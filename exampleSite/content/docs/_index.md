---
title: "Documentation"
description: "Architecture, configuration, deployment guides, and component references for the Hugo Carbon theme."
cascade:
  params:
    collectionType: "docs"
    sidebars:
      left:
        enable: true
        data: "docs"
      right:
        enable: true
    mainBar:
      enable: false
---

The **Hugo Carbon Theme** is an open-source, modular static website theme implementing the **IBM Carbon Design System v11**. It combines Carbon's 16-column 2x Grid, token-based theming, and accessible interface patterns with the speed and simplicity of Hugo.

Everything runs from origin: IBM Plex fonts, KaTeX mathematics, MapLibre GL vector cartography, and Web Worker data engines are self-hosted with zero external CDNs and zero tracking.

---

## Quick Start

### 1. Requirements

Install [Hugo Extended](https://gohugo.io/installation/) (version `0.149.0` or higher) to enable Dart Sass and ESBuild:

```bash
# macOS (Homebrew)
brew install hugo

# Linux (Snap or package manager)
snap install hugo --channel=extended
```

### 2. Clone & Launch

Clone the repository and start the development server:

```bash
git clone https://github.com/caldeira-cc/hugo-theme-carbon.git
cd hugo-theme-carbon/exampleSite
hugo server -p 1316
```

Open `http://localhost:1316/` in your browser. Live reload is active by default.

---

## Documentation Sections

<div class="cds--row" style="margin: 1.5rem -0.5rem; row-gap: 1.25rem;">

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/architecture/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #0f62fe;">
      <span class="cds--tag cds--tag--blue cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">FOUNDATIONS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Architecture &amp; 2x Grid</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Fluid 16-column grid system, 8px mini-unit spatial cadence, 4px baseline rhythm, and layout mechanics.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/configuration/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #7a9eb3;">
      <span class="cds--tag cds--tag--teal cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">SETUP</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Configuration &amp; Cascade</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Parameter dictionaries for <code>hugo.yaml</code>, navigation trees, sidebar data, and front-matter cascade rules.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/deployment/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #24a148;">
      <span class="cds--tag cds--tag--green cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">HOSTING</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Deployment &amp; Hosting</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Step-by-step blueprints for deploying to Cloudflare Pages, GitHub Pages with Actions, Netlify, and static servers.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/customisation/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #8a3ffc;">
      <span class="cds--tag cds--tag--purple cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">THEMING</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Theme Customisation</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Dual-style Light and Dark themes, 18 colour palettes, CSS custom properties, and subdomain token overrides.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #da1e28;">
      <span class="cds--tag cds--tag--red cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">SHORTCODES</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">75+ Shortcodes Catalog</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Modular shortcode library grouped into dedicated pages for cards, navigation, typography, forms, and alerts.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/data-analytics-suite/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #1192e8;">
      <span class="cds--tag cds--tag--cyan cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">DATA SUITE</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">W3C CSVW Data Engine</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Client-side Web Worker table engine with schema metadata, custom status tags, search, and sorting.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/geojson-maps/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #009d9a;">
      <span class="cds--tag cds--tag--teal cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">CARTOGRAPHY</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">MapLibre GL Vector Maps</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        GPU-accelerated vector cartography rendering standard RFC 7946 GeoJSON layers in flat and globe projections.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/encrypted-secrets-demo/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #6929c4;">
      <span class="cds--tag cds--tag--purple cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">SECURITY</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Client-Side Encryption</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Build-time document encryption using PBKDF2 key derivation and Web Crypto AES-256-GCM static decryption.
      </p>
    </a>
  </div>

</div>

---

## AI Disclosure & Editorial Transparency

In accordance with official **IBM Carbon Design System v11 AI component patterns**, all synthetic placeholder text generated with artificial intelligence is marked with the **Carbon AI modifier** (`cds--ai-label`):

{{< ai-label text="This theme documentation strictly distinguishes human-written technical prose from synthetic placeholder text. Wherever machine-assisted content appears, this badge provides direct explainability." />}}

Users can click the AI badge at any time to open an explainability popover detailing how the content was produced.
