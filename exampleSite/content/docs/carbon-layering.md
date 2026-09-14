---
title: "IBM Carbon Design System Layering System & Surfaces"
description: "Authoritative architectural guide, token reference, and live specimens for IBM Carbon v11 contextual layering across Cards, Tiles, and UI items."
author: "Design Systems Team"
weight: 16
cascade:
  params:
    collectionType: "docs"
    sidebars:
      left:
        enable: true
      right:
        enable: true
    mainBar:
      widgets:
        clock:
          enable: true
        date:
          enable: true
        availability:
          enable: true
        location:
          enable: true
        weather:
          enable: true
        themeSwitcher:
          enable: true
        search:
          enable: true
---

# IBM Carbon v11 Contextual Layering Architecture

The **IBM Carbon Design System v11 Layering Model** introduces contextual surface elevation and hierarchical contrast. Instead of hardcoding fixed tokens (such as `ui-01` or `layer-01`), components dynamically query **contextual tokens** that automatically adapt to their nesting depth.

---

## 1. Contextual Layer Hierarchy & Token Map

Carbon v11 distinguishes between the root canvas and three contextual layer depths:

| Layer Level | DOM Selector | White Theme (Light) | G100 Theme (Dark) | Contextual CSS Custom Properties |
|---|---|---|---|---|
| **Layer 0 (Canvas)** | `:root`, `body`, `.carbon-layout` | `#ffffff` | `#161616` | `--cds-background` |
| **Layer 1** | `.cds--layer-one`, `<cds-layer level="0">` | `#f4f4f4` (Gray 10) | `#262626` (Gray 90) | `--cds-layer`<br>`--cds-layer-hover`<br>`--cds-layer-accent`<br>`--cds-field`<br>`--cds-border-subtle`<br>`--cds-border-tile` |
| **Layer 2** | `.cds--layer-two`, `<cds-layer level="1">` | `#ffffff` (White — alternates!) | `#393939` (Gray 80 — elevates!) | `--cds-layer`<br>`--cds-layer-hover`<br>`--cds-layer-accent`<br>`--cds-field`<br>`--cds-border-subtle`<br>`--cds-border-tile` |
| **Layer 3** | `.cds--layer-three`, `<cds-layer level="2">` | `#f4f4f4` (Gray 10 — alternates!) | `#525252` (Gray 70 — elevates!) | `--cds-layer`<br>`--cds-layer-hover`<br>`--cds-layer-accent`<br>`--cds-field`<br>`--cds-border-subtle`<br>`--cds-border-tile` |

---

## 2. Interactive 3-Level Layer Nesting Specimen

Observe how nested `<cds-layer>` containers automatically alternate in light mode and progressively elevate luminance in dark mode:

{{< layer level="1" with_background="true" >}}
<h4>Level 1 Layer (Default Surface)</h4>
<p>Sitting directly on the canvas. Contextual token <code>--cds-layer</code> resolves to Layer 1.</p>

{{< card title="Card in Layer 1" eyebrow="Contained Card" actionText="Inspect Level 1" >}}
This card is situated on Layer 1. Its surface color and borders adapt automatically.
{{< /card >}}

{{< layer level="2" with_background="true" >}}
<h4>Level 2 Layer (Nested Surface)</h4>
<p>Nested inside Layer 1. Contextual token <code>--cds-layer</code> resolves to Layer 2.</p>

{{< card title="Card in Layer 2" eyebrow="Nested Elevation" actionText="Inspect Level 2" accent="blue" >}}
In White theme, this card alternates to <code>#ffffff</code>. In Dark theme, it elevates to <code>#393939</code>.
{{< /card >}}

{{< layer level="3" with_background="true" >}}
<h4>Level 3 Layer (Deepest Surface)</h4>
<p>Triple-nested container. Contextual token <code>--cds-layer</code> resolves to Layer 3.</p>

{{< card title="Card in Layer 3" eyebrow="Triple-Nested" actionText="Inspect Level 3" accent="teal" >}}
Demonstrating three levels of strict IBM Carbon contrast preservation.
{{< /card >}}
{{< /layer >}}
{{< /layer >}}
{{< /layer >}}

---

## 3. Product & Expressive Card Suite

Carbon v11 cards support multiple variants and color accents:

### Standard Contained vs Outlined vs Elevated Cards

{{< card title="Contained Standard Card" eyebrow="Default" actionText="Action Button" href="#" >}}
Standard contained surface using <code>var(--cds-layer)</code>, subtle border, and interactive hover elevation.
{{< /card >}}

{{< card title="Outlined Card" eyebrow="Variant: Outlined" kind="outlined" actionText="Explore" href="#" >}}
Transparent background with crisp subtle border that fills with <code>var(--cds-layer-hover)</code> on hover.
{{< /card >}}

{{< card title="Elevated Drop-Shadow Card" eyebrow="Variant: Elevated" kind="elevated" elevation="md" actionText="Details" href="#" >}}
Elevated card utilizing Carbon shadow tokens (<code>--cds-shadow-01</code> lifting to <code>--cds-shadow-03</code>).
{{< /card >}}

---

## 4. Carbon Color Accent Cards

Cards can feature authoritative top accent stripes corresponding to IBM Carbon color families:

{{< card title="Blue Accent Card" eyebrow="Operations" accent="blue" tag="Production" tagColor="blue" actionText="View Telemetry" href="#" >}}
Informational operational card featuring Carbon Blue accent and status tag.
{{< /card >}}

{{< card title="Green Success Card" eyebrow="Verification" accent="green" tag="Passed" tagColor="green" actionText="Audit Report" href="#" >}}
Healthy state card using Carbon Support Success (<code>--cds-support-success</code>).
{{< /card >}}

{{< card title="Red Critical Card" eyebrow="Security" accent="red" tag="Incident" tagColor="red" actionText="Investigate" href="#" >}}
High-priority security card using Carbon Support Error (<code>--cds-support-error</code>).
{{< /card >}}

---

## 5. Metric & Stat Cards

{{< card kind="stat" title="Total API Requests" value="1.42M" sub="+14.8% vs last month" eyebrow="Telemetry" >}}
{{< /card >}}

{{< card kind="stat" title="System Uptime" value="99.99%" sub="0 incidents reported in past 90 days" eyebrow="Infrastructure" accent="green" >}}
{{< /card >}}

---

## 6. Tiles Suite across Layers

Carbon Tiles (`<cds-tile>`, `<cds-clickable-tile>`, `<cds-expandable-tile>`, `<cds-selectable-tile>`) automatically adapt to the active layer:

{{< tile >}}
<strong>Read-Only Informational Tile</strong>
<p>Foundational layout primitive sitting on <code>var(--cds-layer)</code>.</p>
{{< /tile >}}

{{< clickable-tile href="#" title="Clickable Navigation Tile" >}}
Clickable tile providing tactile hover response and focus ring accessibility.
{{< /clickable-tile >}}

{{< expandable-tile title="Expandable Specification Tile" >}}
This content is visible above the fold.
<!-- more -->
This additional content expands smoothly using official Carbon motion timing functions.
{{< /expandable-tile >}}

{{< tile type="selectable" id="layer-spec-tile" >}}
<strong>Selectable Tile</strong>
<p>Interactive selectable state with Carbon checkmark indicator.</p>
{{< /tile >}}
