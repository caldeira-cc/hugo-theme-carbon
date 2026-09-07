---
title: "Data Analytics & GNU PSPP Statistical Suite"
description: "High-performance client-side data analytics platform, build-time static KPI engine, W3C CSVW table explorer, GNU PSPP Variable View, and full-width GeoJSON maps."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Data", "Analytics", "PSPP"]
tags: ["CSVW", "Web Workers", "PSPP", "Dashboards", "GeoJSON"]
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
    mainBar:
      enable: false
---

The **Hugo-Carbon Data Analytics Suite** integrates **W3C CSVW static tabular exploration**, **instant build-time KPI metrics**, and the **GNU PSPP Statistical Studio** into a high-performance, client-side operational environment.

> [!NOTE]
> **Static Architecture & Instant Build-Time KPIs**: All KPI aggregates are calculated directly during Hugo site compilation, rendering exact values into static HTML with zero browser latency. All analytics, metrics, charts, and maps operate on **static, versioned dataset files** (`.csv`, `.csv-metadata.json`, `.geojson`). Source datasets can be downloaded directly from the toolbar links.

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

## 1. YAML-Driven Analytics Suite (Static Infrastructure & GeoJSON Distribution)

Below is an interactive suite configured via YAML instructions. It automatically resolves the W3C CSVW schema metadata, computes KPI metrics at build time, renders a **full-width interactive map**, and generates **Totals ($\Sigma$)** and **Averages ($\mu$)** in the table footer:

{{< analytics-suite >}}
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
    label: "Total Fleet Uptime"
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
  description: "Static tabular dataset synchronized with GNU PSPP statistical engine."
  variables: ["server_id", "cluster_name", "region", "cpu_utilization", "memory_usage", "uptime_days", "status"]
  summaryRow: "both"
  pageSize: 6
{{< /analytics-suite >}}

---

## 2. Behavioral Research Demographics & GNU PSPP Variable View

This variation exhibits a static psychological research dataset with **Variable View** metadata (*Scale*, *Nominal*, *Ordinal* measures), **Descriptives**, and the **GNU PSPP Command Syntax Reference**:

{{< analytics-suite >}}
title: "Cognitive Performance & Research Demographics"
description: "Multivariate psychological trial dataset with 16 cases and 8 variables."
csv: "/data/research-demographics.csv"

kpis:
  - variable: "cognitive_score"
    calculation: "mean"
    label: "Mean Cognitive Score"
    accent: "blue"
  - variable: "reaction_time_ms"
    calculation: "mean"
    label: "Avg Reaction Time"
    suffix: " ms"
    accent: "teal"
  - variable: "stress_index"
    calculation: "mean"
    label: "Mean Stress Index"
    suffix: " / 10"
    accent: "warning"
  - variable: "participant_id"
    calculation: "count"
    label: "Trial Cohort Size"
    suffix: " Participants"
    accent: "purple"

table:
  enable: true
  title: "Trial Participant Dataset"
  description: "Cross-sectional cohort records with PSPP Variable View."
  variables: ["participant_id", "age", "gender", "education_level", "cognitive_score", "reaction_time_ms", "stress_index", "treatment_group"]
  summaryRow: "averages"
  pageSize: 8
{{< /analytics-suite >}}

---

## 3. GNU PSPP Command Syntax Generation & Batch Execution

The platform supports and generates standard GNU PSPP command syntax (`.sps`):

```spss
* GNU PSPP Command Syntax for Static Research Demographics Dataset.
DATA LIST FREE / participant_id age gender education_level cognitive_score reaction_time_ms stress_index treatment_group.
BEGIN DATA.
P-101 24 Female Master 88.5 312 4.2 Experimental
P-102 29 Male Bachelor 76.0 345 6.8 Control
P-103 35 Female PhD 94.2 289 3.1 Experimental
END DATA.

* Run descriptive statistics with standard error and quartiles.
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

* Run bivariate Pearson correlation matrix.
CORRELATIONS
  /VARIABLES=age WITH cognitive_score reaction_time_ms stress_index.
```
