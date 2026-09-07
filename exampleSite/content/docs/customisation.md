---
title: "Theme Customisation & Palette Tokens"
description: "How to configure, override, and create custom color palettes using IBM Carbon v11 tokens and SCSS compilation."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Design System", "Theming"]
tags: ["Theming", "Tokens", "SCSS"]
version: "v11.2.0"
---

The **Hugo-Carbon Theme Engine** delivers client-side theme switching and compile-time token configuration without requiring CSS file swapping or full page reloads.

---

## 1. The Carbon v11 Token Palette

The design system implements a tripartite color architecture featuring light and dark modes:

```
┌────────────────────────────────────────────────────────┐
│               IBM Carbon Design Tokens                 │
├────────────────────────────┬───────────────────────────┤
│ Light Modes (Backgrounds)  │ Dark Modes (Backgrounds)  │
├────────────────────────────┼───────────────────────────┤
│ • White (white: #ffffff)   │ • Gray 90 (g90: #262626)  │
│ • Gray 10 (g10: #f4f4f4)   │ • Gray 100 (g100: #161616)│
└────────────────────────────┴───────────────────────────┘
```

### Core Token Mapping Reference

| Token Name | White Theme | Gray 10 Theme | Gray 90 Theme | Gray 100 Theme | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--cds-background` | `#ffffff` | `#f4f4f4` | `#262626` | `#161616` | Default page canvas |
| `--cds-layer-01` | `#f4f4f4` | `#ffffff` | `#393939` | `#262626` | First container elevation level |
| `--cds-layer-02` | `#e0e0e0` | `#f4f4f4` | `#525252` | `#393939` | Secondary container layer |
| `--cds-text-primary` | `#161616` | `#161616` | `#f4f4f4` | `#f4f4f4` | High-contrast body text |
| `--cds-text-secondary`| `#525252` | `#525252` | `#c6c6c6` | `#c6c6c6` | Subtle and metadata text |
| `--cds-interactive-01`| `rgb(105, 162, 128)` | `rgb(105, 162, 128)` | `#0f62fe` | `#0f62fe` | Primary action / link focus |
| `--cds-focus` | `rgb(105, 162, 128)` | `rgb(105, 162, 128)` | `#ffffff` | `#ffffff` | Accessible 2px focus ring |

---

## 2. Real-Time Theme Switching Mechanism

Themes are applied to the `<html>` root via the `data-carbon-theme` attribute. The client-side switcher script reads and writes to `localStorage`:

```javascript
// Switching theme dynamically in browser runtime
function setCarbonTheme(themeName) {
  document.documentElement.setAttribute('data-carbon-theme', themeName);
  localStorage.setItem('carbon-theme-preference', themeName);
}
```

When set to `system`, the script monitors the operating system's prefers-color-scheme media query:

```javascript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (localStorage.getItem('carbon-theme-preference') === 'system') {
    document.documentElement.setAttribute('data-carbon-theme', e.matches ? 'g100' : 'white');
  }
});
```

---

## 3. Creating Custom Theme Overrides

Custom themes and palette tokens are configured in `data/themes.yaml`. The dynamic styles template (`layouts/partials/head/styles.html`) transpiles these entries directly into root CSS rules.

### Example: Defining a Custom Theme in `data/themes.yaml`

```yaml
themes:
  emerald_dark:
    name: "Emerald Dark"
    scheme: dark
    tokens:
      --cds-background: "#0d1b14"
      --cds-layer-01: "#14281f"
      --cds-layer-02: "#1c382b"
      --cds-text-primary: "#e8f5ee"
      --cds-text-secondary: "#a3cbb5"
      --cds-interactive-01: "#25a269"
      --cds-focus: "#25a269"
```
