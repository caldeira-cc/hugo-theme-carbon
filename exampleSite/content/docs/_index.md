---
title: "Theme Documentation Hub"
description: "Comprehensive technical specifications, configuration references, deployment guides, and architectural showcases for the Hugo Carbon Theme."
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

<div style="padding: 1.25rem 1.5rem; margin-bottom: 2.5rem; background-color: var(--cds-layer-01); border-left: 4px solid var(--cds-interactive-01); display: flex; align-items: flex-start; gap: 1rem; border-top: 1px solid var(--cds-border-subtle-00); border-right: 1px solid var(--cds-border-subtle-00); border-bottom: 1px solid var(--cds-border-subtle-00);">
  <svg width="24" height="24" viewBox="0 0 32 32" fill="var(--cds-interactive-01)" style="flex-shrink: 0; margin-top: 0.15rem;"><path d="M26 4H6C4.9 4 4 4.9 4 6V26C4 27.1 4.9 28 6 28H26C27.1 28 28 27.1 28 26V6C28 4.9 27.1 4 26 4ZM26 26H6V10H26V26ZM26 8H6V6H26V8Z"/></svg>
  <div>
    <div style="font-weight: 600; font-size: 1rem; color: var(--cds-text-primary); margin-bottom: 0.25rem;">Enterprise Static Architecture Documentation</div>
    <div style="font-size: 0.875rem; color: var(--cds-text-secondary); line-height: 1.5;">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. This technical documentation hub provides exhaustive specifications for installing, configuring, styling, and deploying static websites powered by Hugo and the IBM Carbon Design System v11.
    </div>
  </div>
</div>

Explore the architectural guides, deployment blueprints, and component references below:

<div class="cds--row" style="margin: 1.5rem -0.5rem; row-gap: 1.25rem;">

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/architecture/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid var(--cds-interactive-01);">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">FOUNDATIONS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Architecture &amp; 2x Grid</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Fluid 16-column grid system, 8px mini-unit spatial cadence, 4px baseline rhythm, and 1440px container geometry.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/configuration/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #7a9eb3;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">CONFIGURATION</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Configuration &amp; Cascade</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Complete <code>hugo.yaml</code> parameter dictionary, widget toggles, navigation trees, and front-matter cascade rules.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/customisation/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #24a148;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">THEMING</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Theme Customisation &amp; Tokens</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Strict dual-style theming (Light and Dark), browser switching, OS sync, and per-domain custom color palettes.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/carbon-components/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #8a3ffc;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">COMPONENTS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">75+ Carbon Shortcodes</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Complete reference catalog for accordions, tabs, tiles, notifications, modals, and interactive form controls.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/feature-showcase/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #009d9a;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">SHOWCASE</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Interactive Feature Showcase</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Live interactive specimens of shortcodes, math formulas, vCards, input controls, and TTS audio narration.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/dashboard-layout/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #da1e28;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">DASHBOARD</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Dashboard Framework &amp; KPIs</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Executive telemetry dashboard template with KPI metric cards, status matrices, and real-time modal inspectors.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/data-analytics-suite/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #1192e8;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">DATA SUITE</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">W3C CSVW &amp; PSPP Analytics</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Multithreaded Web Worker CSVW tables, GNU PSPP Variable View, summary rows, and dataset exploration.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/geojson-maps/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #6929c4;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">GEOSPATIAL</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">MapLibre GL Vector Maps</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        GPU-accelerated vector cartography rendering standard RFC 7946 GeoJSON layers in 2D flat or 3D globe projections.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/mathematical-typesetting/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #005d5d;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">MATHEMATICS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">KaTeX &amp; IBM Plex Math</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Client-side KaTeX rendering mapped directly to self-hosted IBM Plex Math OpenType fonts and LaTeX delimiters.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/typography/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #ba4e00;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">TYPOGRAPHY</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Typography &amp; Prose Scale</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Specimens of display headings, body styles, blockquotes, definition lists, task lists, and footnotes.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/encrypted-secrets-demo/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #fa4d56;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">SECURITY</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Encrypted Secrets Container</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Build-time document encryption using PBKDF2 key derivation and AES-256-GCM static decryption.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/cloudflare-deployment/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #f1c21b;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">DEPLOYMENT</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Cloudflare &amp; Static Hosting</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Production setup for deploying sites built on Hugo-Carbon to Cloudflare Pages, GitHub Pages, and Netlify.
      </p>
    </a>
  </div>

</div>
