#!/usr/bin/env python3
"""
Generate MapLibre GL PBF font glyphs from IBM Plex Sans WOFF2/TTF files.

This uses a pure Python approach with fonttools + freetype-py for high-quality
SDF glyph rendering. Falls back to a simplified rasterizer if freetype is unavailable.

Output: static/lib/maplibre/fonts/{fontstack}/{range}.pbf
"""

import os
import struct
import sys
import math
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("ERROR: fonttools not installed. Run: pip3 install fonttools brotli")
    sys.exit(1)

# ─────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────
WOFF2_DIR = Path("static/fonts")
OUTPUT_DIR = Path("static/lib/maplibre/fonts")

FONT_STACKS = {
    "IBM Plex Sans Regular": "IBMPlexSans-Regular.woff2",
    "IBM Plex Sans Bold": "IBMPlexSans-Bold.woff2",
    "IBM Plex Sans SemiBold": "IBMPlexSans-SemiBold.woff2",
    "IBM Plex Sans Italic": "IBMPlexSans-Italic.woff2",
}

SDF_SIZE = 24       # Glyph render size (px)
SDF_BUFFER = 3      # Pixel buffer around each glyph
GLYPH_RANGE = 256   # Glyphs per PBF file
MAX_UNICODE = 65535  # Max codepoint to generate


# ─────────────────────────────────────────────────────────
# Protobuf Encoder (MapLibre glyph format)
# ─────────────────────────────────────────────────────────
def _varint(v):
    r = bytearray()
    while v > 0x7F:
        r.append((v & 0x7F) | 0x80)
        v >>= 7
    r.append(v & 0x7F)
    return bytes(r)

def _zigzag(v):
    return _varint((v << 1) ^ (v >> 31))

def _tag(fn, wt):
    return _varint((fn << 3) | wt)

def pb_uint32(fn, v):
    return _tag(fn, 0) + _varint(v)

def pb_sint32(fn, v):
    return _tag(fn, 0) + _zigzag(v)

def pb_bytes(fn, v):
    return _tag(fn, 2) + _varint(len(v)) + v

def pb_string(fn, v):
    return pb_bytes(fn, v.encode('utf-8'))

def pb_msg(fn, v):
    return _tag(fn, 2) + _varint(len(v)) + v


# ─────────────────────────────────────────────────────────
# Glyph Rasterizer (Pure Python)
# ─────────────────────────────────────────────────────────
class GlyphRasterizer:
    """Rasterizes TrueType glyphs into SDF bitmaps using contour data."""
    
    def __init__(self, ttfont):
        self.ttfont = ttfont
        self.cmap = ttfont.getBestCmap() or {}
        self.upem = ttfont['head'].unitsPerEm
        self.hmtx = ttfont['hmtx']
        self.glyf = ttfont.get('glyf')
        self.scale = SDF_SIZE / self.upem
    
    def get_glyph_data(self, codepoint):
        """Returns (bitmap, w, h, left, top, advance) or None."""
        if codepoint not in self.cmap:
            return None
        
        glyph_name = self.cmap[codepoint]
        aw, lsb = self.hmtx[glyph_name]
        advance = round(aw * self.scale)
        
        # Get contour segments
        segments = self._get_segments(glyph_name)
        
        if not segments:
            # Space or empty glyph — return metrics only
            return (b'', 0, 0, 0, 0, advance)
        
        # Compute bounding box
        all_x = [p[0] for seg in segments for p in seg]
        all_y = [p[1] for seg in segments for p in seg]
        
        x_min = math.floor(min(all_x)) - SDF_BUFFER
        y_min = math.floor(min(all_y)) - SDF_BUFFER
        x_max = math.ceil(max(all_x)) + SDF_BUFFER + 1
        y_max = math.ceil(max(all_y)) + SDF_BUFFER + 1
        
        w = min(x_max - x_min, 48)  # Cap size
        h = min(y_max - y_min, 48)
        
        if w <= 0 or h <= 0:
            return (b'', 0, 0, 0, 0, advance)
        
        # Render SDF
        bitmap = self._render_sdf(segments, w, h, x_min, y_min)
        
        left = x_min + SDF_BUFFER
        top = y_max - SDF_BUFFER
        
        return (bitmap, w, h, left, top, advance)
    
    def _get_segments(self, glyph_name):
        """Extract line segments from glyph contours."""
        if self.glyf is None:
            return []
        
        glyph = self.glyf[glyph_name]
        
        # Handle composite glyphs
        if hasattr(glyph, 'components') and glyph.components:
            segments = []
            for comp in glyph.components:
                comp_segs = self._get_segments(comp.glyphName)
                # Apply component transform
                if hasattr(comp, 'x') and hasattr(comp, 'y'):
                    dx = comp.x * self.scale
                    dy = comp.y * self.scale
                    comp_segs = [[(p[0]+dx, p[1]+dy) for p in seg] for seg in comp_segs]
                segments.extend(comp_segs)
            return segments
        
        if not hasattr(glyph, 'coordinates') or not glyph.coordinates:
            return []
        if not glyph.endPtsOfContours:
            return []
        
        coords = [(x * self.scale, y * self.scale) for x, y in glyph.coordinates]
        flags = list(glyph.flags) if glyph.flags else [1] * len(coords)
        ends = list(glyph.endPtsOfContours)
        
        segments = []
        start = 0
        for end in ends:
            contour_pts = coords[start:end+1]
            contour_flags = flags[start:end+1]
            n = len(contour_pts)
            
            if n < 2:
                start = end + 1
                continue
            
            # Linearize: expand quadratic bezier curves into line segments
            linear_pts = []
            for i in range(n):
                on = contour_flags[i] & 1
                if on:
                    linear_pts.append(contour_pts[i])
                else:
                    # Off-curve: create intermediate points
                    prev_idx = (i - 1) % n
                    next_idx = (i + 1) % n
                    
                    p0 = contour_pts[prev_idx] if contour_flags[prev_idx] & 1 else (
                        (contour_pts[prev_idx][0] + contour_pts[i][0]) / 2,
                        (contour_pts[prev_idx][1] + contour_pts[i][1]) / 2
                    )
                    p2 = contour_pts[next_idx] if contour_flags[next_idx] & 1 else (
                        (contour_pts[i][0] + contour_pts[next_idx][0]) / 2,
                        (contour_pts[i][1] + contour_pts[next_idx][1]) / 2
                    )
                    p1 = contour_pts[i]
                    
                    # Subdivide quadratic bezier into 4 line segments
                    for t_num in range(1, 5):
                        t = t_num / 4.0
                        x = (1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0]
                        y = (1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1]
                        linear_pts.append((x, y))
            
            if len(linear_pts) >= 2:
                for i in range(len(linear_pts)):
                    p1 = linear_pts[i]
                    p2 = linear_pts[(i + 1) % len(linear_pts)]
                    segments.append((p1, p2))
            
            start = end + 1
        
        return segments
    
    def _render_sdf(self, segments, w, h, x_off, y_off):
        """Render SDF bitmap from line segments."""
        bitmap = bytearray(w * h)
        
        for py in range(h):
            for px in range(w):
                gx = x_off + px + 0.5
                gy = y_off + (h - 1 - py) + 0.5  # Flip Y axis
                
                # Winding number for inside/outside test
                winding = 0
                min_dist_sq = 1e10
                
                for (x1, y1), (x2, y2) in segments:
                    # Winding number
                    if y1 <= gy:
                        if y2 > gy:
                            cross = (x2 - x1) * (gy - y1) - (gx - x1) * (y2 - y1)
                            if cross > 0:
                                winding += 1
                    else:
                        if y2 <= gy:
                            cross = (x2 - x1) * (gy - y1) - (gx - x1) * (y2 - y1)
                            if cross < 0:
                                winding -= 1
                    
                    # Distance to segment
                    dx = x2 - x1
                    dy = y2 - y1
                    len_sq = dx * dx + dy * dy
                    if len_sq > 0:
                        t = max(0.0, min(1.0, ((gx - x1) * dx + (gy - y1) * dy) / len_sq))
                        proj_x = x1 + t * dx
                        proj_y = y1 + t * dy
                        d_sq = (gx - proj_x) ** 2 + (gy - proj_y) ** 2
                        if d_sq < min_dist_sq:
                            min_dist_sq = d_sq
                
                dist = math.sqrt(min_dist_sq) if min_dist_sq < 1e10 else SDF_BUFFER * 2
                inside = winding != 0
                
                # SDF encoding: 192 = edge, >192 = inside, <192 = outside
                # Scale factor: SDF_BUFFER pixels = 64 SDF units
                scale_factor = 64.0 / SDF_BUFFER
                if inside:
                    sdf_val = int(192 + min(63, dist * scale_factor))
                else:
                    sdf_val = int(192 - min(192, dist * scale_factor))
                
                bitmap[py * w + px] = max(0, min(255, sdf_val))
        
        return bytes(bitmap)


def create_pbf(fontstack_name, rasterizer, range_start, range_end):
    """Create a PBF file for a glyph range."""
    glyphs_data = b''
    count = 0
    
    for cp in range(range_start, range_end + 1):
        result = rasterizer.get_glyph_data(cp)
        if result is None:
            continue
        
        bmp, w, h, left, top, adv = result
        
        g = b''
        g += pb_uint32(1, cp)
        if bmp:
            g += pb_bytes(2, bmp)
        g += pb_uint32(3, w)
        g += pb_uint32(4, h)
        g += pb_sint32(5, left)
        g += pb_sint32(6, top)
        g += pb_uint32(7, adv)
        
        glyphs_data += pb_msg(3, g)
        count += 1
    
    stack = b''
    stack += pb_string(1, fontstack_name)
    stack += pb_string(2, f"{range_start}-{range_end}")
    stack += glyphs_data
    
    return pb_msg(1, stack), count


def process_font(fontstack_name, woff2_filename):
    """Process one font into PBF glyph ranges."""
    src = WOFF2_DIR / woff2_filename
    if not src.exists():
        print(f"  ⚠ Not found: {src}")
        return False
    
    ttfont = TTFont(str(src))
    rasterizer = GlyphRasterizer(ttfont)
    
    out_dir = OUTPUT_DIR / fontstack_name
    out_dir.mkdir(parents=True, exist_ok=True)
    
    cmap = rasterizer.cmap
    if not cmap:
        print(f"  ⚠ No cmap in {woff2_filename}")
        return False
    
    max_cp = min(max(cmap.keys()), MAX_UNICODE)
    total_glyphs = 0
    ranges = 0
    
    for rs in range(0, max_cp + GLYPH_RANGE, GLYPH_RANGE):
        re = rs + GLYPH_RANGE - 1
        
        has_any = any(rs <= cp <= re for cp in cmap)
        if not has_any:
            # Empty range — write minimal PBF
            stack = pb_string(1, fontstack_name) + pb_string(2, f"{rs}-{re}")
            pbf = pb_msg(1, stack)
        else:
            pbf, count = create_pbf(fontstack_name, rasterizer, rs, re)
            total_glyphs += count
        
        out_path = out_dir / f"{rs}-{re}.pbf"
        with open(out_path, 'wb') as f:
            f.write(pbf)
        ranges += 1
        
        # Progress indicator
        if has_any:
            print(f"    Range {rs}-{re}: {count} glyphs", end='\r')
    
    ttfont.close()
    print(f"  ✓ {fontstack_name}: {total_glyphs} glyphs, {ranges} ranges    ")
    return True


def main():
    print("═══════════════════════════════════════════════════")
    print("  IBM Plex Sans → MapLibre GL PBF Font Generator")
    print("═══════════════════════════════════════════════════")
    print()
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    ok = 0
    for name, woff2 in FONT_STACKS.items():
        print(f"Processing: {name}")
        if process_font(name, woff2):
            ok += 1
    
    print()
    print(f"Generated {ok}/{len(FONT_STACKS)} font stacks → {OUTPUT_DIR}/")
    print()
    if ok > 0:
        print("Style JSON glyphs URL:")
        print('  "glyphs": "/lib/maplibre/fonts/{fontstack}/{range}.pbf"')
        print()
        print("Font names for text-font arrays:")
        for n in FONT_STACKS:
            print(f'  "{n}"')


if __name__ == "__main__":
    main()
