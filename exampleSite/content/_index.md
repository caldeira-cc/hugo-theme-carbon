---
title: "Hugo Carbon — IBM Carbon Design System v11 Theme"
description: "High-performance modular Hugo engine built on IBM Carbon Design System v11 with dual-style theming, zero CDN dependencies, token-based SCSS, AES-256-GCM encryption, and Plex Math."
hero_tag: "/// Carbon v11 Design System"
hero_heading_1: "IBM Carbon"
hero_heading_2: "Modular Theme for Hugo,"
hero_heading_highlight: "engineered."
hero_lead: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. A production-ready, offline-first Hugo static site engine implementing IBM Carbon Design System v11 with token-driven theming, client-side data analytics, and self-hosted IBM Plex typography."

hero_actions:
  - label: "Explore Documentation"
    url: "/docs/"
    type: "primary"
    icon: "arrow-right"
  - label: "75+ Components Studio"
    url: "/docs/carbon-components/"
    type: "secondary"
  - label: "Interactive Showcase"
    url: "/docs/feature-showcase/"
    type: "ghost"

features:
  - id: "01"
    title: "Dual-Style Theming System"
    category: "DESIGN TOKENS"
    description: "Lorem ipsum dolor sit amet: built-in dual styles (Light and Dark) tracking OS preferences, with per-domain custom color tokens and zero-FOUC inline bootstrap."
    url: "/docs/customisation/"
  - id: "02"
    title: "75+ Modular Shortcodes"
    category: "COMPONENTS"
    description: "Consectetur adipiscing elit: accordions, tabs, tiles, notifications, modals, form controls, progress indicators, and status tags matching IBM Carbon React specifications."
    url: "/docs/carbon-components/"
  - id: "03"
    title: "W3C CSVW Data Engine"
    category: "DATA SUITE"
    description: "Sed do eiusmod tempor: declarative tabular datasets ingesting CSV on the Web companion schemas with multithreaded Web Worker sorting, text filtering, and pagination."
    url: "/data/"
  - id: "04"
    title: "IBM Plex Typography Scale"
    category: "TYPOGRAPHY"
    description: "Incididunt ut labore et dolore: 100% self-hosted IBM Plex Sans, Serif, Mono, and Math WOFF2 fonts with KaTeX formulas rendered in OpenType Plex Math."
    url: "/docs/typography/"
  - id: "05"
    title: "MapLibre GL Vector Maps"
    category: "GEOSPATIAL"
    description: "Magna aliqua ut enim ad minim: GPU-accelerated 2D flat and 3D globe vector cartography rendering RFC 7946 GeoJSON layers with Carbon styling."
    url: "/docs/geojson-maps/"
  - id: "06"
    title: "AES-256-GCM Encryption"
    category: "SECURITY"
    description: "Quis nostrud exercitation: build-time static document encryption using PBKDF2 and Web Cryptography API with zero plaintext leaks in production."
    url: "/docs/encrypted-secrets-demo/"

sections:
  - title: "Core Documentation"
    url: "/docs/"
    desc: "Complete architectural and configuration reference"
  - title: "75+ Components Studio"
    url: "/docs/carbon-components/"
    desc: "Exhaustive live component and shortcode specimen catalog"
  - title: "Visual Style Guide"
    url: "/style/"
    desc: "Color tokens, typography scales, and UI landmarks"
  - title: "W3C Data Explorer"
    url: "/data/"
    desc: "Multithreaded tabular CSVW dataset viewer"
---

## Demonstration Showcase & UI Component Specimen

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

{{< notification kind="info" title="Zero External CDN Invariant" subtitle="Lorem ipsum dolor: 100% of all fonts, scripts, stylesheets, and vendor libraries are self-hosted locally from static/ with zero third-party network telemetry." >}}
{{< /notification >}}

---

### Interactive Accordions & Progressive Disclosure

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium:

{{< accordion >}}
  {{< accordion-item title="What is the Carbon 2x Grid layout geometry?" open="true" >}}
Lorem ipsum dolor sit amet, consectetur adipiscing elit. The Carbon 2x Grid is a fluid 16-column layout with an 8-pixel mini-unit spatial cadence governing all margins, paddings, and typographic line heights. The entire content container is bounded within a 1440px max-width frame.
  {{< /accordion-item >}}
  {{< accordion-item title="How does the strict Dual-Style theming architecture work?" >}}
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore: the theme provides two canonical visual styles (`light` based on IBM Carbon White and `dark` based on IBM Carbon Gray 100). The theme manager automatically tracks the operating system `prefers-color-scheme`, while individual domains can override `--cds-*` color tokens in their own `hugo.yaml`.
  {{< /accordion-item >}}
  {{< accordion-item title="How does the W3C CSVW engine process large datasets?" >}}
Excepteur sint occaecat cupidatat non proident: tabular datasets are parsed using companion `.csv-metadata.json` descriptors inside a sandboxed Web Worker. Sorting, filtering, and pagination occur off the main browser thread to guarantee 60 FPS rendering.
  {{< /accordion-item >}}
{{< /accordion >}}

---

### Contained Tabs & Multi-Panel Interfaces

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt:

{{< tabs type="contained" tabs="Architecture & Grid,Design Tokens,Cryptographic Security" >}}
  {{< tab-panel active="true" >}}
    <h4 class="cds--type-heading-03" style="margin-top: 0;">16-Column Fluid Mathematical Geometry</h4>
    <p class="cds--type-body-long-01">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
      <span class="cds--tag cds--tag--blue">16 COLUMNS</span>
      <span class="cds--tag cds--tag--teal">8PX MINI-UNIT</span>
      <span class="cds--tag cds--tag--purple">4PX BASELINE</span>
      <span class="cds--tag cds--tag--green">1440PX BOUNDARY</span>
    </div>
  {{< /tab-panel >}}
  {{< tab-panel >}}
    <h4 class="cds--type-heading-03" style="margin-top: 0;">IBM Carbon v11 CSS Custom Properties</h4>
    <p class="cds--type-body-long-01">
      Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
      <span class="cds--tag cds--tag--warm-gray">--cds-background</span>
      <span class="cds--tag cds--tag--warm-gray">--cds-layer-01</span>
      <span class="cds--tag cds--tag--warm-gray">--cds-interactive-01</span>
      <span class="cds--tag cds--tag--warm-gray">--cds-text-primary</span>
    </div>
  {{< /tab-panel >}}
  {{< tab-panel >}}
    <h4 class="cds--type-heading-03" style="margin-top: 0;">Static Document Encryption (AES-256-GCM)</h4>
    <p class="cds--type-body-long-01">
      In hac habitasse platea dictumst. Vivamus adipiscing fermentum quam. Volutpat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci.
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
  {{< clickable-tile href="/docs/carbon-components/" title="Explore All 75+ Shortcodes" >}}
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Click to inspect the full library of Carbon shortcodes.
  {{< /clickable-tile >}}
  
  {{< expandable-tile title="Expandable Tile Lorem Ipsum" >}}
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Above-the-fold summary is visible by default.
<!-- more -->
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
  {{< /expandable-tile >}}
</div>

---

### Responsive Carbon Data Table

Lorem ipsum dolor sit amet, consectetur adipiscing elit:

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

Lorem ipsum dolor sit amet, KaTeX formulas are rendered using self-hosted IBM Plex Math OpenType fonts:

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
