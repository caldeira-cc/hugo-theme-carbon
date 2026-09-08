---
title: "Configuration Schema & Cascade Inheritance"
description: "Comprehensive technical reference for global hugo.yaml parameters, multi-environment configurations, and cascading front-matter overrides."
date: 2026-08-24T12:00:00Z
author: "Design Systems Team"
version: "v11.2.0"
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

The **Hugo Carbon Theme** employs an enterprise-grade configuration hierarchy built on top of Hugo's native configuration architecture. It cleanly separates global baseline parameters, theme-level tokens, widget controls, and folder-level cascading parameters.

```
site-root/
├── config/
│   └── _default/
│       └── hugo.yaml          # Global platform baseline, typography, tokens & defaults
├── data/
│   ├── sidebars/
│   │   └── docs.yaml          # Hierarchical navigation tree for documentation
│   └── availability.yaml      # Desk availability schedule & holidays
└── content/
    └── docs/
        └── _index.md          # Cascading parameters propagating to child pages
```

---

## 1. Global Baseline Blueprint (`hugo.yaml`)

The baseline configuration establishes site metadata, multilingual settings, Markdown rendering rules, token scales, and main bar widgets:

```yaml
baseURL: "https://example.org/"
title: "Enterprise Knowledge Portal"
defaultContentLanguage: "en"
defaultContentLanguageInSubdir: false

# Supported Languages: English (UK) and Portuguese (PT)
languages:
  en:
    languageName: "English (UK)"
    languageCode: "en-GB"
    weight: 1
    title: "Enterprise Knowledge Portal"
    params:
      description: "High-performance documentation and data portal built on IBM Carbon v11."
  pt:
    languageName: "Português"
    languageCode: "pt-PT"
    weight: 2
    title: "Portal Empresarial de Conhecimento"
    params:
      description: "Portal de documentação e análise de dados de alto desempenho construído com IBM Carbon v11."

# Canonical taxonomy permalinks
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
      unsafe: true # Required to render Carbon HTML components in markdown
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
    startLevel: 2
    endLevel: 4
    ordered: false

# Global Engine Parameters
params:
  # IBM Carbon Theme Settings (Dual-Style: Light & Dark)
  carbon:
    useLocalFonts: true        # Deliver 100% self-hosted WOFF2 fonts
    defaultThemeMode: "system" # Options: "system", "light", "dark"
    themeTransitions: true
    theme:
      # Baseline variants (optional):
      lightVariant: "white"    # "white" (default crisp) or "g10" (soft neutral)
      darkVariant: "g100"      # "g100" (default deep dark) or "g90" (balanced dark)

      # Domain-specific custom colors for Light style:
      light:
        primary: "#0f62fe"             # Primary interactive accent (IBM Blue 60)
        secondary: "#393939"           # Secondary action
        link: "#0f62fe"                # Accessible link color
        linkHover: "#0043ce"           # Link hover color
        uiShellBackground: "#161616"   # Top navigation shell background
        uiShellText: "#ffffff"         # Top navigation shell text

      # Domain-specific custom colors for Dark style:
      dark:
        primary: "#0f62fe"
        secondary: "#525252"
        link: "#78a9ff"
        linkHover: "#a6c8ff"
        focus: "#ffffff"
        uiShellBackground: "#161616"
        uiShellText: "#ffffff"

  # Main Action Bar & Modular Widgets
  mainBar:
    enable: true
    sticky: true
    widgets:
      clock:
        enable: true
        timezone: "UTC"
        mode: "timezone"
        format: "24h"
        showSeconds: true
      date:
        enable: true
      availability:
        enable: true
        url: "#"
      readingProgress:
        enable: true
      themeSwitcher:
        enable: true           # System / Light / Dark selector
      search:
        enable: true           # Instant FlexSearch modal trigger
      weather:
        enable: false
      location:
        enable: false

  # Sidebar Defaults
  sidebars:
    left:
      enable: true
      defaultState: "expanded"
      sticky: true
    right:
      enable: true
      defaultState: "expanded"
      sticky: true

  # Brand & Header Configuration
  navigation:
    brand:
      title: "CARBON"
      description: "[Docs]"
      logoUrl: "/assets/images/ibm-carbon-logo.svg"
    navbar:
      - title: "Overview"
        url: "/"
      - title: "Docs"
        url: "/docs/"
      - title: "Components"
        url: "/docs/carbon-components/"
      - title: "Style Guide"
        url: "/style/"
      - title: "Data Explorer"
        url: "/data/"

  # Social Networks & Online Presence
  social:
    - name: "GitHub"
      id: "github"
      url: "https://github.com/caldeira-cc/hugo-theme-carbon"
      handle: "caldeira-cc/hugo-theme-carbon"
      icon: "github"
    - name: "LinkedIn"
      id: "linkedin"
      url: "https://linkedin.com/company/example"
      handle: "Design Systems"
      icon: "linkedin"
    - name: "Twitter / X"
      id: "twitter"
      url: "https://twitter.com/example"
      handle: "@example"
      icon: "twitter"
```

---

## 2. Multi-Environment Staging & Production

When managing multiple deployment environments (e.g. `staging` vs `production`), Hugo layers environment configs over the default config.

```
config/
├── _default/
│   └── hugo.yaml              # Shared base config
├── staging/
│   └── hugo.yaml              # Overrides: baseURL: "https://staging.example.org/"
└── production/
    └── hugo.yaml              # Overrides: baseURL: "https://example.org/"
```

Compile with:
```bash
hugo --environment production --gc --minify
```

---

## 3. Folder-Level Cascading Configuration

Hugo allows folder `_index.md` files to declare a `cascade:` block. All child pages in that directory automatically inherit the parameters without repeating them on every article.

### Example: Cascading Layout in `content/docs/_index.md`

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

### Parameter Resolution Hierarchy

When resolving any configuration value (e.g., sidebar visibility or theme choice), the engine queries in the following strict order:

1. **Page Front-Matter** (highest priority — e.g. `sidebars: left: enable: false`)
2. **Folder Cascaded Parameters** (inherited from nearest parent `_index.md` `cascade:`)
3. **Environment Config** (`config/<env>/hugo.yaml`)
4. **Global Baseline Config** (`hugo.yaml` — lowest priority fallback)

---

## 4. Custom 3-Level Left Sidebar Navigation

The engine supports rich, nested navigation sidebars defined in `data/sidebars/<name>.yaml`.

### Data Schema (`data/sidebars/docs.yaml`)

```yaml
title: "Theme Documentation"
subtitle: "Specifications & Guides"
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
      - title: "Theme Customisation"
        url: "/docs/customisation/"

  # Level 1: Group 2
  - title: "Components & Shortcodes"
    children:
      - title: "75+ Components Studio"
        url: "/docs/carbon-components/"
      - title: "Feature Showcase"
        url: "/docs/feature-showcase/"
      - title: "Production Deployment"
        url: "/docs/cloudflare-deployment/"
```
