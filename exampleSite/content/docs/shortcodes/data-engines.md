---
title: "Data Engines & Maps Shortcodes"
description: "High-performance data visualisations including W3C CSVW tables, static DataTables, XML data grids, and MapLibre GL GeoJSON maps."
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

The Hugo Carbon theme features zero-dependency, client-side data engines designed to parse and visualize large tabular and geospatial datasets locally without server-side APIs or external cloud services.

---

## 1. W3C CSVW Interactive Table (`csvw-table`)

The `csvw-table` shortcode loads standard CSV datasets paired with declarative W3C CSV on the Web companion metadata (`.csv-metadata.json`).

### Key Capabilities
- **Background Web Worker**: Multi-threaded parsing off the main UI thread with automatic synchronous fallback.
- **Declarative Status Tags**: Custom cell badge styling defined directly in schema metadata via `cds-variable-style`.
- **Instant Search & Sort**: Real-time filtering and column sorting across tens of thousands of rows.
- **Client-Side Export**: One-click export to CSV, JSON, and printable formats.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `src` | String | Required | Path to the `.csv` file in `static/` |
| `metadata` | String | *Optional* | Path to companion `.csv-metadata.json` schema |
| `title` | String | *Optional* | Table header title |
| `description` | String | *Optional* | Descriptive caption |
| `pageSize` | Number | `10` | Default rows per page |
| `searchable` | Boolean | `true` | Show search bar |
| `sortable` | Boolean | `true` | Enable column header sorting |

### Example

{{< csvw-table src="/data/financial-benchmarks.csv" metadata="/data/financial-benchmarks.csv-metadata.json" title="System Performance Benchmarks" description="Live Web Worker CSVW table specimen with declarative status tag formatting." pageSize="5" />}}

```markdown
{{</* csvw-table src="/data/financial-benchmarks.csv" metadata="/data/financial-benchmarks.csv-metadata.json" title="System Performance Benchmarks" description="Live Web Worker CSVW table specimen with declarative status tag formatting." pageSize="5" /*/>}}
```

---

## 2. Static Carbon Data Table (`data-table`)

For smaller tables where full worker pagination is unnecessary, the `data-table` shortcode renders lightweight Carbon tables directly from Markdown or tabular JSON.

### Example

{{< data-table title="Build Pipeline Benchmarks" description="Static execution statistics" zebra="true" >}}
| Pipeline Stage | Toolchain | Runtime (ms) | Status |
| :--- | :--- | :--- | :--- |
| SCSS Dart Sass | Hugo Pipes | 142ms | Active |
| ESBuild Modules | Hugo Pipes | 88ms | Active |
| Dependency Audit | Python 3 | 45ms | Verified |
| Link Integrity | Python 3 | 190ms | Verified |
{{< /data-table >}}

```markdown
{{</* data-table title="Build Pipeline Benchmarks" description="Static execution statistics" zebra="true" */>}}
| Pipeline Stage | Toolchain | Runtime (ms) | Status |
| :--- | :--- | :--- | :--- |
| SCSS Dart Sass | Hugo Pipes | 142ms | Active |
| ESBuild Modules | Hugo Pipes | 88ms | Active |
| Dependency Audit | Python 3 | 45ms | Verified |
| Link Integrity | Python 3 | 190ms | Verified |
{{</* /data-table */>}}
```

---

## 3. MapLibre GL Vector Map (`geojson-map`)

The `geojson-map` shortcode embeds GPU-accelerated vector cartography rendering standard RFC 7946 GeoJSON layers with Carbon design tokens.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `src` | String | Required | Path to GeoJSON file in `static/` |
| `projection` | String | `"mercator"` | Map projection (`mercator`, `globe`) |
| `title` | String | *Optional* | Map figure title |
| `height` | String | `"440px"` | Map container height |

### Example

{{< geojson-map src="/data/sample-infrastructure.geojson" projection="mercator" height="360px" title="Global Infrastructure Distribution" >}}

```markdown
{{</* geojson-map src="/data/sample-infrastructure.geojson" projection="mercator" height="360px" title="Global Infrastructure Distribution" */>}}
```
