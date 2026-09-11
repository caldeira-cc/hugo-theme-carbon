---
title: "Hugo Carbon — IBM Carbon Design System v11 Theme"
description: "High-performance modular Hugo engine built on IBM Carbon Design System v11 with dual-style theming, zero CDN dependencies, token-based SCSS, AES-256-GCM encryption, and Plex Math."
hero_tag: "/// Carbon v11 Design System"
hero_heading_1: "IBM Carbon"
hero_heading_2: "Modular Theme for Hugo,"
hero_heading_highlight: "open source."
hero_lead: "An offline-first Hugo static site engine implementing the IBM Carbon Design System v11. Built with fluid 16-column 2x Grid geometry, dynamic token-driven theming, client-side data analytics, and self-hosted IBM Plex typography."

hero_actions:
  - label: "Explore Documentation"
    url: "/docs/"
    type: "primary"
    icon: "arrow-right"
  - label: "Shortcode Library"
    url: "/docs/shortcodes/"
    type: "secondary"
  - label: "Deployment Guide"
    url: "/docs/deployment/"
    type: "ghost"

features:
  - id: "01"
    title: "Dual-Style Theming System"
    category: "DESIGN TOKENS"
    description: "Built-in dual styles (Light and Dark) synchronised with operating system preferences, with per-domain token customisation and zero-FOUC inline bootstrapping."
    url: "/docs/customisation/"
  - id: "02"
    title: "75+ Modular Shortcodes"
    category: "COMPONENTS"
    description: "Accordions, tabs, tiles, notifications, modal dialogs, form controls, progress indicators, and status tags matching IBM Carbon React component specifications."
    url: "/docs/shortcodes/"
  - id: "03"
    title: "W3C CSVW Data Engine"
    category: "DATA SUITE"
    description: "Declarative tabular datasets ingesting CSV on the Web companion schemas with multithreaded Web Worker sorting, text filtering, and pagination."
    url: "/data/"
  - id: "04"
    title: "IBM Plex Typography Scale"
    category: "TYPOGRAPHY"
    description: "100% self-hosted IBM Plex Sans, Serif, Mono, and Math WOFF2 fonts with KaTeX formulas rendered in OpenType Plex Math."
    url: "/docs/typography/"
  - id: "05"
    title: "MapLibre GL Vector Maps"
    category: "GEOSPATIAL"
    description: "GPU-accelerated 2D flat and 3D globe vector cartography rendering RFC 7946 GeoJSON layers with Carbon styling."
    url: "/docs/geojson-maps/"
  - id: "06"
    title: "AES-256-GCM Encryption"
    category: "SECURITY"
    description: "Build-time static document encryption using PBKDF2 and the Web Cryptography API with zero plaintext leaks in production."
    url: "/docs/encrypted-secrets-demo/"

sections:
  - title: "Core Documentation"
    url: "/docs/"
    desc: "Complete architectural and configuration reference"
  - title: "Shortcodes Catalog"
    url: "/docs/shortcodes/"
    desc: "Exhaustive live component and shortcode specimen library"
  - title: "Deployment Guide"
    url: "/docs/deployment/"
    desc: "Production hosting blueprints for Cloudflare, GitHub, and Netlify"
  - title: "W3C Data Explorer"
    url: "/data/"
    desc: "Multithreaded tabular CSVW dataset viewer"
---

## Live Component Specimens & Theme Capabilities

The specimens below demonstrate interactive Carbon Design System components functioning inside Hugo Markdown content without external frameworks.

{{< notification kind="info" title="Zero External CDN Invariant" subtitle="100% of all fonts, scripts, stylesheets, and vendor libraries are self-hosted locally from static/ with zero third-party network telemetry." >}}
{{< /notification >}}

---

### Interactive Accordions & Progressive Disclosure

Accordions collapse dense technical details into scannable lists, expanding smoothly upon user interaction:

{{< accordion >}}
  {{< accordion-item title="What is the Carbon 2x Grid layout geometry?" open="true" >}}
The Carbon 2x Grid is a fluid 16-column layout with an 8-pixel mini-unit spatial cadence governing all margins, paddings, and typographic line heights. The entire content container is bounded within an auto-centering 1440px max-width boundary.
  {{< /accordion-item >}}
  {{< accordion-item title="How does the Dual-Style theming architecture work?" >}}
The theme provides two canonical visual styles: `light` (based on IBM Carbon White) and `dark` (based on IBM Carbon Gray 100). The theme manager automatically tracks the operating system's `prefers-color-scheme`, while individual sites can override `--cds-*` color tokens in their own `hugo.yaml`.
  {{< /accordion-item >}}
  {{< accordion-item title="How does the W3C CSVW engine process large datasets?" >}}
Tabular datasets are parsed using companion `.csv-metadata.json` descriptors inside a sandboxed Web Worker. Sorting, filtering, and pagination occur off the main browser thread to guarantee 60 FPS rendering.
  {{< /accordion-item >}}
{{< /accordion >}}

---

### Contained Tabs & Multi-Panel Interfaces

Tabs organise related perspectives into a compact, switchable interface:

{{< tabs type="contained" >}}
  {{< tab-panel title="Architecture & Grid" icon="grid" selected="true" >}}
    <h4 class="cds--type-heading-03" style="margin-top: 0;">16-Column Fluid Mathematical Geometry</h4>
    <p class="cds--type-body-long-01">
      The responsive grid adapts seamlessly from single-column mobile viewports (320px) up to 16 columns on desktop displays, maintaining a consistent 4px baseline rhythm across all headings and paragraph text.
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
      <span class="cds--tag cds--tag--blue">16 COLUMNS</span>
      <span class="cds--tag cds--tag--teal">8PX MINI-UNIT</span>
      <span class="cds--tag cds--tag--purple">4PX BASELINE</span>
      <span class="cds--tag cds--tag--green">1440PX BOUNDARY</span>
    </div>
  {{< /tab-panel >}}
  {{< tab-panel title="Design Tokens" icon="color-palette" >}}
    <h4 class="cds--type-heading-03" style="margin-top: 0;">IBM Carbon v11 CSS Custom Properties</h4>
    <p class="cds--type-body-long-01">
      Components use standard Carbon design tokens (`--cds-*`) for layer backgrounds, borders, focus rings, and text colours, ensuring cohesive styling across light and dark colorways.
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
      <span class="cds--tag cds--tag--warm-gray">--cds-background</span>
      <span class="cds--tag cds--tag--warm-gray">--cds-layer-01</span>
      <span class="cds--tag cds--tag--warm-gray">--cds-interactive-01</span>
      <span class="cds--tag cds--tag--warm-gray">--cds-text-primary</span>
    </div>
  {{< /tab-panel >}}
  {{< tab-panel title="Cryptographic Security" icon="locked" >}}
    <h4 class="cds--type-heading-03" style="margin-top: 0;">Static Document Encryption (AES-256-GCM)</h4>
    <p class="cds--type-body-long-01">
      Sensitive pages are encrypted at build time via Python using PBKDF2 with 100,000 iterations and AES-256-GCM. Browsers decrypt content entirely in-origin via the native Web Cryptography API.
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
      <span class="cds--tag cds--tag--red">PBKDF2 SHA-256</span>
      <span class="cds--tag cds--tag--red">100,000 ITERATIONS</span>
      <span class="cds--tag cds--tag--red">AES-256-GCM</span>
    </div>
  {{< /tab-panel >}}
{{< /tabs >}}

---

### Interactive Tiles & Structured Affordances

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  {{< clickable-tile href="/docs/shortcodes/" title="Explore 75+ Shortcodes &rarr;" >}}
Inspect the complete catalog of Carbon shortcodes, parameter tables, and usage examples.
  {{< /clickable-tile >}}
  
  {{< expandable-tile title="Expandable Tile Configuration Specimen" >}}
**Summary Content**: Core configuration parameters are set in `hugo.yaml`.
<!-- more -->
**Expanded Detail**: Additional module parameters—such as MapLibre GL coordinates, Web Worker buffer thresholds, and custom color themes—can be customized in site configurations.
  {{< /expandable-tile >}}
</div>

---

### Responsive Carbon Data Table

{{< data-table sortable="true" stickyHeader="true" filterable="true" >}}
| Module Component | Architectural Layer | Status | Benchmark LCP | Security Standard |
|:---|:---|:---|:---|:---|
| **W3C CSVW Engine** | Web Worker Pipeline | <span class="cds--tag cds--tag--green">OPERATIONAL</span> | `185 ms` | W3C Standard |
| **MapLibre GL Vector Maps** | GPU Canvas Projection | <span class="cds--tag cds--tag--green">OPERATIONAL</span> | `210 ms` | RFC 7946 GeoJSON |
| **KaTeX IBM Plex Math** | OpenType Glyph Layout | <span class="cds--tag cds--tag--blue">VERIFIED</span> | `95 ms` | ISO LaTeX |
| **GNU PSPP Statistics** | Statistical Web Worker | <span class="cds--tag cds--tag--purple">ACTIVE</span> | `240 ms` | POSIX Compliant |
| **AES-256-GCM Vault** | Web Cryptography API | <span class="cds--tag cds--tag--red">ENCRYPTED</span> | `120 ms` | NIST SP 800-38D |
{{< /data-table >}}

---

### Mathematical Typesetting with IBM Plex Math

KaTeX formulas are rendered client-side using self-hosted IBM Plex Math OpenType fonts:

$$\oint_{\partial \Omega} \mathbf{F} \cdot d\mathbf{r} = \iint_{\Omega} (\nabla \times \mathbf{F}) \cdot d\mathbf{S}$$

$$\mathcal{L} = \sqrt{\frac{1}{2\pi \sigma^2}} \exp\left( -\frac{(x - \mu)^2}{2\sigma^2} \right)$$

---

### Declarative Architecture Diagram

{{< mermaid title="Hugo Carbon Theme Static Architecture" id="theme-arch-diagram" >}}
flowchart LR
    Source["Markdown & Config\n(hugo.yaml + content/)"] --> Hugo["Hugo Extended Engine\n(Dart Sass + esbuild)"]
    Theme["hugo-theme-carbon\n(layouts/ + assets/ + static/)"] --> Hugo
    
    Hugo --> Output["Compiled Static Output\n(public/)"]
    
    subgraph ClientBrowser ["Offline-First Client Runtime"]
        Output --> DOM["Semantic HTML5 DOM\n(16-Column 2x Grid)"]
        Output --> Worker["Web Worker Thread\n(W3C CSVW + PSPP)"]
        Output --> Fonts["IBM Plex WOFF2 Fonts\n(Sans / Serif / Mono / Math)"]
    end
    
    classDef primary fill:#161616,stroke:#0f62fe,stroke-width:2px,color:#f4f4f4;
    classDef worker fill:#1e1e1e,stroke:#8a3ffc,stroke-width:2px,color:#f4f4f4;
    classDef font fill:#1b2a33,stroke:#009d9a,stroke-width:2px,color:#f4f4f4;
    
    class Source,Theme,Hugo,Output,DOM primary;
    class Worker worker;
    class Fonts font;
{{< /mermaid >}}
