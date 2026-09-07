---
title: "Geospatial Vector Map Explorer"
description: "How to render interactive MapLibre GL vector maps adhering to the open Mapbox Vector Tile (MVT) standard with GeoJSON overlays and theme styling."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Architecture", "Geospatial"]
tags: ["Maps", "MapLibre", "MVT", "GeoJSON"]
version: "v11.2.0"
---

The **Hugo-Carbon Modular Engine** includes a client-side geospatial mapping system powered by GPU-accelerated **MapLibre GL JS v4**. It renders vector tiles, IBM Carbon theme palettes, 3D spherical globe projections, and GeoJSON overlays with zero external CDN dependencies.

---

## 1. 2D Flat & 3D Globe Vector Projections

The `{{</* geojson-map */>}}` shortcode embeds an interactive GPU-accelerated vector map with dynamic 2D Flat (Mercator) and 3D Spherical Globe projection switching:

{{< geojson-map 
    lat="38.7223" 
    lng="-9.1393" 
    zoom="3" 
    title="Global Infrastructure & Sensor Nodes"
    src="/data/sample-infrastructure.geojson"
    projection="globe"
    height="460px"
>}}

---

## 2. Key Architecture Features

- **3D Globe & 2D Flat Mercator**: Instant client-side projection switching powered by MapLibre GL v4 with WebGL acceleration.
- **IBM Plex Sans Typography**: All cartographic labels (countries, continents, capitals, cities, towns, waterways, and road names) render using self-hosted IBM Plex Sans PBF glyphs.
- **IBM Carbon × Sage Color Palette**: Custom dark (`carbon-vector-dark.json`) and light (`carbon-vector-light.json`) vector styling derived from IBM Carbon tokens and Sage Green (`#69a280`).
- **User-Configurable Layer Toggles**: Dynamic toggling of Roads, Buildings, Labels, and Administrative Boundaries directly from the toolbar or modal.
- **Full Interactive Modal**: Expand any map into an immersive modal explorer with real-time coordinate tracking and GeoJSON data export.
- **Open Mapbox Vector Tile (MVT) Standard**: 100% offline-compatible vector tile rendering adhering to the open MVT specification (Carto/OSM basemaps) with zero API keys or external telemetry.
- **Zero External CDNs**: 100% self-hosted scripts, styles, vector tiles, and 1,028 font PBF ranges in `static/lib/maplibre/`.
