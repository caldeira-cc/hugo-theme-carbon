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

Tabs organise content into separate views within the same context, allowing users to alternate between related perspectives without navigating away from the page.

### Parameters

- **`tabs`**: Container shortcode.
- **`tab-panel`**:
  - `title` (String): Tab label text.
  - `icon` (String, optional): Carbon icon name.
  - `selected` (Boolean, optional): Set to `true` on the default active tab.

### Example

{{< tabs >}}
  {{< tab-panel title="Overview" selected="true" >}}
  **Overview Tab Content**: The theme compiles SCSS via Dart Sass and outputs pure CSS custom properties (`--cds-*`).
  {{< /tab-panel >}}

  {{< tab-panel title="Configuration" >}}
  **Configuration Tab Content**: All parameters are defined in `hugo.yaml` and can be overridden per section via Hugo front-matter cascades.
  {{< /tab-panel >}}

  {{< tab-panel title="Dependencies" >}}
  **Dependencies Tab Content**: 100% self-hosted fonts, vendor libraries, and licenses. Zero third-party network calls.
  {{< /tab-panel >}}
{{< /tabs >}}

```markdown
{{</* tabs */>}}
  {{</* tab-panel title="Overview" selected="true" */>}}
  **Overview Tab Content**: The theme compiles SCSS via Dart Sass and outputs pure CSS custom properties (`--cds-*`).
  {{</* /tab-panel */>}}

  {{</* tab-panel title="Configuration" */>}}
  **Configuration Tab Content**: All parameters are defined in `hugo.yaml` and can be overridden per section via Hugo front-matter cascades.
  {{</* /tab-panel */>}}

  {{</* tab-panel title="Dependencies" */>}}
  **Dependencies Tab Content**: 100% self-hosted fonts, vendor libraries, and licenses. Zero third-party network calls.
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
