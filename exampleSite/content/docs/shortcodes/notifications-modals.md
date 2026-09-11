---
title: "Notifications & Modals Shortcodes"
description: "Documentation and live specimens for alerts, toast notifications, accessible modal dialogs, and skeleton loading states."
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

Feedback components provide real-time status notices, confirmations, and focus-trapped dialogs to guide user actions.

---

## 1. Inline Notification (`notification`)

The `notification` shortcode renders Carbon inline banners communicating essential system status, warnings, errors, or successes. Following `@carbon/react` specifications, notifications equipped with action buttons or close handlers render as `ActionableNotification`.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `kind` | String | `"info"` | Status variant (`info`, `success`, `warning`, `error`, `ai`) |
| `title` | String | Required | Notification headline |
| `subtitle` | String | *Optional* | Explanatory description |
| `actionText` | String | *Optional* | Label for interactive action button |
| `actionHref` | String | *Optional* | Target URL for action button |
| `hideClose` | Boolean | `"false"` | When set to `"true"`, suppresses the dismiss close button |
| `lowContrast` | Boolean | `false` | When `true`, displays lower contrast container style |

### Examples

{{< notification kind="info" title="Scheduled Maintenance" subtitle="Origin servers will undergo non-disruptive kernel upgrades on Sunday at 02:00 UTC." >}}
{{< /notification >}}

{{< notification kind="success" title="Build Completed" subtitle="All static assets were compiled and verified against WCAG 2.1 AA benchmarks." actionText="View Docs" actionHref="/docs/" >}}
{{< /notification >}}

{{< notification kind="warning" title="Version Deprecation" subtitle="Legacy shortcode signatures will be removed in the next major theme revision." >}}
{{< /notification >}}

{{< notification kind="error" title="Validation Notice" subtitle="Static analysis detected missing metadata fields." hideClose="true" >}}
{{< /notification >}}

```markdown
{{</* notification kind="info" title="Scheduled Maintenance" subtitle="Origin servers will undergo non-disruptive kernel upgrades on Sunday at 02:00 UTC." */>}}
{{</* /notification */>}}

{{</* notification kind="success" title="Build Completed" subtitle="All static assets were compiled and verified against WCAG 2.1 AA benchmarks." actionText="View Docs" actionHref="/docs/" */>}}
{{</* /notification */>}}

{{</* notification kind="error" title="Validation Notice" subtitle="Static analysis detected missing metadata fields." hideClose="true" */>}}
{{</* /notification */>}}
```

---

## 2. Toast Notification (`toast`)

Toast notifications deliver non-obtrusive, temporary feedback at the edge of the viewport.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `kind` | String | `"info"` | Status variant (`info`, `success`, `warning`, `error`) |
| `title` | String | Required | Short headline |
| `subtitle` | String | *Optional* | Description text |
| `caption` | String | *Optional* | Timestamp or supplemental status notice |

### Example

{{< toast type="success" title="Export Ready" caption="01:14 UTC" >}}
CSV dataset with companion W3C metadata has been prepared.
{{< /toast >}}

```markdown
{{</* toast type="success" title="Export Ready" caption="01:14 UTC" */>}}
CSV dataset with companion W3C metadata has been prepared.
{{</* /toast */>}}
```

---

## 3. Modal Dialog (`modal`)

The `modal` shortcode renders an accessible dialog box with keyboard focus trapping, Escape key dismissal, and primary/secondary actions.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Required | Unique modal element identifier |
| `title` | String | Required | Modal dialog headline |
| `label` | String | *Optional* | Eyebrow category tag |
| `primaryButton` | String | `"Confirm"` | Text for primary action button |
| `secondaryButton` | String | `"Cancel"` | Text for secondary dismiss button |

### Example

<button class="cds--btn cds--btn--secondary" type="button" onclick="const m = document.getElementById('demo-modal'); if (m) m.classList.add('is-visible');">
  Open Modal Dialog Specimen
</button>

{{< modal id="demo-modal" title="Confirm Asset Deployment" label="Build Process" primaryButton="Deploy Now" secondaryButton="Cancel" >}}
You are about to synchronize static artifacts with the Anycast distribution edge. This process purges the global CDN cache immediately.
{{< /modal >}}

```markdown
<button class="cds--btn cds--btn--secondary" type="button" onclick="document.getElementById('demo-modal').classList.add('is-visible');">
  Open Modal Dialog Specimen
</button>

{{</* modal id="demo-modal" title="Confirm Asset Deployment" label="Build Process" primaryButton="Deploy Now" secondaryButton="Cancel" */>}}
You are about to synchronize static artifacts with the Anycast distribution edge. This process purges the global CDN cache immediately.
{{</* /modal */>}}
```

---

## 4. Skeleton States (`skeleton` & `loading`)

Skeleton loaders display animated placeholders while data or heavy assets load asynchronously.

### Parameters

- `type`: `text`, `heading`, `paragraph`, `button`, `card`, `table`, `icon`

### Example

<div style="padding: 1.5rem; background: var(--cds-layer-01); border: 1px solid var(--cds-border-subtle-00); margin: 1.5rem 0;">
  {{< skeleton type="heading" width="40%" >}}
  <div style="margin: 0.75rem 0;"></div>
  {{< skeleton type="paragraph" lines="3" >}}
  <div style="margin: 1rem 0;"></div>
  {{< skeleton type="button" width="120px" >}}
</div>

```markdown
{{</* skeleton type="heading" width="40%" */>}}
{{</* skeleton type="paragraph" lines="3" */>}}
{{</* skeleton type="button" width="120px" */>}}
```
