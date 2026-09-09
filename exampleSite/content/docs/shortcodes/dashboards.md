---
title: "Dashboards & KPIs Shortcodes"
description: "Telemetry and executive analytics components including KPI metric cards, metric progress bars, status item matrices, and responsive dashboard grids."
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

The Hugo Carbon dashboard suite enables authors to construct responsive operational monitoring consoles, performance telemetry views, and status overview portals directly in Markdown.

---

## 1. KPI Metric Cards (`dashboard-kpi`)

The `dashboard-kpi` shortcode presents individual indicators with large numeric figures, trend indicators, delta percentages, and contextual badges.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required | Metric label |
| `value` | String | Required | Primary numerical figure |
| `unit` | String | *Optional* | Unit suffix (e.g. `ms`, `%`, `MB`) |
| `delta` | String | *Optional* | Change magnitude (e.g. `+14.2%`) |
| `trend` | String | `"neutral"` | Trend direction (`up`, `down`, `neutral`) |
| `status` | String | *Optional* | Status badge label |
| `statusColor` | String | `"blue"` | Tag colorway |

### Example

<div class="cds--row" style="margin: 0 -0.5rem 1.5rem;">
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="padding: 0.5rem;">
    {{< dashboard-kpi title="Origin Response Time" value="48" unit="ms" delta="-12%" trend="down" status="Optimal" statusColor="green" >}}
  </div>
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="padding: 0.5rem;">
    {{< dashboard-kpi title="Cache Hit Ratio" value="99.4" unit="%" delta="+0.8%" trend="up" status="Healthy" statusColor="green" >}}
  </div>
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4" style="padding: 0.5rem;">
    {{< dashboard-kpi title="Bandwidth Reduction" value="3.2" unit="TB" delta="+24%" trend="up" status="Active" statusColor="blue" >}}
  </div>
</div>

```markdown
<div class="cds--row">
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4">
    {{</* dashboard-kpi title="Origin Response Time" value="48" unit="ms" delta="-12%" trend="down" status="Optimal" statusColor="green" */>}}
  </div>
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4">
    {{</* dashboard-kpi title="Cache Hit Ratio" value="99.4" unit="%" delta="+0.8%" trend="up" status="Healthy" statusColor="green" */>}}
  </div>
  <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-4">
    {{</* dashboard-kpi title="Bandwidth Reduction" value="3.2" unit="TB" delta="+24%" trend="up" status="Active" statusColor="blue" */>}}
  </div>
</div>
```

---

## 2. Metric Progress Bars (`dashboard-metric-bar`)

The `dashboard-metric-bar` displays capacity, completion, or resource consumption against target limits.

### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | String | Required | Metric title |
| `value` | Number | Required | Current metric value |
| `max` | Number | `100` | Maximum possible value |
| `unit` | String | `"%"` | Unit label |
| `status` | String | `"active"` | Visual status state (`active`, `finished`, `error`) |

### Example

{{< dashboard-metric-bar label="Static Storage Quota" value="34" max="100" unit="%" status="active" >}}
{{< dashboard-metric-bar label="Memory Consumption" value="78" max="100" unit="%" status="active" >}}
{{< dashboard-metric-bar label="CDN Edge Cache Fill" value="96" max="100" unit="%" status="finished" >}}

```markdown
{{</* dashboard-metric-bar label="Static Storage Quota" value="34" max="100" unit="%" status="active" */>}}
{{</* dashboard-metric-bar label="Memory Consumption" value="78" max="100" unit="%" status="active" */>}}
{{</* dashboard-metric-bar label="CDN Edge Cache Fill" value="96" max="100" unit="%" status="finished" */>}}
```

---

## 3. Status Matrix (`dashboard-status-matrix`)

The `dashboard-status-matrix` presents operational health across distributed subsystems or service clusters.

### Example

{{< dashboard-status-matrix title="Edge Service Availability Matrix" >}}
  {{< dashboard-status-item name="DNS Resolution (Anycast)" status="Operational" statusColor="green" metric="100% SLA" >}}
  {{< dashboard-status-item name="Hugo Pipes Asset Engine" status="Operational" statusColor="green" metric="Zero Failures" >}}
  {{< dashboard-status-item name="Web Worker CSV Pipeline" status="Operational" statusColor="green" metric="18ms latency" >}}
  {{< dashboard-status-item name="MapLibre GL Vector Engine" status="Operational" statusColor="green" metric="60 FPS" >}}
{{< /dashboard-status-matrix >}}

```markdown
{{</* dashboard-status-matrix title="Edge Service Availability Matrix" */>}}
  {{</* dashboard-status-item name="DNS Resolution (Anycast)" status="Operational" statusColor="green" metric="100% SLA" */>}}
  {{</* dashboard-status-item name="Hugo Pipes Asset Engine" status="Operational" statusColor="green" metric="Zero Failures" */>}}
  {{</* dashboard-status-item name="Web Worker CSV Pipeline" status="Operational" statusColor="green" metric="18ms latency" */>}}
  {{</* dashboard-status-item name="MapLibre GL Vector Engine" status="Operational" statusColor="green" metric="60 FPS" */>}}
{{</* /dashboard-status-matrix */>}}
```
