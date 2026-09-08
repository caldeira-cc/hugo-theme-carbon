---
title: "Privacy Policy"
description: "Demonstration privacy policy outlining client-side telemetry handling, local storage tokens, and offline-first zero-tracking principles."
date: 2026-08-24T12:00:00Z
author: "Security Operations"
layout: "single"
aliases:
  - "/privacy/"
cascade:
  params:
    sidebars:
      left:
        enable: false
      right:
        enable: true
---

# Privacy Policy & Data Protection

*Last modified: August 24, 2026*

## 1. Zero External Telemetry Invariant

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. The **Hugo Carbon Theme** operates on an offline-first, local-first architecture where **zero telemetry, analytical tracking, or third-party cookies** are transmitted to external servers.

> [!NOTE]
> All fonts (IBM Plex Sans, IBM Plex Serif, IBM Plex Mono, IBM Plex Math) and client-side dependencies (KaTeX, MapLibre GL, Highlight.js, Mermaid) are 100% self-hosted from the local origin. No requests are dispatched to external content delivery networks.

## 2. Client-Side Local Storage

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur:

- **`carbon-theme`**: Stores the user's active theme selection (`system`, `light`, or `dark`). This token is read synchronously before DOM paint to prevent flash-of-unstyled-content (FOUC).
- **`carbon-cookie-consent`**: Stores granular preferences for functional demonstration modules.

## 3. Web Worker Sandboxing

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Tabular data parsing (W3C CSVW engine) and statistical computations (GNU PSPP engine) execute strictly inside sandboxed in-memory Web Workers on the client machine. No row-level records leave browser memory.

## 4. Contact & Compliance Inquiries

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. For inquiries regarding static site compliance or cryptographic verification, consult the [Theme Documentation](/docs/).
