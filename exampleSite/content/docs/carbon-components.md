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
- **Token-based Theming** (`--cds-*` across White, Gray 10, Gray 90, Gray 100, and domain custom overrides)
- **WCAG 2.1 / 2.2 AA Accessibility** (full keyboard tab-stops, 2px focus rings, ARIA landmarks)
- **Zero Runtime CDNs** (100% self-hosted dependencies)

---

## 1. Full IBM Carbon Color Palette & Token Scales

The system implements the complete **`@carbon/colors`** 120-color specification across 12 families (10 grades from 10 to 100), plus the **`@carbon/charts`** 14-color categorical visualization palette. All colors are exposed as CSS custom properties in `:root` and structured in `data/themes.yaml`.

### 12 Carbon Color Families (Grades 10–100)

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  <div style="background: var(--cds-layer-01); padding: 1rem; border: 1px solid var(--cds-border-subtle-00);">
    <strong style="display: block; margin-bottom: 0.5rem;">Blue (Interactive Core)</strong>
    <div style="display: flex; height: 28px; width: 100%;">
      <span style="flex: 1; background: var(--cds-color-blue-10);" title="blue-10: #edf5ff"></span>
      <span style="flex: 1; background: var(--cds-color-blue-20);" title="blue-20: #d0e2ff"></span>
      <span style="flex: 1; background: var(--cds-color-blue-30);" title="blue-30: #a6c8ff"></span>
      <span style="flex: 1; background: var(--cds-color-blue-40);" title="blue-40: #78a9ff"></span>
      <span style="flex: 1; background: var(--cds-color-blue-50);" title="blue-50: #4589ff"></span>
      <span style="flex: 1; background: var(--cds-color-blue-60);" title="blue-60: #0f62fe (Interactive Primary)"></span>
      <span style="flex: 1; background: var(--cds-color-blue-70);" title="blue-70: #0043ce"></span>
      <span style="flex: 1; background: var(--cds-color-blue-80);" title="blue-80: #002d9c"></span>
      <span style="flex: 1; background: var(--cds-color-blue-90);" title="blue-90: #001d6c"></span>
      <span style="flex: 1; background: var(--cds-color-blue-100);" title="blue-100: #001141"></span>
    </div>
  </div>

  <div style="background: var(--cds-layer-01); padding: 1rem; border: 1px solid var(--cds-border-subtle-00);">
    <strong style="display: block; margin-bottom: 0.5rem;">Cyan & Teal</strong>
    <div style="display: flex; height: 28px; width: 100%;">
      <span style="flex: 1; background: var(--cds-color-cyan-20);" title="cyan-20"></span>
      <span style="flex: 1; background: var(--cds-color-cyan-40);" title="cyan-40"></span>
      <span style="flex: 1; background: var(--cds-color-cyan-60);" title="cyan-60"></span>
      <span style="flex: 1; background: var(--cds-color-cyan-80);" title="cyan-80"></span>
      <span style="flex: 1; background: var(--cds-color-cyan-100);" title="cyan-100"></span>
      <span style="flex: 1; background: var(--cds-color-teal-20);" title="teal-20"></span>
      <span style="flex: 1; background: var(--cds-color-teal-40);" title="teal-40"></span>
      <span style="flex: 1; background: var(--cds-color-teal-60);" title="teal-60"></span>
      <span style="flex: 1; background: var(--cds-color-teal-80);" title="teal-80"></span>
      <span style="flex: 1; background: var(--cds-color-teal-100);" title="teal-100"></span>
    </div>
  </div>

  <div style="background: var(--cds-layer-01); padding: 1rem; border: 1px solid var(--cds-border-subtle-00);">
    <strong style="display: block; margin-bottom: 0.5rem;">Green & Yellow (Status / Success)</strong>
    <div style="display: flex; height: 28px; width: 100%;">
      <span style="flex: 1; background: var(--cds-color-green-20);" title="green-20"></span>
      <span style="flex: 1; background: var(--cds-color-green-40);" title="green-40"></span>
      <span style="flex: 1; background: var(--cds-color-green-60);" title="green-60: #198038"></span>
      <span style="flex: 1; background: var(--cds-color-green-80);" title="green-80"></span>
      <span style="flex: 1; background: var(--cds-color-green-100);" title="green-100"></span>
      <span style="flex: 1; background: var(--cds-color-yellow-20);" title="yellow-20"></span>
      <span style="flex: 1; background: var(--cds-color-yellow-30);" title="yellow-30: #f1c21b (Warning)"></span>
      <span style="flex: 1; background: var(--cds-color-yellow-50);" title="yellow-50"></span>
      <span style="flex: 1; background: var(--cds-color-yellow-70);" title="yellow-70"></span>
      <span style="flex: 1; background: var(--cds-color-yellow-100);" title="yellow-100"></span>
    </div>
  </div>

  <div style="background: var(--cds-layer-01); padding: 1rem; border: 1px solid var(--cds-border-subtle-00);">
    <strong style="display: block; margin-bottom: 0.5rem;">Red & Magenta (Error / Danger)</strong>
    <div style="display: flex; height: 28px; width: 100%;">
      <span style="flex: 1; background: var(--cds-color-red-20);" title="red-20"></span>
      <span style="flex: 1; background: var(--cds-color-red-40);" title="red-40"></span>
      <span style="flex: 1; background: var(--cds-color-red-60);" title="red-60: #da1e28 (Error)"></span>
      <span style="flex: 1; background: var(--cds-color-red-80);" title="red-80"></span>
      <span style="flex: 1; background: var(--cds-color-red-100);" title="red-100"></span>
      <span style="flex: 1; background: var(--cds-color-magenta-20);" title="magenta-20"></span>
      <span style="flex: 1; background: var(--cds-color-magenta-40);" title="magenta-40"></span>
      <span style="flex: 1; background: var(--cds-color-magenta-60);" title="magenta-60"></span>
      <span style="flex: 1; background: var(--cds-color-magenta-80);" title="magenta-80"></span>
      <span style="flex: 1; background: var(--cds-color-magenta-100);" title="magenta-100"></span>
    </div>
  </div>

  <div style="background: var(--cds-layer-01); padding: 1rem; border: 1px solid var(--cds-border-subtle-00);">
    <strong style="display: block; margin-bottom: 0.5rem;">Purple & Orange</strong>
    <div style="display: flex; height: 28px; width: 100%;">
      <span style="flex: 1; background: var(--cds-color-purple-20);" title="purple-20"></span>
      <span style="flex: 1; background: var(--cds-color-purple-40);" title="purple-40"></span>
      <span style="flex: 1; background: var(--cds-color-purple-60);" title="purple-60: #8a3ffc"></span>
      <span style="flex: 1; background: var(--cds-color-purple-80);" title="purple-80"></span>
      <span style="flex: 1; background: var(--cds-color-purple-100);" title="purple-100"></span>
      <span style="flex: 1; background: var(--cds-color-orange-20);" title="orange-20"></span>
      <span style="flex: 1; background: var(--cds-color-orange-40);" title="orange-40"></span>
      <span style="flex: 1; background: var(--cds-color-orange-50);" title="orange-50"></span>
      <span style="flex: 1; background: var(--cds-color-orange-70);" title="orange-70"></span>
      <span style="flex: 1; background: var(--cds-color-orange-100);" title="orange-100"></span>
    </div>
  </div>

  <div style="background: var(--cds-layer-01); padding: 1rem; border: 1px solid var(--cds-border-subtle-00);">
    <strong style="display: block; margin-bottom: 0.5rem;">Neutral Grays (Gray, Cool Gray, Warm Gray)</strong>
    <div style="display: flex; height: 28px; width: 100%;">
      <span style="flex: 1; background: var(--cds-color-gray-10);" title="gray-10"></span>
      <span style="flex: 1; background: var(--cds-color-gray-30);" title="gray-30"></span>
      <span style="flex: 1; background: var(--cds-color-gray-60);" title="gray-60"></span>
      <span style="flex: 1; background: var(--cds-color-gray-80);" title="gray-80"></span>
      <span style="flex: 1; background: var(--cds-color-gray-100);" title="gray-100"></span>
      <span style="flex: 1; background: var(--cds-color-cool-gray-30);" title="cool-gray-30"></span>
      <span style="flex: 1; background: var(--cds-color-cool-gray-80);" title="cool-gray-80"></span>
      <span style="flex: 1; background: var(--cds-color-warm-gray-30);" title="warm-gray-30"></span>
      <span style="flex: 1; background: var(--cds-color-warm-gray-60);" title="warm-gray-60"></span>
      <span style="flex: 1; background: var(--cds-color-warm-gray-90);" title="warm-gray-90"></span>
    </div>
  </div>
</div>

### Data Visualization Categorical 14-Palette

<div style="display: flex; height: 36px; width: 100%; margin: 1rem 0; border: 1px solid var(--cds-border-subtle-00);">
  <span style="flex: 1; background: var(--cds-charts-color-categorical-1);" title="Categorical 1: Purple 70"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-2);" title="Categorical 2: Cyan 50"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-3);" title="Categorical 3: Teal 70"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-4);" title="Categorical 4: Magenta 70"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-5);" title="Categorical 5: Red 50"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-6);" title="Categorical 6: Red 90"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-7);" title="Categorical 7: Green 60"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-8);" title="Categorical 8: Blue 80"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-9);" title="Categorical 9: Magenta 50"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-10);" title="Categorical 10: Yellow 50"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-11);" title="Categorical 11: Teal 50"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-12);" title="Categorical 12: Cyan 90"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-13);" title="Categorical 13: Purple 60"></span>
  <span style="flex: 1; background: var(--cds-charts-color-categorical-14);" title="Categorical 14: Green 20"></span>
</div>

---

## 2. Carbon Tag Suite (All 11 Color Families & Filter Tags)

Carbon tags label and categorize content with high visual legibility. All 11 Carbon color families, outline styles, and dismissable filter states are supported:

<div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;">
  {{< tag type="blue" name="Blue" clickable="false" >}}
  {{< tag type="cyan" name="Cyan" clickable="false" >}}
  {{< tag type="teal" name="Teal" clickable="false" >}}
  {{< tag type="green" name="Green" clickable="false" >}}
  {{< tag type="purple" name="Purple" clickable="false" >}}
  {{< tag type="magenta" name="Magenta" clickable="false" >}}
  {{< tag type="red" name="Red" clickable="false" >}}
  {{< tag type="gray" name="Gray" clickable="false" >}}
  {{< tag type="cool-gray" name="Cool Gray" clickable="false" >}}
  {{< tag type="warm-gray" name="Warm Gray" clickable="false" >}}
  {{< tag type="high-contrast" name="High Contrast" clickable="false" >}}
  {{< tag type="outline" name="Outline" clickable="false" >}}
  {{< tag type="blue" name="Dismissable Tag" filter="true" clickable="false" >}}
</div>

```markdown
{{</* tag type="blue" name="Blue" */>}}
{{</* tag type="cyan" name="Cyan" */>}}
{{</* tag type="teal" name="Teal" */>}}
{{</* tag type="green" name="Green" */>}}
{{</* tag type="purple" name="Purple" */>}}
{{</* tag type="magenta" name="Magenta" */>}}
{{</* tag type="red" name="Red" */>}}
{{</* tag type="gray" name="Gray" */>}}
{{</* tag type="cool-gray" name="Cool Gray" */>}}
{{</* tag type="warm-gray" name="Warm Gray" */>}}
{{</* tag type="high-contrast" name="High Contrast" */>}}
{{</* tag type="outline" name="Outline" */>}}
{{</* tag type="blue" name="Filter Tag" filter="true" */>}}
```

---

## 3. Code Snippets & Standalone Copy Buttons

Formatted code snippet presentation supporting single-line, multi-line expandable, and inline executions with clipboard integration:

### Single-Line Code Snippet
{{< code-snippet type="single" text="npm install @carbon/react @carbon/styles" />}}

### Multi-Line Expandable Code Snippet
{{< code-snippet type="multi" expandable="true" >}}
import { Button, DataTable, Dropdown } from '@carbon/react';

function CarbonApp() {
  return (
    <div className="cds--grid">
      <div className="cds--row">
        <Button kind="primary">Explore Carbon v11</Button>
      </div>
    </div>
  );
}
export default CarbonApp;
{{< /code-snippet >}}

### Inline Code Snippet & Standalone Copy Button
Use {{< code-snippet type="inline" text="data-carbon-theme='g100'" />}} to set high-contrast dark theme. Or copy the clone URL: {{< copy-button text="git clone https://github.com/caldeira-cc/hugo-theme-carbon.git" >}}


```markdown
{{</* code-snippet type="single" text="npm install @carbon/react" */>}}
{{</* code-snippet type="multi" expandable="true" */>}}
...multi-line code...
{{</* /code-snippet */>}}
{{</* code-snippet type="inline" text="inline-code" */>}}
{{</* copy-button text="https://example.com" */>}}
```

---

## 4. Action Buttons, Button Sets & Sizing

Buttons express user actions with standardized Carbon weights, danger variants, responsive button groupings, and accessible keyboard focus states:

{{< button-set >}}
  {{< button kind="primary" icon="arrow-right" >}}Primary{{< /button >}}
  {{< button kind="secondary" >}}Secondary{{< /button >}}
  {{< button kind="tertiary" >}}Tertiary{{< /button >}}
  {{< button kind="ghost" icon="launch" href="https://react.carbondesignsystem.com/" >}}Ghost ↗{{< /button >}}
  {{< button kind="danger" >}}Danger Primary{{< /button >}}
  {{< button kind="danger--tertiary" >}}Danger Tertiary{{< /button >}}
  {{< button kind="primary" icon="copy" icon_only="true" aria_label="Copy code action" >}}{{< /button >}}
{{< /button-set >}}

<div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0; flex-wrap: wrap;">
  {{< button kind="primary" size="sm" >}}Small (32px){{< /button >}}
  {{< button kind="primary" size="md" >}}Medium (40px){{< /button >}}
  {{< button kind="primary" size="lg" >}}Large (48px){{< /button >}}
  {{< button kind="secondary" disabled="true" >}}Disabled{{< /button >}}
</div>

```markdown
{{</* button-set */>}}
  {{</* button kind="primary" icon="arrow-right" */>}}Primary{{</* /button */>}}
  {{</* button kind="secondary" */>}}Secondary{{</* /button */>}}
  {{</* button kind="danger--tertiary" */>}}Danger Tertiary{{</* /button */>}}
{{</* /button-set */>}}
```

---

## 5. Hierarchical Tree View Navigation

The TreeView displays folder/file structures and nested taxonomies with keyboard navigation and expand/collapse states:

{{< tree-view label="Hugo Carbon Repository Tree" >}}
  {{< tree-node label="hugo-theme-carbon" icon="folder" expanded="true" >}}
    {{< tree-node label="assets" icon="folder" expanded="true" >}}
      {{< tree-node label="scss" icon="folder" >}}
        {{< tree-node label="_tokens.scss" icon="file" leaf="true" />}}
        {{< tree-node label="_carbon-components.scss" icon="file" leaf="true" />}}
      {{< /tree-node >}}
    {{< /tree-node >}}
    {{< tree-node label="layouts" icon="folder" >}}
      {{< tree-node label="shortcodes" icon="folder" >}}
        {{< tree-node label="button.html" icon="file" leaf="true" />}}
        {{< tree-node label="tree-view.html" icon="file" leaf="true" />}}
      {{< /tree-node >}}
    {{< /tree-node >}}
    {{< tree-node label="theme.yaml" icon="file" leaf="true" selected="true" />}}
  {{< /tree-node >}}
{{< /tree-view >}}


```markdown
{{</* tree-view label="File Directory" */>}}
  {{</* tree-node label="Folder" icon="folder" expanded="true" */>}}
    {{</* tree-node label="Child File" icon="file" leaf="true" */>}}
  {{</* /tree-node */>}}
{{</* /tree-view */>}}
```

---

## 6. Carbon Tiles (Standard, Clickable, Expandable, Selectable)

Carbon tiles package content onto elevated surfaces:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  {{< tile >}}
    <strong>Standard Tile</strong>
    <p style="margin: 0.5rem 0 0; color: var(--cds-text-secondary); font-size: 0.8125rem;">Static content surface bounded by subtle 1px border.</p>
  {{< /tile >}}

  {{< clickable-tile href="/docs/carbon-components/" title="Clickable Tile" >}}
    <strong>Clickable Tile</strong>
    <p style="margin: 0.5rem 0 0; color: var(--cds-text-secondary); font-size: 0.8125rem;">Interactive hover elevation and active focus rings.</p>
  {{< /clickable-tile >}}

  {{< tile type="selectable" id="tile-sel-1" selected="true" >}}
    <strong>Selectable Tile</strong>
    <p style="margin: 0.5rem 0 0; color: var(--cds-text-secondary); font-size: 0.8125rem;">Click or press space to toggle selection state.</p>
  {{< /tile >}}
</div>

{{< expandable-tile title="Expandable Tile Specification" >}}
  Above-the-fold summary content visible by default.
  <!-- more -->
  Below-the-fold expanded details disclosed smoothly with rotational chevron indicator.
{{< /expandable-tile >}}

```markdown
{{</* tile */>}}Static Surface{{</* /tile */>}}
{{</* clickable-tile href="..." */>}}Clickable Card{{</* /clickable-tile */>}}
{{</* tile type="selectable" selected="true" */>}}Selectable Card{{</* /tile */>}}
{{</* expandable-tile title="Details" */>}}Summary<!-- more -->Full content{{</* /expandable-tile */>}}
```

---

## 7. Skeletons & Shimmer Loading States

Skeletons provide smooth visual placeholders during asynchronous data fetching:

{{< skeleton type="heading" width="65%" >}}
{{< skeleton type="paragraph" count="2" >}}
{{< skeleton type="card" >}}

```markdown
{{</* skeleton type="text" width="80%" */>}}
{{</* skeleton type="heading" width="65%" */>}}
{{</* skeleton type="paragraph" count="3" */>}}
{{</* skeleton type="button" width="140px" */>}}
{{</* skeleton type="card" */>}}
{{</* skeleton type="table" */>}}
```

---

## 8. Accordions & Disclosure Panels

{{< accordion >}}
  {{< accordion-item title="What is the Local-First Zero-CDN Architecture?" open="true" >}}
All scripts, stylesheets, mathematical rendering engines (KaTeX), MapLibre vector tiles, and IBM Plex fonts are 100% self-hosted locally under static/.
  {{< /accordion-item >}}
  {{< accordion-item title="How does static site compilation work?" >}}
Hugo isolates builds into modular static targets with instant generation times and zero runtime dependencies.
  {{< /accordion-item >}}
{{< /accordion >}}

---

## 9. Tabs & Contained Tab Panels

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

---

## 10. Progress Bars & Step Indicators

{{< progress-bar value="85" label="Dependency Audit" helper="85% Complete" status="success" >}}

{{< progress-indicator steps="Define Tokens,Implement Components,Run Link Audit,Deploy Targets" current="2" >}}

---

## 11. Contained Lists & Structured Lists

{{< contained-list title="Modular Architecture Sections" >}}
  {{< contained-list-item title="Documentation Hub" description="Architectural specifications & guides" href="/docs/" >}}
  {{< contained-list-item title="W3C Data Explorer" description="Tabular dataset ingestion & analysis" href="/data/" >}}
  {{< contained-list-item title="Component Studio" description="Live shortcode specimens" href="/docs/carbon-components/" >}}
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

## 12. Notifications & Feedback Alerts

{{< toast type="success" title="Local Verification Passed" caption="Validated via verify-dependencies.py" >}}
All Carbon React component references, SCSS packages, and local font sets verified with zero external CDN dependencies.
{{< /toast >}}

{{< callout type="info" title="Zero-CDN Invariant" >}}
The website runs entirely offline without external runtime network calls.
{{< /callout >}}

---

## 13. Form Controls, Content Switchers, Toggles & Tooltips

{{< form-input type="text" label="Project Codename" placeholder="e.g. Hugo-Carbon-v2" helper="Unique slug identifier" >}}Carbon-Modular-Engine{{< /form-input >}}

<div style="display: flex; gap: 2rem; align-items: center; margin: 1rem 0; flex-wrap: wrap;">
  {{< toggle id="toggle-wasm" label="WebAssembly Acceleration" checked="true" >}}
  {{< tooltip text="IBM Carbon v11 Accessible Tooltip" >}}Hover here for Definition{{< /tooltip >}}
</div>

---

## 14. Carbon Pagination & Navigation

{{< pagination total="120" page="1" pageSize="10" pageSizes="5,10,25,50" >}}

{{< pagination-nav total="6" current="2" >}}

---

## 15. AI Chat & Generative AI Component Suite

Compliant with **IBM Carbon for AI** React component specifications (`.cds--chat`, `.cds--chat-header`, `.cds--chat-messages`, `.cds--chat-composer`).

{{< ai-chat title="Carbon Interactive AI Assistant" model="SmolLM2-360M-Instruct" height="380px" >}}

---

## 16. Master Carbon React Component Shortcode Inventory

| Carbon React Component | Hugo Carbon Shortcode | BEM Primary Class | Status |
|---|---|---|---|
| `Accordion`, `AccordionItem` | `accordion`, `accordion-item` | `.cds--accordion` | ✓ Implemented |
| `Breadcrumb`, `BreadcrumbItem` | `breadcrumb` | `.cds--breadcrumb` | ✓ Implemented |
| `Button`, `ButtonSet`, `IconButton` | `button`, `button-set` | `.cds--btn`, `.cds--btn-set` | ✓ Implemented |
| `Card` (Expressive / Product) | `card` | `.cds--card` | ✓ Implemented |
| `Checkbox`, `CheckboxGroup` | `checkbox`, `form-input` | `.cds--checkbox` | ✓ Implemented |
| `ClickableTile`, `ExpandableTile`, `SelectableTile`, `Tile` | `tile`, `clickable-tile`, `expandable-tile` | `.cds--tile` | ✓ Implemented |
| `CodeSnippet` (Single, Multi, Inline) | `code-snippet`, `code-file` | `.cds--snippet` | ✓ Implemented |
| `ContainedList`, `ContainedListItem` | `contained-list`, `contained-list-item` | `.cds--contained-list` | ✓ Implemented |
| `ContentSwitcher`, `Switch` | `content-switcher` | `.cds--content-switcher` | ✓ Implemented |
| `CopyButton` | `copy-button` | `.cds--copy-btn` | ✓ Implemented |
| `DataTable`, `TableToolbar`, `TableSort` | `data-table`, `csvw-table`, `xml-table` | `.cds--data-table` | ✓ Implemented |
| `DatePicker`, `TimePicker` | `date-picker`, `time-picker` | `.cds--date-picker`, `.cds--time-picker` | ✓ Implemented |
| `FileUploader` | `file-uploader` | `.cds--file` | ✓ Implemented |
| `Form`, `FormGroup`, `FormItem` | `form-input` | `.cds--form-item`, `.cds--label` | ✓ Implemented |
| `Link` | `link` | `.cds--link` | ✓ Implemented |
| `Loading`, `InlineLoading` | `loading` | `.cds--loading`, `.cds--inline-loading` | ✓ Implemented |
| `Modal`, `ComposedModal` | `modal`, `dashboard-modal` | `.cds--modal` | ✓ Implemented |
| `Notification` (Inline, Toast) | `notification`, `toast`, `callout` | `.cds--inline-notification`, `.cds--toast-notification` | ✓ Implemented |
| `NumberInput` | `number-input` | `.cds--number` | ✓ Implemented |
| `OverflowMenu` | `overflow-menu` | `.cds--overflow-menu` | ✓ Implemented |
| `Pagination`, `PaginationNav` | `pagination`, `pagination-nav` | `.cds--pagination`, `.cds--pagination-nav` | ✓ Implemented |
| `Popover` | `popover` | `.cds--popover` | ✓ Implemented |
| `ProgressBar`, `ProgressIndicator` | `progress-bar`, `progress-indicator` | `.cds--progress-bar`, `.cds--progress` | ✓ Implemented |
| `RadioButton`, `RadioButtonGroup` | `radio-group`, `radio-button` | `.cds--radio-button` | ✓ Implemented |
| `Search` | `search` | `.cds--search` | ✓ Implemented |
| `Select` | `select` | `.cds--select` | ✓ Implemented |
| `SkeletonText`, `SkeletonPlaceholder`, `SkeletonIcon` | `skeleton` | `.cds--skeleton` | ✓ Implemented |
| `Slider` | `slider` | `.cds--slider` | ✓ Implemented |
| `StructuredList` | `structured-list` | `.cds--structured-list` | ✓ Implemented |
| `Tabs`, `TabPanel` | `tabs`, `tab-panel` | `.cds--tabs` | ✓ Implemented |
| `Tag` (11 Color Families + Filter) | `tag` | `.cds--tag` | ✓ Implemented |
| `Toggle` | `toggle` | `.cds--toggle` | ✓ Implemented |
| `Tooltip`, `DefinitionTooltip` | `tooltip` | `.cds--tooltip` | ✓ Implemented |
| `TreeView`, `TreeNode` | `tree-view`, `tree-node` | `.cds--tree`, `.cds--tree__node` | ✓ Implemented |
| `UIShell` (Header, SideNav, GlobalBar) | `layouts/partials/header/`, `sidebars/` | `.cds--header`, `.cds--side-nav` | ✓ Implemented |
| `AIChat`, `ChatContainer`, `ChatComposer` | `ai-chat`, `persona-ai` | `.cds--chat` | ✓ Implemented |
| `VCard` (RFC 6350 Business Card) | `vcard` | `.cds--vcard` | ✓ Implemented |
