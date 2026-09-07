---
title: "Configuration Schema & Cascade Inheritance"
description: "Comprehensive technical reference for global hugo.yaml parameters, multi-subdomain environment configs, and cascading folder overrides."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
version: "v11.2.0"
---

The **Hugo-Carbon Modular Engine** employs an enterprise-grade configuration hierarchy built on top of Hugo's directory-based configuration architecture. It separates global platform defaults from subdomain-specific overrides while supporting folder-level cascading parameters.

```
config/
├── _default/
│   └── hugo.yaml          # Global platform baseline, typography, tokens & defaults
├── cesar/
│   └── hugo.yaml          # Personal hub subdomain overrides (cesar.caldeira.cc)
├── blog/
│   └── hugo.yaml          # Editorial publication overrides (blog.caldeira.cc)
├── apps/
│   └── hugo.yaml          # Interactive applications overrides (apps.caldeira.cc)
├── carbon/
│   └── hugo.yaml          # Theme engine & documentation overrides (carbon.caldeira.cc)
└── assets/
    └── hugo.yaml          # Shared static CDN bundle (assets.caldeira.cc)
```

---

## 1. Global Baseline Blueprint (`config/_default/hugo.yaml`)

The `_default` configuration establishes global defaults, multilingual routing, security policies, token scales, and fallback widget configurations.

```yaml
baseURL: "https://cesar.caldeira.cc/"
defaultContentLanguage: "en"
defaultContentLanguageInSubdir: false

# Supported Languages: English (UK) and Portuguese
languages:
  en:
    languageName: "English (UK)"
    languageCode: "en-GB"
    weight: 1
    title: "César Caldeira | Hub"
    params:
      description: "Working at the intersection of politics and technology, visualising institutions and their functioning, and making strategic assessments on the basis of local, national, and international politics."
  pt:
    languageName: "Português"
    languageCode: "pt-PT"
    weight: 2
    title: "César Caldeira | Hub"
    params:
      description: "Trabalho na intersecção entre política e tecnologia, visualizando instituições e o seu funcionamento, e elaborando avaliações estratégicas."

# Route taxonomies canonically within each subdomain
permalinks:
  categories: "/categories/:slug/"
  tags: "/tags/:slug/"
  authors: "/authors/:slug/"

taxonomies:
  category: categories
  tag: tags
  author: authors

# Markdown & KaTeX LaTeX Parsing Configuration
markup:
  goldmark:
    renderer:
      unsafe: true # Allow raw HTML for advanced components
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
  tableOfContents:
    endLevel: 4
    ordered: false
    startLevel: 2

# Global Engine Parameters
params:
  environment: "cesar"
  assetsURL: "https://assets.caldeira.cc"

  # IBM Carbon Theme Settings
  carbon:
    defaultThemeMode: "system" # Options: "system", "white", "g10", "g90", "g100"
    themeTransitions: true

  # On-Device WebLLM AI Assistant
  aiAgent:
    enable: false
    model: "SmolLM2-360M-Instruct-q4f16_1-MLC"

  # Typography Scales (Options: "sans", "serif", "mono")
  typography:
    content: "sans"
    headings: "sans"
    navbar: "sans"

  # Visual Palette Token Overrides
  styleOverrides:
    enableCustomColors: false
    colors:
      brandPrimary: "rgb(105, 162, 128)"
      brandSecondary: "#393939"
      background: "#ffffff"
      layer01: "#f4f4f4"
      layer02: "#e0e0e0"
      textPrimary: "#161616"
      textSecondary: "#525252"
      link: "rgb(105, 162, 128)"
      focus: "rgb(105, 162, 128)"
      field01: "#f4f4f4"

  # Main Action Bar & Modular Widgets (Disabled by default)
  mainBar:
    enable: false
    sticky: true
    widgets:
      clock:
        enable: true
        timezone: "Europe/London"
        mode: "timezone"
        format: "24h"
        showSeconds: true
      availability:
        enable: false
        status: "available"
      readingProgress:
        enable: true
      weather:
        enable: false
        defaultCity: "London"
        units: "metric"
      location:
        enable: false
        coordinates: "51.5074, -0.1278"
      themeSwitcher:
        enable: true
      search:
        enable: true

  # Sidebar Defaults
  sidebars:
    left:
      enable: false
      defaultState: "expanded"
      sticky: true
    right:
      enable: true
      defaultState: "expanded"
      sticky: true

  # Brand & Header Configuration
  navigation:
    brand:
      title: "CÉSAR CALDEIRA"
      description: "Hub"
      logoUrl: "/assets/images/ibm-carbon-logo.svg"
    navbar: []

  # Social Networks & Online Presence
  social:
    - name: "Facebook"
      id: "facebook"
      url: "https://facebook.com/cesarcaldeira"
      handle: "César Caldeira"
      icon: "facebook"
    - name: "LinkedIn"
      id: "linkedin"
      url: "https://in.caldeira.cc"
      handle: "César Caldeira"
      icon: "linkedin"
    - name: "Twitter / X"
      id: "twitter"
      url: "https://tweet.caldeira.cc"
      handle: "@cesarcaldeira"
      icon: "twitter"
    - name: "Instagram"
      id: "instagram"
      url: "https://instagram.com/cesarcaldeira"
      handle: "@cesarcaldeira"
      icon: "instagram"
    - name: "Chess.com"
      id: "chess"
      url: "https://www.chess.com/member/cesarcaldeira"
      handle: "cesarcaldeira"
      icon: "chess"
    - name: "Bluesky"
      id: "bluesky"
      url: "https://bsky.app/profile/caldeira.cc"
      handle: "@caldeira.cc"
      icon: "bluesky"
```

---

## 2. Environment Override Files

When Hugo compiles an environment with `hugo --environment <name>`, it layers `config/<name>/hugo.yaml` over `config/_default/hugo.yaml`.

### Subdomain Configurations

| Subdomain | Environment Flag | Dev Port | Key Config Features |
| :--- | :--- | :--- | :--- |
| `cesar.caldeira.cc` | `cesar` | `1313` | Personal Hub, Biographical manifest, Archive |
| `blog.caldeira.cc` | `blog` | `1314` | Editorial journal, Serif typography (`typography.content: "serif"`), right TOC sidebar |
| `apps.caldeira.cc` | `apps` | `1315` | Interactive apps, Stockfish chess, WebLLM AI persona, simulation canvas |
| `carbon.caldeira.cc` | `carbon` | `1316` | Documentation hub, 3-level custom left sidebar (`sidebars.left.data: "docs"`), Style guide studio |
| `assets.caldeira.cc` | `assets` | `1317` | Shared CDN target hosting compiled CSS, JS, fonts, and images |

#### Example: `config/carbon/hugo.yaml`
```yaml
baseURL: "https://carbon.caldeira.cc/"

params:
  environment: "carbon"
  navigation:
    brand:
      title: "IBM CARBON"
      description: "Theme & Docs"
      logoUrl: "/assets/images/ibm-carbon-logo.svg"
    navbar:
      - title: "Overview"
        url: "/"
      - title: "Docs"
        url: "/docs/"
      - title: "Style Guide"
        url: "/style/"
      - title: "Data Explorer"
        url: "/data/"
      - title: "Hub"
        url: "https://cesar.caldeira.cc/"
      - title: "Insights"
        url: "https://blog.caldeira.cc/"
      - title: "Apps"
        url: "https://apps.caldeira.cc/"

  sidebars:
    left:
      enable: true
      data: "docs"
    right:
      enable: true
```

---

## 3. Folder-Level Cascading Configuration

Hugo allows folder `_index.md` files to declare a `cascade:` block. All child pages in that directory automatically inherit the parameters.

### Example: Cascading Layout & Theme in `content/carbon/docs/_index.md`

```yaml
---
title: "Technical Documentation"
description: "Architecture guidelines, configuration specs, and technical documentation."
cascade:
  params:
    collectionType: "docs"
    sidebars:
      left:
        enable: true
        data: "docs"    # Automatically uses data/sidebars/docs.yaml
      right:
        enable: true
    typography:
      content: "sans"
      headings: "sans"
    mainBar:
      enable: false
---
```

### Parameter Resolution Priority

When resolving any configuration value (e.g., sidebar visibility or typography choice), the engine queries in the following strict order:

1. **Page Front-Matter** (highest priority — e.g. `sidebars: left: enable: false`)
2. **Folder Cascaded Parameters** (inherited from nearest parent `_index.md` `cascade:`)
3. **Environment Config** (`config/<env>/hugo.yaml`)
4. **Global Baseline Config** (`config/_default/hugo.yaml` — lowest priority fallback)

---

## 4. Custom 3-Level Left Sidebar Configuration

The engine supports rich, nested navigation sidebars defined in `data/sidebars/<name>.yaml`.

### Data Schema (`data/sidebars/docs.yaml`)

```yaml
title: "Technical Documentation"
subtitle: "Architecture & Specifications"
items:
  # Level 1: Category / Section Header
  - title: "Foundations & Grid"
    children:
      # Level 2: Parent Page or Direct Link
      - title: "2x Grid Architecture"
        url: "/docs/architecture/"
        children:
          # Level 3: Indented Leaf Link / Anchor
          - title: "16-Column Grid"
            url: "/docs/architecture/#grid"
          - title: "IBM Plex Typography"
            url: "/docs/architecture/#typography"
      - title: "Mathematical Typesetting"
        url: "/docs/mathematical-typesetting/"

  # Level 1: Group 2
  - title: "Platform Architecture"
    children:
      - title: "Configuration & Cascade"
        url: "/docs/configuration/"
      - title: "Cloudflare Deployment"
        url: "/docs/cloudflare-deployment/"
```
