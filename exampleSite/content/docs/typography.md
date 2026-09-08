---
title: "Typography & Content Elements Reference"
description: "Comprehensive catalogue of IBM Plex typography scales, headings, inline styling, images, captions, callouts, tables, quotes, and footnotes."
date: 2026-08-24T12:00:00Z
author: "Design Systems Team"
categories: ["Design System", "Typography"]
tags: ["Typography", "IBM Plex", "Carbon v11"]
version: "v11.2.0"
---

This page provides an exhaustive, live reference catalogue of every typographic scale, content element, inline style, figure, callout, table, quote, and annotation rendered by the **Hugo-Carbon Modular Engine**.

---

## 1. Heading Hierarchy & Type Scales

The typographic hierarchy follows the mathematical IBM Carbon v11 Type Scale powered by self-hosted **IBM Plex Sans**, **IBM Plex Serif**, and **IBM Plex Mono**.

# Display / Heading 01 (`# Heading 1`)
Used for primary page titles, display headings, and major content landmarks (`42px / 2.625rem`, light/regular weight).

## Heading 02 (`## Heading 2`)
Used for primary section breaks and major thematic divisions (`32px / 2rem`, regular/semi-bold weight).

### Heading 03 (`### Heading 3`)
Used for sub-sections and component category headers (`24px / 1.5rem`, semi-bold weight).

#### Heading 04 (`#### Heading 4`)
Used for subsection subsections and card titles (`20px / 1.25rem`, semi-bold weight).

##### Heading 05 (`##### Heading 5`)
Used for minor group titles and widget headers (`16px / 1rem`, semi-bold weight).

###### Heading 06 (`###### Heading 6`)
Used for metadata headers, captions, and micro-labels (`14px / 0.875rem`, uppercase bold with letter-spacing).

---

## 2. Body Text, Lead Paragraphs & Captions

<p class="cds--type-body-long-02" style="font-size: 1.25rem; line-height: 1.6; color: var(--cds-text-primary); margin-bottom: 1.5rem;">
  <strong>Lead Paragraph (`.cds--type-body-long-02`):</strong> Designed for article introductory paragraphs and executive summaries. It provides higher visual presence and fluid scannability before descending into technical body prose.
</p>

Standard body copy (`.cds--type-body-long-01`) is optimized for extended reading comfort at `16px / 1rem` with a `1.5` line-height multiplier. The IBM Carbon spatial grid ensures that paragraphs maintain optimal line lengths (between 50 and 75 characters per line) regardless of viewport dimensions.

<p class="cds--type-body-short-01" style="color: var(--cds-text-secondary); margin-bottom: 1rem;">
  <strong>Compact Body Copy (`.cds--type-body-short-01`):</strong> Used for dense UI containers, modal dialogs, and table descriptions where vertical compactness is critical.
</p>

<p class="cds--type-caption" style="color: var(--cds-text-helper);">
  <strong>Caption Text (`.cds--type-caption`):</strong> Rendered at 12px (0.75rem) for timestamps, legal disclaimers, and contextual assistance.
</p>

---

## 3. Inline Text Formatting & Annotations

The engine supports all standard and extended CommonMark inline formatting:

- **Bold text (`**bold**` or `__bold__`)**: Emphasizes critical terms with `font-weight: 600`.
- *Italic text (`*italic*` or `_italic_`)**: Applied for foreign terms, publication titles, or conceptual emphasis.
- ***Bold and Italic (`***bold italic***`)***: Combined strong emphasis.
- `Inline Code (`code`)`: Formatted in self-hosted IBM Plex Mono with subtle background padding: `const token = "cds--interactive-01";`.
- ~~Strikethrough text (`~~deleted~~`)~~: Indicates superseded or deprecated specifications.
- <u>Underlined text (`<u>underline</u>`)</u>: For explicit textual underbars.
- <mark style="background-color: var(--cds-layer-02); color: var(--cds-text-primary); padding: 0.1rem 0.35rem; border-radius: 2px;">Highlighted / Marked text (`<mark>highlight</mark>`)</mark>: For analytical search matches and highlighted text blocks.
- Chemical formulas and subscripts: H<sub>2</sub>O, CO<sub>2</sub>, and x<sub>i,j</sub> using `<sub>subscript</sub>`.
- Mathematical powers and superscripts: E = mc<sup>2</sup>, 2<sup>64</sup>, and ISO 8601<sup>[^1]</sup> using `<sup>superscript</sup>`.
- Keyboard Shortcuts (`<kbd>`): Press <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd> to trigger the universal search modal.

---

## 4. Blockquotes & Pullquotes

### Standard Blockquote
> Good design is a lot like clear thinking made visual. The IBM Carbon Design System unites rigorous grid mechanics with intentional typographic clarity.
>
> — <cite>Design Systems Manifesto</cite>

### Nested Analytical Blockquote
> Political institutions and digital architectures share a foundational premise: rules must be transparent, verifiable, and resilient under stress.
>
> > When systems lack explicit constraints, ambiguity fills the void, resulting in fragmentation and technical debt.
> >
> > — <cite>Institutional Governance Review, 2026</cite>

---

## 5. Inline Carbon Callouts & Notifications

Four distinct callout styles communicate critical notices, warnings, and architectural directives:

{{< callout type="info" title="Informational Directive" >}}
All stylesheets and IBM Plex font assets are served locally from memory or the static CDN without executing third-party external CDN requests.
{{< /callout >}}

{{< callout type="success" title="Verification Passed" >}}
The automated link auditor scanned all compiled pages across all subdomains and confirmed **0 broken internal links** and **100% dependency compliance**.
{{< /callout >}}

{{< callout type="warning" title="Configuration Warning" >}}
When overriding `params.styleOverrides`, ensure that the chosen contrast ratio between `--cds-text-primary` and `--cds-background` satisfies WCAG 2.1 AA (minimum 4.5:1).
{{< /callout >}}

{{< callout type="error" title="Critical Security Constraint" >}}
Never commit sensitive private keys or plaintext passwords to Markdown front-matter. Use the client-side AES-256-GCM encrypted secrets shortcode.
{{< /callout >}}

---

## 6. Images, Figures & Captions

### Standard Markdown Image with Caption
![IBM Carbon Design System Architecture Blueprint](/assets/images/ibm-carbon-logo.svg)
*Figure 1.1: Scalable vector icon demonstrating pixel-aligned SVG geometry under Carbon Design Language v11.*

### Structured Hugo Figure Shortcode (`{{< figure >}}`)

{{< figure 
    src="/assets/images/ibm-carbon-logo.svg" 
    alt="IBM Carbon Vector Logo" 
    caption="Token-Driven Theming Architecture" 
    number="1.2"
    legend="Demonstrating dynamic token injection where color variables inherit from data/themes.yaml into root CSS properties."
    source="https://carbondesignsystem.com"
    sourceText="IBM Carbon Design System Official Specification"
>}}

---

## 7. Lists & Hierarchies

### Unordered Bullet Lists (3 Nested Levels)
- Level 1: Platform Foundation
  - Level 2: Design Token Scale
    - Level 3: Interactive Colors (`--cds-interactive-01`)
    - Level 3: Background Layers (`--cds-layer-01`, `--cds-layer-02`)
    - Level 3: Typography Scales (`--cds-font-sans`, `--cds-font-mono`)
  - Level 2: 2x Grid System
    - Level 3: 16-Column Layout
    - Level 3: Fluid Breakpoints (`sm`, `md`, `lg`, `xlg`, `max`)
- Level 1: Multi-Subdomain Routing
  - Level 2: Section Architecture (docs, style, data, showcase)

### Ordered Numeric Lists (3 Nested Levels)
1. **Compilation Phase**
   1. Clean destination directory (`public/`)
   2. Parse YAML configurations and language dictionaries
   3. Render Markdown through Goldmark engine
2. **Asset Pipeline Phase**
   1. Transpile SCSS to minified CSS via Hugo Pipes
   2. Bundle self-hosted WebAssembly and Web Worker modules
3. **Verification Phase**
   1. Run `scripts/verify-dependencies.py`
   2. Execute `scripts/test_public_html.py`

### Interactive Checklists / Task Lists
- [x] Implement UK English (`en-GB`) localization across all environments
- [x] Configure minimalist 404 error page without sidebars
- [x] Create 3-level hierarchical custom left sidebar engine
- [x] Implement social network badges (Facebook, LinkedIn, Twitter/X, Instagram, Chess.com, Bluesky)
- [ ] Deploy multi-subdomain target matrix to Cloudflare Pages

### Definition Lists (`<dl>`)
<dl style="margin: 1.5rem 0;">
  <dt style="font-weight: 600; color: var(--cds-text-primary); margin-top: 0.75rem;">Carbon 2x Grid</dt>
  <dd style="color: var(--cds-text-secondary); margin-left: 1.5rem; margin-bottom: 0.75rem;">A fluid 16-column layout system with an 8px mini-unit spatial cadence governing all typography, margins, and component alignments.</dd>
  <dt style="font-weight: 600; color: var(--cds-text-primary); margin-top: 0.75rem;">Cascading Configuration</dt>
  <dd style="color: var(--cds-text-secondary); margin-left: 1.5rem; margin-bottom: 0.75rem;">Hugo's mechanism allowing parent section `_index.md` files to propagate layout and parameter rules to all nested descendants.</dd>
</dl>

---

## 8. Data Tables & Status Matrices

### Responsive Carbon Data Table

| Module Name | Deployment Target | Security Level | Status | Load Time (LCP) |
| :--- | :--- | :--- | :--- | :--- |
| **Documentation Portal** | `docs.example.org` | Level 1 (Public) | <span class="cds--tag cds--tag--green">ONLINE</span> | `180 ms` |
| **Data Analytics Suite** | `data.example.org` | Level 1 (Public) | <span class="cds--tag cds--tag--green">ONLINE</span> | `210 ms` |
| **Component Studio** | `components.example.org` | Level 1 (Public) | <span class="cds--tag cds--tag--blue">VERIFIED</span> | `195 ms` |
| **Telemetry Dashboard** | `telemetry.example.org` | Level 2 (Worker) | <span class="cds--tag cds--tag--purple">STANDBY</span> | `240 ms` |
| **Theme & Style Guide** | `style.example.org` | Level 1 (Public) | <span class="cds--tag cds--tag--green">ONLINE</span> | `170 ms` |
| **Static Asset Origin** | `assets.example.org` | Level 1 (CORS) | <span class="cds--tag cds--tag--teal">OPTIMIZED</span> | `95 ms` |

---

## 9. Footnotes & Citations

The static engine parses footnotes into interactive superscripts with automated bidirectional back-links:

The IBM Carbon 2x Grid is predicated on an 8-pixel mini-unit spatial cadence[^1], ensuring typographic baselines and container boundaries align geometrically across all viewport sizes[^2].

---

## 10. Horizontal Rules & Thematic Dividers

Standard thematic break:

---

Tagged section divider:

<div style="display: flex; align-items: center; margin: 3rem 0; gap: 1rem;">
  <div style="flex: 1; height: 1px; background-color: var(--cds-border-subtle-00);"></div>
  <span class="cds--tag cds--tag--outline" style="font-family: var(--cds-font-mono, monospace);">/// End of Typographic Reference</span>
  <div style="flex: 1; height: 1px; background-color: var(--cds-border-subtle-00);"></div>
</div>

---

### Footnote References
[^1]: The 8-pixel mini-unit spatial cadence is detailed in the [Architecture & 2x Grid Specification](/docs/architecture/#the-8px-mini-unit-spatial-system).
[^2]: Viewport scaling adheres strictly to IBM Carbon breakpoints: `sm` (320px), `md` (672px), `lg` (1056px), `xlg` (1312px), and `max` (1584px).
