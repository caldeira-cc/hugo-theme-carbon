---
title: "Data Analytics, CSVW Web Worker & PSPP Statistical Suite"
description: "Comprehensive guide to the multithreaded CSVW static data engine, build-time KPI calculations, GNU PSPP statistical analysis suite, full-width responsive maps, and IBM-styled cartography."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Data", "Architecture", "Analytics"]
tags: ["CSVW", "Web Workers", "PSPP", "Dashboards", "GeoJSON"]
version: "v11.2.0"
---

The **Hugo-Carbon Data & Analytics Suite** provides an enterprise-grade, client-side data exploration, statistical analysis, and operational dashboard environment. It computes initial KPI aggregates at **build time** for zero layout shift and instantaneous load times, while utilizing a **background Web Worker** for interactive filtering, sorting, and GNU PSPP statistics.

> [!NOTE]
> **Static Architecture Notice**: All analytics, metrics, charts, and maps operate on **static, versioned dataset files** (`.csv`, `.csv-metadata.json`, `.geojson`). Computations occur purely at build time and within client-side Web Workers without backend servers or live streaming endpoints. Source datasets can be downloaded directly from the toolbar links.

```
┌────────────────────────────────────────────────────────────────────────┐
│             Hugo-Carbon Client-Side Static Data Architecture           │
├────────────────────────────┬───────────────────────────────────────────┤
│ Build Time (Hugo Compiler) │ Background Web Worker (csvw-worker.js)    │
├────────────────────────────┼───────────────────────────────────────────┤
│ • Exact Precomputed KPIs   │ • Asynchronous CSV text tokenizer         │
│ • Static HTML Rendering    │ • Full-text search & column filter engine │
│ • Full-Width Responsive Map│ • Descriptives (Mean, StdDev, Skew, Kurt) │
│ • PSPP Variable View Grid  │ • Contingency Crosstabs & Chi-Square      │
│ • Direct Source Downloads  │ • Pearson / Spearman Correlation Matrices │
└────────────────────────────┴───────────────────────────────────────────┘
```

---

## 1. The CSVW Data Engine & Web Worker Pipeline

The data engine conforms to the **W3C CSV on the Web (CSVW)** recommendation. Tabular datasets (`.csv`) are coupled with JSON-LD schema metadata files (`.csv-metadata.json`) defining column types, titles, units, and constraints.

### Automatic Metadata Resolution
When providing `csv: "/data/server-telemetry.csv"`, the engine automatically discovers and binds `/data/server-telemetry.csv-metadata.json` without requiring duplicate parameter configuration.

### Direct Source Dataset Downloads
Rather than generating synthetic client-side exports, the table toolbar provides direct download links for:
- **Download CSV**: Direct link to the source `.csv` file.
- **CSVW Meta**: Direct link to the W3C CSVW `.csv-metadata.json` JSON-LD schema.
- **GeoJSON**: Direct link to the source `.geojson` vector file on maps and modal viewers.

---

## 2. YAML-Driven Analytics Suite Shortcode

The `analytics-suite` shortcode calculates KPI aggregates at compile time and renders full-width maps and tables with clean YAML instructions:

```yaml
{{</* analytics-suite */>}}
title: "Global Node Infrastructure & Performance Dataset"
description: "Static cluster fleet matrix with GNU PSPP statistical engine and geospatial coordination."
csv: "/data/server-telemetry.csv"

kpis:
  - variable: "cpu_utilization"
    calculation: "mean"
    label: "Mean CPU Load"
    suffix: "%"
    accent: "blue"
  - variable: "memory_usage"
    calculation: "mean"
    label: "Mean Memory Usage"
    suffix: "%"
    accent: "purple"
  - variable: "uptime_days"
    calculation: "sum"
    label: "Total Cumulative Uptime"
    suffix: " Days"
    accent: "green"
  - variable: "server_id"
    calculation: "count"
    label: "Monitored Edge Nodes"
    suffix: " Nodes"
    accent: "magenta"

map:
  enable: true
  source: "/data/sample-infrastructure.geojson"
  lat: 38.0
  lng: 15.0
  zoom: 2
  height: "440px"
  title: "Global Node Geospatial Distribution"

table:
  enable: true
  title: "Edge Server Fleet Matrix"
  variables: ["server_id", "cluster_name", "region", "cpu_utilization", "memory_usage", "uptime_days", "status"]
  summaryRow: "both" # "totals" | "averages" | "both" | "none"
  pageSize: 6
{{</* /analytics-suite */>}}
```

---

## 3. Application Variant 1: Research Demographics & GNU PSPP Statistical Suite

This showcase demonstrates a behavioral research dataset with active **Variable View**, **Descriptives**, and the **GNU PSPP Analytics Studio**:

{{< csvw-table 
    csv="/data/research-demographics.csv" 
    title="Cognitive Performance & Research Demographics"
    description="Multivariate psychological dataset with 16 cases and 8 variables."
    features="stats,variableView,pspp,search,filter,pagination"
    pageSize="8"
/>}}

---

## 4. Application Variant 2: Environmental Climate Network (GeoJSON + CSVW Table)

This variation links spatial coordinates in Lisbon, Madrid, Paris, London, and Tokyo with an air quality sensor table. Clicking a map marker filters the data table, and clicking a row pans the map:

{{< dashboard title="Global Air Quality & Climate Sensor Network" layout="grid" features="stats,geo,map,kpi" id="dash-climate" >}}

<div class="cds--row" style="margin: 0 -0.5rem 1.5rem; row-gap: 1rem;">
  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #24a148;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">SENSORS ONLINE</div>
      <div class="cds--type-display-01" style="font-size: 2rem; font-weight: 300; margin: 0.25rem 0;">10 / 10</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">Complete Dataset</div>
    </div>
  </div>

  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #0f62fe;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">MEAN PM2.5</div>
      <div class="cds--type-display-01" style="font-size: 2rem; font-weight: 300; margin: 0.25rem 0;">26.9 µg/m³</div>
      <div style="font-size: 0.75rem; color: var(--cds-text-secondary);">Moderate Range</div>
    </div>
  </div>

  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #8a3ffc;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">AVG TEMP</div>
      <div class="cds--type-display-01" style="font-size: 2rem; font-weight: 300; margin: 0.25rem 0;">22.6 °C</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">Optimal Band</div>
    </div>
  </div>

  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); height: 100%; padding: 1.25rem; border-top: 3px solid #f1c21b;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary); text-transform: uppercase; font-family: var(--cds-font-mono, monospace);">AVG HUMIDITY</div>
      <div class="cds--type-display-01" style="font-size: 2rem; font-weight: 300; margin: 0.25rem 0;">65.4%</div>
      <div style="font-size: 0.75rem; color: var(--cds-text-secondary);">Standard Range</div>
    </div>
  </div>
</div>

<div style="width: 100%; margin-bottom: 1.5rem;">
  {{< geojson-map 
      lat="45.0" 
      lng="10.0" 
      zoom="3" 
      src="/data/sample-infrastructure.geojson"
      title="Global Environmental Sensor Deployment"
      height="360px"
  >}}
</div>

<div style="width: 100%;">
  {{< csvw-table 
      csv="/data/environmental-sensors.csv" 
      title="Environmental Sensor Dataset & Regional Air Quality"
      features="stats,variableView,pspp,search,filter,pagination"
      pageSize="5"
  />}}
</div>

{{< /dashboard >}}

---

## 5. Application Variant 3: Modal-Triggered Analytics Dashboard

The suite allows any dashboard to be launched as an elevated, distraction-free modal dialog using the `dashboard-modal` shortcode:

{{< dashboard-modal 
    title="Edge Infrastructure & Node Cluster Analytics"
    subtitle="Interactive static dataset view with health matrices and server loads."
    buttonText="Open Infrastructure Dashboard Modal"
    badge="MODAL DASHBOARD"
>}}

<div class="cds--row" style="margin: 0 -0.5rem 1.5rem; row-gap: 1rem;">
  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); padding: 1.25rem; border-top: 3px solid #0f62fe;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary);">CLUSTER NODES</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0;">10 Nodes</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">Static Records</div>
    </div>
  </div>
  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); padding: 1.25rem; border-top: 3px solid #24a148;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary);">MEAN CPU LOAD</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0;">53.6%</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">Within Expected Margin</div>
    </div>
  </div>
  <div class="cds--col-sm-4 cds--col-md-2 cds--col-lg-4" style="padding: 0 0.5rem;">
    <div class="cds--tile" style="background-color: var(--cds-layer-01); padding: 1.25rem; border-top: 3px solid #8a3ffc;">
      <div class="cds--type-caption" style="color: var(--cds-text-secondary);">MEAN UPTIME</div>
      <div class="cds--type-display-01" style="font-size: 2.25rem; font-weight: 300; margin: 0.25rem 0;">237 Days</div>
      <div style="font-size: 0.75rem; color: #24a148; font-weight: 600;">High Fleet Stability</div>
    </div>
  </div>
</div>

{{< csvw-table 
    csv="/data/server-telemetry.csv" 
    title="Cluster Node Server Telemetry Dataset"
    features="stats,variableView,pspp,search,filter"
    pageSize="5"
/>}}

{{< /dashboard-modal >}}

---

## 6. GNU PSPP Command Syntax Reference

When clicking **PSPP Studio**, the engine generates standard GNU PSPP command syntax:

```spss
* GNU PSPP Command Syntax for Static Research Demographics Dataset.
DATA LIST FREE / participant_id age gender education_level cognitive_score reaction_time_ms stress_index treatment_group.
BEGIN DATA.
P-101 24 Female Master 88.5 312 4.2 Experimental
P-102 29 Male Bachelor 76.0 345 6.8 Control
P-103 35 Female PhD 94.2 289 3.1 Experimental
END DATA.

* Run descriptive statistics with standard error.
DESCRIPTIVES VARIABLES=age cognitive_score reaction_time_ms stress_index
  /STATISTICS=MEAN STDDEV MIN MAX SEMEAN VARIANCE SKEWNESS KURTOSIS.

* Run frequency distributions and bar charts.
FREQUENCIES VARIABLES=gender education_level treatment_group
  /BARCHART FREQ.

* Run crosstabulation with Pearson Chi-Square test of independence.
CROSSTABS
  /TABLES=treatment_group BY education_level
  /STATISTICS=CHISQ
  /CELLS=COUNT ROW COLUMN TOTAL.
```

---

## 7. MapLibre GL Vector Tile Architecture & Carbon Styling

The platform employs **MapLibre GL JS** to render GPU-accelerated vector tiles with custom **Carbon Design System v11 Dark & Light color schemes**:

### Vector Tile Layer Specifications
- **Base Background**: `#161616` (`--cds-background` dark) / `#f4f4f4` (light)
- **Water Bodies & Rivers**: `#0d2137` / `#d6e8f2` (soft marine and jeans blue)
- **Buildings & Footprints**: `#262626` (`--cds-layer-01` dark) / `#ffffff` (light)
- **Motorways / Expressways**: `#0f62fe` (Interactive Blue 60 accent)
- **Primary & Secondary Roads**: `#525252` / `#a8a8a8`
- **Minor & Residential Roads**: `#262626` / `#e0e0e0`
- **Administrative Boundaries**: `#69a280` / `#8d8d8d` (sage green accent)
- **Typography & Place Labels**: Configured with **Plex Sans** glyphs

### User-Configurable Default Layers & Toggles
In shortcodes and YAML configurations, authors can specify default layer states:

```yaml
map:
  enable: true
  source: "/data/sample-infrastructure.geojson"
  roads: true
  buildings: true
  labels: true
  boundaries: true
  theme: "auto" # "auto" | "dark" | "light"
  height: "440px"
```

Interactive switches in the map toolbar allow users to dynamically toggle **Roads**, **Buildings**, and **Labels** with instantaneous WebGL layer updates, as well as switch between **Auto**, **Dark Vector**, and **Light Vector** styles.
