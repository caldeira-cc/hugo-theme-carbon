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

## 1. Dual-Style Architecture: Light & Dark

The design system implements a clean, accessible dual-style architecture:

```
┌────────────────────────────────────────────────────────┐
│               IBM Carbon Dual-Style Theming            │
├────────────────────────────┬───────────────────────────┤
│ Light Style                │ Dark Style                │
├────────────────────────────┼───────────────────────────┤
│ • Canonical IBM White      │ • Canonical IBM Gray 100  │
│ • Optional Gray 10 variant │ • Optional Gray 90 variant│
└────────────────────────────┴───────────────────────────┘
```

### Core Token Mapping Reference

| Token Name | Light Style (White) | Light Variant (Gray 10) | Dark Style (Gray 100) | Dark Variant (Gray 90) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--cds-background` | `#ffffff` | `#f4f4f4` | `#161616` | `#262626` | Default page canvas |
| `--cds-layer-01` | `#f4f4f4` | `#ffffff` | `#262626` | `#393939` | Container elevation level 1 |
| `--cds-layer-02` | `#e0e0e0` | `#e0e0e0` | `#393939` | `#525252` | Container elevation level 2 |
| `--cds-text-primary` | `#161616` | `#161616` | `#f4f4f4` | `#f4f4f4` | High-contrast body text |
| `--cds-text-secondary`| `#525252` | `#525252` | `#c6c6c6` | `#c6c6c6` | Metadata and helper text |
| `--cds-interactive-01`| `#0f62fe` | `#0f62fe` | `#0f62fe` | `#0f62fe` | Primary action button / links |
| `--cds-focus` | `#0f62fe` | `#0f62fe` | `#ffffff` | `#ffffff` | Accessible 2px focus ring |

---

## 2. Real-Time Theme Switching Mechanism

The theme switcher provides three user-facing options: **Browser Default (`system`)**, **Light (`light`)**, and **Dark (`dark`)**.

Active visual styling is applied to `<html>` via `data-carbon-theme="light"` or `data-carbon-theme="dark"`. The inline `<head>` script reads `localStorage` synchronously before initial render to prevent flash-of-unstyled-content (FOUC).

```javascript
// Programmatic theme control in browser runtime
window.CarbonTheme.set('dark');   // 'system' | 'light' | 'dark'
window.CarbonTheme.getActive(); // returns 'light' or 'dark'
window.CarbonTheme.isDark();    // returns boolean
```

When set to `system`, changes to the operating system's `prefers-color-scheme` automatically update the visual mode in real time.

---

## 3. Per-Domain Custom Colour Configuration

Each website repository or subdomain customises its brand colors independently in `hugo.yaml` under `params.carbon.theme`.

### Example: Custom Brand Colors in `hugo.yaml`

```yaml
params:
  carbon:
    defaultThemeMode: "system" # Initial default: system | light | dark
    theme:
      # Optional base variant overrides:
      # lightVariant: "g10"   # Uses soft neutral Gray 10
      # darkVariant: "g90"    # Uses balanced dark Gray 90

      # Custom Light Mode Tokens:
      light:
        primary: "#69a280"             # Custom brand primary (e.g. Sage Green)
        secondary: "#393939"
        link: "#38664b"                # High-contrast accessible link
        linkHover: "#264934"
        focus: "#69a280"
        uiShellBackground: "#69a280"   # Top navigation shell
        uiShellText: "#ffffff"

      # Custom Dark Mode Tokens:
      dark:
        primary: "#69a280"
        secondary: "#525252"
        link: "#8ec3a4"                # Light sage link (>8:1 contrast on dark)
        linkHover: "#b8dec7"
        focus: "#8ec3a4"
        uiShellBackground: "#69a280"
        uiShellText: "#ffffff"
```

The Hugo engine injects these overrides at build time directly into scoped CSS selectors (`html[data-carbon-theme="light"]` and `html[data-carbon-theme="dark"]`), ensuring full WCAG 2.1 AA contrast compliance across both styles.
