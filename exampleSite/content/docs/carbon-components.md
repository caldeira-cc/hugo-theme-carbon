---
title: "IBM Carbon Design System Component Library"
description: "Comprehensive technical reference, parameter guide, and live shortcode specifications for all Carbon v11 components, skeletons, and UI patterns."
author: "Design Systems Team"
weight: 15
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

# Carbon Design System v11 Component Suite

The Hugo-Carbon Modular Platform implements the **IBM Carbon Design System v11** component specifications using pure semantic HTML5, token-driven SCSS, and lightweight vanilla JS modules compiled via Hugo's native asset pipeline (`js.Build`).

All components adhere strictly to:
- **16-Column 2x Grid Layout** (8px mini-units, 4px baseline rhythm, 1440px max width boundary)
- **Token-based Theming** (`--cds-*` across White, Gray 10, Gray 90, Gray 100, and custom theme tokens)
- **WCAG 2.1 / 2.2 AA Accessibility** (full keyboard tab-stops, 2px focus rings, ARIA landmarks)
- **Zero Runtime CDNs** (100% self-hosted dependencies)

---

## 1. Skeletons & Shimmer Loading States

Skeletons provide smooth visual placeholders during asynchronous data fetching.

### Shortcode Examples

{{< skeleton type="heading" width="65%" >}}
{{< skeleton type="paragraph" count="3" >}}

```markdown
{{</* skeleton type="text" width="80%" */>}}
{{</* skeleton type="heading" width="65%" */>}}
{{</* skeleton type="paragraph" count="3" */>}}
{{</* skeleton type="button" width="140px" */>}}
{{</* skeleton type="card" */>}}
{{</* skeleton type="table" */>}}
{{</* skeleton type="icon" */>}}
```

### Skeleton Component Preview

{{< skeleton type="card" >}}

---

## 2. Accordions

Accordions disclose content sections on demand with smooth rotational chevrons and keyboard navigation.

{{< accordion >}}
  {{< accordion-item title="What is the Local-First Zero-CDN Architecture?" open="true" >}}
All scripts, stylesheets, mathematical rendering engines (KaTeX), MapLibre vector tiles, and IBM Plex fonts are 100% self-hosted locally under static/.
  {{< /accordion-item >}}
  {{< accordion-item title="How does static site compilation work?" >}}
Hugo isolates builds into modular static targets with instant generation times and zero runtime dependencies.
  {{< /accordion-item >}}
{{< /accordion >}}

```markdown
{{</* accordion align="start" */>}}
  {{</* accordion-item title="Section Title" open="true" */>}}
    Content goes here...
  {{</* /accordion-item */>}}
{{</* /accordion */>}}
```

---

## 3. Tabs & Contained Tab Panels

Tabs organize dense content into switchable panels without leaving the current view.

{{< tabs type="contained" tabs="Architecture,Theming,Security" >}}
  {{< tab-panel active="true" >}}
    The architecture relies on static compilation with zero runtime React or Node server dependencies.
  {{< /tab-panel >}}
  {{< tab-panel >}}
    All colors are mapped to CSS custom properties (`--cds-*`) with build-time theme injection.
  {{< /tab-panel >}}
  {{< tab-panel >}}
    Static AES-256-GCM encryption protects sensitive content without plaintext leakage.
  {{< /tab-panel >}}
{{< /tabs >}}

```markdown
{{</* tabs type="contained" tabs="Tab 1,Tab 2,Tab 3" */>}}
  {{</* tab-panel active="true" */>}}Content for Tab 1{{</* /tab-panel */>}}
  {{</* tab-panel */>}}Content for Tab 2{{</* /tab-panel */>}}
  {{</* tab-panel */>}}Content for Tab 3{{</* /tab-panel */>}}
{{</* /tabs */>}}
```

---

## 4. Progress Bars & Step Indicators

Meters and step trackers for linear workflows and multi-step processes.

{{< progress-bar value="85" label="Dependency Audit" helper="85% Complete" status="success" >}}

{{< progress-indicator steps="Define Tokens,Implement Components,Run Link Audit,Deploy Targets" current="2" >}}

```markdown
{{</* progress-bar value="85" label="Audit" helper="85% Complete" status="success" */>}}
{{</* progress-indicator steps="Step 1,Step 2,Step 3" current="2" vertical="false" */>}}
```

---

## 5. Contained Lists & Structured Lists

Organize key-value specifications and grouped items within clean Carbon containers.

{{< contained-list title="Modular Architecture Sections" >}}
  {{< contained-list-item title="Documentation Hub" description="Architectural specifications & guides" href="/docs/" >}}
  {{< contained-list-item title="W3C Data Explorer" description="Tabular dataset ingestion & analysis" href="/data/" >}}
  {{< contained-list-item title="Component Studio" description="Live 75+ shortcodes specimen" href="/docs/carbon-components/" >}}
{{< /contained-list >}}

{{< structured-list headers="Token Name,CSS Variable,Standard Value" >}}
  <tr class="cds--structured-list-row">
    <td class="cds--structured-list-td">Interactive Primary</td>
    <td class="cds--structured-list-td"><code>--cds-interactive-01</code></td>
    <td class="cds--structured-list-td">#0f62fe (IBM Blue 60)</td>
  </tr>
  <tr class="cds--structured-list-row">
    <td class="cds--structured-list-td">Layer Background</td>
    <td class="cds--structured-list-td"><code>--cds-layer-01</code></td>
    <td class="cds--structured-list-td">#f4f4f4 (Light) / #262626 (Dark)</td>
  </tr>
{{< /structured-list >}}

---

## 6. Action Buttons & Button Sets

Carbon buttons provide clear calls to action with standardized visual weights.

{{< button kind="primary" icon="arrow-right" >}}Primary Action{{< /button >}}
{{< button kind="secondary" >}}Secondary Action{{< /button >}}
{{< button kind="tertiary" >}}Tertiary Action{{< /button >}}
{{< button kind="ghost" icon="launch" href="https://react.carbondesignsystem.com/" >}}Carbon Storybook ↗{{< /button >}}
{{< button kind="danger" >}}Danger Action{{< /button >}}

```markdown
{{</* button kind="primary" icon="arrow-right" */>}}Primary Action{{</* /button */>}}
{{</* button kind="secondary" */>}}Secondary Action{{</* /button */>}}
{{</* button kind="ghost" href="https://..." icon="launch" */>}}External Link{{</* /button */>}}
```

---

## 7. Notifications & Alerts

Inline alerts and toast notifications for non-disruptive system feedback.

{{< toast type="success" title="Local Verification Passed" caption="Validated via verify-dependencies.py" >}}
All 124 Carbon React component references, SCSS packages, and local font sets verified with zero external CDN dependencies.
{{< /toast >}}

{{< callout type="info" title="Zero-CDN Invariant" >}}
The website runs entirely offline without external runtime network calls.
{{< /callout >}}

---

## 8. Form Controls, Content Switchers, Toggles & Tooltips

{{< form-input type="text" label="Project Codename" placeholder="e.g. Hugo-Carbon-v2" helper="Unique slug identifier" >}}Carbon-Modular-Engine{{< /form-input >}}

<div style="display: flex; gap: 2rem; align-items: center; margin: 1rem 0; flex-wrap: wrap;">
  {{< toggle id="toggle-wasm" label="WebAssembly Acceleration" checked="true" >}}
  {{< tooltip text="IBM Carbon v11 Accessible Tooltip" >}}Hover here for Definition{{< /tooltip >}}
</div>

---

## 9. Cards & Carbon Tiles

{{< card title="IBM Carbon Design System Architecture" eyebrow="Component Spec" tag="v11" href="https://react.carbondesignsystem.com/" actionText="View Storybook ↗" >}}
  Fully compliant with IBM Carbon v11 16-column grid, token-driven theming, and zero runtime external CDN invariants.
{{< /card >}}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  {{< clickable-tile href="/docs/carbon-components/" title="Clickable Tile Spec" >}}
    Clickable tile with hover elevation and focus state rings.
  {{< /clickable-tile >}}
  
  {{< expandable-tile title="Expandable Tile Spec" >}}
    Above-the-fold summary content.
    <!-- more -->
    Below-the-fold expanded details revealed smoothly on chevron click.
  {{< /expandable-tile >}}
</div>

---

## 10. Carbon Pagination & Navigation

{{< pagination total="120" page="1" pageSize="10" pageSizes="5,10,25,50" >}}

{{< pagination-nav total="6" current="2" >}}

---

## 11. AI Chat & Generative AI Component Suite

Compliant with **IBM Carbon for AI** React component specifications (`.cds--chat`, `.cds--chat-header`, `.cds--chat-messages`, `.cds--chat-composer`).

{{< ai-chat title="Carbon Interactive AI Assistant" model="SmolLM2-360M-Instruct" height="420px" >}}

```markdown
{{</* ai-chat title="Research Assistant" model="SmolLM2-360M-Instruct" height="550px" */>}}
```

---

## 12. Master Carbon React Component Shortcode Inventory

| Carbon React Component | Hugo Carbon Shortcode | Status |
|---|---|---|
| `AIChat`, `ChatContainer`, `ChatComposer` | `ai-chat`, `persona-ai` | ✓ Implemented |
| `Accordion`, `AccordionItem` | `accordion`, `accordion-item` | ✓ Implemented |
| `Breadcrumb`, `BreadcrumbItem` | `breadcrumb` | ✓ Implemented |
| `Button`, `ButtonSet`, `IconButton` | `button` | ✓ Implemented |
| `Card` (Expressive / Product) | `card` | ✓ Implemented |
| `Checkbox` | `checkbox` | ✓ Implemented |
| `ClickableTile`, `ExpandableTile`, `Tile` | `clickable-tile`, `expandable-tile`, `tile` | ✓ Implemented |
| `CodeSnippet` | `code-file` | ✓ Implemented |
| `ContainedList`, `ContainedListItem` | `contained-list`, `contained-list-item` | ✓ Implemented |
| `ContentSwitcher` | `content-switcher` | ✓ Implemented |
| `DataTable`, `TableToolbar`, `TableSort` | `data-table`, `csvw-table`, `xml-table` | ✓ Implemented |
| `DatePicker`, `TimePicker` | `date-picker`, `time-picker` | ✓ Implemented |
| `FileUploader` | `file-uploader` | ✓ Implemented |
| `Link` | `link` | ✓ Implemented |
| `Loading`, `InlineLoading` | `loading` | ✓ Implemented |
| `Modal`, `ComposedModal` | `modal` | ✓ Implemented |
| `Notification` (Inline, Toast) | `notification`, `toast` | ✓ Implemented |
| `NumberInput` | `number-input` | ✓ Implemented |
| `OverflowMenu` | `overflow-menu` | ✓ Implemented |
| `Pagination`, `PaginationNav` | `pagination`, `pagination-nav` | ✓ Implemented |
| `Popover` | `popover` | ✓ Implemented |
| `ProgressBar`, `ProgressIndicator` | `progress-bar`, `progress-indicator` | ✓ Implemented |
| `RadioButton`, `RadioButtonGroup` | `radio-group`, `radio-button` | ✓ Implemented |
| `Search` | `search` | ✓ Implemented |
| `Select` | `select` | ✓ Implemented |
| `SkeletonText`, `SkeletonPlaceholder`, `SkeletonIcon` | `skeleton` | ✓ Implemented |
| `Slider` | `slider` | ✓ Implemented |
| `StructuredList` | `structured-list` | ✓ Implemented |
| `Tabs`, `TabPanel` | `tabs`, `tab-panel` | ✓ Implemented |
| `Tag` | `tag` | ✓ Implemented |
| `Toggle` | `toggle` | ✓ Implemented |
| `Tooltip`, `DefinitionTooltip` | `tooltip` | ✓ Implemented |
| `UIShell` | `layouts/partials/header/navbar.html`, `sidebars/` | ✓ Implemented |
| `VCard` (Business Card / RFC 6350) | `vcard` (File & Variable Modes) | ✓ Implemented |
