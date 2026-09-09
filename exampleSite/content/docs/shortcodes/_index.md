---
title: "Shortcodes & Component Catalog"
description: "Index of semantic Hugo shortcodes implementing the IBM Carbon Design System v11 for content authors and technical writers."
cascade:
  params:
    collectionType: "docs"
    sidebars:
      left:
        enable: true
        data: "docs"
      right:
        enable: true
---

The **Hugo Carbon Theme** provides a modular library of over 75 semantic shortcodes. Each shortcode maps directly to official **IBM Carbon Design System v11** specifications, generating accessible, token-aware HTML markup without requiring external component frameworks or build-step dependencies.

---

## Shortcode Categories

Explore the dedicated documentation pages for each component family:

<div class="cds--row" style="margin: 1.5rem -0.5rem; row-gap: 1.25rem;">

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/cards-tiles/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #0f62fe;">
      <span class="cds--tag cds--tag--blue cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">CONTAINERS</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Cards &amp; Tiles</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Content cards, clickable and expandable tiles, digital business cards (vCards), and the Carbon AI modifier.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/navigation/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #7a9eb3;">
      <span class="cds--tag cds--tag--teal cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">WAYFINDING</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Navigation</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Breadcrumb paths, tabbed interfaces, content switchers, numeric pagination, and hierarchical tree views.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/content-typography/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #24a148;">
      <span class="cds--tag cds--tag--green cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">EDITORIAL</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Content &amp; Typography</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Editorial callouts, code blocks with copy actions, captioned figures, status tags, tooltips, and KaTeX math formulas.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/notifications-modals/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #da1e28;">
      <span class="cds--tag cds--tag--red cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">FEEDBACK</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Notifications &amp; Modals</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Inline and toast notifications, dismissible alerts, accessible modal dialogs, and skeleton loading states.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/forms-inputs/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #8a3ffc;">
      <span class="cds--tag cds--tag--purple cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">INTERACTIVE</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Forms &amp; Inputs</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Carbon text inputs, number pickers, search fields, sliders, toggles, checkboxes, radio sets, and date pickers.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/data-engines/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #1192e8;">
      <span class="cds--tag cds--tag--cyan cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">DATA SUITE</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Data Engines &amp; Maps</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Multithreaded Web Worker CSVW tables, static Carbon DataTables, XML engines, and MapLibre GL GeoJSON maps.
      </p>
    </a>
  </div>

  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8" style="padding: 0 0.5rem;">
    <a href="/docs/shortcodes/dashboards/" class="cds--tile cds--tile--clickable" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; padding: 1.25rem; background-color: var(--cds-layer-01); border-left: 3px solid #009d9a;">
      <span class="cds--tag cds--tag--teal cds--tag--sm" style="align-self: flex-start; margin-bottom: 0.5rem;">TELEMETRY</span>
      <h3 class="cds--type-heading-03" style="margin: 0 0 0.5rem; color: var(--cds-text-primary);">Dashboards &amp; KPIs</h3>
      <p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin: 0; flex: 1 0 auto;">
        Dashboard layouts, KPI metric tiles, metric progress bars, status item matrices, and drill-down modal inspectors.
      </p>
    </a>
  </div>

</div>

---

## AI Modifier & Transparency Standards

In adherence to the **IBM Carbon Design System v11 AI component specifications**, all placeholder content generated by artificial intelligence models is explicitly distinguished using the **Carbon AI modifier** (`cds--ai-label`).

When reading the shortcode examples in these documentation pages, look for the **AI badge**:

{{< ai-label text="This is an official IBM Carbon Design System AI Label. Clicking this badge displays an explainability popover detailing why and how the specimen content was created." />}}

Clicking the AI badge opens an explainability popover that clarifies the origin of the content, preserving editorial transparency across all specimens.
