/**
 * IBM Carbon Design System v11 — High-Performance CSVW & Statistical Web Worker
 * Offloads data parsing, filtering, sorting, column aggregations, and PSPP/SPSS statistical computations
 * to a background worker thread to ensure zero UI thread stutter and 60 FPS responsiveness.
 */

'use strict';

// ---------------------------------------------------------------------------
// 1. CSV Parser
// ---------------------------------------------------------------------------
function parseCSV(csvText, delimiter = ',') {
  if (!csvText || typeof csvText !== 'string') return { headers: [], rows: [] };
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  function parseLine(line, delim) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === delim && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0], delimiter);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = parseLine(line, delimiter);
    const rowObj = { _id: `row-${i}` };
    headers.forEach((h, colIdx) => {
      let val = vals[colIdx] !== undefined ? vals[colIdx] : '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      rowObj[h] = val;
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

// ---------------------------------------------------------------------------
// 2. Statistical Computations (SPSS / PSPP Compatible Engine)
// ---------------------------------------------------------------------------

function computeDescriptives(values) {
  const nums = values
    .map(v => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]+/g, ''))))
    .filter(v => typeof v === 'number' && !isNaN(v))
    .sort((a, b) => a - b);

  const n = nums.length;
  if (n === 0) return null;

  const sum = nums.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const stdErr = stdDev / Math.sqrt(n);

  const min = nums[0];
  const max = nums[n - 1];
  const range = max - min;

  // Quartiles
  const q1 = nums[Math.floor(n * 0.25)];
  const median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)];
  const q3 = nums[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Skewness & Kurtosis
  let m3 = 0;
  let m4 = 0;
  for (let i = 0; i < n; i++) {
    const diff = nums[i] - mean;
    m3 += Math.pow(diff, 3);
    m4 += Math.pow(diff, 4);
  }
  const skewness = (m3 / n) / Math.pow(stdDev || 1, 3);
  const kurtosis = ((m4 / n) / Math.pow(variance || 1, 2)) - 3;

  return {
    n,
    sum: Number(sum.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    stdErr: Number(stdErr.toFixed(4)),
    median: Number(median.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    skewness: Number(skewness.toFixed(4)),
    kurtosis: Number(kurtosis.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    range: Number(range.toFixed(4)),
    q1: Number(q1.toFixed(4)),
    q3: Number(q3.toFixed(4)),
    iqr: Number(iqr.toFixed(4))
  };
}

function computeFrequencies(values) {
  const counts = {};
  let total = 0;

  values.forEach(v => {
    const key = v === null || v === undefined || v === '' ? '(Missing)' : String(v);
    counts[key] = (counts[key] || 0) + 1;
    total++;
  });

  let cumCount = 0;
  const rows = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .map(key => {
      const count = counts[key];
      cumCount += count;
      const percent = total > 0 ? (count / total) * 100 : 0;
      const cumPercent = total > 0 ? (cumCount / total) * 100 : 0;

      return {
        value: key,
        frequency: count,
        percent: Number(percent.toFixed(2)),
        cumPercent: Number(cumPercent.toFixed(2))
      };
    });

  return { total, rows };
}

function computeCrosstab(rowVals, colVals, rowName = 'RowVar', colName = 'ColVar') {
  const len = Math.min(rowVals.length, colVals.length);
  const table = {};
  const colSet = new Set();
  const rowSet = new Set();
  let grandTotal = 0;

  for (let i = 0; i < len; i++) {
    const r = String(rowVals[i] ?? '(Missing)');
    const c = String(colVals[i] ?? '(Missing)');
    rowSet.add(r);
    colSet.add(c);

    if (!table[r]) table[r] = {};
    table[r][c] = (table[r][c] || 0) + 1;
    grandTotal++;
  }

  const rowCategories = Array.from(rowSet);
  const colCategories = Array.from(colSet);

  // Calculate row totals, col totals, and Chi-Square
  const rowTotals = {};
  const colTotals = {};
  colCategories.forEach(c => (colTotals[c] = 0));

  rowCategories.forEach(r => {
    let rSum = 0;
    colCategories.forEach(c => {
      const count = table[r]?.[c] || 0;
      rSum += count;
      colTotals[c] += count;
    });
    rowTotals[r] = rSum;
  });

  let chiSquare = 0;
  rowCategories.forEach(r => {
    colCategories.forEach(c => {
      const observed = table[r]?.[c] || 0;
      const expected = (rowTotals[r] * colTotals[c]) / (grandTotal || 1);
      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    });
  });

  const df = (rowCategories.length - 1) * (colCategories.length - 1);

  return {
    rowName,
    colName,
    rowCategories,
    colCategories,
    table,
    rowTotals,
    colTotals,
    grandTotal,
    chiSquare: Number(chiSquare.toFixed(4)),
    df
  };
}

function computeCorrelation(xVals, yVals) {
  const pairs = [];
  for (let i = 0; i < Math.min(xVals.length, yVals.length); i++) {
    const x = parseFloat(String(xVals[i]).replace(/[^0-9.-]+/g, ''));
    const y = parseFloat(String(yVals[i]).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(x) && !isNaN(y)) {
      pairs.push([x, y]);
    }
  }

  const n = pairs.length;
  if (n < 2) return null;

  const sumX = pairs.reduce((acc, p) => acc + p[0], 0);
  const sumY = pairs.reduce((acc, p) => acc + p[1], 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  pairs.forEach(p => {
    const dx = p[0] - meanX;
    const dy = p[1] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  });

  const r = denX && denY ? num / Math.sqrt(denX * denY) : 0;
  const r2 = r * r;
  const slope = denX ? num / denX : 0;
  const intercept = meanY - slope * meanX;

  // t-statistic for correlation
  const tStat = r2 < 1 ? (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r2) : 0;

  return {
    n,
    r: Number(r.toFixed(4)),
    r2: Number(r2.toFixed(4)),
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    tStat: Number(tStat.toFixed(4))
  };
}

function computeSpatialAggregations(rows, geoKey, metricKeys) {
  const groups = {};

  rows.forEach(row => {
    const region = row[geoKey] || row['region'] || row['country'] || row['location'] || 'Unknown';
    if (!groups[region]) {
      groups[region] = {
        region,
        count: 0,
        metrics: {}
      };
      metricKeys.forEach(m => (groups[region].metrics[m] = []));
    }
    groups[region].count++;
    metricKeys.forEach(m => {
      const val = parseFloat(String(row[m]).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(val)) {
        groups[region].metrics[m].push(val);
      }
    });
  });

  // Calculate summary stats for each region
  const summary = Object.keys(groups).map(reg => {
    const g = groups[reg];
    const stats = {};
    metricKeys.forEach(m => {
      const arr = g.metrics[m];
      if (arr.length > 0) {
        const sum = arr.reduce((a, b) => a + b, 0);
        const mean = sum / arr.length;
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        stats[m] = {
          count: arr.length,
          sum: Number(sum.toFixed(2)),
          mean: Number(mean.toFixed(2)),
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2))
        };
      } else {
        stats[m] = { count: 0, sum: 0, mean: 0, min: 0, max: 0 };
      }
    });
    return {
      region: reg,
      count: g.count,
      stats
    };
  });

  return summary;
}

// ---------------------------------------------------------------------------
// 3. Worker Message Dispatcher
// ---------------------------------------------------------------------------

self.onmessage = function (e) {
  const msg = e.data;
  if (!msg || !msg.type) return;

  const t0 = performance.now();

  switch (msg.type) {
    case 'PARSE_CSV': {
      const { headers, rows } = parseCSV(msg.csvText, msg.delimiter || ',');
      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'PARSE_CSV_RESULT',
        id: msg.id,
        headers,
        rows,
        totalRows: rows.length,
        elapsed
      });
      break;
    }

    case 'FILTER_SORT': {
      let filtered = [...msg.rows];

      // 1. Search Query filter
      if (msg.query) {
        const q = msg.query.toLowerCase().trim();
        filtered = filtered.filter(row => {
          return Object.keys(row).some(k => {
            if (k.startsWith('_')) return false;
            return String(row[k]).toLowerCase().includes(q);
          });
        });
      }

      // 2. Column-specific filters
      if (msg.columnFilters && typeof msg.columnFilters === 'object') {
        Object.keys(msg.columnFilters).forEach(col => {
          const val = msg.columnFilters[col]?.toLowerCase().trim();
          if (val) {
            filtered = filtered.filter(row => String(row[col] ?? '').toLowerCase().includes(val));
          }
        });
      }

      // 3. Sort
      if (msg.sortColumn) {
        const col = msg.sortColumn;
        const dir = msg.sortDirection === 'desc' ? -1 : 1;
        filtered.sort((a, b) => {
          const valA = a[col] ?? '';
          const valB = b[col] ?? '';
          const numA = parseFloat(String(valA).replace(/[^0-9.-]+/g, ''));
          const numB = parseFloat(String(valB).replace(/[^0-9.-]+/g, ''));

          if (!isNaN(numA) && !isNaN(numB)) {
            return (numA - numB) * dir;
          }
          return String(valA).localeCompare(String(valB)) * dir;
        });
      }

      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'FILTER_SORT_RESULT',
        id: msg.id,
        rows: filtered,
        totalFiltered: filtered.length,
        elapsed
      });
      break;
    }

    case 'COMPUTE_DESCRIPTIVES': {
      const results = {};
      Object.keys(msg.columns).forEach(col => {
        results[col] = computeDescriptives(msg.columns[col]);
      });
      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'DESCRIPTIVES_RESULT',
        id: msg.id,
        results,
        elapsed
      });
      break;
    }

    case 'COMPUTE_FREQUENCIES': {
      const results = computeFrequencies(msg.values);
      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'FREQUENCIES_RESULT',
        id: msg.id,
        column: msg.column,
        results,
        elapsed
      });
      break;
    }

    case 'COMPUTE_CROSSTAB': {
      const results = computeCrosstab(msg.rowVals, msg.colVals, msg.rowName, msg.colName);
      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'CROSSTAB_RESULT',
        id: msg.id,
        results,
        elapsed
      });
      break;
    }

    case 'COMPUTE_CORRELATION': {
      const results = computeCorrelation(msg.xVals, msg.yVals);
      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'CORRELATION_RESULT',
        id: msg.id,
        xName: msg.xName,
        yName: msg.yName,
        results,
        elapsed
      });
      break;
    }

    case 'COMPUTE_SPATIAL_STATS': {
      const results = computeSpatialAggregations(msg.rows, msg.geoKey, msg.metricKeys || []);
      const elapsed = Math.round(performance.now() - t0);
      self.postMessage({
        type: 'SPATIAL_STATS_RESULT',
        id: msg.id,
        results,
        elapsed
      });
      break;
    }

    default:
      console.warn('[CSVW Worker] Unhandled message type:', msg.type);
  }
};
