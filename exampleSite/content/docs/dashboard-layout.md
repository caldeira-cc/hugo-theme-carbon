---
title: "Modular Dashboards & W3C CSVW Data Engine"
description: "How to build executive KPI metric bars, status matrices, and interactive W3C CSVW tabular data explorer components."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Architecture", "Data"]
tags: ["CSVW", "Dashboards", "Metrics"]
version: "v11.2.0"
---

The **Hugo-Carbon Modular Engine** includes a specialized dashboard subsystem designed for tabular data exploration and executive operational metric displays.

---

## 1. Executive KPI Summary Row

The executive KPI summary row provides rapid status assessments with token-based delta indicators:

<div class="cds--row" style="margin: 1.5rem -0.5rem; row-gap: 1rem;">
  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid var(--cds-interactive-01);">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">PAGES COMPILED</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0; color: var(--cds-text-primary);">498</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">+100% Zero Errors</div>
    </div>
  </div>

  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #7a9eb3;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">SUBDOMAINS</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0; color: var(--cds-text-primary);">5</div>
      <div style="font-size: 0.75rem; color: var(--cds-text-secondary);">Isolated Targets</div>
    </div>
  </div>

  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #8a3ffc;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">LOCAL ASSETS</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0; color: var(--cds-text-primary);">100%</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">Zero CDN Reliance</div>
    </div>
  </div>

  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #b8a88a;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">BUILD LATENCY</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0; color: var(--cds-text-primary);">149 ms</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">In-Memory Render</div>
    </div>
  </div>
</div>

---

## 2. W3C CSVW Tabular Data Engine

The W3C CSV on the Web (CSVW) standard allows tabular datasets to be annotated with machine-readable metadata schemas (`table.csv-metadata.json`).

### Key Features
- **Client-Side Search**: Instant full-text filtering across all columns without network roundtrips.
- **Dynamic Sorting**: Column header sort toggles with ascending/descending indicators.
- **Type Coercion**: Numbers, dates, and URLs formatted into interactive elements.

Visit the live [**Data Explorer Studio**](/data/) to interact with the full table explorer.
