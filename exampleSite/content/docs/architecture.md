---
title: "Architecture & 2x Grid Specification"
description: "Mathematical layout specifications for the IBM Carbon 2x Grid, 8px mini-unit spatial system, and IBM Plex typeface scale."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Architecture", "Design System"]
tags: ["Carbon v11", "Grid", "IBM Plex"]
version: "v11.2.0"
---

The **Hugo-Carbon Modular Engine** implements the foundational mathematics of the **IBM Design Language** and the **IBM Carbon Design System v11**. Every margin, padding, typography scale, and layout column aligns strictly with the **Carbon 2x Grid**.

---

## 1. The Carbon 2x Grid (Fluid 16-Column)

The Carbon 2x Grid provides fluid structure across mobile, tablet, and desktop display environments. The grid uses a **16-column layout** on desktop with an **8px mini-unit** and a **4px baseline grid** for vertical rhythm.

### Viewport Breakpoint Scale

| Viewport Profile | Viewport Range | Grid Columns | Gutter Width | Screen Margins | Spatial Base |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Small (`sm`)** | `320px` – `671px` | `4` | `16px` (1rem) | `16px` (1rem) | 4px baseline rhythm |
| **Medium (`md`)** | `672px` – `1055px` | `8` | `32px` (2rem) | `16px` (1rem) | 8px component step |
| **Large (`lg`)** | `1056px` – `1311px` | `16` | `32px` (2rem) | `16px` (1rem) | 8px component step |
| **Extra Large (`xlg`)** | `1312px` – `1583px` | `16` | `32px` (2rem) | `24px` (1.5rem) | 8px component step |
| **Max Frame (`max`)** | `1584px` and above | `16` (Max 1440px) | `32px` (2rem) | Auto-centered | 1440px boundary frame |

### Content Envelope CSS Implementation

```scss
// Container Envelope Enforcing 1440px Maximum Boundary
.carbon-content-frame {
  width: 100%;
  max-width: 1440px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  box-sizing: border-box;

  @media (min-width: 42rem) { // 672px MD Breakpoint
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
```

---

## 2. The 8px Mini-Unit Spatial System

All margins, paddings, and component dimensions are integer multiples of the **8-pixel mini-unit**:

```
$spacing-01:  2px;  (0.125rem) - Micro-borders & hairline dividers
$spacing-02:  4px;  (0.25rem)  - Tight padding & badge insets
$spacing-03:  8px;  (0.5rem)   - 1 Mini-Unit (Default inline gap)
$spacing-04: 12px;  (0.75rem)  - Form input insets
$spacing-05: 16px;  (1.0rem)   - 2 Mini-Units (Standard component spacing)
$spacing-06: 24px;  (1.5rem)   - 3 Mini-Units (Tile padding & subheadings)
$spacing-07: 32px;  (2.0rem)   - 4 Mini-Units (Card spacing & grid gutters)
$spacing-08: 40px;  (2.5rem)   - 5 Mini-Units (Main action bar height)
$spacing-09: 48px;  (3.0rem)   - 6 Mini-Units (UI shell top header height)
$spacing-10: 64px;  (4.0rem)   - 8 Mini-Units (Section hero vertical padding)
```

---

## 3. IBM Plex Typeface Scale

The Hugo-Carbon engine bundles 100% self-hosted **IBM Plex** fonts in WOFF2 format:

| Typeface | Weights Included | Operational Application Context |
| :--- | :--- | :--- |
| **IBM Plex Sans** | `300`, `400`, `600`, `700` | UI shell header, navigation items, page headings, buttons, body prose |
| **IBM Plex Serif** | `400`, `600` | Long-form editorial passages, pull quotes, academic journal essays |
| **IBM Plex Mono** | `400`, `600` | Code blocks, technical tags, timestamps, data table metrics |
| **IBM Plex Math** | `400` | Mathematical formulas, Greek symbols, integral signs, matrix delimiters |

---

## 4. Content Frame Allocation Model

The layout scaffold distributes space across the 16-column grid dynamically based on active sidebars:

- **Dual Sidebars Enabled (Left + Right)**:
  - Left Navigation Sidebar: Columns 1 to 3 (`3 cols`, 280px sticky).
  - Main Content Region: Columns 4 to 13 (`10 cols`).
  - Right Table of Contents / Meta Sidebar: Columns 14 to 16 (`3 cols`, sticky).
- **Single Left Sidebar Enabled**:
  - Left Sidebar: Columns 1 to 3 (`3 cols`).
  - Main Content Region: Columns 4 to 16 (`13 cols`).
- **Single Right Sidebar Enabled**:
  - Main Content Region: Columns 1 to 13 (`13 cols`).
  - Right Sidebar: Columns 14 to 16 (`3 cols`).
- **Full Width Layout (Zero Sidebars)**:
  - Main Content Region: Columns 1 to 16 (`16 cols` — standard for 404 pages and full-width showcases).

{{< mermaid title="Carbon 2x Grid Layout Allocation Pipeline" id="grid-pipeline" >}}
flowchart LR
    A["Front-Matter / Cascade\n(params.sidebars)"] --> B{"Sidebar Evaluation"}
    B -->|left: true, right: true| C["Dual Sidebar Layout\n[3 Cols] + [10 Cols] + [3 Cols]"]
    B -->|left: true, right: false| D["Left Sidebar Layout\n[3 Cols] + [13 Cols]"]
    B -->|left: false, right: true| E["Right Sidebar Layout\n[13 Cols] + [3 Cols]"]
    B -->|left: false, right: false| F["Full 16-Column Canvas\n[16 Cols Boundary]"]
{{< /mermaid >}}

---

## 5. Standalone Theme Package & Multi-Site Monorepo Architecture

The repository isolates the **Hugo-Carbon Theme** into a standalone, portable theme package located in `themes/carbon/`:

```
Hugo-Carbon Workspace Root/
├── themes/carbon/              <-- Standalone Reusable Hugo Theme
│   ├── assets/                 <-- Token-driven SCSS & modular JS engines
│   ├── layouts/                <-- Decoupled HTML5 templates & shortcodes
│   ├── static/                 <-- Self-hosted fonts, licenses, and libraries
│   ├── data/                   <-- Dynamic palette themes (themes.yaml)
│   └── theme.yaml              <-- Theme manifest & metadata (v11.2.0)
│
├── content/                    <-- Individual Websites
│   ├── cesar/                  <-- Personal Landing Page (Hub)
│   ├── blog/                   <-- Publication & Academic Blog
│   ├── carbon/                 <-- Theme Documentation & Specimen Portal
│   └── apps/                   <-- Interactive Web Application Sandbox
│
├── config/                     <-- Multi-Environment Config Cascade
│   ├── _default/hugo.yaml      <-- Base config loading theme: "carbon"
│   ├── cesar/hugo.yaml         <-- cesar.caldeira.cc environment
│   ├── blog/hugo.yaml          <-- blog.caldeira.cc environment
│   └── carbon/hugo.yaml        <-- carbon.caldeira.cc environment
│
└── .agents/                    <-- Dual-Agent Operating Framework
    ├── skills/theme-engineer/  <-- Theme Engineer Agent (Hugo & Theme Maintenance)
    └── skills/content-creator/ <-- Content Creator Agent (Site Content Authoring)
```

