---
title: "Multi-Subdomain Cloudflare Deployment Guide"
description: "Step-by-step production blueprint for deploying Hugo-Carbon with multiple subdomains on Cloudflare Pages and DNS completely for free."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Deployment", "Cloudflare"]
tags: ["Cloudflare", "CI/CD", "Hugo"]
version: "v11.2.0"
---

This guide provides a comprehensive, production-ready blueprint for deploying the **Hugo-Carbon Modular Engine** across multiple isolated subdomains using **Cloudflare Pages** and **Cloudflare DNS** at **zero monthly hosting cost ($0/mo)**.

```
                    ┌────────────────────────┐
                    │  Cloudflare Anycast    │
                    │      Edge Network      │
                    └───────────┬────────────┘
                                │
        ┌───────────────┬───────┴───────┬───────────────┐
        ▼               ▼               ▼               ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│    cesar     ││     blog     ││     apps     ││    carbon    │
│  .caldeira.cc││  .caldeira.cc││  .caldeira.cc││  .caldeira.cc│
│ (Personal)   ││ (Publication)││ (Interactive)││ (Engine/Docs)│
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
        │               │               │               │
        └───────────────┴───────┬───────┴───────────────┘
                                ▼
                    ┌────────────────────────┐
                    │   assets.caldeira.cc   │
                    │   (Shared Static CDN)  │
                    └────────────────────────┘
```

---

## 1. Multi-Target Build Strategy

The Hugo-Carbon project compiles into 5 discrete public directories:

```bash
# Compile each environment into its respective target directory
hugo --environment cesar  -d public/cesar  --cleanDestinationDir
hugo --environment blog   -d public/blog   --cleanDestinationDir
hugo --environment apps   -d public/apps   --cleanDestinationDir
hugo --environment carbon -d public/carbon --cleanDestinationDir
hugo --environment assets -d public/assets --cleanDestinationDir
```

### Automation Shell Script (`scripts/build-all.sh`)

Create an executable build script in your repository root:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "Compiling all Hugo-Carbon Subdomains..."
echo "=================================================="

export HUGO_ENV="production"

for env in cesar blog apps carbon assets; do
  echo "--> Building target: ${env}..."
  hugo --environment "${env}" -d "public/${env}" --cleanDestinationDir --minify
done

echo "--> Running dependency and license audit..."
python3 scripts/verify-dependencies.py

echo "--> Auditing internal link integrity..."
python3 scripts/test_public_html.py

echo "🎉 ALL SUBDOMAINS COMPILED AND VERIFIED SUCCESSFULLY!"
```

Make it executable:
```bash
chmod +x scripts/build-all.sh
```

---

## 2. Cloudflare Pages Project Configuration

Cloudflare Pages provides unlimited bandwidth, global SSD edge CDN, automatic SSL certificates, and 500 build operations per month on the Free tier.

### Method A: Individual Cloudflare Pages Projects (Recommended)

Create 5 distinct Pages projects linked to the same GitHub repository:

| Pages Project Name | Custom Subdomain | Build Command | Output Directory |
| :--- | :--- | :--- | :--- |
| `caldeira-cesar` | `cesar.caldeira.cc` | `hugo --environment cesar -d public/cesar` | `public/cesar` |
| `caldeira-blog` | `blog.caldeira.cc` | `hugo --environment blog -d public/blog` | `public/blog` |
| `caldeira-apps` | `apps.caldeira.cc` | `hugo --environment apps -d public/apps` | `public/apps` |
| `caldeira-carbon` | `carbon.caldeira.cc` | `hugo --environment carbon -d public/carbon` | `public/carbon` |
| `caldeira-assets` | `assets.caldeira.cc` | `hugo --environment assets -d public/assets` | `public/assets` |

#### Environment Variables in Cloudflare Pages Dashboard
For each project, navigate to **Settings > Environment Variables** and add:
- `HUGO_VERSION`: `0.149.0` (or `latest extended`)
- `NODE_VERSION`: `20.x`

---

## 3. GitHub Actions Automated Deployment Workflow

Instead of relying on Cloudflare's native build limits, you can use **GitHub Actions** to build all 5 subdomains in parallel and deploy them directly using Wrangler.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Multi-Subdomain Hugo-Carbon to Cloudflare Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - env: "cesar"
            project: "caldeira-cesar"
          - env: "blog"
            project: "caldeira-blog"
          - env: "apps"
            project: "caldeira-apps"
          - env: "carbon"
            project: "caldeira-carbon"
          - env: "assets"
            project: "caldeira-assets"

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Hugo Extended
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "0.149.0"
          extended: true

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Build Hugo Target
        run: |
          hugo --environment ${{ matrix.env }} -d public/${{ matrix.env }} --minify --cleanDestinationDir

      - name: Verify Link Integrity & Dependencies
        run: |
          python3 scripts/verify-dependencies.py

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy public/${{ matrix.env }} --project-name=${{ matrix.project }} --commit-dirty=true
```

---

## 4. Cloudflare DNS & Custom Domains

In your Cloudflare Dashboard for your domain (`caldeira.cc`):

### 1. DNS Records Setup
Add `CNAME` records with the **Proxy status: Proxied (Orange Cloud)**:

| Type | Name | Target | Proxy Status |
| :--- | :--- | :--- | :--- |
| `CNAME` | `cesar` | `caldeira-cesar.pages.dev` | 🟠 Proxied |
| `CNAME` | `blog` | `caldeira-blog.pages.dev` | 🟠 Proxied |
| `CNAME` | `apps` | `caldeira-apps.pages.dev` | 🟠 Proxied |
| `CNAME` | `carbon` | `caldeira-carbon.pages.dev` | 🟠 Proxied |
| `CNAME` | `assets` | `caldeira-assets.pages.dev` | 🟠 Proxied |
| `CNAME` | `@` (apex) | `caldeira-cesar.pages.dev` | 🟠 Proxied |

### 2. Apex Domain Redirection (Page Rules)
To redirect `caldeira.cc` to `https://cesar.caldeira.cc/`:
- **Rule URL**: `caldeira.cc/*`
- **Setting**: *Forwarding URL* (301 Permanent Redirect)
- **Destination**: `https://cesar.caldeira.cc/$1`

---

## 5. Security Headers, CORS & Performance Optimization

### 1. CORS Headers for `assets.caldeira.cc`
Because fonts (IBM Plex WOFF2) and scripts are shared from `assets.caldeira.cc`, Cloudflare must serve appropriate CORS headers.

In the Cloudflare Dashboard, go to **Rules > Transform Rules > Modify Response Header**:
- **Rule Name**: `Allow Cross-Origin Asset CDN`
- **If Incoming Request**: `Hostname eq "assets.caldeira.cc"`
- **Response Headers**:
  - `Access-Control-Allow-Origin`: `*`
  - `Access-Control-Allow-Methods`: `GET, HEAD, OPTIONS`
  - `Timing-Allow-Origin`: `*`

### 2. Security Headers (Transform Rules)
Add a Response Header rule applied across all subdomains:
- `X-Frame-Options`: `SAMEORIGIN`
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`

### 3. SSL/TLS and Edge Optimization
In the Cloudflare Dashboard:
1. **SSL/TLS**: Set encryption mode to **Full (Strict)**.
2. **Speed > Optimization**:
   - Enable **Brotli** compression.
   - Enable **Early Hints** (103 Early Hints).
   - Enable **HTTP/3 (with QUIC)** and **0-RTT Connection Resumption**.
3. **Caching > Cache Rules**:
   - Add a rule for `*.woff2`, `*.css`, and `*.js`: Edge TTL **1 Month**, Browser TTL **1 Year**.
