---
title: "Navigation Shortcodes"
description: "Wayfinding and structured navigational components including breadcrumbs, tabbed panels, content switchers, pagination, and tree hierarchies."
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

Navigation shortcodes provide structured wayfinding across complex document hierarchies, facilitating accessible movement between related sections and views.

---

## 1. Breadcrumb (`breadcrumb`)

The `breadcrumb` shortcode informs users of their current location within the site hierarchy and provides one-click links to parent pages.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | String | Required | Comma-separated list of `Label (URL)` pairs |

### Example

{{< breadcrumb items="Home (/), Documentation (/docs/), Shortcodes (/docs/shortcodes/), Navigation (/docs/shortcodes/navigation/)" >}}

```markdown
{{</* breadcrumb items="Home (/), Documentation (/docs/), Shortcodes (/docs/shortcodes/), Navigation (/docs/shortcodes/navigation/)" */>}}
```

---

## 2. Tabs & Tab Panels (`tabs`, `tab-panel`)

Tabs organise content into separate views within the same context, allowing users to alternate between related perspectives without navigating away from the page. Following `@carbon/react` specifications, the tabs component supports line tabs, contained tabs, vertical tabs, secondary subtitles, status badges, dismissable tabs, and accessible keyboard navigation.

### Parameters

#### Container (`tabs`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | String | `"default"` | Tab variant: `"default"` (line tab with indicator), `"contained"` (bordered surface tabs), `"vertical"` (vertical column layout) |
| `size` | String | `"md"` | Tab height sizing: `"sm"` (32px), `"md"` (40px, default), `"lg"` (48px, contained) |
| `fullWidth` | Boolean | `false` | When `true`, tabs stretch equally to span the full width of the container |
| `dismissable` | Boolean | `false` | When `true`, enables dismissal close buttons across all tabs |
| `iconOnly` | Boolean | `false` | When `true`, renders icon-only tab buttons with accessible labels |
| `light` | Boolean | `false` | Uses light surface layer styling |
| `label` | String | `"Navigation Tabs"` | Screen-reader accessible label for the tablist (`aria-label`) |

#### Tab Panel (`tab-panel`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | `"Tab"` | Primary tab label text |
| `icon` | String | *Optional* | Official Carbon SVG icon name rendered via `components/icon.html` |
| `secondaryLabel` | String | *Optional* | Subtitle rendered under primary label (contained tall tabs) |
| `badge` | String/Number | *Optional* | Counter or status badge text |
| `badgeColor` | String | `"blue"` | Carbon tag color (`blue`, `green`, `red`, `purple`, `teal`, `warm-gray`) |
| `disabled` | Boolean | `false` | Disables tab selection and keyboard focus |
| `selected` | Boolean | `false` | Sets this tab as initially selected (default: first non-disabled tab) |
| `dismissable` | Boolean | `false` | Individual tab close button |

### Examples

#### 1. Standard Line Tabs with Icons

{{< tabs >}}
  {{< tab-panel title="Overview" icon="information" selected="true" >}}
  **Overview Tab Content**: The theme compiles SCSS via Dart Sass and outputs pure CSS custom properties (`--cds-*`).
  {{< /tab-panel >}}

  {{< tab-panel title="Configuration" icon="settings" >}}
  **Configuration Tab Content**: All parameters are defined in `hugo.yaml` and can be overridden per section via Hugo front-matter cascades.
  {{< /tab-panel >}}

  {{< tab-panel title="Dependencies" icon="locked" >}}
  **Dependencies Tab Content**: 100% self-hosted fonts, vendor libraries, and licenses. Zero third-party network calls.
  {{< /tab-panel >}}
{{< /tabs >}}

#### 2. Contained Tabs with Secondary Labels & Badges

{{< tabs type="contained" >}}
  {{< tab-panel title="Architecture" icon="diagram" secondaryLabel="Engine v2.1" badge="Core" badgeColor="blue" selected="true" >}}
  Modular multi-subdomain Hugo engine with zero-copy Float32Array Web Worker pipelines.
  {{< /tab-panel >}}

  {{< tab-panel title="Theming" icon="color-palette" secondaryLabel="18 Palettes" badge="Live" badgeColor="green" >}}
  Theme-adaptive tokens with dynamic light/dark mode switching driven by client preference.
  {{< /tab-panel >}}

  {{< tab-panel title="Legacy System" icon="warning" disabled="true" >}}
  This tab is disabled (`disabled="true"`) and skipped during keyboard navigation.
  {{< /tab-panel >}}
{{< /tabs >}}

#### 3. Vertical Tabs (`type="vertical"`)

{{< tabs type="vertical" >}}
  {{< tab-panel title="Data Pipeline" icon="data--base" selected="true" >}}
  **W3C CSVW Engine**: Processes tabular data in background Web Workers with declarative metadata schemas.
  {{< /tab-panel >}}

  {{< tab-panel title="Cartography" icon="map" >}}
  **MapLibre GL Vector Maps**: Renders local-first RFC 7946 GeoJSON vector cartography with zero CDN dependencies.
  {{< /tab-panel >}}

  {{< tab-panel title="Cryptography" icon="locked" >}}
  **AES-256-GCM Encryption**: Build-time encryption using PBKDF2 SHA-256 key derivation with client-side decryption.
  {{< /tab-panel >}}
{{< /tabs >}}

```markdown
{{</* tabs type="contained" */>}}
  {{</* tab-panel title="Architecture" icon="diagram" secondaryLabel="Engine v2.1" badge="Core" badgeColor="blue" selected="true" */>}}
  Modular multi-subdomain Hugo engine with zero-copy Float32Array Web Worker pipelines.
  {{</* /tab-panel */>}}

  {{</* tab-panel title="Theming" icon="color-palette" secondaryLabel="18 Palettes" badge="Live" badgeColor="green" */>}}
  Theme-adaptive tokens with dynamic light/dark mode switching driven by client preference.
  {{</* /tab-panel */>}}

  {{</* tab-panel title="Legacy System" icon="warning" disabled="true" */>}}
  Disabled tab content.
  {{</* /tab-panel */>}}
{{</* /tabs */>}}
```

---

## 3. Content Switcher (`content-switcher`)

The `content-switcher` renders an accessible segmented control button group, commonly used to toggle between alternate visual modes (e.g. Code vs Preview, or Metric vs Raw view).

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | String | Required | Comma-separated list of button labels |
| `target_id` | String | *Optional* | Target element identifier |

### Example

{{< content-switcher options="Standard Build, Production Minified, Debug Mode" >}}

```markdown
{{</* content-switcher options="Standard Build, Production Minified, Debug Mode" */>}}
```

---

## 4. Pagination (`pagination` & `pagination-nav`)

Pagination controls divide large sets of records or articles into discrete pages, improving load times and reducing visual density.

### Parameters

- **`pagination`**:
  - `total` (Number): Total item count.
  - `page` (Number): Current page index (1-based).
  - `pageSize` (Number): Items per page.
  - `pageSizes` (String): Comma-separated allowed page size options.
- **`pagination-nav`**:
  - `total` (Number): Total page count.
  - `current` (Number): Current active page.

### Example

{{< pagination total="250" page="1" pageSize="25" pageSizes="10,25,50,100" >}}

{{< pagination-nav total="8" current="3" >}}

```markdown
{{</* pagination total="250" page="1" pageSize="25" pageSizes="10,25,50,100" */>}}

{{</* pagination-nav total="8" current="3" */>}}
```

---

## 5. Overflow Menu (`overflow-menu`)

The `overflow-menu` displays additional or secondary actions under an accessible vertical ellipsis trigger.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | String | Required | Comma-separated list of action labels |
| `align` | String | `"right"` | Alignment of the dropdown menu (`left`, `right`) |

### Example

<div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background-color: var(--cds-layer-01); border: 1px solid var(--cds-border-subtle-00);">
  <span>Document Options & Actions</span>
  {{< overflow-menu items="Download Markdown, Export PDF, Inspect Raw Metadata, View Revisions" align="right" >}}{{< /overflow-menu >}}
</div>

```markdown
{{</* overflow-menu items="Download Markdown, Export PDF, Inspect Raw Metadata, View Revisions" align="right" */>}}{{</* /overflow-menu */>}}
```
