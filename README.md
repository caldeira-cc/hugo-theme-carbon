# IBM Carbon Design System v11 Hugo Theme Engine

A modular, enterprise-grade static site engine for [Hugo](https://gohugo.io/), built with the **IBM Design Language** and **IBM Carbon Design System v11**.

## Features

- **IBM Carbon v11 Design Tokens**: Built-in support for 4 theme modes (`white`, `g10`, `g90`, `g100`) with dynamic CSS custom properties and instant theme switching.
- **IBM Carbon 2x Grid**: 16-column responsive grid with 8px mini-units, 4px baseline vertical rhythm, and 1440px max-width boundary.
- **IBM Plex Typography**: Self-hosted WOFF2 font delivery directly from the official IBM Plex repository (IBM Plex Sans, IBM Plex Mono, and IBM Plex Serif) with zero third-party CDN requests.
- **Hybrid Islands & Dynamic Widgets**:
  - Main Action Bar with live Open-Meteo Weather API, Location, Date, Theme Switcher, and Instant Search.
  - Client-side fast search with keyboard shortcuts (`/` or `Cmd+K`).
- **W3C CSVW Interactive Data Table Engine**:
  - Declarative tabular dataset ingestion (`.csv` + `.csv-metadata.json`).
  - Client-side sorting, instant text filtering, status tag badges, and Carbon pagination controls.
- **Hierarchical Navigation & Sidebars**:
  - Left navigation tree for documentation hierarchies.
  - Right Table of Contents with active scroll-spy.
  - Mobile off-canvas drawers (< 1056px).
- **Collection Engine & Standardized Cards**:
  - Category and tag filtering bars (`.cds--tag`).
  - Standardized ClickableTile page cards with dynamic metadata grid.

## Quick Start

### Requirements
- [Hugo Extended](https://gohugo.io/installation/) v0.120+ (includes Dart Sass and JS Bundling).

### Run Local Development Server
```bash
hugo server -D -p 1313
```
Navigate to `http://localhost:1313/` in your browser.

### Build for Production
```bash
hugo --minify --gc
```
The static site will be generated in `./public/`.

## Configuration

Edit `hugo.yaml` to adjust site parameters, navigation links, theme colors, and widget toggles. See `/docs/configuration/` for full details.

## License
Apache-2.0 or MIT. Built with IBM Carbon Design System.
