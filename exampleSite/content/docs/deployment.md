---
title: "Deployment & Hosting Guide"
description: "Step-by-step instructions for deploying sites built on the Hugo Carbon theme to Cloudflare Pages, GitHub Pages, Netlify, and custom static hosts."
categories: ["Deployment", "Hosting"]
tags: ["Cloudflare", "GitHub Actions", "Netlify", "Hugo", "Hosting"]
aliases:
  - "/docs/cloudflare-deployment/"
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

The **Hugo Carbon Theme** is engineered as a zero-CDN, fully self-hosted static site architecture. Because every asset—including IBM Plex fonts, KaTeX math typesetting, MapLibre GL, and Web Workers—is compiled into standard HTML, CSS, and vanilla JavaScript at build time, the resulting output directory (`public/`) can be hosted on any static hosting provider or content delivery network without requiring runtime servers or database infrastructure.

This guide details recommended deployment procedures for the most popular static hosting platforms.

---

## 1. Cloudflare Pages (Recommended)

Cloudflare Pages provides global Anycast distribution, automated preview builds on pull requests, and instant cache invalidation with zero configuration.

### Deployment Steps

1. **Push your site to Git**: Ensure your Hugo project is hosted on GitHub, GitLab, or Bitbucket.
2. **Create a Cloudflare Pages Project**:
   - In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
   - Select your repository and click **Begin setup**.
3. **Configure Build Settings**:

| Setting | Recommended Value | Description |
| :--- | :--- | :--- |
| **Framework preset** | `Hugo` | Pre-selects Hugo build environment |
| **Build command** | `hugo --gc --minify` | Runs garbage collection and asset minification |
| **Build output directory** | `public` | Default Hugo destination directory |
| **Root directory** | `/` (or path to your site directory) | Working directory for the Hugo build |

4. **Set Environment Variables**:
   Under **Environment variables**, set:
   - `HUGO_VERSION`: `0.149.0` (or your current Hugo Extended version).

> [!IMPORTANT]
> The Hugo Carbon theme uses Dart Sass and ESBuild via Hugo Pipes. Ensure `HUGO_VERSION` is set to `0.149.0` or higher to guarantee that extended compilation features succeed.

5. **Deploy**: Click **Save and Deploy**. Your site will compile and be live at your `*.pages.dev` subdomain in seconds.

---

## 2. GitHub Pages with GitHub Actions

If you prefer hosting directly on GitHub, use GitHub Actions to compile and deploy automatically on every push to your default branch.

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy Hugo Carbon to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Hugo Extended
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.149.0'
          extended: true

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Verify Zero-CDN Dependencies
        run: python3 hugo-theme-carbon/scripts/verify-dependencies.py

      - name: Build Hugo Site
        run: hugo --gc --minify

      - name: Audit Link Integrity
        run: python3 hugo-theme-carbon/scripts/test_public_html.py --dir public

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

In your repository settings, navigate to **Settings** &rarr; **Pages** and set **Source** to **GitHub Actions**.

---

## 3. Netlify Deployment

To deploy to Netlify, add a `netlify.toml` file to your site root:

```toml
[build]
  command = "hugo --gc --minify"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.149.0"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

Connect your Git repository in Netlify and it will automatically detect the configuration and build your site.

---

## 4. Local Build & Testing Commands

You can build and test the site locally using the Hugo CLI before pushing changes:

```bash
# 1. Start local development server with live reload
hugo server -D

# 2. Build for production (minified, with asset finger-printing)
hugo --gc --minify

# 3. Verify that 100% of dependencies, fonts, and assets are local
python3 hugo-theme-carbon/scripts/verify-dependencies.py

# 4. Audit static link integrity across all generated HTML files
python3 hugo-theme-carbon/scripts/test_public_html.py --dir public
```
