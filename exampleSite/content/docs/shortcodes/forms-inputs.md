---
title: "Forms & Inputs Shortcodes"
description: "Interactive Carbon form controls including text inputs, number pickers, search fields, sliders, toggles, checkboxes, and date selectors."
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

The Hugo Carbon theme provides accessible form controls that map directly to the **IBM Carbon Design System v11** input specifications, featuring focus rings, helper text, and invalid state indicators.

---

## 1. Text & Number Inputs (`form-input`, `number-input`)

### Text Input (`form-input`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | String | Required | Input label text |
| `placeholder` | String | *Optional* | Placeholder prompt |
| `helper` | String | *Optional* | Helper text rendered below the field |
| `type` | String | `"text"` | HTML input type (`text`, `email`, `password`, `url`) |

{{< form-input label="Repository Identifier" placeholder="caldeira-cc/hugo-theme-carbon" helper="Enter GitHub owner and repository slug" >}}{{< /form-input >}}

```markdown
{{</* form-input label="Repository Identifier" placeholder="caldeira-cc/hugo-theme-carbon" helper="Enter GitHub owner and repository slug" */>}}{{</* /form-input */>}}
```

### Number Input (`number-input`)

{{< number-input label="Concurrent Worker Threads" min="1" max="16" value="4" step="1" helper="Number of Web Workers allocated for CSV parsing" >}}

```markdown
{{</* number-input label="Concurrent Worker Threads" min="1" max="16" value="4" step="1" helper="Number of Web Workers allocated for CSV parsing" */>}}
```

---

## 2. Search & Select Controls (`search`, `select`)

### Search (`search`)

{{< search placeholder="Search documentation topics..." size="md" label="Documentation Search" >}}

```markdown
{{</* search placeholder="Search documentation topics..." size="md" label="Documentation Search" */>}}
```

### Select Dropdown (`select`)

{{< select label="Deployment Target" helper="Select static hosting platform" options="Cloudflare Pages,GitHub Pages,Netlify,Self-Hosted Nginx" >}}

```markdown
{{</* select label="Deployment Target" helper="Select static hosting platform" options="Cloudflare Pages,GitHub Pages,Netlify,Self-Hosted Nginx" */>}}
```

---

## 3. Sliders & Toggles (`slider`, `toggle`)

### Slider Control (`slider`)

{{< slider label="Map Vector Detail Level" min="1" max="100" value="75" step="5" unit="%" >}}

```markdown
{{</* slider label="Map Vector Detail Level" min="1" max="100" value="75" step="5" unit="%" */>}}
```

### Toggle Switch (`toggle`)

{{< toggle id="toggle-dark-mode" label="Dark Theme Mode" label_on="Enabled" label_off="Disabled" checked="true" >}}

```markdown
{{</* toggle id="toggle-dark-mode" label="Dark Theme Mode" label_on="Enabled" label_off="Disabled" checked="true" */>}}
```

---

## 4. Radios & Checkboxes (`radio-group`, `checkbox`)

### Radio Group (`radio-group`, `radio-button`)

{{< radio-group legend="Default Content Language" name="lang-selection" helper="Choose language variant" >}}
  {{< radio-button name="lang-selection" value="en" label="British English (en-GB)" checked="true" >}}
  {{< radio-button name="lang-selection" value="pt" label="Português (pt-PT)" >}}
{{< /radio-group >}}

```markdown
{{</* radio-group legend="Default Content Language" name="lang-selection" helper="Choose language variant" */>}}
  {{</* radio-button name="lang-selection" value="en" label="British English (en-GB)" checked="true" */>}}
  {{</* radio-button name="lang-selection" value="pt" label="Português (pt-PT)" */>}}
{{</* /radio-group */>}}
```

### Checkbox (`checkbox`)

{{< checkbox id="chk-minify" label="Enable HTML, CSS, and JS minification" checked="true" >}}
{{< checkbox id="chk-audit" label="Run automated link integrity check before publish" checked="true" >}}

```markdown
{{</* checkbox id="chk-minify" label="Enable HTML, CSS, and JS minification" checked="true" */>}}
{{</* checkbox id="chk-audit" label="Run automated link integrity check before publish" checked="true" */>}}
```

---

## 5. Date & Time Pickers (`date-picker`, `time-picker`)

{{< date-picker label="Release Publication Date" placeholder="2026-09-09" helper="ISO standard YYYY-MM-DD" >}}

{{< time-picker label="Build Schedule Window" helper="UTC execution time" >}}

```markdown
{{</* date-picker label="Release Publication Date" placeholder="2026-09-09" helper="ISO standard YYYY-MM-DD" */>}}

{{</* time-picker label="Build Schedule Window" helper="UTC execution time" */>}}
```

---

## 6. File Uploader (`file-uploader`)

{{< file-uploader label="Upload W3C CSV Dataset" helper="Select .csv file (Max size: 50MB)" accept=".csv,.json" >}}

```markdown
{{</* file-uploader label="Upload W3C CSV Dataset" helper="Select .csv file (Max size: 50MB)" accept=".csv,.json" */>}}
```
