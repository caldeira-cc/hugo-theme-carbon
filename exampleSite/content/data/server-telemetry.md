---
title: "Global Edge Server Telemetry"
description: "Interactive W3C CSVW tabular data table for multi-region server cluster health, memory metrics, and uptime logs."
date: 2026-08-01T11:00:00Z
author: "Site Reliability Engineering"
categories: ["Telemetry", "Data Explorer"]
tags: ["CSVW", "DataTable", "Infrastructure", "Edge"]
status: "Active"
---

This dataset demonstrates the **W3C CSV on the Web (CSVW)** interactive data table component. The component dynamically ingests `/data/server-telemetry.csv` and its accompanying schema definition `/data/server-telemetry.csv-metadata.json`.

{{< callout type="info" title="Interactive Capabilities" >}}
Try clicking on any column header (e.g. <strong>Uptime (Days)</strong> or <strong>CPU Load</strong>) to toggle ascending and descending sort, or type in the search bar to filter nodes instantly.
{{< /callout >}}

{{< csvw-table csv="/data/server-telemetry.csv" metadata="/data/server-telemetry.csv-metadata.json" title="Global Edge Cluster Telemetry" description="Live health and performance data for edge compute nodes" />}}

## Metadata Schema Specification

The schema is defined following the [W3C CSVW Metadata Vocabulary](https://www.w3.org/TR/tabular-metadata/):

{{< code-file src="/data/server-telemetry.csv-metadata.json" title="server-telemetry.csv-metadata.json" lang="json" height="340px" />}}
