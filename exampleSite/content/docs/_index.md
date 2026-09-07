---
title: "Technical Documentation"
description: "Comprehensive technical specifications, configuration references, deployment guides, and architectural showcases for the Carbon Hugo Engine."
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
    <div style="font-weight: 600; font-size: 1rem; color: var(--cds-text-primary); margin-bottom: 0.25rem;">Enterprise Static Architecture Reference</div>
    <div style="font-size: 0.875rem; color: var(--cds-text-secondary); line-height: 1.5;">
      This technical documentation hub provides exhaustive specifications for building, configuring, styling, and deploying multi-subdomain static nodes powered by Hugo and the Carbon Design System v11.
    </div>
  </div>
</div>

Explore the architectural guides, deployment tutorials, and component references below:

<div class="cds--row" style="margin: 1.5rem -0.5rem; row-gap: 1.25rem;">
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/architecture/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid var(--cds-interactive-01);">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">FOUNDATIONS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Architecture &amp; 2x Grid</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        The fluid 16-column grid system, 8px mini-unit cadence, and Plex typeface hierarchies.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/configuration/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #7a9eb3;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">CONFIGURATION</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Configuration &amp; Cascade</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Global <code>hugo.yaml</code> schema reference, environment layers, and folder front-matter inheritance.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/cloudflare-deployment/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #f1c21b;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">DEPLOYMENT</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Cloudflare Deployment Guide</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Step-by-step production setup for deploying 5 isolated subdomains on Cloudflare Pages for free.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/typography/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #8a3ffc;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">TYPOGRAPHY</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Typography &amp; Content Reference</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Every implementation of headings, inline styling, images with captions, callouts, tables, and footnotes.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/feature-showcase/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #009d9a;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">SHOWCASE</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Platform Feature Showcase</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Interactive demonstrations of shortcodes, math equations, code modal expansions, and TTS audio narration.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/data-analytics-suite/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #da1e28;">
      <span class="cds--tag cds--tag--outline" style="align-self: flex-start; margin-bottom: 0.5rem; font-family: var(--cds-font-mono, monospace);">ANALYTICS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Data Analytics &amp; PSPP Suite</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Multithreaded Web Worker CSVW tables, GNU PSPP Variable View, summary rows, and GeoJSON spatial sync.
      </p>
    </a>
  </div>
</div>
