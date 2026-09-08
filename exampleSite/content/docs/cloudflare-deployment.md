---
title: "Production Deployment Guide"
description: "Comprehensive blueprint for deploying Hugo-Carbon static sites to Cloudflare Pages, GitHub Pages, and Netlify with automated CI/CD."
date: 2026-08-24T12:00:00Z
author: "Cloud Infrastructure Group"
categories: ["Deployment", "Cloudflare"]
tags: ["Cloudflare", "CI/CD", "Hugo", "Hosting"]
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

This guide provides a comprehensive, production-ready blueprint for deploying websites built on the **Hugo Carbon Theme** to modern static hosting platforms including **Cloudflare Pages**, **GitHub Pages**, and **Netlify** with zero hosting costs and automated Git-based CI/CD pipelines.

```
┌─────────────────────────────────┐
│        Git Push to Main         │
│  (GitHub / GitLab / Bitbucket)  │
└────────────────┬────────────────┘
                 │ Webhook Trigger
                 ▼
┌─────────────────────────────────┐
│     Cloudflare / GitHub CI      │
│  - Hugo Extended v0.149.0       │
│  - SCSS Dart Sass Compilation   │
│  - AES-256-GCM Encryption Tool  │
└────────────────┬────────────────┘
                 │ Deploy Artifact
                 ▼
┌─────────────────────────────────┐
│      Global Anycast Edge        │
│   (Zero-CDN / 100% In-Origin)   │
└─────────────────────────────────┘
```

---

## 1. Cloudflare Pages Deployment (Recommended)

Cloudflare Pages provides global Anycast edge distribution, instant cache purges, unlimited bandwidth, and automatic TLS certificates.

### Step 1: Connect Git Repository
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers & Pages)** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your repository containing the Hugo site.

### Step 2: Configure Build Settings
Fill in the deployment configuration modal:

| Configuration Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Project name** | `my-carbon-site` | Generates `my-carbon-site.pages.dev` |
| **Production branch** | `main` | Production deployment trigger |
| **Framework preset** | `Hugo` | Pre-selects Hugo build environment |
| **Build command** | `hugo --gc --minify` | Runs garbage collection and HTML/CSS minification |
| **Build output directory**| `public` | Default Hugo destination directory |
| **Root directory** | `/` (or `exampleSite` if testing demo) | Repository root where `hugo.yaml` is located |

### Step 3: Set Required Environment Variables
Under **Environment variables (advanced)**, add:

```
HUGO_VERSION = 0.149.0
```

> [!IMPORTANT]
> Cloudflare Pages defaults to an older Hugo runtime if `HUGO_VERSION` is omitted. Setting `0.149.0` guarantees that Dart Sass, Hugo Pipes, and ESBuild features compile without errors.

### Step 4: Add Post-Build Encryption (Optional)
If your site contains encrypted notes using the `password:` front-matter parameter, chain the Python encryption script to your build command:

```bash
hugo --gc --minify && python3 scripts/encrypt.py --dir public
```

### Step 5: Custom Domain & DNS
Once the build completes:
1. Go to **Custom domains** in the Pages project.
2. Click **Set up a custom domain** (e.g. `docs.example.org`).
3. Cloudflare automatically configures the CNAME record and provisions a Cloudflare SSL certificate.

---

## 2. GitHub Pages Deployment via GitHub Actions

To deploy directly to GitHub Pages without third-party services, create a declarative workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Hugo-Carbon to GitHub Pages

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
        run: python3 scripts/verify-dependencies.py

      - name: Build Hugo Site
        run: hugo --gc --minify

      - name: Encrypt Protected Documents (Optional)
        run: python3 scripts/encrypt.py --dir public

      - name: Audit Static Link Integrity
        run: python3 scripts/test_public_html.py --dir public

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

---

## 3. Netlify Deployment

Create a `netlify.toml` in your repository root:

```toml
[build]
  command = "hugo --gc --minify"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.149.0"
  HUGO_ENABLEGITINFO = "true"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

---

## 4. Local Verification Before Deployment

Before pushing changes to production, run the included verification scripts locally:

```bash
# 1. Verify 100% self-hosted fonts, vendor scripts, and licenses
python3 scripts/verify-dependencies.py

# 2. Compile site locally with garbage collection and minification
hugo --gc --minify

# 3. Test static HTML internal links and anchors
python3 scripts/test_public_html.py --dir public
```
