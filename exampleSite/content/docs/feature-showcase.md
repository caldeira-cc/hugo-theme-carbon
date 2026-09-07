---
title: "Platform Feature Showcase"
description: "Comprehensive interactive demonstration of every IBM Carbon Design System v11 React component, shortcode, data visualization, encryption module, and typographic capability."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Architecture", "Design System"]
tags: ["Carbon v11", "Hugo", "Cloudflare", "WebGPU", "Components"]
version: "v11.2.0"
---

{{< breadcrumb items="Carbon Hub (https://carbon.caldeira.cc/), Documentation (/docs/), Feature Showcase (/docs/feature-showcase/)" >}}

{{< notification kind="success" title="Interactive Showcase Active" subtitle="Experience all 34 IBM Carbon React components, data engines, and Hugo shortcodes directly within this live specimen environment." >}}
{{< /notification >}}

Welcome to the **Hugo-Carbon Feature Showcase**. This master specimen page exercises and exhibits every built-in capability, interactive component, shortcode, and data engine packaged within the Hugo-Carbon architecture.

---

## 1. Cards, Tiles & Digital Business Cards

{{< card title="IBM Carbon Design System Architecture" eyebrow="Component Spec" tag="v11.2" href="https://react.carbondesignsystem.com/" actionText="View Storybook ↗" >}}
Compliant with IBM Carbon v11 16-column grid, token-driven theming, and zero runtime external CDN invariants.
{{< /card >}}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  {{< clickable-tile href="/docs/carbon-components/" title="Clickable Tile Specimen" >}}
Clickable tile with hover elevation and Carbon focus ring.
  {{< /clickable-tile >}}
  
  {{< expandable-tile title="Expandable Tile Specimen" >}}
Above-the-fold summary content visible by default.
<!-- more -->
Below-the-fold expanded details revealed smoothly on chevron click.
  {{< /expandable-tile >}}
</div>

### Digital Business Cards (RFC 6350 vCard Engine)

The `vcard` shortcode presents rich contact information as an IBM Carbon business card with instant **VCF file downloads**, **clipboard copying**, and **offline QR code generation**.

#### Mode A: Parsed from `.vcf` File
{{< vcard file="/data/cesar-caldeira.vcf" >}}{{< /vcard >}}

#### Mode B: Direct Parameters & Dynamic VCF Generation
{{< vcard
    name="Dr. Elena Rostova"
    title="Senior Research Director"
    org="Cognitive Systems & Machine Learning Lab"
    email="elena.rostova@lab.example.org"
    phone="+44 20 7946 0912"
    website="https://carbon.caldeira.cc"
    location="London, United Kingdom"
    badge="Principal Investigator"
    badgeColor="purple"
    linkedin="https://linkedin.com"
    github="https://github.com" >}}
Leading edge computing and private AI systems research with IBM Carbon v11 interface standards.
{{< /vcard >}}

---

## 2. Navigation, Pagination & Breadcrumbs

{{< pagination total="120" page="1" pageSize="10" pageSizes="5,10,25,50" >}}

{{< pagination-nav total="6" current="2" >}}

---

## 3. Interactive Form Controls & Input Studio

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
  <div>
    {{< search placeholder="Search components..." size="md" label="Component Filter" >}}
    {{< select label="Distribution Target" helper="Cloudflare Pages subdomain" options="cesar.caldeira.cc,blog.caldeira.cc,apps.caldeira.cc,carbon.caldeira.cc" >}}
  </div>
  <div>
    {{< slider label="Worker Batch Size" min="10" max="500" value="150" step="10" unit=" ops" >}}
    {{< number-input label="Execution Threads" min="1" max="16" value="4" step="1" helper="Number of Web Workers" >}}
  </div>
  <div>
    {{< date-picker label="Release Date" placeholder="2026-08-29" helper="Standard ISO format" >}}
    {{< time-picker label="UTC Sync Interval" helper="Cron schedule target" >}}
  </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
  <div>
    {{< radio-group legend="Theme Preference" name="theme-selection" helper="Select default colorway" >}}
      {{< radio-button name="theme-selection" value="dark" label="Carbon Dark (Gray 100)" checked="true" >}}
      {{< radio-button name="theme-selection" value="light" label="Carbon Light (White)" >}}
    {{< /radio-group >}}
  </div>
  <div>
    {{< checkbox id="opt-wasm" label="WebAssembly Multithreading" checked="true" helper="Uses client SIMD instructions" >}}
    {{< checkbox id="opt-webgpu" label="WebGPU Neural Acceleration" checked="true" helper="Hardware accelerated matrix operations" >}}
  </div>
  <div>
    {{< file-uploader label="Upload Tabular Dataset" description="Accepts .csv, .json, .xml schemas" buttonLabel="Select file" accept=".csv,.json" >}}
  </div>
</div>

<div style="display: flex; gap: 2rem; align-items: center; margin: 1.5rem 0; flex-wrap: wrap;">
  {{< toggle id="demo-toggle" label="Edge Caching Layer" checked="true" >}}
  {{< content-switcher id="period-switcher" options="Daily,Weekly,Monthly,Quarterly" >}}
  {{< tooltip text="IBM Carbon v11 Definition Tooltip" >}}Hover here for Definition{{< /tooltip >}}
</div>

---

## 4. Shimmer Skeletons & Loading States

{{< skeleton type="heading" width="40%" >}}
{{< skeleton type="text" lines="3" >}}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  {{< skeleton type="card" >}}
  {{< skeleton type="card" >}}
</div>

---

## 5. Modals, Popovers & Status Feedback

<div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; margin: 1.5rem 0;">
  {{< modal id="demo-modal" title="Confirm Compilation" label="Build Engine" primaryButton="Execute" secondaryButton="Dismiss" >}}
Static site generator will compile all 5 target environments into public distribution directories.
  {{< /modal >}}

  {{< popover trigger="Inspect Popover Details" >}}
Flyout popover containing interactive contextual notes and reference definitions.
  {{< /popover >}}

  {{< loading type="inline" status="active" text="Processing background SIMD tasks..." >}}
</div>

{{< toast type="success" title="Local Verification Passed" caption="100% Zero-CDN Compliant" >}}
All 49 IBM Plex and KaTeX font files, scripts, and stylesheets verified locally.
{{< /toast >}}

{{< notification kind="info" title="System Status: Operational" subtitle="The multi-subdomain engine is executing across 5 isolated targets." >}}
{{< /notification >}}

{{< notification kind="warning" title="Subdomain Routing Advisory" subtitle="Cross-subdomain asset fetching requires Access-Control-Allow-Origin on assets.caldeira.cc." >}}
{{< /notification >}}

{{< notification kind="error" title="Data Integrity Notice" subtitle="CSVW metadata files must strictly conform to W3C Tabular Data schemas." >}}
{{< /notification >}}

---

## 6. Disclosure, Tabs & Structured Content

{{< tabs tabs="Overview,Architecture,Security" >}}
  {{< tab-panel >}}
#### IBM Carbon Modular Architecture
Decoupled multi-subdomain architecture built for enterprise performance, zero-CDN compliance, and accessible design.
  {{< /tab-panel >}}
  {{< tab-panel >}}
#### Static Island Hydration
Non-blocking Web Workers execute numerical simulations and vector queries without UI lag.
  {{< /tab-panel >}}
  {{< tab-panel >}}
#### AES-256-GCM Cryptography
Zero plaintext leaks with build-time document encryption and client memory key derivation.
  {{< /tab-panel >}}
{{< /tabs >}}

{{< accordion >}}
  {{< accordion-item title="What is the Zero-CDN invariant?" open="true" >}}
All vendor scripts, styles, typefaces, and icons are committed to source control and distributed from the local static origin.
  {{< /accordion-item >}}
  {{< accordion-item title="How does multi-subdomain deployment work?" >}}
Each subdomain (cesar, blog, apps, carbon, assets) compiles from isolated Hugo environment configs and deploys to Cloudflare Pages.
  {{< /accordion-item >}}
{{< /accordion >}}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
  <div>
    {{< contained-list title="Platform Modules" >}}
      {{< contained-list-item title="CSVW Engine" description="W3C Tabular Data Explorer" href="/data/" >}}
      {{< contained-list-item title="Encrypted Secrets" description="AES-256-GCM Web Crypto" href="/docs/encrypted-secrets-demo/" >}}
      {{< contained-list-item title="GeoJSON Maps" description="Leaflet & Vector Tiles" href="/docs/geojson-maps/" >}}
    {{< /contained-list >}}
  </div>
  <div>
    {{< progress-bar value="85" max="100" label="Component Migration Progress" helper="85% of legacy elements migrated to Carbon React" >}}
    <div style="margin-top: 1.5rem;">
      {{< progress-indicator steps="Define,Develop,Verify,Deploy" current="3" >}}
    </div>
  </div>
</div>

---

## 7. Data Tables & Tabular Exploration

{{< data-table title="Architecture Performance Metrics" description="Benchmark comparison across rendering layers" zebra="true" >}}
| Subdomain / Target | Primary Function | Compiled Pages | Build Time | Status |
|---|---|---|---|---|
| **cesar.caldeira.cc** | Institutional & Career Hub | 38 pages | 255 ms | Operational |
| **blog.caldeira.cc** | Publication & Magazine | 156 pages | 370 ms | Operational |
| **apps.caldeira.cc** | Interactive Web Apps & AI | 105 pages | 306 ms | Operational |
| **carbon.caldeira.cc** | Design System & Docs Hub | 174 pages | 433 ms | Operational |
| **assets.caldeira.cc** | Shared Assets & Cryptography | 423 pages | 780 ms | Operational |
{{< /data-table >}}

---

## 8. On-Device AI Chat Companion

{{< ai-chat title="Carbon Interactive AI Assistant" model="SmolLM2-360M-Instruct" height="420px" >}}

---

## 9. Mathematical Typesetting (IBM Plex Math & KaTeX)

Euler's identity is given by $e^{i\pi} + 1 = 0$, and Einstein's mass-energy equivalence is $E = mc^2$.

$$\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}$$

$$\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}, \quad \nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \frac{\partial \mathbf{E}}{\partial t}$$

---

## 10. Declarative Mermaid Flowcharts

{{< mermaid title="Multi-Subdomain Static Request Routing" id="diagram-arch-routing" >}}
flowchart TD
    Client["Client Web Browser\n(Desktop / Mobile)"] -->|HTTPS / WOFF2| Edge["Cloudflare Anycast Network\n(Edge CDN & DNS)"]
    
    subgraph Subdomains ["Isolated Subdomain Deployments"]
        Edge -->|cesar.caldeira.cc| S1["Hub & Manifest\n(Profile / Career)"]
        Edge -->|blog.caldeira.cc| S2["Publication Node\n(Essays / Insights)"]
        Edge -->|apps.caldeira.cc| S3["Interactive Sandbox\n(Chess / AI / Physics)"]
        Edge -->|carbon.caldeira.cc| S4["Carbon Docs Hub\n(Specs / Engine)"]
    end

    subgraph StaticCDN ["Central Shared Asset Distribution"]
        S1 -.->|Fonts & Icons| Assets["assets.caldeira.cc\n(WOFF2 / JS / SVGs)"]
        S2 -.->|Fonts & Icons| Assets
        S3 -.->|Fonts & Icons| Assets
        S4 -.->|Fonts & Icons| Assets
    end

    classDef primary fill:#262626,stroke:#0f62fe,stroke-width:2px,color:#f4f4f4;
    classDef edgeBkg fill:#1e1e1e,stroke:#393939,stroke-width:1px,color:#c6c6c6;
    classDef cdn fill:#14281f,stroke:#24a148,stroke-width:2px,color:#e8f5ee;
    
    class Client,Edge primary;
    class S1,S2,S3,S4 edgeBkg;
    class Assets cdn;
{{< /mermaid >}}

---

## 11. Interactive Audio Read-Aloud Player

The platform includes a client-side text-to-speech player utilizing the Web Speech API with speed adjustment and voice selection:

{{< read-aloud >}}

---

## 12. Social Media Suite & Interactive Badges

The engine includes responsive vector badges and flexible layouts for all 6 core social networks (Facebook, LinkedIn, Twitter/X, Instagram, Chess.com, Bluesky).

### Full Collection Inline Badges
{{< social-links layout="inline" >}}

### Individual Inline Shortcode Badges
Connect with César Caldeira on {{< social "linkedin" >}}, follow real-time updates on {{< social "bluesky" >}}, analyze chess matches on {{< social "chess" >}}, or view photographs on {{< social "instagram" >}}.

---

## 13. Summary of Specialized Modules

- {{< link href="/data/" icon="launch" >}}W3C CSVW Tabular Data Explorer{{< /link >}}
- {{< link href="/docs/encrypted-secrets-demo/" icon="launch" >}}Client-Side Encrypted Secrets Demo{{< /link >}}
- {{< link href="/docs/geojson-maps/" icon="launch" >}}Geospatial Vector Map Explorer{{< /link >}}
- {{< link href="/docs/dashboard-layout/" icon="launch" >}}Modular Dashboard Engine{{< /link >}}
- {{< link href="/style/" icon="launch" >}}Style Guide Studio{{< /link >}}
