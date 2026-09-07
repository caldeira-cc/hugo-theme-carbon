#!/usr/bin/env python3
"""
Generate IBM Carbon × Sage Green vector tile styles for MapLibre GL.

Reads the CARTO Dark Matter and Positron base styles, replaces all colors
with an IBM Carbon + Sage Green (#69a280) derived palette, and outputs
carbon-vector-dark.json and carbon-vector-light.json.

Color Philosophy:
  - Water uses Faded Jeans Blue palette (#7a9eb3 / #35596e / #a5c8dc)
  - Parks & vegetation use Sage Green derivatives (#69a280 / #2e5840 / #e5f0ea)
  - Roads use warm IBM Gray scale with Sage tint for motorways
  - Background, layers, borders follow IBM Carbon tokens exactly
  - Labels use proper contrast ratios (WCAG AA)
"""

import json
import re
import sys

# ─────────────────────────────────────────────────────────
# IBM Carbon × Sage Green Color Palettes
# ─────────────────────────────────────────────────────────

DARK_PALETTE = {
    # Base Chrome (IBM Carbon g100)
    "background":         "#161616",  # --cds-background
    "landcover":          "#1c2620",  # Subtle dark sage tint
    "landuse_residential":"#1a1a1a",  # Slightly warmer than bg
    "landuse_other":      "#1e1e1e",  # Industrial/commercial
    
    # Water (Faded Jeans Blue palette — dark mode)
    "water":              "#0d2137",  # Deep navy-jeans
    "water_shadow":       "#091a2b",  # Darker water shadow
    "waterway":           "#1b3a52",  # Muted jeans-dark derivative
    "waterway_label":     "#5a96b5",  # Readable waterway text (jeans mid-light)
    
    # Parks & Vegetation (Sage Green — dark mode)
    "park":               "#182d21",  # --cds-color-sage-dark (dark mode)
    "park_label":         "#6db38a",  # Legible sage text on dark
    
    # Buildings (IBM Carbon layers)
    "building":           "#222222",  # Between bg and layer-01
    "building_top":       "#262626",  # --cds-layer-01
    "building_outline":   "#2e2e2e",  # Subtle distinction
    
    # Roads — Warm Gray scale with Sage accent on motorways
    "road_motorway_case":    "#69a280",  # Sage green itself!
    "road_motorway_fill":    "#4e8062",  # --cds-interactive-04 (darker sage)
    "road_trunk_case":       "#3d6b50",  # Deep sage
    "road_trunk_fill":       "#4a7c5e",  # Mid sage
    "road_primary_case":     "#393939",  # --cds-layer-accent-01
    "road_primary_fill":     "#525252",  # Gray 60
    "road_secondary_case":   "#2e2e2e",  # Subtle dark
    "road_secondary_fill":   "#393939",  # Gray 70
    "road_minor_case":       "#222222",  # Very subtle
    "road_minor_fill":       "#2a2a2a",  # Barely visible
    "road_service_case":     "#1e1e1e",
    "road_service_fill":     "#262626",  # --cds-layer-01
    "road_path":             "#2e3830",  # Faint sage-gray
    "road_rail":             "#393939",  # Gray 70
    "road_rail_dash":        "#525252",  # Gray 60
    
    # Boundaries
    "boundary_country":      "#69a280",  # Sage green accent
    "boundary_country_inner":"#3d6b50",  # Deep sage
    "boundary_state":        "#393939",  # Gray 70
    "boundary_county":       "#262626",  # --cds-layer-01
    
    # Labels
    "label_text_primary":    "#f4f4f4",  # --cds-text-primary (dark)
    "label_text_secondary":  "#c6c6c6",  # --cds-text-secondary (dark)
    "label_text_tertiary":   "#8d8d8d",  # --cds-text-helper (dark)
    "label_halo":            "#161616",  # Match background
    "label_country":         "#e5f0ea",  # Sage light — distinctive
    "label_city":            "#f4f4f4",  # Bright white
    "label_city_halo":       "#161616",
    
    # POI & Aeroway
    "poi_text":              "#8d8d8d",  # Gray helper
    "aeroway":               "#262626",  # --cds-layer-01
    
    # Road name labels
    "roadname_text":         "#8d8d8d",  # --cds-text-helper
    "roadname_halo":         "#161616",
}

LIGHT_PALETTE = {
    # Base Chrome (IBM Carbon white / g10)
    "background":         "#f4f4f4",  # --cds-layer-01 (g10 bg)
    "landcover":          "#e8efe9",  # Very light sage tint
    "landuse_residential":"#f0f0f0",  # Slightly off-white
    "landuse_other":      "#ececec",  # Industrial/commercial
    
    # Water (Faded Jeans Blue palette — light mode)
    "water":              "#d6e8f2",  # Jeans-light derivative
    "water_shadow":       "#c4dae8",  # Slightly deeper
    "waterway":           "#a5c8dc",  # --cds-color-jeans-light (light mode)
    "waterway_label":     "#35596e",  # --cds-color-jeans-dark (readable)
    
    # Parks & Vegetation (Sage Green — light mode)
    "park":               "#dce9e1",  # Lighter than sage-light
    "park_label":         "#2e5840",  # --cds-color-sage-dark (readable on light)
    
    # Buildings (IBM Carbon layers)
    "building":           "#e8e8e8",  # Between white and layer-02
    "building_top":       "#ffffff",  # --cds-background (white)
    "building_outline":   "#d8d8d8",  # Subtle border
    
    # Roads — Warm Gray scale with Sage accent on motorways
    "road_motorway_case":    "#4e8062",  # Interactive-04 sage
    "road_motorway_fill":    "#69a280",  # Sage green itself!
    "road_trunk_case":       "#5a8d6d",  # Mid sage
    "road_trunk_fill":       "#7ab393",  # Lighter sage
    "road_primary_case":     "#c6c6c6",  # Gray 30
    "road_primary_fill":     "#ffffff",  # White fill
    "road_secondary_case":   "#d4d4d4",  # Lighter gray
    "road_secondary_fill":   "#ffffff",  # White fill
    "road_minor_case":       "#e0e0e0",  # --cds-border-subtle-00
    "road_minor_fill":       "#ffffff",  # White fill
    "road_service_case":     "#e8e8e8",
    "road_service_fill":     "#ffffff",
    "road_path":             "#c8d5cc",  # Faint sage-gray
    "road_rail":             "#c6c6c6",  # Gray 30
    "road_rail_dash":        "#ffffff",  # White dashes
    
    # Boundaries
    "boundary_country":      "#69a280",  # Sage green accent
    "boundary_country_inner":"#a1c5af",  # Light sage
    "boundary_state":        "#c6c6c6",  # Gray 30
    "boundary_county":       "#e0e0e0",  # Gray 20
    
    # Labels
    "label_text_primary":    "#161616",  # --cds-text-primary (light)
    "label_text_secondary":  "#525252",  # --cds-text-secondary (light)
    "label_text_tertiary":   "#6f6f6f",  # --cds-text-helper (light)
    "label_halo":            "#ffffff",  # White halo
    "label_country":         "#2e5840",  # --cds-color-sage-dark
    "label_city":            "#161616",  # Dark text
    "label_city_halo":       "#ffffff",
    
    # POI & Aeroway
    "poi_text":              "#6f6f6f",  # Gray helper
    "aeroway":               "#e0e0e0",  # Gray 20
    
    # Road name labels
    "roadname_text":         "#6f6f6f",  # --cds-text-helper
    "roadname_halo":         "#ffffff",
}


def build_style(palette, style_name):
    """Build the complete MapLibre GL style spec from palette."""
    return {
        "version": 8,
        "name": style_name,
        "metadata": { "maputnik:renderer": "mbgljs" },
        "sources": {
            "carto": {
                "type": "vector",
                "tiles": [
                    "https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt",
                    "https://tiles-b.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt",
                    "https://tiles-c.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt",
                    "https://tiles-d.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt"
                ],
                "minzoom": 0,
                "maxzoom": 14
            }
        },
        "glyphs": "/lib/maplibre/fonts/{fontstack}/{range}.pbf",
        "layers": build_layers(palette)
    }


def build_layers(p):
    """Build all 93 map layers using the given palette."""
    layers = []
    
    # 1. Background
    layers.append({
        "id": "background",
        "type": "background",
        "layout": { "visibility": "visible" },
        "paint": { "background-color": p["background"], "background-opacity": 1 }
    })
    
    # 2. Landcover (woods, grass, etc.)
    layers.append({
        "id": "landcover",
        "type": "fill",
        "source": "carto",
        "source-layer": "landcover",
        "filter": ["any",
            ["==", "class", "wood"],
            ["==", "class", "grass"],
            ["==", "subclass", "recreation_ground"]
        ],
        "paint": { "fill-color": p["landcover"], "fill-opacity": 1 }
    })
    
    # 3-4. Parks
    for park_class in ["national_park", "nature_reserve"]:
        layers.append({
            "id": f"park_{park_class}",
            "type": "fill",
            "source": "carto",
            "source-layer": "park",
            "minzoom": 9 if park_class == "national_park" else 0,
            "filter": ["all", ["==", "class", park_class]],
            "layout": { "visibility": "visible" },
            "paint": {
                "fill-color": p["park"],
                "fill-opacity": { "stops": [[5, 0.4], [9, 0.7]] } if park_class == "nature_reserve" else 1,
            }
        })
    
    # 5. Landuse residential
    layers.append({
        "id": "landuse_residential",
        "type": "fill",
        "source": "carto",
        "source-layer": "landuse",
        "minzoom": 6,
        "filter": ["any",
            ["==", "class", "residential"],
            ["==", "class", "suburb"],
            ["==", "class", "neighbourhood"]
        ],
        "paint": { "fill-color": p["landuse_residential"], "fill-opacity": { "stops": [[6, 0], [9, 0.6]] } }
    })
    
    # 6. Landuse other (commercial, industrial, etc.)
    layers.append({
        "id": "landuse",
        "type": "fill",
        "source": "carto",
        "source-layer": "landuse",
        "filter": ["any",
            ["==", "class", "cemetery"],
            ["==", "class", "stadium"],
            ["==", "class", "industrial"]
        ],
        "paint": { "fill-color": p["landuse_other"], "fill-opacity": 0.5 }
    })
    
    # 7. Waterway lines
    layers.append({
        "id": "waterway",
        "type": "line",
        "source": "carto",
        "source-layer": "waterway",
        "paint": {
            "line-color": p["waterway"],
            "line-width": { "stops": [[8, 0.5], [14, 3]] }
        }
    })
    
    # 8-9. Boundaries (county, state) — placed under water for z-ordering
    layers.append({
        "id": "boundary_county",
        "type": "line",
        "source": "carto",
        "source-layer": "boundary",
        "minzoom": 7,
        "filter": ["all", ["==", "admin_level", 6], ["==", "maritime", 0]],
        "paint": {
            "line-color": p["boundary_county"],
            "line-width": 0.5,
            "line-dasharray": [3, 3],
            "line-opacity": 0.6
        }
    })
    layers.append({
        "id": "boundary_state",
        "type": "line",
        "source": "carto",
        "source-layer": "boundary",
        "minzoom": 4,
        "filter": ["all", ["==", "admin_level", 4], ["==", "maritime", 0]],
        "paint": {
            "line-color": p["boundary_state"],
            "line-width": { "stops": [[4, 0.5], [10, 1.2]] },
            "line-dasharray": [4, 2],
            "line-opacity": 0.8
        }
    })
    
    # 10-11. Water fills
    layers.append({
        "id": "water",
        "type": "fill",
        "source": "carto",
        "source-layer": "water",
        "layout": { "visibility": "visible" },
        "paint": { "fill-color": p["water"], "fill-opacity": 1 }
    })
    layers.append({
        "id": "water_shadow",
        "type": "fill",
        "source": "carto",
        "source-layer": "water",
        "paint": { "fill-color": p["water_shadow"], "fill-translate": [0, 1], "fill-opacity": 0.15 }
    })
    
    # 12-13. Aeroways
    for aero_type, width in [("runway", 5), ("taxiway", 2)]:
        layers.append({
            "id": f"aeroway-{aero_type}",
            "type": "line",
            "source": "carto",
            "source-layer": "aeroway",
            "filter": ["==", "class", aero_type],
            "paint": {
                "line-color": p["aeroway"],
                "line-width": { "stops": [[11, width * 0.4], [17, width * 4]] },
                "line-opacity": 0.8
            }
        })
    
    # 14-19. Tunnels — case (outline)
    tunnel_types = [
        ("service", "road_service_case", 1.2),
        ("minor",   "road_minor_case",   1.6),
        ("sec",     "road_secondary_case",2.2),
        ("pri",     "road_primary_case",  2.8),
        ("trunk",   "road_trunk_case",    3.4),
        ("mot",     "road_motorway_case", 4.0),
    ]
    class_filters = {
        "service": ["in", "class", "service", "track"],
        "minor":   ["in", "class", "minor", "tertiary"],
        "sec":     ["==", "class", "secondary"],
        "pri":     ["==", "class", "primary"],
        "trunk":   ["==", "class", "trunk"],
        "mot":     ["==", "class", "motorway"],
    }
    for suffix, color_key, width in tunnel_types:
        layers.append({
            "id": f"tunnel_{suffix}_case",
            "type": "line",
            "source": "carto",
            "source-layer": "transportation",
            "minzoom": 12 if suffix in ("service",) else 8 if suffix in ("minor",) else 5,
            "filter": ["all", ["==", "brunnel", "tunnel"], class_filters[suffix]],
            "layout": { "line-join": "round", "line-cap": "butt" },
            "paint": {
                "line-color": p[color_key],
                "line-width": { "stops": [[5, width * 0.3], [18, width * 3]] },
                "line-dasharray": [3, 3],
                "line-opacity": 0.6
            }
        })
    
    # 20. Tunnel path
    layers.append({
        "id": "tunnel_path",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 14,
        "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "path"]],
        "paint": {
            "line-color": p["road_path"],
            "line-width": { "stops": [[14, 0.5], [18, 2]] },
            "line-dasharray": [2, 2],
            "line-opacity": 0.5
        }
    })
    
    # 21-26. Tunnels — fill
    tunnel_fills = [
        ("service", "road_service_fill", 0.8),
        ("minor",   "road_minor_fill",   1.2),
        ("sec",     "road_secondary_fill",1.8),
        ("pri",     "road_primary_fill",  2.2),
        ("trunk",   "road_trunk_fill",    2.8),
        ("mot",     "road_motorway_fill", 3.4),
    ]
    for suffix, color_key, width in tunnel_fills:
        layers.append({
            "id": f"tunnel_{suffix}_fill",
            "type": "line",
            "source": "carto",
            "source-layer": "transportation",
            "minzoom": 12 if suffix in ("service",) else 8 if suffix in ("minor",) else 5,
            "filter": ["all", ["==", "brunnel", "tunnel"], class_filters[suffix]],
            "layout": { "line-join": "round", "line-cap": "butt" },
            "paint": {
                "line-color": p[color_key],
                "line-width": { "stops": [[5, width * 0.2], [18, width * 2.5]] },
                "line-opacity": 0.5
            }
        })
    
    # 27-28. Tunnel rail
    layers.append({
        "id": "tunnel_rail",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 12,
        "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "rail"]],
        "paint": { "line-color": p["road_rail"], "line-width": 1.5, "line-opacity": 0.5 }
    })
    layers.append({
        "id": "tunnel_rail_dash",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 12,
        "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "rail"]],
        "paint": {
            "line-color": p["road_rail_dash"],
            "line-width": 0.8,
            "line-dasharray": [6, 6],
            "line-opacity": 0.4
        }
    })
    
    # 29-37. Surface roads — case (outline)
    road_cases = [
        ("road_service_case", "service", "road_service_case", 1.2, 13),
        ("road_minor_case",   "minor",   "road_minor_case",   1.6, 10),
        ("road_pri_case_ramp","pri_ramp","road_primary_case",  2.0, 8),
        ("road_trunk_case_ramp","trunk_ramp","road_trunk_case",2.5, 7),
        ("road_mot_case_ramp","mot_ramp","road_motorway_case", 3.0, 7),
        ("road_sec_case_noramp","sec",   "road_secondary_case",2.2, 8),
        ("road_pri_case_noramp","pri",   "road_primary_case",  2.8, 7),
        ("road_trunk_case_noramp","trunk","road_trunk_case",   3.4, 5),
        ("road_mot_case_noramp","mot",   "road_motorway_case", 4.0, 4),
    ]
    ramp_filters = {
        "service": ["all", ["!has", "brunnel"], ["in", "class", "service", "track"]],
        "minor":   ["all", ["!has", "brunnel"], ["in", "class", "minor", "tertiary"]],
        "pri_ramp":   ["all", ["!has", "brunnel"], ["==", "class", "primary"], ["==", "ramp", 1]],
        "trunk_ramp": ["all", ["!has", "brunnel"], ["==", "class", "trunk"], ["==", "ramp", 1]],
        "mot_ramp":   ["all", ["!has", "brunnel"], ["==", "class", "motorway"], ["==", "ramp", 1]],
        "sec":     ["all", ["!has", "brunnel"], ["==", "class", "secondary"], ["!=", "ramp", 1]],
        "pri":     ["all", ["!has", "brunnel"], ["==", "class", "primary"], ["!=", "ramp", 1]],
        "trunk":   ["all", ["!has", "brunnel"], ["==", "class", "trunk"], ["!=", "ramp", 1]],
        "mot":     ["all", ["!has", "brunnel"], ["==", "class", "motorway"], ["!=", "ramp", 1]],
    }
    for layer_id, filter_key, color_key, width, minzoom in road_cases:
        layers.append({
            "id": layer_id,
            "type": "line",
            "source": "carto",
            "source-layer": "transportation",
            "minzoom": minzoom,
            "filter": ramp_filters[filter_key],
            "layout": { "line-join": "round", "line-cap": "round" },
            "paint": {
                "line-color": p[color_key],
                "line-width": { "stops": [[5, width * 0.3], [18, width * 4]] },
                "line-opacity": 1
            }
        })
    
    # 38. Road path
    layers.append({
        "id": "road_path",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 14,
        "filter": ["all", ["!has", "brunnel"], ["==", "class", "path"]],
        "paint": {
            "line-color": p["road_path"],
            "line-width": { "stops": [[14, 0.5], [18, 2]] },
            "line-dasharray": [2, 2],
            "line-opacity": 0.7
        }
    })
    
    # 39-47. Surface roads — fill
    road_fills = [
        ("road_service_fill", "service", "road_service_fill", 0.8, 13),
        ("road_minor_fill",   "minor",   "road_minor_fill",   1.2, 10),
        ("road_pri_fill_ramp","pri_ramp","road_primary_fill",  1.6, 8),
        ("road_trunk_fill_ramp","trunk_ramp","road_trunk_fill",2.0, 7),
        ("road_mot_fill_ramp","mot_ramp","road_motorway_fill", 2.4, 7),
        ("road_sec_fill_noramp","sec",   "road_secondary_fill",1.8, 8),
        ("road_pri_fill_noramp","pri",   "road_primary_fill",  2.2, 7),
        ("road_trunk_fill_noramp","trunk","road_trunk_fill",   2.8, 5),
        ("road_mot_fill_noramp","mot",   "road_motorway_fill", 3.4, 4),
    ]
    for layer_id, filter_key, color_key, width, minzoom in road_fills:
        layers.append({
            "id": layer_id,
            "type": "line",
            "source": "carto",
            "source-layer": "transportation",
            "minzoom": minzoom,
            "filter": ramp_filters[filter_key],
            "layout": { "line-join": "round", "line-cap": "round" },
            "paint": {
                "line-color": p[color_key],
                "line-width": { "stops": [[5, width * 0.2], [18, width * 3]] },
                "line-opacity": 1
            }
        })
    
    # 48-49. Rail
    layers.append({
        "id": "rail",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 12,
        "filter": ["all", ["!has", "brunnel"], ["==", "class", "rail"]],
        "paint": { "line-color": p["road_rail"], "line-width": 1.5, "line-opacity": 0.7 }
    })
    layers.append({
        "id": "rail_dash",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 12,
        "filter": ["all", ["!has", "brunnel"], ["==", "class", "rail"]],
        "paint": {
            "line-color": p["road_rail_dash"],
            "line-width": 0.8,
            "line-dasharray": [6, 6],
            "line-opacity": 0.5
        }
    })
    
    # 50-56. Bridges — case
    bridge_cases = [
        ("service", "road_service_case", 1.4),
        ("minor",   "road_minor_case",   1.8),
        ("sec",     "road_secondary_case",2.4),
        ("pri",     "road_primary_case",  3.0),
        ("trunk",   "road_trunk_case",    3.6),
        ("mot",     "road_motorway_case", 4.2),
    ]
    for suffix, color_key, width in bridge_cases:
        layers.append({
            "id": f"bridge_{suffix}_case",
            "type": "line",
            "source": "carto",
            "source-layer": "transportation",
            "minzoom": 12 if suffix == "service" else 8 if suffix == "minor" else 5,
            "filter": ["all", ["==", "brunnel", "bridge"], class_filters[suffix]],
            "layout": { "line-join": "round", "line-cap": "butt" },
            "paint": {
                "line-color": p[color_key],
                "line-width": { "stops": [[5, width * 0.3], [18, width * 3.5]] },
                "line-opacity": 1
            }
        })
    
    # 57. Bridge path
    layers.append({
        "id": "bridge_path",
        "type": "line",
        "source": "carto",
        "source-layer": "transportation",
        "minzoom": 14,
        "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "path"]],
        "paint": {
            "line-color": p["road_path"],
            "line-width": { "stops": [[14, 0.5], [18, 2]] },
            "line-dasharray": [2, 2]
        }
    })
    
    # 58-63. Bridges — fill
    bridge_fills = [
        ("service", "road_service_fill", 1.0),
        ("minor",   "road_minor_fill",   1.4),
        ("sec",     "road_secondary_fill",2.0),
        ("pri",     "road_primary_fill",  2.6),
        ("trunk",   "road_trunk_fill",    3.2),
        ("mot",     "road_motorway_fill", 3.8),
    ]
    for suffix, color_key, width in bridge_fills:
        layers.append({
            "id": f"bridge_{suffix}_fill",
            "type": "line",
            "source": "carto",
            "source-layer": "transportation",
            "minzoom": 12 if suffix == "service" else 8 if suffix == "minor" else 5,
            "filter": ["all", ["==", "brunnel", "bridge"], class_filters[suffix]],
            "layout": { "line-join": "round", "line-cap": "round" },
            "paint": {
                "line-color": p[color_key],
                "line-width": { "stops": [[5, width * 0.2], [18, width * 2.8]] },
                "line-opacity": 1
            }
        })
    
    # 64-65. Buildings
    layers.append({
        "id": "building",
        "type": "fill",
        "source": "carto",
        "source-layer": "building",
        "minzoom": 13,
        "paint": {
            "fill-color": p["building"],
            "fill-outline-color": p["building_outline"],
            "fill-opacity": { "stops": [[13, 0], [15, 0.85]] }
        }
    })
    layers.append({
        "id": "building-top",
        "type": "fill",
        "source": "carto",
        "source-layer": "building",
        "minzoom": 13,
        "paint": {
            "fill-color": p["building_top"],
            "fill-translate": [1, -1],
            "fill-opacity": { "stops": [[13, 0], [16, 0.4]] }
        }
    })
    
    # 66-67. Country boundaries (on top of everything except labels)
    layers.append({
        "id": "boundary_country_outline",
        "type": "line",
        "source": "carto",
        "source-layer": "boundary",
        "filter": ["all", ["==", "admin_level", 2], ["==", "maritime", 0]],
        "layout": { "line-join": "round", "line-cap": "round" },
        "paint": {
            "line-color": p["boundary_country"],
            "line-width": { "stops": [[1, 0.8], [6, 2], [14, 4]] },
            "line-opacity": { "stops": [[1, 0.6], [6, 0.9]] }
        }
    })
    layers.append({
        "id": "boundary_country_inner",
        "type": "line",
        "source": "carto",
        "source-layer": "boundary",
        "filter": ["all", ["==", "admin_level", 2], ["==", "maritime", 0]],
        "layout": { "line-join": "round", "line-cap": "round" },
        "paint": {
            "line-color": p["boundary_country_inner"],
            "line-width": { "stops": [[1, 0.4], [6, 0.8]] },
            "line-opacity": 0.5
        }
    })
    
    # ─── LABELS ───
    
    # 68. Waterway labels
    layers.append({
        "id": "waterway_label",
        "type": "symbol",
        "source": "carto",
        "source-layer": "waterway",
        "minzoom": 13,
        "layout": {
            "text-field": "{name}",
            "text-font": ["IBM Plex Sans Italic", "IBM Plex Sans Regular"],
            "text-size": 11,
            "symbol-placement": "line",
            "symbol-spacing": 400
        },
        "paint": {
            "text-color": p["waterway_label"],
            "text-halo-color": p["label_halo"],
            "text-halo-width": 1
        }
    })
    
    # 69-71. Water name labels
    for wn_id, minz, size, prop in [
        ("watername_ocean", 1, 14, "uppercase"),
        ("watername_sea", 4, 12, "uppercase"),
        ("watername_lake", 8, 11, "none"),
    ]:
        layers.append({
            "id": wn_id,
            "type": "symbol",
            "source": "carto",
            "source-layer": "water_name",
            "minzoom": minz,
            "layout": {
                "text-field": "{name}",
                "text-font": ["IBM Plex Sans Italic", "IBM Plex Sans Regular"],
                "text-size": size,
                "text-transform": prop,
                "text-letter-spacing": 0.12 if prop == "uppercase" else 0.04
            },
            "paint": {
                "text-color": p["waterway_label"],
                "text-halo-color": p["water"],
                "text-halo-width": 1.2
            }
        })
    
    # 72. Watername lake line
    layers.append({
        "id": "watername_lake_line",
        "type": "symbol",
        "source": "carto",
        "source-layer": "water_name",
        "minzoom": 12,
        "layout": {
            "text-field": "{name}",
            "text-font": ["IBM Plex Sans Italic", "IBM Plex Sans Regular"],
            "text-size": 11,
            "symbol-placement": "line"
        },
        "paint": {
            "text-color": p["waterway_label"],
            "text-halo-color": p["water"],
            "text-halo-width": 1
        }
    })
    
    # 73-76. Place labels (hamlet → town)
    place_levels = [
        ("place_hamlet",   "hamlet",   12, 10, "label_text_tertiary"),
        ("place_suburbs",  "suburb",   11, 11, "label_text_tertiary"),
        ("place_villages", "village",  10, 11, "label_text_secondary"),
        ("place_town",     "town",      8, 12, "label_text_secondary"),
    ]
    for pl_id, cls, minz, size, color_key in place_levels:
        layers.append({
            "id": pl_id,
            "type": "symbol",
            "source": "carto",
            "source-layer": "place",
            "minzoom": minz,
            "filter": ["==", "class", cls],
            "layout": {
                "text-field": "{name:latin}",
                "text-font": ["IBM Plex Sans Regular"],
                "text-size": size,
                "text-letter-spacing": 0.04,
                "text-max-width": 8,
            },
            "paint": {
                "text-color": p[color_key],
                "text-halo-color": p["label_halo"],
                "text-halo-width": 1.2
            }
        })
    
    # 77-79. Country labels
    for c_id, maxz, minz, size, spacing in [
        ("place_country_2", 7, 3, { "stops": [[3, 11], [7, 16]] }, 0.08),
        ("place_country_1", None, 2, { "stops": [[2, 12], [5, 18]] }, 0.1),
        ("place_state", 8, 4, { "stops": [[4, 9], [8, 14]] }, 0.06),
    ]:
        layer = {
            "id": c_id,
            "type": "symbol",
            "source": "carto",
            "source-layer": "place",
            "minzoom": minz,
            "layout": {
                "text-field": "{name:latin}",
                "text-font": ["IBM Plex Sans Bold"],
                "text-size": size,
                "text-transform": "uppercase",
                "text-letter-spacing": spacing,
                "text-max-width": 8,
            },
            "paint": {
                "text-color": p["label_country"],
                "text-halo-color": p["label_halo"],
                "text-halo-width": 1.5
            }
        }
        if maxz:
            layer["maxzoom"] = maxz
        if c_id == "place_state":
            layer["filter"] = ["==", "class", "state"]
            layer["paint"]["text-color"] = p["label_text_secondary"]
        elif c_id == "place_country_2":
            layer["filter"] = ["all", ["==", "class", "country"], ["has", "iso_a2"], [">=", "rank", 3]]
        else:
            layer["filter"] = ["all", ["==", "class", "country"], ["has", "iso_a2"], ["<=", "rank", 2]]
        layers.append(layer)
    
    # 80. Continent
    layers.append({
        "id": "place_continent",
        "type": "symbol",
        "source": "carto",
        "source-layer": "place",
        "maxzoom": 3,
        "filter": ["==", "class", "continent"],
        "layout": {
            "text-field": "{name:latin}",
            "text-font": ["IBM Plex Sans Bold"],
            "text-size": 14,
            "text-transform": "uppercase",
            "text-letter-spacing": 0.2,
        },
        "paint": {
            "text-color": p["label_country"],
            "text-halo-color": p["label_halo"],
            "text-halo-width": 1.5
        }
    })
    
    # 81-86. City labels at various zoom ranges
    city_configs = [
        ("place_city_r6", 6, 7, {"stops": [[6, 11], [9, 15]]}, "label_city"),
        ("place_city_r5", 5, 7, {"stops": [[5, 12], [9, 16]]}, "label_city"),
        ("place_city_dot_r7", 7, 8, 11, "label_city"),
        ("place_city_dot_r4", 4, 7, {"stops": [[4, 11], [8, 14]]}, "label_city"),
        ("place_city_dot_r2", 2, 7, {"stops": [[2, 12], [6, 16]]}, "label_city"),
        ("place_city_dot_z7", 7, None, {"stops": [[7, 11], [12, 16]]}, "label_city"),
    ]
    for c_id, minz, maxz, size, color_key in city_configs:
        f = ["==", "class", "city"]
        if "r7" in c_id:
            f = ["all", ["==", "class", "city"], [">=", "rank", 7]]
        elif "r6" in c_id:
            f = ["all", ["==", "class", "city"], [">=", "rank", 6]]
        elif "r5" in c_id:
            f = ["all", ["==", "class", "city"], [">=", "rank", 5]]
        elif "r4" in c_id:
            f = ["all", ["==", "class", "city"], [">=", "rank", 4], ["<", "rank", 7]]
        elif "r2" in c_id:
            f = ["all", ["==", "class", "city"], [">=", "rank", 2], ["<", "rank", 4]]
        elif "z7" in c_id and "capital" not in c_id:
            f = ["all", ["==", "class", "city"], ["<", "rank", 2]]
        
        layer = {
            "id": c_id,
            "type": "symbol",
            "source": "carto",
            "source-layer": "place",
            "minzoom": minz,
            "filter": f,
            "layout": {
                "text-field": "{name:latin}",
                "text-font": ["IBM Plex Sans SemiBold"],
                "text-size": size,
                "text-max-width": 8,
                "icon-allow-overlap": True,
            },
            "paint": {
                "text-color": p[color_key],
                "text-halo-color": p["label_city_halo"],
                "text-halo-width": 1.4
            }
        }
        if maxz:
            layer["maxzoom"] = maxz
        layers.append(layer)
    
    # 87. Capital city at z7
    layers.append({
        "id": "place_capital_dot_z7",
        "type": "symbol",
        "source": "carto",
        "source-layer": "place",
        "minzoom": 7,
        "filter": ["all", ["==", "class", "city"], [">=", "capital", 2]],
        "layout": {
            "text-field": "{name:latin}",
            "text-font": ["IBM Plex Sans Bold"],
            "text-size": {"stops": [[7, 12], [12, 18]]},
            "text-max-width": 8,
            "icon-allow-overlap": True,
        },
        "paint": {
            "text-color": p["label_city"],
            "text-halo-color": p["label_city_halo"],
            "text-halo-width": 1.5
        }
    })
    
    # 88-89. POI labels (stadium, park)
    for poi_id, cls in [("poi_stadium", "stadium"), ("poi_park", "park")]:
        layers.append({
            "id": poi_id,
            "type": "symbol",
            "source": "carto",
            "source-layer": "poi",
            "minzoom": 14,
            "filter": ["==", "class", cls],
            "layout": {
                "text-field": "{name}",
                "text-font": ["IBM Plex Sans Regular"],
                "text-size": 10,
                "text-max-width": 6,
            },
            "paint": {
                "text-color": p["park_label"] if cls == "park" else p["poi_text"],
                "text-halo-color": p["label_halo"],
                "text-halo-width": 1
            }
        })
    
    # 90-93. Road name labels
    rn_configs = [
        ("roadname_minor", 15, 10, ["in", "class", "minor", "service", "tertiary"]),
        ("roadname_sec",   13, 11, ["==", "class", "secondary"]),
        ("roadname_pri",   11, 12, ["in", "class", "primary", "trunk"]),
        ("roadname_major", 9,  13, ["==", "class", "motorway"]),
    ]
    for rn_id, minz, size, f in rn_configs:
        layers.append({
            "id": rn_id,
            "type": "symbol",
            "source": "carto",
            "source-layer": "transportation_name",
            "minzoom": minz,
            "filter": f,
            "layout": {
                "text-field": "{name}",
                "text-font": ["IBM Plex Sans Regular"],
                "text-size": size,
                "symbol-placement": "line",
                "symbol-spacing": 400,
                "text-max-angle": 30,
            },
            "paint": {
                "text-color": p["roadname_text"],
                "text-halo-color": p["roadname_halo"],
                "text-halo-width": 1.2
            }
        })
    
    # 94. House numbers
    layers.append({
        "id": "housenumber",
        "type": "symbol",
        "source": "carto",
        "source-layer": "housenumber",
        "minzoom": 17,
        "layout": {
            "text-field": "{housenumber}",
            "text-font": ["IBM Plex Sans Regular"],
            "text-size": 9,
        },
        "paint": {
            "text-color": p["label_text_tertiary"],
            "text-halo-color": p["label_halo"],
            "text-halo-width": 0.8
        }
    })
    
    return layers


def main():
    dark_style = build_style(
        DARK_PALETTE,
        "IBM Carbon × Sage Vector Dark"
    )
    
    light_style = build_style(
        LIGHT_PALETTE,
        "IBM Carbon × Sage Vector Light"
    )
    
    out_dark = "static/lib/maplibre/carbon-vector-dark.json"
    out_light = "static/lib/maplibre/carbon-vector-light.json"
    
    with open(out_dark, "w") as f:
        json.dump(dark_style, f, indent=2)
    print(f"✓ Wrote {out_dark} ({len(dark_style['layers'])} layers)")
    
    with open(out_light, "w") as f:
        json.dump(light_style, f, indent=2)
    print(f"✓ Wrote {out_light} ({len(light_style['layers'])} layers)")


if __name__ == "__main__":
    main()
