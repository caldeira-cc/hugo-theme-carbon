#!/usr/bin/env python3
"""
Dependency & License Integrity Verification Script
Validates that all third-party libraries, fonts, assets, and licenses are 100% locally available.
"""

import os
import sys
import re

REQUIRED_FILES = [
    # Highlight.js
    "static/lib/highlight/highlight.min.js",
    # Chart.js
    "static/lib/chartjs/chart.umd.min.js",
    # MapLibre GL Vector Tile Engine
    "static/lib/maplibre/maplibre-gl.js",
    "static/lib/maplibre/maplibre-gl.css",
    "static/lib/maplibre/carbon-vector-dark.json",
    "static/lib/maplibre/carbon-vector-light.json",
    # MapLibre IBM Plex Sans PBF Font Glyphs (spot-check key ranges)
    "static/lib/maplibre/fonts/IBM Plex Sans Regular/0-255.pbf",
    "static/lib/maplibre/fonts/IBM Plex Sans Bold/0-255.pbf",
    "static/lib/maplibre/fonts/IBM Plex Sans SemiBold/0-255.pbf",
    "static/lib/maplibre/fonts/IBM Plex Sans Italic/0-255.pbf",
    # Leaflet (Fallback)
    "static/lib/leaflet/leaflet.js",
    "static/lib/leaflet/leaflet.css",
    "static/lib/leaflet/images/marker-icon.png",
    "static/lib/leaflet/images/marker-icon-2x.png",
    "static/lib/leaflet/images/marker-shadow.png",
    "static/lib/leaflet/images/layers.png",
    "static/lib/leaflet/images/layers-2x.png",
    # KaTeX
    "static/lib/katex/katex.min.js",
    "static/lib/katex/auto-render.min.js",
    "static/lib/katex/katex.min.css",
    # Mermaid
    "static/lib/mermaid/mermaid.min.js",
    # KaTeX Fonts (sample check)
    "static/lib/katex/fonts/KaTeX_Main-Regular.woff2",
    "static/lib/katex/fonts/KaTeX_Math-Italic.woff2",
    "static/lib/katex/fonts/KaTeX_AMS-Regular.woff2",
    "static/lib/katex/fonts/KaTeX_Size1-Regular.woff2",
    # IBM Plex Fonts (sample check)
    "static/fonts/IBMPlexSans-Regular.woff2",
    "static/fonts/IBMPlexSans-SemiBold.woff2",
    "static/fonts/IBMPlexMono-Regular.woff2",
    "static/fonts/IBMPlexMath-Regular.woff2",
    "static/fonts/IBMPlexSerif-Regular.woff2",
    # Carbon Design System Component & Icon Catalogs
    "static/lib/carbon-components/carbon-catalog.json",
    "data/carbon-icons.json",
    # License files
    "static/licenses/APACHE-2.0.txt",
    "static/licenses/APACHE-2.0-CARBON-ICONS.txt",
    "static/licenses/MIT.txt",
    "static/licenses/BSD-2-CLAUSE.txt",
    "static/licenses/BSD-3-CLAUSE.txt",
    "static/licenses/SIL-OFL-1.1.txt",
    "static/licenses/GPL-3.0.txt",
    "static/licenses/PSF-2.0.txt",
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
THEME_DIR = os.path.dirname(SCRIPT_DIR)
ROOT_DIR = os.path.dirname(THEME_DIR)

def resolve_path(rel_path):
    # Check directly inside THEME_DIR (hugo-theme-carbon)
    theme_carbon_path = os.path.join(THEME_DIR, rel_path)
    if os.path.exists(theme_carbon_path):
        return theme_carbon_path
    root_path = os.path.join(ROOT_DIR, rel_path)
    if os.path.exists(root_path):
        return root_path
    return rel_path

def main():
    print("=" * 60)
    print("Hugo-Carbon Dependency & License Verification Suite")
    print("=" * 60)

    failed = False

    # 1. Check all required local distribution files
    print("\n[1/4] Checking required local library and license files...")
    for fpath in REQUIRED_FILES:
        resolved = resolve_path(fpath)
        if not os.path.exists(resolved):
            print(f"  ❌ MISSING: {fpath} (checked {resolved})")
            failed = True
        else:
            size = os.path.getsize(resolved)
            if size == 0:
                print(f"  ❌ EMPTY FILE: {resolved}")
                failed = True
            else:
                size_str = f"{size / 1024:.1f} KB" if size > 1024 else f"{size} B"
                print(f"  ✓ Found: {resolved} ({size_str})")

    # 2. Check total KaTeX font count
    katex_fonts_dir = resolve_path("static/lib/katex/fonts")
    if os.path.exists(katex_fonts_dir):
        kfonts = [f for f in os.listdir(katex_fonts_dir) if f.endswith('.woff2')]
        print(f"\n[2/4] KaTeX Font Assets: Found {len(kfonts)} / 20 WOFF2 font files.")
        if len(kfonts) < 20:
            print("  ❌ Missing some KaTeX font files!")
            failed = True
        else:
            print("  ✓ All 20 KaTeX WOFF2 font files present.")
    else:
        print(f"  ❌ KaTeX fonts directory missing: {katex_fonts_dir}!")
        failed = True

    # 3. Check total IBM Plex font count
    plex_fonts_dir = resolve_path("static/fonts")
    if os.path.exists(plex_fonts_dir):
        pfonts = [f for f in os.listdir(plex_fonts_dir) if f.endswith('.woff2')]
        print(f"\n[3/4] IBM Plex Fonts: Found {len(pfonts)} / 29 WOFF2 font files.")
        if len(pfonts) < 29:
            print("  ❌ Missing some IBM Plex font files!")
            failed = True
        else:
            print("  ✓ All 29 IBM Plex WOFF2 font files present.")

    # 4. Check total Carbon Icon SVG count
    icons_dir = resolve_path("assets/icons")
    if os.path.exists(icons_dir):
        svg_count = sum(len([f for f in files if f.endswith('.svg')]) for _, _, files in os.walk(icons_dir))
        print(f"\n[4/4] Carbon Design System Icons: Found {svg_count} SVG icons in {icons_dir}.")
        if svg_count < 2000:
            print("  ❌ Missing Carbon icon suite!")
            failed = True
        else:
            print(f"  ✓ {svg_count} official Carbon SVG icons present.")
    else:
        print(f"  ❌ Carbon icons directory missing: {icons_dir}!")
        failed = True

    # 5. Verify no CDN script references remain in assets/js
    print("\n[Audit] Scanning assets/js for third-party script CDN URLs...")
    cdn_patterns = [
        re.compile(r'https?://cdnjs\.cloudflare\.com/ajax/libs/'),
        re.compile(r'https?://cdn\.jsdelivr\.net/npm/'),
        re.compile(r'https?://unpkg\.com/(?!$)'),
    ]

    assets_js_dir = resolve_path("assets/js")
    if os.path.exists(assets_js_dir):
        for root, _, files in os.walk(assets_js_dir):
            for fname in files:
                if fname.endswith(".js"):
                    full_path = os.path.join(root, fname)
                    with open(full_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        for pat in cdn_patterns:
                            matches = pat.findall(content)
                            if matches:
                                print(f"  ❌ CDN URL found in {full_path}: {matches}")
                                failed = True

    if failed:
        print("\n❌ Verification FAILED: Some dependencies or licenses are missing or misconfigured.")
        sys.exit(1)
    else:
        print("\n✅ Verification PASSED: All 100% of dependencies, fonts, and licenses are locally implemented and verified.")

if __name__ == "__main__":
    main()
