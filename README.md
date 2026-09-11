# Hugo Carbon — IBM Carbon Design System v11 for Hugo

[![Hugo](https://img.shields.io/badge/Hugo-Extended_v0.120+-0e73aa?style=flat-square&logo=hugo)](https://gohugo.io/)
[![Carbon Design System](https://img.shields.io/badge/IBM_Carbon-v11-0f62fe?style=flat-square&logo=ibm)](https://carbondesignsystem.com/)
[![Accessibility](https://img.shields.io/badge/WCAG-2.1_AA_Compliant-24a148?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Zero CDN](https://img.shields.io/badge/Dependencies-100%25_Self--Hosted-8a3ffc?style=flat-square)](https://github.com/caldeira-cc/hugo-theme-carbon)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue.flat-square)](LICENSE)

A high-performance, modular, enterprise-grade static site theme for [Hugo](https://gohugo.io/), implementing the **IBM Design Language** and **IBM Carbon Design System v11** with zero runtime React or Node dependencies.

Designed for documentation hubs, engineering portals, academic research platforms, data dashboards, and corporate knowledge bases.

---

## Key Features

- **IBM Carbon Design System v11 Compliance**:
  - Fluid **16-column 2x Grid** with 8px mini-unit spatial cadence and 4px baseline rhythm.
  - Auto-centered **1440px maximum content boundary frame**.
  - Strict **WCAG 2.1 Level AA accessibility** (accessible contrast ratios, skip-to-content links, ARIA landmarks, 2px focus rings via `--cds-focus`).
- **Strict Dual-Style Theming (`light` & `dark`)**:
  - Canonical IBM Carbon base tokens: **Carbon White** (`light`) and **Carbon Gray 100** (`dark`).
  - Baseline variant support for soft light (**Gray 10**) and balanced dark (**Gray 90**).
  - Runtime theme manager (`system`, `light`, `dark`) with automatic OS `prefers-color-scheme` tracking and zero-FOUC inline head resolution.
  - Per-site / per-domain custom color overrides via `hugo.yaml` (`params.carbon.theme.light` and `params.carbon.theme.dark`).
- **100% Offline-First / Zero External CDNs**:
  - Self-hosted **IBM Plex WOFF2 font family** (IBM Plex Sans, IBM Plex Serif, IBM Plex Mono, and IBM Plex Math).
  - Self-hosted vendor scripts and styles (KaTeX, MapLibre GL, Mermaid, Chart.js, Highlight.js).
  - Zero external third-party network requests for complete privacy and GDPR compliance.
- **75+ Modular Shortcodes**:
  - Complete UI component library: accordions, tabs, tiles, clickable/expandable tiles, notifications, toasts, tags, modals, popovers, progress bars, step indicators, and form inputs.
- **Client-Side Data & Cartography Engines**:
  - **W3C CSVW Data Engine**: Declarative tabular exploration ingesting `.csv` datasets with companion `.csv-metadata.json` schemas, multithreaded Web Worker processing, instant search, and Carbon pagination.
  - **MapLibre GL GeoJSON Maps**: GPU-accelerated 2D flat and 3D globe vector cartography rendering RFC 7946 GeoJSON layers with Carbon styling.
  - **GNU PSPP / SPSS Statistics**: Client-side statistical analysis suite with interactive Variable View and Data View.
  - **KaTeX IBM Plex Math**: High-performance mathematical typesetting with all symbols rendered in self-hosted IBM Plex Math OpenType fonts.
  - **AES-256-GCM Static Encryption**: Build-time static document encryption with PBKDF2 key derivation and zero plaintext leakage.
- **Modular Layout Framework**:
  - Single articles, paginated lists, documentation hierarchies with dual sidebars, executive KPI dashboards, editorial magazines, and interactive style guides.
- **Sticky Main Action Bar**:
  - Modular widgets: Timezone Clock, ISO Date, Availability Tracker, Open-Meteo Weather, FlexSearch client search modal, and Theme Switcher.

---

## Quick Start

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) **v0.120.0 or later** (requires Dart Sass / Hugo Pipes bundling).
- [Git](https://git-scm.com/).

---

### Option A: Using Hugo Modules (Recommended)

1. Initialize your Hugo site (if not already done):
   ```bash
   hugo new site my-site
   cd my-site
   git init
   hugo mod init github.com/my-org/my-site
   ```

2. Add `hugo-theme-carbon` to your `hugo.yaml`:
   ```yaml
   module:
     imports:
       - path: github.com/caldeira-cc/hugo-theme-carbon
   ```

3. Download theme dependencies:
   ```bash
   hugo mod get github.com/caldeira-cc/hugo-theme-carbon
   ```

4. Start the development server:
   ```bash
   hugo server -D
   ```

---

### Option B: Using Git Submodules

1. In your Hugo project root, add the theme as a submodule:
   ```bash
   git submodule add https://github.com/caldeira-cc/hugo-theme-carbon.git themes/hugo-theme-carbon
   ```

2. Set the theme in `hugo.yaml`:
   ```yaml
   theme: "hugo-theme-carbon"
   ```

3. Start the development server:
   ```bash
   hugo server -D
   ```

---

### Option C: Exploring the Included `exampleSite`

The repository includes a complete demonstration website showcasing every layout, component, and shortcode:

```bash
git clone https://github.com/caldeira-cc/hugo-theme-carbon.git
cd hugo-theme-carbon/exampleSite
hugo server -p 1316 --bind 127.0.0.1
```

Open `http://localhost:1316/` in your browser to explore the live showcase.

---

## Directory Structure

```
hugo-theme-carbon/
├── assets/
│   ├── scss/
│   │   ├── main.scss               # Main stylesheet importing all SCSS modules
│   │   ├── _tokens.scss            # Base IBM Carbon v11 tokens (White, G10, G90, G100)
│   │   ├── _grid.scss              # 16-column 2x Grid & layout scaffolds
│   │   ├── _fonts.scss             # Self-hosted IBM Plex @font-face rules
│   │   ├── _math.scss              # KaTeX IBM Plex Math typography rules
│   │   ├── _typography.scss        # Carbon type scale & heading hierarchies
│   │   ├── _components.scss        # Core Carbon UI shell & component styles
│   │   ├── _main-bar.scss          # Sticky action bar & widget styles
│   │   └── _sidebars.scss          # Hierarchical navigation & ToC styles
│   └── js/
│       ├── main.js                 # Vanilla JS entry point
│       ├── theme.js                # Dual-style theme manager (system/light/dark)
│       ├── csvw-table.js           # W3C CSVW tabular engine & Web Worker pipeline
│       ├── geojson-map.js          # MapLibre GL vector cartography controller
│       ├── spss-engine.js          # GNU PSPP / SPSS statistics engine
│       ├── search.js               # FlexSearch client-side indexing & search modal
│       └── ui-shell.js             # Mobile drawers, accordions, tabs, and modals
├── layouts/
│   ├── _default/
│   │   ├── baseof.html             # Master HTML scaffold with zero-FOUC theme bootstrap
│   │   ├── single.html             # Standard article layout with metadata grid
│   │   ├── list.html               # Section archive with filterable card grid
│   │   └── dashboard.html          # Executive KPI dashboard layout
│   ├── partials/
│   │   ├── head/                   # Meta tags, preloaded fonts, dynamic theme CSS
│   │   ├── header/navbar.html      # IBM Carbon UI Shell header & brand navigation
│   │   ├── main-bar/bar.html       # Sticky action bar with modular widgets
│   │   ├── sidebars/               # Left navigation tree & right scroll-spy ToC
│   │   └── footer/footer.html      # Carbon 4-column structured footer
│   ├── shortcodes/                 # 75+ modular Hugo shortcodes
│   └── style/list.html             # Interactive visual style guide specimen
├── static/
│   ├── fonts/                      # 29 IBM Plex WOFF2 fonts (Sans, Serif, Mono, Math)
│   ├── lib/                        # Self-hosted KaTeX, MapLibre, Mermaid, Chart.js
│   └── licenses/                   # Standardized open-source license texts
├── data/
│   ├── themes.yaml                 # Baseline color theme definitions
│   └── availability.yaml           # Working schedule & availability calendar
├── scripts/
│   ├── verify-dependencies.py      # Dependency & font zero-CDN integrity auditor
│   ├── test_public_html.py         # Static link integrity auditor
│   └── encrypt.py                  # AES-256-GCM static document encryption tool
└── theme.yaml                      # Theme manifest & metadata
```

---

## Theming & Color Customisation

Hugo-Carbon implements a strict **Dual-Style Architecture** (`light` and `dark`) compliant with IBM Carbon Design System v11 tokens.

### Theme Modes

| Mode | Selector | Base Scale | Primary Role |
|:---|:---|:---|:---|
| **System** | `html[data-carbon-theme="light\|dark"]` | Tracks OS | Automatically tracks operating system `prefers-color-scheme`. |
| **Light** | `html[data-carbon-theme="light"]` | White (`#ffffff`) | High-clarity light canvas with Gray 10/20 layers. |
| **Dark** | `html[data-carbon-theme="dark"]` | Gray 100 (`#161616`) | Deep dark canvas with Gray 90/80 layers. |

### Per-Site Palette Overrides (`hugo.yaml`)

You can customize the color palette for your site or domain directly in `hugo.yaml` under `params.carbon.theme`. The engine injects these overrides at build time directly into scoped CSS selectors (`html[data-carbon-theme="light"]` and `html[data-carbon-theme="dark"]`):

```yaml
params:
  carbon:
    defaultThemeMode: "system" # Initial default: system | light | dark
    theme:
      # Optional base variant foundations:
      lightVariant: "white"    # "white" (default) or "g10"
      darkVariant: "g100"      # "g100" (default) or "g90"

      # Light Mode Overrides:
      light:
        primary: "#0f62fe"             # IBM Blue 60 (or custom brand hex)
        secondary: "#393939"
        background: "#ffffff"
        layer01: "#f4f4f4"
        layer02: "#e0e0e0"
        textPrimary: "#161616"
        textSecondary: "#525252"
        link: "#0f62fe"
        linkHover: "#0043ce"
        focus: "#0f62fe"
        uiShellBackground: "#161616"
        uiShellText: "#ffffff"

      # Dark Mode Overrides:
      dark:
        primary: "#0f62fe"
        secondary: "#525252"
        background: "#161616"
        layer01: "#262626"
        layer02: "#393939"
        textPrimary: "#f4f4f4"
        textSecondary: "#c6c6c6"
        link: "#78a9ff"
        linkHover: "#a6c8ff"
        focus: "#ffffff"
        uiShellBackground: "#161616"
        uiShellText: "#ffffff"

      # Optional arbitrary token map:
      tokens:
        light:
          --cds-support-success: "#24a148"
        dark:
          --cds-support-success: "#42be65"
```

---

## 75+ Shortcodes Reference

Hugo-Carbon includes an exhaustive library of shortcodes adhering strictly to Carbon Design System patterns:

### 1. Structural & Container Components

| Shortcode | Description | Key Parameters |
|:---|:---|:---|
| `{{< accordion >}}` | Collapsible section container | `align="start\|end"` |
| `{{< accordion-item >}}` | Individual collapsible item | `title="string"`, `open="true\|false"` |
| `{{< tabs >}}` | Tabbed navigation container | `type="default\|contained\|vertical"`, `size="sm\|md\|lg"`, `fullWidth="true"`, `dismissable="true"` |
| `{{< tab-panel >}}` | Individual tab content panel | `title="string"`, `icon="string"`, `secondaryLabel="string"`, `badge="string"`, `selected="true"` |
| `{{< tile >}}` | Standard content tile | — |
| `{{< clickable-tile >}}` | Interactive link tile | `href="url"`, `title="string"`, `external="true\|false"` |
| `{{< expandable-tile >}}` | Tile with summary and reveal | `title="string"`, fold with `<!-- more -->` |
| `{{< card >}}` | Standardized Carbon card | `title="string"`, `eyebrow="string"`, `tag="string"`, `href="url"` |
| `{{< contained-list >}}` | List in elevated container | `title="string"` |
| `{{< contained-list-item >}}` | Contained list row | `title="string"`, `description="string"`, `href="url"` |
| `{{< structured-list >}}` | Tabular key-value comparison | `headers="Col 1,Col 2"` |

#### Example: Accordion & Tabs
```markdown
{{< accordion >}}
  {{< accordion-item title="System Architecture" open="true" >}}
    Static compilation with zero runtime React dependencies.
  {{< /accordion-item >}}
  {{< accordion-item title="Theming Tokens" >}}
    Fully managed via CSS Custom Properties (`--cds-*`).
  {{< /accordion-item >}}
{{< /accordion >}}

{{< tabs type="contained" >}}
  {{< tab-panel title="Overview" icon="information" selected="true" >}}Overview content goes here...{{< /tab-panel >}}
  {{< tab-panel title="Installation" icon="download" >}}Installation steps...{{< /tab-panel >}}
  {{< tab-panel title="Verification" icon="checkmark--filled" badge="Passed" badgeColor="green" >}}Verification commands...{{< /tab-panel >}}
{{< /tabs >}}
```

---

### 2. Feedback, Status & Modals

| Shortcode | Description | Key Parameters |
|:---|:---|:---|
| `{{< notification >}}` | Banner notification | `kind="info\|success\|warning\|error"`, `title="string"`, `subtitle="string"` |
| `{{< toast >}}` | Timed or inline alert toast | `kind="info\|success\|warning\|error"`, `title="string"`, `subtitle="string"` |
| `{{< tag >}}` | Carbon status badge / tag | `type="blue\|green\|red\|purple\|teal\|warm-gray"`, `size="sm\|md"` |
| `{{< tooltip >}}` | Contextual hover tooltip | `text="Tooltip message"` (wraps target text) |
| `{{< popover >}}` | Dismissible floating popover | `trigger="Click me"`, `direction="bottom\|top"` |
| `{{< modal >}}` | Accessible dialog modal | `id="string"`, `title="string"`, `triggerText="string"` |
| `{{< progress-bar >}}` | Determinate progress bar | `value="75"`, `max="100"`, `label="string"`, `status="active\|success\|error"` |
| `{{< progress-indicator >}}`| Multi-step linear tracker | `steps="Step 1,Step 2,Step 3"`, `current="1"`, `vertical="false"` |
| `{{< skeleton >}}` | Loading placeholder state | `type="text\|heading\|card\|table"`, `lines="3"` |

---

### 3. Interactive Form Controls

| Shortcode | Description | Key Parameters |
|:---|:---|:---|
| `{{< button >}}` | Carbon action button | `type="primary\|secondary\|tertiary\|ghost\|danger"`, `href="url"`, `icon="arrow-right"` |
| `{{< form-input >}}` | Standard text input field | `label="string"`, `placeholder="string"`, `helper="string"` |
| `{{< number-input >}}` | Step-adjusted number input | `label="string"`, `min="0"`, `max="100"`, `value="10"`, `step="1"` |
| `{{< slider >}}` | Range slider control | `label="string"`, `min="0"`, `max="100"`, `value="50"`, `unit="%"`, `step="5"` |
| `{{< select >}}` | Dropdown select menu | `label="string"`, `options="Opt 1,Opt 2,Opt 3"`, `helper="string"` |
| `{{< toggle >}}` | Binary switch toggle | `id="string"`, `label="string"`, `checked="true\|false"` |
| `{{< checkbox >}}` | Accessible checkbox | `id="string"`, `label="string"`, `checked="true\|false"`, `helper="string"` |
| `{{< radio-group >}}` | Grouped radio options | `legend="string"`, `name="string"`, wraps `{{< radio-button >}}` |
| `{{< date-picker >}}` | Date selection field | `label="string"`, `placeholder="YYYY-MM-DD"`, `helper="string"` |
| `{{< time-picker >}}` | Time selection field | `label="string"`, `helper="string"` |
| `{{< file-uploader >}}` | File attachment dropzone | `label="string"`, `description="string"`, `accept=".csv,.json"` |
| `{{< content-switcher >}}`| Segmented view switcher | `options="Day,Week,Month"`, `id="string"` |

---

### 4. Data, Mathematics & Science

| Shortcode | Description | Key Parameters |
|:---|:---|:---|
| `{{< csvw-table >}}` | W3C CSVW tabular data engine | `csv="path/to/data.csv"`, `metadata="path/to/schema.json"`, `pageSize="10"` |
| `{{< data-table >}}` | Markdown table to Carbon DataTable | `sortable="true"`, `filterable="true"`, `stickyHeader="true"` |
| `{{< xml-table >}}` | Build-time XML dataset table | `src="path/to/data.xml"`, `title="string"`, `pageSize="10"` |
| `{{< geojson-map >}}` | MapLibre GL vector map | `src="path/to/geo.geojson"`, `projection="mercator\|globe"`, `height="450px"` |
| `{{< math >}}` | KaTeX with IBM Plex Math | Formula in block; supports LaTeX delimiters `$$...$$` |
| `{{< mermaid >}}` | Light/Dark reactive diagram | `id="string"`, `title="string"`, declarative Mermaid syntax |
| `{{< spss-view >}}` | GNU PSPP dataset viewer | `data="path/to/data.csv"`, `variableView="true"`, `height="400px"` |
| `{{< analytics-suite >}}` | Executive telemetry suite | `dataset="string"`, `kpis="true"` |

---

### 5. Dashboard Framework

| Shortcode | Description | Key Parameters |
|:---|:---|:---|
| `{{< dashboard >}}` | Full-width dashboard container | Wraps dashboard child components |
| `{{< dashboard-header >}}` | Header with title and controls | `title="string"`, `subtitle="string"`, `badge="LIVE"` |
| `{{< dashboard-kpi-grid >}}`| Grid for metric cards | `columns="3\|4"` |
| `{{< dashboard-kpi >}}` | Single KPI metric card | `title="string"`, `value="99.9%"`, `trend="up\|down"`, `change="+0.4%"` |
| `{{< dashboard-metric-bar >}}`| Inline horizontal progress meter | `label="string"`, `value="72"`, `max="100"`, `unit="GB"` |
| `{{< dashboard-status-matrix >}}`| Service health grid | Wraps `{{< dashboard-status-item >}}` |
| `{{< dashboard-status-item >}}`| Individual node status | `name="string"`, `status="healthy\|degraded\|offline"` |

---

### 6. Utilities & Media

| Shortcode | Description | Key Parameters |
|:---|:---|:---|
| `{{< code-file >}}` | Syntax-highlighted code block | `file="path"`, `lang="yaml"`, `title="filename"`, `lineNos="true"` |
| `{{< breadcrumb >}}` | Breadcrumb trail | `items="Home (/), Docs (/docs/), Page (/docs/page/)"` |
| `{{< pagination >}}` | Carbon pagination controller | `total="100"`, `page="1"`, `pageSize="10"`, `pageSizes="5,10,25"` |
| `{{< read-aloud >}}` | Client-side Web Speech TTS player | `speed="1.0"`, `showControls="true"` |
| `{{< vcard >}}` | RFC 6350 digital business card | `file="sample.vcf"` OR parameters (`name`, `title`, `email`, etc.) |
| `{{< social-links >}}` | Social network badges | `layout="inline\|grid"` (uses config `params.social`) |

---

## Client-Side Data Engines

### 1. W3C CSVW Tabular Engine
Hugo-Carbon implements the [W3C CSV on the Web (CSVW)](https://www.w3.org/TR/tabular-data-primer/) specification. By providing a companion `.csv-metadata.json` schema alongside your `.csv` dataset, you declare typed columns, formatted titles, units, descriptions, and status badge mappings:

```markdown
{{< csvw-table 
    csv="/data/server-telemetry.csv" 
    metadata="/data/server-telemetry.csv-metadata.json" 
    title="Global Server Telemetry" 
    pageSize="10" >}}
```

Processing occurs inside a dedicated Web Worker to ensure zero main-thread UI stuttering, even with thousands of rows.

### 2. MapLibre GL GeoJSON Vector Maps
GPU-accelerated vector cartography rendering standard RFC 7946 GeoJSON files:

```markdown
{{< geojson-map 
    src="/data/sample-infrastructure.geojson" 
    projection="mercator" 
    zoom="3" 
    height="480px" 
    interactive="true" >}}
```

Automatically inherits the active Carbon theme mode (`light` or `dark`), adapting vector tile layer palettes in real time.

### 3. KaTeX with IBM Plex Math
All mathematical expressions are rendered client-side using KaTeX, with font rules mapped to self-hosted **IBM Plex Math WOFF2**:

```markdown
$$\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}$$

$$\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}, \quad \nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \frac{\partial \mathbf{E}}{\partial t}$$
```

### 4. Build-Time Static Document Encryption
Protect sensitive documents or internal notes with AES-256-GCM encryption:
1. Set `password: "your-passphrase"` in the page front-matter.
2. Run the encryption script post-build:
   ```bash
   python3 scripts/encrypt.py --dir public
   ```
3. The page content is encrypted with PBKDF2 (100,000 iterations, SHA-256) and AES-256-GCM. Plaintext is completely removed from the static output; decryption occurs strictly in client memory upon passphrase entry.

---

## Configuration Reference (`hugo.yaml`)

Below is a complete, annotated template for your site's `hugo.yaml`:

```yaml
baseURL: "https://example.org/"
title: "Enterprise Knowledge Portal"
defaultContentLanguage: "en"

# Multilingual configuration (en-GB, pt-PT, etc.)
languages:
  en:
    languageName: "English (UK)"
    languageCode: "en-GB"
    weight: 1
    title: "Enterprise Knowledge Portal"
    params:
      description: "High-performance documentation and data portal built on IBM Carbon v11."

taxonomies:
  category: categories
  tag: tags
  author: authors

# Markdown & Syntax Highlighting
markup:
  goldmark:
    renderer:
      unsafe: true # Required for Carbon HTML components in markdown
    extensions:
      passthrough:
        enable: true
        delimiters:
          block:
            - ["$$", "$$"]
            - ["\\[", "\\]"]
          inline:
            - ["$", "$"]
            - ["\\(", "\\)"]
  highlight:
    style: "monokai"
    lineNos: true
    guessSyntax: true
  tableOfContents:
    startLevel: 2
    endLevel: 4
    ordered: false

params:
  # Carbon Theme Settings
  carbon:
    useLocalFonts: true        # 100% self-hosted WOFF2 fonts
    defaultThemeMode: "system" # Initial theme: "system", "light", "dark"
    theme:
      lightVariant: "white"    # "white" or "g10"
      darkVariant: "g100"      # "g100" or "g90"

  # Typography Families
  typography:
    content: "sans"            # "sans" or "serif"
    headings: "sans"
    navbar: "sans"

  # Sidebars (docs hierarchies and ToC)
  sidebars:
    left:
      enable: true
      defaultState: "expanded"
      sticky: true
    right:
      enable: true
      defaultState: "expanded"
      sticky: true

  # Main Action Bar & Widgets
  mainBar:
    enable: true
    sticky: true
    widgets:
      clock:
        enable: true
        mode: "timezone"
        timezone: "UTC"
      date:
        enable: true
      availability:
        enable: true
        url: "/contact/"
      themeSwitcher:
        enable: true           # System / Light / Dark selector
      search:
        enable: true           # Instant FlexSearch modal trigger

  # Top UI Shell Navigation
  navigation:
    brand:
      title: "CARBON"
      description: "[Portal]"
      logoUrl: "/assets/images/ibm-carbon-logo.svg"
    navbar:
      - title: "Overview"
        url: "/"
        icon: "Home20"
      - title: "Docs"
        url: "/docs/"
        icon: "Catalog20"
      - title: "Style Guide"
        url: "/style/"
        icon: "ColorPalette20"
      - title: "Data Explorer"
        url: "/data/"
        icon: "Table20"

  # Structured Footer
  footer:
    copyright: "Hugo Carbon Open Source Theme. Built on IBM Carbon Design System v11."
    compliance: "Compliant with WCAG 2.1 AA Standards & GDPR."
    columns:
      - title: "Resources"
        links:
          - title: "Documentation"
            url: "/docs/"
          - title: "Style Guide"
            url: "/style/"
          - title: "Data Explorer"
            url: "/data/"
      - title: "Legal & Privacy"
        links:
          - title: "Privacy Policy"
            url: "/privacy/"
          - title: "Terms of Service"
            url: "/terms/"
          - title: "Open Source Licenses"
            url: "/licenses/"
```

---

## Production Deployment

### 1. Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. In the **Cloudflare Dashboard** -> **Compute (Workers & Pages)** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Configure the build settings:
   - **Framework preset**: `Hugo`
   - **Build command**: `hugo --gc --minify`
   - **Build output directory**: `public`
4. Under **Environment variables**, set:
   ```
   HUGO_VERSION = 0.149.0
   ```
5. Click **Save and Deploy**.

### 2. GitHub Pages
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.149.0'
          extended: true
      - name: Build
        run: hugo --gc --minify
      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

---

## Verification & Auditing Scripts

The theme includes test utilities in `scripts/`:

```bash
# Verify 100% self-hosted fonts, vendor scripts, and OSS licenses (Zero-CDN invariant)
python3 scripts/verify-dependencies.py

# Run static link integrity audit (verifies 0 broken links in public/)
python3 scripts/test_public_html.py --dir public

# Encrypt sensitive documents post-build
python3 scripts/encrypt.py --dir public
```

---

## Contributing & License

Contributions are welcome! Please submit pull requests or file issues on GitHub.

- **Theme Engine**: Licensed under [Apache-2.0](LICENSE).
- **IBM Carbon Design System**: Copyright IBM Corporation, licensed under Apache-2.0.
- **IBM Plex Fonts**: Copyright IBM Corporation, licensed under SIL Open Font License 1.1.
