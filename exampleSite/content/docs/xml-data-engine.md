---
title: "XML Data Engine & Tabular Explorer"
description: "How to parse, compute, and render structured XML datasets at build-time and interactively with Carbon Design System components."
date: 2026-08-25T12:00:00Z
author: "César Caldeira"
categories: ["Architecture", "Data", "XML"]
tags: ["XML", "DataEngine", "BuildTime", "KPIs", "Carbon v11"]
version: "v11.3.0"
---

The **Carbon Modular Engine** includes native **XML dataset integration**, enabling build-time statistical parsing and high-performance client-side exploration of hierarchical XML data without third-party dependencies.

---

## 1. Declarative XML Table Shortcode

The `{{</* xml-table */>}}` shortcode ingests raw XML files (such as telemetry logs, power grid feeds, institutional registries, or sensor matrices), computes key performance indicators at build time, and renders an accessible Carbon Design System data table:

{{< xml-table src="/data/sample-dataset.xml" title="European Renewable Energy & Carbon Telemetry" pageSize="10" >}}

---

## 2. Key Architecture Features

- **Build-Time Computation:** Pre-computes total records, cumulative capacity, mean output, and generation efficiency at compile time via Hugo's native `transform.Unmarshal` engine, ensuring instant first-contentful-paint (FCP).
- **Client-Side Live Filtering:** Instant live text filtering and column sorting across all numeric and string columns powered by `assets/js/xml-engine.js`.
- **Zero Runtime Dependencies:** Native browser `DOMParser` and DOM manipulation with zero heavy table libraries.
- **Direct Data Download:** Includes one-click direct download of the underlying XML document.
- **Strict Carbon Design Tokens:** Zebra striping, compact row heights, monospace telemetry identifiers, and color-coded status badges.

---

## 3. Shortcode Parameter Reference

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `src` | String | *(Required)* | Static URL path to the `.xml` file (e.g. `/data/telemetry.xml`). |
| `title` | String | `"XML Data Explorer"` | Heading displayed above the dataset. |
| `description` | String | `""` | Optional subtitle or contextual metadata summary. |
| `pageSize` | Number | `10` | Default visible rows per page. |
| `id` | String | Auto-generated | Unique DOM identifier for the table container. |
