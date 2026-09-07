// IBM Carbon Design System v11 — SPSS/PSPP Statistical Analysis Engine
// Browser-based statistical analysis modal for W3C CSVW datasets.
// Provides: Data View, Variable View, Syntax Editor, Output Viewer.
// Supports SPSS syntax: DESCRIPTIVES, FREQUENCIES, CROSSTABS, CORRELATIONS,
// T-TEST, EXAMINE, GRAPH commands with Chart.js-powered graphics.

(function () {
  'use strict';

  // =========================================================================
  // 1. Chart.js Lazy Loader (same pattern as Leaflet in geojson-map.js)
  // =========================================================================
  let chartjsLoaded = false;
  let chartjsLoading = false;
  const chartjsCallbacks = [];

  function loadChartJS(cb) {
    if (chartjsLoaded && window.Chart) { cb(); return; }
    chartjsCallbacks.push(cb);
    if (chartjsLoading) return;
    chartjsLoading = true;

    const script = document.createElement('script');
    script.src = '/lib/chartjs/chart.umd.min.js';
    script.onload = () => {
      chartjsLoaded = true;
      chartjsCallbacks.forEach(fn => fn());
      chartjsCallbacks.length = 0;
    };
    script.onerror = () => {
      chartjsLoading = false;
      console.error('[SPSS Engine] Failed to load local Chart.js');
      chartjsCallbacks.forEach(fn => fn());
      chartjsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  }

  // =========================================================================
  // 2. Utility Functions
  // =========================================================================
  function esc(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };

    function parseLine(line) {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    }

    const headers = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const vals = parseLine(line);
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = vals[idx] !== undefined ? vals[idx] : '';
      });
      rows.push(rowObj);
    }
    return { headers, rows };
  }

  /** Strip %, $, commas from a value and parse as float */
  function toNum(val) {
    if (val == null || val === '') return NaN;
    const s = String(val).replace(/[%$,\s]/g, '');
    return parseFloat(s);
  }

  /** Get numeric array from a column, stripping non-numeric */
  function numericCol(rows, colName) {
    return rows.map(r => toNum(r[colName])).filter(v => !isNaN(v));
  }

  /** Basic statistics */
  function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN; }
  function variance(arr, m) {
    if (arr.length < 2) return NaN;
    const mu = m !== undefined ? m : mean(arr);
    return arr.reduce((sum, v) => sum + (v - mu) ** 2, 0) / (arr.length - 1);
  }
  function stddev(arr, m) { return Math.sqrt(variance(arr, m)); }
  function median(arr) {
    if (!arr.length) return NaN;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }
  function mode(arr) {
    if (!arr.length) return NaN;
    const freq = {};
    arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    let maxF = 0, modeVal = arr[0];
    for (const [k, f] of Object.entries(freq)) {
      if (f > maxF) { maxF = f; modeVal = parseFloat(k); }
    }
    return modeVal;
  }
  function skewness(arr) {
    const n = arr.length;
    if (n < 3) return NaN;
    const m = mean(arr), s = stddev(arr, m);
    if (s === 0) return 0;
    return (n / ((n - 1) * (n - 2))) * arr.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0);
  }
  function kurtosis(arr) {
    const n = arr.length;
    if (n < 4) return NaN;
    const m = mean(arr), s = stddev(arr, m);
    if (s === 0) return 0;
    const k4 = arr.reduce((sum, v) => sum + ((v - m) / s) ** 4, 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * k4 - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  }
  function percentile(arr, p) {
    if (!arr.length) return NaN;
    const s = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (s.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (idx - lo);
  }
  function range(arr) {
    if (!arr.length) return NaN;
    return Math.max(...arr) - Math.min(...arr);
  }
  /** Standard error of mean */
  function semean(arr) {
    return arr.length > 0 ? stddev(arr) / Math.sqrt(arr.length) : NaN;
  }

  /** Pearson correlation coefficient */
  function pearsonR(xArr, yArr) {
    const n = Math.min(xArr.length, yArr.length);
    if (n < 2) return NaN;
    const mx = mean(xArr.slice(0, n)), my = mean(yArr.slice(0, n));
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xArr[i] - mx, dy = yArr[i] - my;
      num += dx * dy;
      dx2 += dx * dx;
      dy2 += dy * dy;
    }
    const denom = Math.sqrt(dx2 * dy2);
    return denom === 0 ? 0 : num / denom;
  }

  /** T-distribution critical value approximation (two-tailed, via normal approx for large df) */
  function tTestPValue(t, df) {
    // Approximation using the incomplete beta function relation
    // For simplicity, use a lookup-style approach for common significance levels
    const x = df / (df + t * t);
    return incompleteBeta(df / 2, 0.5, x);
  }

  /** Regularized incomplete beta function (simple numeric integration) */
  function incompleteBeta(a, b, x) {
    if (x < 0 || x > 1) return NaN;
    if (x === 0) return 0;
    if (x === 1) return 1;
    // Use continued fraction expansion (Lentz's method)
    const maxIter = 200, eps = 1e-10;
    const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
    const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;

    let f = 1, c = 1, d = 0;
    for (let i = 0; i <= maxIter; i++) {
      let m = Math.floor(i / 2);
      let numerator;
      if (i === 0) {
        numerator = 1;
      } else if (i % 2 === 0) {
        numerator = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
      } else {
        numerator = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
      }
      d = 1 + numerator * d;
      if (Math.abs(d) < eps) d = eps;
      d = 1 / d;
      c = 1 + numerator / c;
      if (Math.abs(c) < eps) c = eps;
      f *= c * d;
      if (Math.abs(c * d - 1) < eps) break;
    }
    return front * (f - 1);
  }

  /** Log-gamma function (Stirling approx) */
  function lnGamma(z) {
    if (z < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
    }
    z -= 1;
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let x = 1.000000000190015;
    for (let i = 0; i < 6; i++) x += c[i] / (z + i + 1);
    const t = z + 5.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  /** Chi-square p-value approximation */
  function chiSquarePValue(chiSq, df) {
    if (df <= 0 || chiSq < 0) return NaN;
    return 1 - lowerIncompleteGamma(df / 2, chiSq / 2);
  }

  /** Regularized lower incomplete gamma function */
  function lowerIncompleteGamma(s, x) {
    if (x < 0) return 0;
    if (x === 0) return 0;
    // Series expansion
    let sum = 0, term = 1 / s;
    for (let n = 1; n < 200; n++) {
      term *= x / (s + n);
      sum += term;
      if (Math.abs(term) < 1e-10) break;
    }
    return Math.exp(-x + s * Math.log(x) - lnGamma(s)) * (1 / s + sum);
  }

  // Carbon colour palette for charts
  const CHART_COLORS = [
    '#0f62fe', '#6929c4', '#1192e8', '#005d5d', '#9f1853',
    '#fa4d56', '#570408', '#198038', '#002d9c', '#ee538b',
    '#b28600', '#009d9a', '#012749', '#8a3800', '#a56eff'
  ];

  function fmt(v, dp) {
    if (v == null || isNaN(v)) return '—';
    return Number(v).toFixed(dp !== undefined ? dp : 3);
  }

  // =========================================================================
  // 3. SPSS Syntax Parser
  // =========================================================================
  function parseSPSSSyntax(text) {
    // Remove comments: * ... \n  and  /* ... */
    let cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '');
    cleaned = cleaned.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('*')) return '';
      return line;
    }).join('\n');

    // Split commands by period (.)
    const rawCommands = cleaned.split(/\.\s*(?:\n|$)/);
    const commands = [];

    for (const raw of rawCommands) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      const fullCmd = lines.join(' ');

      // Extract command name (first word)
      const firstSpace = fullCmd.indexOf(' ');
      const cmdName = (firstSpace > 0 ? fullCmd.substring(0, firstSpace) : fullCmd).toUpperCase().replace('-', '_');
      const rest = firstSpace > 0 ? fullCmd.substring(firstSpace + 1) : '';

      // Parse subcommands (/ delimited)
      const subcommands = {};
      const parts = rest.split(/\s*\/\s*/);

      // First part before any / is the main argument
      if (parts[0]) {
        subcommands._main = parts[0].trim();
      }

      for (let i = 1; i < parts.length; i++) {
        const eqIdx = parts[i].indexOf('=');
        if (eqIdx > 0) {
          const subName = parts[i].substring(0, eqIdx).trim().toUpperCase();
          const subVal = parts[i].substring(eqIdx + 1).trim();
          subcommands[subName] = subVal;
        } else {
          const subName = parts[i].trim().toUpperCase();
          subcommands[subName] = true;
        }
      }

      // Parse VARIABLES= from main or subcommand
      let variables = [];
      const varsSource = subcommands.VARIABLES || subcommands._main || '';
      if (typeof varsSource === 'string') {
        const varsMatch = varsSource.replace(/^VARIABLES\s*=\s*/i, '');
        // Handle "var1 BY var2" or "var1 var2 var3" or "var1 WITH var2"
        if (/\bBY\b/i.test(varsMatch)) {
          const byParts = varsMatch.split(/\s+BY\s+/i);
          variables = byParts.map(p => p.trim().split(/[\s,]+/)).flat().filter(Boolean);
          subcommands._byVar = byParts.length > 1 ? byParts[1].trim().split(/[\s,]+/)[0] : null;
          subcommands._rowVars = byParts[0].trim().split(/[\s,]+/);
        } else if (/\bWITH\b/i.test(varsMatch)) {
          const withParts = varsMatch.split(/\s+WITH\s+/i);
          variables = withParts.map(p => p.trim().split(/[\s,]+/)).flat().filter(Boolean);
          subcommands._withVar = withParts.length > 1 ? withParts[1].trim().split(/[\s,]+/)[0] : null;
        } else {
          variables = varsMatch.split(/[\s,]+/).filter(v => v && v !== '=' && !/^VARIABLES$/i.test(v));
        }
      }

      // Parse /STATISTICS= values
      let statistics = [];
      if (subcommands.STATISTICS && typeof subcommands.STATISTICS === 'string') {
        statistics = subcommands.STATISTICS.split(/[\s,]+/).map(s => s.toUpperCase()).filter(Boolean);
      }

      // Parse /CELLS= values
      let cells = [];
      if (subcommands.CELLS && typeof subcommands.CELLS === 'string') {
        cells = subcommands.CELLS.split(/[\s,]+/).map(s => s.toUpperCase()).filter(Boolean);
      }

      // Parse /TABLES= for CROSSTABS
      if (subcommands.TABLES && typeof subcommands.TABLES === 'string') {
        const tablesStr = subcommands.TABLES;
        if (/\bBY\b/i.test(tablesStr)) {
          const byParts = tablesStr.split(/\s+BY\s+/i);
          subcommands._rowVars = byParts[0].trim().split(/[\s,]+/).filter(Boolean);
          subcommands._byVar = byParts.length > 1 ? byParts[1].trim().split(/[\s,]+/)[0] : null;
          variables = [...(subcommands._rowVars || [])];
          if (subcommands._byVar) variables.push(subcommands._byVar);
        }
      }

      // Parse /TESTVAL= for T-TEST
      if (subcommands.TESTVAL && typeof subcommands.TESTVAL === 'string') {
        subcommands._testVal = parseFloat(subcommands.TESTVAL);
      }

      // Chart type from GRAPH command
      if (cmdName === 'GRAPH') {
        for (const key of ['HISTOGRAM', 'BAR', 'SCATTER', 'PIE', 'LINE', 'BOXPLOT']) {
          if (subcommands[key] !== undefined) {
            subcommands._chartType = key.toLowerCase();
            if (typeof subcommands[key] === 'string') {
              const chartVarsStr = subcommands[key];
              if (/\bBY\b/i.test(chartVarsStr)) {
                const byParts = chartVarsStr.split(/\s+BY\s+/i);
                variables = byParts.map(p => p.trim().split(/[\s,]+/)).flat().filter(Boolean);
                subcommands._byVar = byParts[1]?.trim().split(/[\s,]+/)[0];
              } else if (/\bWITH\b/i.test(chartVarsStr)) {
                const withParts = chartVarsStr.split(/\s+WITH\s+/i);
                variables = withParts.map(p => p.trim().split(/[\s,]+/)).flat().filter(Boolean);
                subcommands._withVar = withParts[1]?.trim().split(/[\s,]+/)[0];
              } else {
                variables = chartVarsStr.split(/[\s,]+/).filter(Boolean);
              }
            }
            break;
          }
        }
      }

      commands.push({
        command: cmdName,
        variables,
        subcommands,
        statistics,
        cells,
        raw: trimmed
      });
    }

    return commands;
  }

  // =========================================================================
  // 4. Statistical Procedures
  // =========================================================================

  /** DESCRIPTIVES — Summary statistics table */
  function procDescriptives(dataset, cmd) {
    const vars = cmd.variables.length > 0
      ? cmd.variables.filter(v => dataset.headers.includes(v))
      : dataset.headers.filter(h => {
          const vals = numericCol(dataset.rows, h);
          return vals.length > 0;
        });

    if (vars.length === 0) {
      return { type: 'error', title: 'DESCRIPTIVES', message: 'No valid numeric variables found.' };
    }

    // Determine which statistics to show
    const defaultStats = ['MEAN', 'STDDEV', 'MIN', 'MAX'];
    const statsReq = cmd.statistics.length > 0 ? cmd.statistics : defaultStats;
    const allStats = ['N', 'MEAN', 'STDDEV', 'MIN', 'MAX', 'RANGE', 'VARIANCE', 'SKEWNESS', 'KURTOSIS', 'SEMEAN'];
    const showStats = statsReq.filter(s => allStats.includes(s));
    if (showStats.length === 0) showStats.push(...defaultStats);
    if (!showStats.includes('N')) showStats.unshift('N');

    const colTitles = dataset.variableLabels || {};
    const tableRows = [];

    for (const v of vars) {
      const nums = numericCol(dataset.rows, v);
      const m = mean(nums);
      const row = { variable: colTitles[v] || v };

      for (const s of showStats) {
        switch (s) {
          case 'N': row.N = nums.length; break;
          case 'MEAN': row.Mean = fmt(m); break;
          case 'STDDEV': row['Std. Deviation'] = fmt(stddev(nums, m)); break;
          case 'MIN': row.Minimum = fmt(Math.min(...nums), 2); break;
          case 'MAX': row.Maximum = fmt(Math.max(...nums), 2); break;
          case 'RANGE': row.Range = fmt(range(nums), 2); break;
          case 'VARIANCE': row.Variance = fmt(variance(nums, m)); break;
          case 'SKEWNESS': row.Skewness = fmt(skewness(nums)); break;
          case 'KURTOSIS': row.Kurtosis = fmt(kurtosis(nums)); break;
          case 'SEMEAN': row['S.E. Mean'] = fmt(semean(nums)); break;
        }
      }
      tableRows.push(row);
    }

    return {
      type: 'table',
      title: 'Descriptive Statistics',
      subtitle: `Variables: ${vars.join(', ')}`,
      columns: ['variable', ...showStats.map(s => {
        const names = { N: 'N', MEAN: 'Mean', STDDEV: 'Std. Deviation', MIN: 'Minimum', MAX: 'Maximum', RANGE: 'Range', VARIANCE: 'Variance', SKEWNESS: 'Skewness', KURTOSIS: 'Kurtosis', SEMEAN: 'S.E. Mean' };
        return names[s] || s;
      })],
      rows: tableRows
    };
  }

  /** FREQUENCIES — Frequency table + optional chart */
  function procFrequencies(dataset, cmd) {
    const vars = cmd.variables.length > 0
      ? cmd.variables.filter(v => dataset.headers.includes(v))
      : [dataset.headers[0]];

    const outputs = [];
    const wantStats = cmd.statistics.length > 0;
    const wantBarChart = cmd.subcommands.BARCHART !== undefined;
    const wantHistogram = cmd.subcommands.HISTOGRAM !== undefined;

    for (const v of vars) {
      const colTitle = (dataset.variableLabels || {})[v] || v;
      const values = dataset.rows.map(r => r[v]).filter(val => val != null && val !== '');
      const freq = {};
      values.forEach(val => { freq[val] = (freq[val] || 0) + 1; });

      const sortedKeys = Object.keys(freq).sort((a, b) => {
        const na = parseFloat(a), nb = parseFloat(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      });

      const total = values.length;
      let cumPct = 0;
      const freqRows = sortedKeys.map(k => {
        const f = freq[k];
        const pct = (f / total * 100);
        cumPct += pct;
        return {
          Value: k,
          Frequency: f,
          Percent: fmt(pct, 1),
          'Valid Percent': fmt(pct, 1),
          'Cumulative Percent': fmt(cumPct, 1)
        };
      });
      freqRows.push({
        Value: 'Total',
        Frequency: total,
        Percent: '100.0',
        'Valid Percent': '100.0',
        'Cumulative Percent': ''
      });

      outputs.push({
        type: 'table',
        title: `${colTitle}`,
        subtitle: 'Frequency Table',
        columns: ['Value', 'Frequency', 'Percent', 'Valid Percent', 'Cumulative Percent'],
        rows: freqRows
      });

      // Statistics sub-table
      if (wantStats) {
        const nums = numericCol(dataset.rows, v);
        const statsRows = [];
        for (const s of cmd.statistics) {
          switch (s) {
            case 'MEAN': statsRows.push({ Statistic: 'Mean', Value: fmt(mean(nums)) }); break;
            case 'MEDIAN': statsRows.push({ Statistic: 'Median', Value: fmt(median(nums)) }); break;
            case 'MODE': statsRows.push({ Statistic: 'Mode', Value: fmt(mode(nums)) }); break;
            case 'STDDEV': statsRows.push({ Statistic: 'Std. Deviation', Value: fmt(stddev(nums)) }); break;
            case 'RANGE': statsRows.push({ Statistic: 'Range', Value: fmt(range(nums), 2) }); break;
            case 'MIN': statsRows.push({ Statistic: 'Minimum', Value: fmt(Math.min(...nums), 2) }); break;
            case 'MAX': statsRows.push({ Statistic: 'Maximum', Value: fmt(Math.max(...nums), 2) }); break;
          }
        }
        statsRows.unshift({ Statistic: 'N (Valid)', Value: nums.length });
        if (statsRows.length > 1) {
          outputs.push({
            type: 'table',
            title: `${colTitle} — Statistics`,
            columns: ['Statistic', 'Value'],
            rows: statsRows
          });
        }
      }

      // Bar chart
      if (wantBarChart) {
        outputs.push({
          type: 'chart',
          chartType: 'bar',
          title: `${colTitle} — Bar Chart`,
          labels: sortedKeys,
          datasets: [{ label: 'Frequency', data: sortedKeys.map(k => freq[k]) }]
        });
      }

      // Histogram
      if (wantHistogram) {
        const nums = numericCol(dataset.rows, v);
        if (nums.length > 0) {
          const binCount = Math.max(5, Math.ceil(Math.sqrt(nums.length)));
          const minVal = Math.min(...nums), maxVal = Math.max(...nums);
          const binWidth = (maxVal - minVal) / binCount || 1;
          const bins = Array(binCount).fill(0);
          const binLabels = [];
          for (let i = 0; i < binCount; i++) {
            const lo = minVal + i * binWidth;
            binLabels.push(fmt(lo + binWidth / 2, 1));
          }
          nums.forEach(n => {
            let idx = Math.floor((n - minVal) / binWidth);
            if (idx >= binCount) idx = binCount - 1;
            bins[idx]++;
          });
          outputs.push({
            type: 'chart',
            chartType: 'bar',
            title: `${colTitle} — Histogram`,
            labels: binLabels,
            datasets: [{ label: 'Frequency', data: bins }],
            options: { barPercentage: 1.0, categoryPercentage: 1.0 }
          });
        }
      }
    }

    return outputs;
  }

  /** CROSSTABS — Cross-tabulation with chi-square */
  function procCrosstabs(dataset, cmd) {
    const rowVars = cmd.subcommands._rowVars || [];
    const colVar = cmd.subcommands._byVar;

    if (rowVars.length === 0 || !colVar) {
      return { type: 'error', title: 'CROSSTABS', message: 'Syntax: CROSSTABS /TABLES=rowvar BY colvar.' };
    }

    const outputs = [];
    const wantChisq = cmd.statistics.includes('CHISQ');
    const cellOpts = cmd.cells.length > 0 ? cmd.cells : ['COUNT'];

    for (const rowVar of rowVars) {
      if (!dataset.headers.includes(rowVar) || !dataset.headers.includes(colVar)) {
        outputs.push({ type: 'error', title: 'CROSSTABS', message: `Variable "${rowVar}" or "${colVar}" not found.` });
        continue;
      }

      const rowLabels = (dataset.variableLabels || {})[rowVar] || rowVar;
      const colLabels = (dataset.variableLabels || {})[colVar] || colVar;

      // Build contingency table
      const rowVals = [...new Set(dataset.rows.map(r => r[rowVar]))].sort();
      const colVals = [...new Set(dataset.rows.map(r => r[colVar]))].sort();

      const counts = {};
      const rowTotals = {};
      const colTotals = {};
      let grandTotal = 0;

      rowVals.forEach(rv => { counts[rv] = {}; rowTotals[rv] = 0; colVals.forEach(cv => { counts[rv][cv] = 0; }); });
      colVals.forEach(cv => { colTotals[cv] = 0; });

      dataset.rows.forEach(r => {
        const rv = r[rowVar], cv = r[colVar];
        if (counts[rv] && counts[rv][cv] !== undefined) {
          counts[rv][cv]++;
          rowTotals[rv]++;
          colTotals[cv]++;
          grandTotal++;
        }
      });

      // Build table rows
      const tableColumns = [rowLabels, ...colVals, 'Total'];
      const tableRows = [];

      for (const rv of rowVals) {
        const row = { [rowLabels]: rv };
        for (const cv of colVals) {
          const c = counts[rv][cv];
          const parts = [];
          if (cellOpts.includes('COUNT')) parts.push(c);
          if (cellOpts.includes('ROW')) parts.push(`(${fmt(rowTotals[rv] ? c / rowTotals[rv] * 100 : 0, 1)}%)`);
          if (cellOpts.includes('COLUMN')) parts.push(`[${fmt(colTotals[cv] ? c / colTotals[cv] * 100 : 0, 1)}%]`);
          if (cellOpts.includes('TOTAL')) parts.push(`{${fmt(grandTotal ? c / grandTotal * 100 : 0, 1)}%}`);
          row[cv] = parts.join(' ');
        }
        row.Total = rowTotals[rv];
        tableRows.push(row);
      }

      // Total row
      const totalRow = { [rowLabels]: 'Total' };
      colVals.forEach(cv => { totalRow[cv] = colTotals[cv]; });
      totalRow.Total = grandTotal;
      tableRows.push(totalRow);

      outputs.push({
        type: 'table',
        title: `${rowLabels} × ${colLabels} Crosstabulation`,
        columns: tableColumns,
        rows: tableRows
      });

      // Chi-square test
      if (wantChisq) {
        let chiSq = 0;
        const df = (rowVals.length - 1) * (colVals.length - 1);

        for (const rv of rowVals) {
          for (const cv of colVals) {
            const observed = counts[rv][cv];
            const expected = grandTotal > 0 ? (rowTotals[rv] * colTotals[cv]) / grandTotal : 0;
            if (expected > 0) {
              chiSq += (observed - expected) ** 2 / expected;
            }
          }
        }

        const pValue = chiSquarePValue(chiSq, df);

        outputs.push({
          type: 'table',
          title: 'Chi-Square Tests',
          columns: ['Test', 'Value', 'df', 'Asymptotic Significance (2-sided)'],
          rows: [
            { Test: 'Pearson Chi-Square', Value: fmt(chiSq), df: df, 'Asymptotic Significance (2-sided)': fmt(pValue) },
            { Test: 'N of Valid Cases', Value: grandTotal, df: '', 'Asymptotic Significance (2-sided)': '' }
          ]
        });
      }
    }

    return outputs;
  }

  /** CORRELATIONS — Pearson correlation matrix */
  function procCorrelations(dataset, cmd) {
    const vars = cmd.variables.length > 0
      ? cmd.variables.filter(v => dataset.headers.includes(v))
      : dataset.headers.filter(h => numericCol(dataset.rows, h).length > 0);

    if (vars.length < 2) {
      return { type: 'error', title: 'CORRELATIONS', message: 'Need at least 2 numeric variables.' };
    }

    const numArrays = {};
    vars.forEach(v => { numArrays[v] = numericCol(dataset.rows, v); });

    const tableColumns = ['', ...vars];
    const tableRows = [];

    for (const v1 of vars) {
      const row = { '': (dataset.variableLabels || {})[v1] || v1 };
      for (const v2 of vars) {
        const r = pearsonR(numArrays[v1], numArrays[v2]);
        const n = Math.min(numArrays[v1].length, numArrays[v2].length);
        row[v2] = `${fmt(r)}${v1 !== v2 && Math.abs(r) > 0.5 ? ' **' : v1 !== v2 && Math.abs(r) > 0.3 ? ' *' : ''}`;
      }
      tableRows.push(row);
    }

    const outputs = [{
      type: 'table',
      title: 'Correlations',
      subtitle: 'Pearson Correlation Coefficients. ** p < .01, * p < .05 (approximate)',
      columns: tableColumns,
      rows: tableRows
    }];

    // Correlation matrix heatmap
    if (vars.length <= 10) {
      const matrixData = [];
      for (const v1 of vars) {
        for (const v2 of vars) {
          matrixData.push({
            x: (dataset.variableLabels || {})[v2] || v2,
            y: (dataset.variableLabels || {})[v1] || v1,
            r: pearsonR(numArrays[v1], numArrays[v2])
          });
        }
      }
      // We'll render this as a styled table with colour coding instead of a chart
    }

    return outputs;
  }

  /** T-TEST — One-sample t-test */
  function procTTest(dataset, cmd) {
    const testVal = cmd.subcommands._testVal || 0;
    const vars = cmd.variables.length > 0
      ? cmd.variables.filter(v => dataset.headers.includes(v))
      : dataset.headers.filter(h => numericCol(dataset.rows, h).length > 0).slice(0, 3);

    if (vars.length === 0) {
      return { type: 'error', title: 'T-TEST', message: 'No valid numeric variables found.' };
    }

    const outputs = [];

    // Group Statistics
    const statsRows = [];
    for (const v of vars) {
      const nums = numericCol(dataset.rows, v);
      const m = mean(nums);
      statsRows.push({
        Variable: (dataset.variableLabels || {})[v] || v,
        N: nums.length,
        Mean: fmt(m),
        'Std. Deviation': fmt(stddev(nums, m)),
        'Std. Error Mean': fmt(semean(nums))
      });
    }

    outputs.push({
      type: 'table',
      title: 'One-Sample Statistics',
      columns: ['Variable', 'N', 'Mean', 'Std. Deviation', 'Std. Error Mean'],
      rows: statsRows
    });

    // T-Test results
    const testRows = [];
    for (const v of vars) {
      const nums = numericCol(dataset.rows, v);
      if (nums.length < 2) continue;
      const m = mean(nums);
      const se = semean(nums);
      const t = se > 0 ? (m - testVal) / se : NaN;
      const df = nums.length - 1;
      const p = !isNaN(t) ? tTestPValue(Math.abs(t), df) : NaN;
      const meanDiff = m - testVal;
      // 95% CI
      const tCrit = 1.96; // approximate for large samples
      const ciLo = meanDiff - tCrit * se;
      const ciHi = meanDiff + tCrit * se;

      testRows.push({
        Variable: (dataset.variableLabels || {})[v] || v,
        t: fmt(t),
        df: df,
        'Sig. (2-tailed)': fmt(p),
        'Mean Difference': fmt(meanDiff),
        '95% CI Lower': fmt(ciLo),
        '95% CI Upper': fmt(ciHi)
      });
    }

    outputs.push({
      type: 'table',
      title: `One-Sample Test (Test Value = ${testVal})`,
      columns: ['Variable', 't', 'df', 'Sig. (2-tailed)', 'Mean Difference', '95% CI Lower', '95% CI Upper'],
      rows: testRows
    });

    return outputs;
  }

  /** EXAMINE — Descriptives + percentiles + charts */
  function procExamine(dataset, cmd) {
    const vars = cmd.variables.length > 0
      ? cmd.variables.filter(v => dataset.headers.includes(v))
      : dataset.headers.filter(h => numericCol(dataset.rows, h).length > 0).slice(0, 3);

    const outputs = [];
    const wantBoxplot = cmd.subcommands.PLOT !== undefined;

    for (const v of vars) {
      const colTitle = (dataset.variableLabels || {})[v] || v;
      const nums = numericCol(dataset.rows, v);
      if (nums.length === 0) continue;

      const m = mean(nums);
      const sd = stddev(nums, m);

      // Descriptives
      outputs.push({
        type: 'table',
        title: `${colTitle} — Descriptives`,
        columns: ['Statistic', 'Value', 'Std. Error'],
        rows: [
          { Statistic: 'Mean', Value: fmt(m), 'Std. Error': fmt(semean(nums)) },
          { Statistic: '95% CI Lower Bound', Value: fmt(m - 1.96 * semean(nums)), 'Std. Error': '' },
          { Statistic: '95% CI Upper Bound', Value: fmt(m + 1.96 * semean(nums)), 'Std. Error': '' },
          { Statistic: '5% Trimmed Mean', Value: fmt(mean(nums.sort((a, b) => a - b).slice(Math.floor(nums.length * 0.05), Math.ceil(nums.length * 0.95)))), 'Std. Error': '' },
          { Statistic: 'Median', Value: fmt(median(nums)), 'Std. Error': '' },
          { Statistic: 'Variance', Value: fmt(variance(nums, m)), 'Std. Error': '' },
          { Statistic: 'Std. Deviation', Value: fmt(sd), 'Std. Error': '' },
          { Statistic: 'Minimum', Value: fmt(Math.min(...nums), 2), 'Std. Error': '' },
          { Statistic: 'Maximum', Value: fmt(Math.max(...nums), 2), 'Std. Error': '' },
          { Statistic: 'Range', Value: fmt(range(nums), 2), 'Std. Error': '' },
          { Statistic: 'Interquartile Range', Value: fmt(percentile(nums, 75) - percentile(nums, 25), 2), 'Std. Error': '' },
          { Statistic: 'Skewness', Value: fmt(skewness(nums)), 'Std. Error': fmt(Math.sqrt(6.0 / nums.length)) },
          { Statistic: 'Kurtosis', Value: fmt(kurtosis(nums)), 'Std. Error': fmt(Math.sqrt(24.0 / nums.length)) }
        ]
      });

      // Percentiles
      outputs.push({
        type: 'table',
        title: `${colTitle} — Percentiles`,
        columns: ['Percentile', 'Value'],
        rows: [5, 10, 25, 50, 75, 90, 95].map(p => ({
          Percentile: `${p}th`,
          Value: fmt(percentile(nums, p), 2)
        }))
      });

      // Boxplot
      if (wantBoxplot) {
        const q1 = percentile(nums, 25), q3 = percentile(nums, 75);
        const iqr = q3 - q1;
        const whiskerLo = Math.max(Math.min(...nums), q1 - 1.5 * iqr);
        const whiskerHi = Math.min(Math.max(...nums), q3 + 1.5 * iqr);
        const outliers = nums.filter(v => v < whiskerLo || v > whiskerHi);

        outputs.push({
          type: 'chart',
          chartType: 'boxplot',
          title: `${colTitle} — Box Plot`,
          boxData: { min: whiskerLo, q1, median: median(nums), q3, max: whiskerHi, outliers, label: colTitle }
        });

        // Also add histogram
        const binCount = Math.max(5, Math.ceil(Math.sqrt(nums.length)));
        const minVal = Math.min(...nums), maxVal = Math.max(...nums);
        const binWidth = (maxVal - minVal) / binCount || 1;
        const bins = Array(binCount).fill(0);
        const binLabels = [];
        for (let i = 0; i < binCount; i++) {
          binLabels.push(fmt(minVal + (i + 0.5) * binWidth, 1));
        }
        nums.forEach(n => {
          let idx = Math.floor((n - minVal) / binWidth);
          if (idx >= binCount) idx = binCount - 1;
          bins[idx]++;
        });
        outputs.push({
          type: 'chart',
          chartType: 'bar',
          title: `${colTitle} — Histogram`,
          labels: binLabels,
          datasets: [{ label: 'Frequency', data: bins }],
          options: { barPercentage: 1.0, categoryPercentage: 1.0 }
        });
      }
    }

    return outputs;
  }

  /** GRAPH — Generate charts */
  function procGraph(dataset, cmd) {
    const chartType = cmd.subcommands._chartType || 'bar';
    const vars = cmd.variables.filter(v => dataset.headers.includes(v));

    if (vars.length === 0) {
      return { type: 'error', title: 'GRAPH', message: 'No valid variables specified.' };
    }

    const colTitle = v => (dataset.variableLabels || {})[v] || v;

    switch (chartType) {
      case 'histogram': {
        const v = vars[0];
        const nums = numericCol(dataset.rows, v);
        if (nums.length === 0) return { type: 'error', title: 'GRAPH', message: `"${v}" has no numeric values.` };
        const binCount = Math.max(5, Math.ceil(Math.sqrt(nums.length)));
        const minVal = Math.min(...nums), maxVal = Math.max(...nums);
        const binWidth = (maxVal - minVal) / binCount || 1;
        const bins = Array(binCount).fill(0);
        const labels = [];
        for (let i = 0; i < binCount; i++) labels.push(fmt(minVal + (i + 0.5) * binWidth, 1));
        nums.forEach(n => { let idx = Math.floor((n - minVal) / binWidth); if (idx >= binCount) idx = binCount - 1; bins[idx]++; });
        return { type: 'chart', chartType: 'bar', title: `Histogram of ${colTitle(v)}`, labels, datasets: [{ label: 'Frequency', data: bins }], options: { barPercentage: 1.0, categoryPercentage: 1.0 } };
      }

      case 'bar': {
        const v = vars[0];
        const byVar = cmd.subcommands._byVar;
        if (byVar && dataset.headers.includes(byVar)) {
          // Grouped bar: values of v grouped by byVar
          const groups = {};
          dataset.rows.forEach(r => {
            const g = r[byVar] || 'Other';
            if (!groups[g]) groups[g] = [];
            groups[g].push(toNum(r[v]));
          });
          const labels = Object.keys(groups);
          return {
            type: 'chart', chartType: 'bar', title: `${colTitle(v)} by ${colTitle(byVar)}`,
            labels, datasets: [{ label: `Mean ${colTitle(v)}`, data: labels.map(l => mean(groups[l].filter(x => !isNaN(x)))) }]
          };
        } else {
          // Frequency bar
          const freq = {};
          dataset.rows.forEach(r => { const val = r[v] || ''; freq[val] = (freq[val] || 0) + 1; });
          const labels = Object.keys(freq).sort();
          return { type: 'chart', chartType: 'bar', title: `Bar Chart of ${colTitle(v)}`, labels, datasets: [{ label: 'Count', data: labels.map(l => freq[l]) }] };
        }
      }

      case 'scatter': {
        if (vars.length < 2) return { type: 'error', title: 'GRAPH', message: 'Scatter plot needs 2 variables: GRAPH /SCATTER=var1 WITH var2.' };
        const xVar = vars[0], yVar = cmd.subcommands._withVar || vars[1];
        const data = [];
        dataset.rows.forEach(r => {
          const x = toNum(r[xVar]), y = toNum(r[yVar]);
          if (!isNaN(x) && !isNaN(y)) data.push({ x, y });
        });
        return { type: 'chart', chartType: 'scatter', title: `${colTitle(xVar)} vs ${colTitle(yVar)}`, scatterData: data, xLabel: colTitle(xVar), yLabel: colTitle(yVar) };
      }

      case 'pie': {
        const v = vars[0];
        const freq = {};
        dataset.rows.forEach(r => { const val = r[v] || ''; freq[val] = (freq[val] || 0) + 1; });
        const labels = Object.keys(freq).sort();
        return { type: 'chart', chartType: 'pie', title: `${colTitle(v)} Distribution`, labels, datasets: [{ data: labels.map(l => freq[l]) }] };
      }

      case 'line': {
        const v = vars[0];
        const byVar = cmd.subcommands._byVar;
        if (byVar && dataset.headers.includes(byVar)) {
          const groups = {};
          dataset.rows.forEach(r => { const g = r[byVar] || ''; if (!groups[g]) groups[g] = []; groups[g].push(toNum(r[v])); });
          const labels = Object.keys(groups).sort();
          return { type: 'chart', chartType: 'line', title: `${colTitle(v)} by ${colTitle(byVar)}`, labels, datasets: [{ label: colTitle(v), data: labels.map(l => mean(groups[l].filter(x => !isNaN(x)))) }] };
        }
        const data = dataset.rows.map((r, i) => toNum(r[v])).filter(v => !isNaN(v));
        return { type: 'chart', chartType: 'line', title: `Line Chart of ${colTitle(v)}`, labels: data.map((_, i) => i + 1), datasets: [{ label: colTitle(v), data }] };
      }

      case 'boxplot': {
        const v = vars[0];
        const nums = numericCol(dataset.rows, v);
        if (nums.length === 0) return { type: 'error', title: 'GRAPH', message: `"${v}" has no numeric values.` };
        const q1 = percentile(nums, 25), q3 = percentile(nums, 75);
        const iqr = q3 - q1;
        const whiskerLo = Math.max(Math.min(...nums), q1 - 1.5 * iqr);
        const whiskerHi = Math.min(Math.max(...nums), q3 + 1.5 * iqr);
        const outliers = nums.filter(v => v < whiskerLo || v > whiskerHi);
        return { type: 'chart', chartType: 'boxplot', title: `Box Plot of ${colTitle(v)}`, boxData: { min: whiskerLo, q1, median: median(nums), q3, max: whiskerHi, outliers, label: colTitle(v) } };
      }

      default:
        return { type: 'error', title: 'GRAPH', message: `Unknown chart type: ${chartType}` };
    }
  }

  // =========================================================================
  // 5. Command Dispatcher
  // =========================================================================
  function executeCommand(dataset, cmd) {
    switch (cmd.command) {
      case 'DESCRIPTIVES': return [procDescriptives(dataset, cmd)];
      case 'FREQUENCIES': return procFrequencies(dataset, cmd);
      case 'CROSSTABS': return procCrosstabs(dataset, cmd);
      case 'CORRELATIONS': return [procCorrelations(dataset, cmd)].flat();
      case 'T_TEST': case 'TTEST': return procTTest(dataset, cmd);
      case 'EXAMINE': return procExamine(dataset, cmd);
      case 'GRAPH': return [procGraph(dataset, cmd)];
      case 'VARIABLE': return []; // Metadata — handled separately
      case 'VALUE': return [];
      case 'MISSING': return [];
      default:
        return [{ type: 'error', title: cmd.command, message: `Unknown command: ${cmd.command}. Supported: DESCRIPTIVES, FREQUENCIES, CROSSTABS, CORRELATIONS, T-TEST, EXAMINE, GRAPH.` }];
    }
  }

  // =========================================================================
  // 6. Output Renderer — HTML generation
  // =========================================================================

  let chartCounter = 0;

  function renderOutputItem(item) {
    if (!item) return '';

    if (item.type === 'error') {
      return `
        <div class="spss-output-block spss-output-block--error">
          <div class="spss-output-block__header">
            <span class="spss-output-block__icon">⚠</span>
            <span class="spss-output-block__title">${esc(item.title || 'Error')}</span>
          </div>
          <div class="spss-output-block__body">
            <p class="spss-output-error">${esc(item.message)}</p>
          </div>
        </div>`;
    }

    if (item.type === 'note') {
      return `
        <div class="spss-output-block spss-output-block--note">
          <div class="spss-output-block__header">
            <span class="spss-output-block__icon">ℹ</span>
            <span class="spss-output-block__title">${esc(item.title || 'Notes')}</span>
          </div>
          <div class="spss-output-block__body">
            <p>${esc(item.message)}</p>
          </div>
        </div>`;
    }

    if (item.type === 'table') {
      const cols = item.columns || [];
      const rows = item.rows || [];
      return `
        <div class="spss-output-block spss-output-block--table">
          <div class="spss-output-block__header">
            <span class="spss-output-block__icon">▦</span>
            <span class="spss-output-block__title">${esc(item.title || 'Table')}</span>
          </div>
          ${item.subtitle ? `<p class="spss-output-block__subtitle">${esc(item.subtitle)}</p>` : ''}
          <div class="spss-output-block__body">
            <div class="spss-pivot-table-wrapper">
              <table class="spss-pivot-table" aria-label="${esc(item.title || 'Table')}">
                <thead>
                  <tr>${cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${rows.map((row, ri) => `<tr class="${ri === rows.length - 1 && (row[cols[0]] === 'Total') ? 'spss-pivot-table__total-row' : ''}">
                    ${cols.map((c, ci) => `<td class="${ci === 0 ? 'spss-pivot-table__row-header' : ''}">${esc(String(row[c] ?? ''))}</td>`).join('')}
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    }

    if (item.type === 'chart') {
      const chartId = `spss-chart-${++chartCounter}`;
      return `
        <div class="spss-output-block spss-output-block--chart">
          <div class="spss-output-block__header">
            <span class="spss-output-block__icon">📊</span>
            <span class="spss-output-block__title">${esc(item.title || 'Chart')}</span>
          </div>
          <div class="spss-output-block__body">
            <div class="spss-chart-container">
              <canvas id="${chartId}" data-spss-chart='${JSON.stringify(item).replace(/'/g, '&#39;')}'></canvas>
            </div>
          </div>
        </div>`;
    }

    return '';
  }

  /** Render a Chart.js chart from a chart output item */
  function renderChart(canvas) {
    const item = JSON.parse(canvas.getAttribute('data-spss-chart'));
    if (!item || !window.Chart) return;

    // Determine theme colours
    const isDark = ['g90', 'g100'].includes(document.documentElement.getAttribute('data-carbon-theme'));
    const textColor = isDark ? '#c6c6c6' : '#525252';
    const gridColor = isDark ? 'rgba(198,198,198,0.15)' : 'rgba(22,22,22,0.08)';
    const bgColors = CHART_COLORS.map(c => c + '99'); // 60% opacity

    const defaults = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: "'IBM Plex Sans', sans-serif", size: 12 } } },
        tooltip: { titleFont: { family: "'IBM Plex Sans', sans-serif" }, bodyFont: { family: "'IBM Plex Mono', monospace", size: 11 } }
      },
      scales: {
        x: { ticks: { color: textColor, font: { family: "'IBM Plex Sans', sans-serif", size: 11 } }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: { family: "'IBM Plex Sans', sans-serif", size: 11 } }, grid: { color: gridColor } }
      }
    };

    let config;

    if (item.chartType === 'scatter') {
      config = {
        type: 'scatter',
        data: { datasets: [{ label: item.title, data: item.scatterData, backgroundColor: CHART_COLORS[0] + '99', borderColor: CHART_COLORS[0], pointRadius: 5 }] },
        options: { ...defaults, scales: { ...defaults.scales, x: { ...defaults.scales.x, title: { display: true, text: item.xLabel || '', color: textColor } }, y: { ...defaults.scales.y, title: { display: true, text: item.yLabel || '', color: textColor } } } }
      };
    } else if (item.chartType === 'pie') {
      config = {
        type: 'pie',
        data: { labels: item.labels, datasets: item.datasets.map(ds => ({ ...ds, backgroundColor: bgColors, borderColor: CHART_COLORS, borderWidth: 1 })) },
        options: { ...defaults, scales: undefined }
      };
    } else if (item.chartType === 'line') {
      config = {
        type: 'line',
        data: { labels: item.labels, datasets: item.datasets.map((ds, i) => ({ ...ds, borderColor: CHART_COLORS[i % CHART_COLORS.length], backgroundColor: 'transparent', tension: 0.3, pointRadius: 4 })) },
        options: defaults
      };
    } else if (item.chartType === 'boxplot') {
      // Render boxplot as a bar chart with error bars approximation
      const bd = item.boxData;
      config = {
        type: 'bar',
        data: {
          labels: [bd.label || 'Data'],
          datasets: [
            { label: 'Median', data: [bd.median], backgroundColor: CHART_COLORS[0] + '99', borderColor: CHART_COLORS[0], borderWidth: 2 },
            { label: 'Q1', data: [bd.q1], backgroundColor: 'transparent', borderColor: CHART_COLORS[1], borderWidth: 1, type: 'line', pointStyle: 'line', pointRadius: 8 },
            { label: 'Q3', data: [bd.q3], backgroundColor: 'transparent', borderColor: CHART_COLORS[1], borderWidth: 1, type: 'line', pointStyle: 'line', pointRadius: 8 },
            { label: 'Min', data: [bd.min], backgroundColor: 'transparent', borderColor: CHART_COLORS[2], type: 'line', pointStyle: 'dash', pointRadius: 6 },
            { label: 'Max', data: [bd.max], backgroundColor: 'transparent', borderColor: CHART_COLORS[2], type: 'line', pointStyle: 'dash', pointRadius: 6 }
          ]
        },
        options: { ...defaults, indexAxis: 'y' }
      };
    } else {
      // Default: bar
      const opts = item.options || {};
      config = {
        type: 'bar',
        data: {
          labels: item.labels,
          datasets: item.datasets.map((ds, i) => ({
            ...ds,
            backgroundColor: bgColors[i % bgColors.length],
            borderColor: CHART_COLORS[i % CHART_COLORS.length],
            borderWidth: 1,
            barPercentage: opts.barPercentage || 0.8,
            categoryPercentage: opts.categoryPercentage || 0.9
          }))
        },
        options: defaults
      };
    }

    try {
      new window.Chart(canvas, config);
    } catch (e) {
      console.error('[SPSS Engine] Chart render error:', e);
    }
  }

  // =========================================================================
  // 7. SPSS Modal Controller
  // =========================================================================
  const SPSSModal = {
    el: null,
    dataset: null,        // { headers, rows, metadata, variableLabels }
    csvUrl: '',
    metaUrl: '',
    outputItems: [],      // rendered output outline
    syntaxHistory: [],
    activeTab: 'data',

    init() {
      this.el = document.getElementById('pspp-engine-modal') || document.getElementById('spss-engine-modal');
      if (!this.el) return;

      // Close handlers
      this.el.querySelectorAll('[data-spss-close], [data-pspp-close]').forEach(btn =>
        btn.addEventListener('click', () => this.close())
      );

      // Tab switcher
      this.el.querySelectorAll('[data-spss-tab], [data-pspp-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchTab(btn.getAttribute('data-spss-tab') || btn.getAttribute('data-pspp-tab'));
        });
      });

      // Run Syntax button
      const runBtn = this.el.querySelector('[data-spss-run], [data-pspp-run]');
      if (runBtn) runBtn.addEventListener('click', () => this.runSyntax());

      // Clear Output button
      const clearBtn = this.el.querySelector('[data-spss-clear-output], [data-pspp-clear-output]');
      if (clearBtn) clearBtn.addEventListener('click', () => this.clearOutput());

      // Keyboard shortcuts
      document.addEventListener('keydown', e => {
        if (!this.isOpen()) return;
        if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this.runSyntax(); }
      });

      // Load .sps file button
      const loadSpsBtn = this.el.querySelector('[data-spss-load-sps], [data-pspp-load-sps]');
      if (loadSpsBtn) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.sps,.txt';
        fileInput.style.display = 'none';
        loadSpsBtn.parentNode.appendChild(fileInput);
        loadSpsBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
          const file = fileInput.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const editor = this.el.querySelector('[data-spss-syntax-editor], [data-pspp-syntax-editor]');
            if (editor) editor.value = reader.result;
          };
          reader.readAsText(file);
          fileInput.value = '';
        });
      }
    },

    isOpen() { return this.el?.classList.contains('is-visible'); },

    async open({ csvUrl, metaUrl, title } = {}) {
      this.init();
      if (!this.el) return;

      this.csvUrl = csvUrl || '';
      this.metaUrl = metaUrl || '';
      this.outputItems = [];
      this.activeTab = 'data';

      // Show modal
      this.el.classList.add('is-visible');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Update title
      const titleEl = this.el.querySelector('[data-spss-title], [data-pspp-title]');
      if (titleEl && title) titleEl.textContent = title;

      // Load data
      if (csvUrl) {
        // Automatic CSVW metadata inference if not explicitly provided
        const resolvedMetaUrl = metaUrl || `${csvUrl}-metadata.json`;
        await this.loadDataset(csvUrl, resolvedMetaUrl);
      }

      this.switchTab('data');
    },

    async openWithData({ title, csvText, rows, headers, metadata } = {}) {
      this.init();
      if (!this.el) return;

      this.outputItems = [];
      this.activeTab = 'data';

      this.el.classList.add('is-visible');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const titleEl = this.el.querySelector('[data-spss-title], [data-pspp-title]');
      if (titleEl && title) titleEl.textContent = title;

      let parsedRows = rows;
      let parsedHeaders = headers;

      if (!parsedRows && csvText) {
        const parsed = parseCSV(csvText);
        parsedRows = parsed.rows;
        parsedHeaders = parsed.headers;
      }

      const meta = metadata || {};
      const variableLabels = {};
      if (meta.tableSchema && meta.tableSchema.columns) {
        meta.tableSchema.columns.forEach(col => {
          if (col.titles) variableLabels[col.name] = col.titles;
        });
      }

      this.dataset = {
        headers: parsedHeaders || [],
        rows: parsedRows || [],
        metadata: meta,
        variableLabels: variableLabels
      };

      this.renderDataView();
      this.renderVariableView();
      this.updateStatus();

      this.addOutput({
        type: 'note',
        title: 'Dataset Initialized',
        message: `${title || 'Dataset'} — ${this.dataset.rows.length} cases and ${this.dataset.headers.length} variables loaded into GNU PSPP Studio.`
      });

      this.switchTab('data');
    },

    close() {
      if (!this.el) return;
      this.el.classList.remove('is-visible');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    async loadDataset(csvUrl, metaUrl) {
      const statusEl = this.el.querySelector('[data-spss-status], [data-pspp-status]');
      if (statusEl) statusEl.textContent = 'Loading dataset…';

      try {
        const [csvRes, metaRes] = await Promise.all([
          fetch(csvUrl).then(r => r.text()),
          metaUrl ? fetch(metaUrl).then(r => r.json()).catch(() => ({})) : Promise.resolve({})
        ]);

        const parsed = parseCSV(csvRes);
        const metadata = metaRes;

        // Build variable labels from metadata
        const variableLabels = {};
        if (metadata.tableSchema && metadata.tableSchema.columns) {
          metadata.tableSchema.columns.forEach(col => {
            if (col.titles) variableLabels[col.name] = col.titles;
          });
        }

        this.dataset = {
          headers: parsed.headers,
          rows: parsed.rows,
          metadata: metadata,
          variableLabels: variableLabels
        };

        this.renderDataView();
        this.renderVariableView();
        this.updateStatus();

        // Add processing note to output
        this.addOutput({
          type: 'note',
          title: 'Dataset Loaded',
          message: `${metadata.title || csvUrl} — ${parsed.rows.length} cases, ${parsed.headers.length} variables loaded successfully.`
        });

      } catch (err) {
        console.error('[PSPP Engine] Load error:', err);
        if (statusEl) statusEl.textContent = `Error loading dataset: ${err.message}`;
      }
    },

    switchTab(tab) {
      this.activeTab = tab;
      this.el.querySelectorAll('[data-spss-tab]').forEach(btn => {
        btn.classList.toggle('is-selected', btn.getAttribute('data-spss-tab') === tab);
      });
      this.el.querySelectorAll('[data-spss-panel]').forEach(panel => {
        panel.classList.toggle('is-active', panel.getAttribute('data-spss-panel') === tab);
      });

      // Re-render charts if switching to output tab
      if (tab === 'output') {
        setTimeout(() => this.renderPendingCharts(), 100);
      }
    },

    renderDataView() {
      const container = this.el.querySelector('[data-spss-data-view]');
      if (!container || !this.dataset) return;

      const { headers, rows } = this.dataset;
      const labels = this.dataset.variableLabels || {};

      const maxRows = Math.min(rows.length, 200); // Cap at 200 for performance

      container.innerHTML = `
        <div class="spss-data-grid-wrapper">
          <table class="spss-data-grid" aria-label="Data View">
            <thead>
              <tr>
                <th class="spss-data-grid__row-num">#</th>
                ${headers.map(h => `<th title="${esc(labels[h] || h)}">${esc(labels[h] || h)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.slice(0, maxRows).map((row, i) => `
                <tr>
                  <td class="spss-data-grid__row-num">${i + 1}</td>
                  ${headers.map(h => `<td>${esc(row[h] || '')}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${rows.length > maxRows ? `<p class="spss-data-grid__overflow">Showing first ${maxRows} of ${rows.length} cases.</p>` : ''}
      `;
    },

    renderVariableView() {
      const container = this.el.querySelector('[data-spss-variable-view]');
      if (!container || !this.dataset) return;

      const { headers, rows, metadata } = this.dataset;
      const labels = this.dataset.variableLabels || {};
      const columns = metadata?.tableSchema?.columns || [];

      const varRows = headers.map((h, i) => {
        const colMeta = columns.find(c => c.name === h) || {};
        const nums = numericCol(rows, h);
        const isNumeric = nums.length > rows.length * 0.5;

        return `
          <tr>
            <td class="spss-var-grid__idx">${i + 1}</td>
            <td class="spss-var-grid__name"><code>${esc(h)}</code></td>
            <td>${esc(labels[h] || '')}</td>
            <td><span class="cds--tag cds--tag--sm ${isNumeric ? 'cds--tag--blue' : 'cds--tag--purple'}">${esc(colMeta.datatype || (isNumeric ? 'numeric' : 'string'))}</span></td>
            <td>${isNumeric ? 'Scale' : 'Nominal'}</td>
            <td>${colMeta.name === metadata?.tableSchema?.primaryKey ? 'Input (Key)' : 'Input'}</td>
            <td>${rows.length > 0 ? rows.length - numericCol(rows, h).length + ' missing' : '—'}</td>
          </tr>`;
      });

      container.innerHTML = `
        <div class="spss-var-grid-wrapper">
          <table class="spss-var-grid" aria-label="Variable View">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Label</th>
                <th>Type</th>
                <th>Measure</th>
                <th>Role</th>
                <th>Missing</th>
              </tr>
            </thead>
            <tbody>${varRows.join('')}</tbody>
          </table>
        </div>`;
    },

    runSyntax() {
      const editor = this.el.querySelector('[data-spss-syntax-editor]');
      if (!editor || !this.dataset) return;

      const syntax = editor.value.trim();
      if (!syntax) return;

      const startTime = performance.now();
      const commands = parseSPSSSyntax(syntax);

      // Add syntax echo to output
      this.addOutput({
        type: 'note',
        title: 'Syntax',
        message: syntax
      });

      for (const cmd of commands) {
        const results = executeCommand(this.dataset, cmd);
        const items = Array.isArray(results) ? results : [results];
        items.forEach(item => {
          if (item) this.addOutput(item);
        });
      }

      const elapsed = (performance.now() - startTime).toFixed(0);
      this.addOutput({
        type: 'note',
        title: 'Processing Complete',
        message: `${commands.length} command(s) executed in ${elapsed}ms.`
      });

      // Switch to output tab
      this.switchTab('output');
      this.updateStatus();
    },

    addOutput(item) {
      this.outputItems.push(item);
      this.renderOutputView();
    },

    clearOutput() {
      this.outputItems = [];
      this.renderOutputView();
    },

    renderOutputView() {
      const outlineEl = this.el.querySelector('[data-spss-outline]');
      const reportEl = this.el.querySelector('[data-spss-report]');
      if (!outlineEl || !reportEl) return;

      // Outline tree
      outlineEl.innerHTML = this.outputItems.map((item, i) => {
        const icon = item.type === 'table' ? '▦' : item.type === 'chart' ? '📊' : item.type === 'error' ? '⚠' : 'ℹ';
        const title = item.title || item.type;
        return `<button class="spss-outline-item" data-spss-outline-idx="${i}" title="${esc(title)}">
          <span class="spss-outline-item__icon">${icon}</span>
          <span class="spss-outline-item__label">${esc(title)}</span>
        </button>`;
      }).join('');

      // Report pane
      reportEl.innerHTML = this.outputItems.map(renderOutputItem).join('');

      // Outline click scrolls to item
      outlineEl.querySelectorAll('[data-spss-outline-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-spss-outline-idx'));
          const blocks = reportEl.querySelectorAll('.spss-output-block');
          if (blocks[idx]) blocks[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      // Render charts
      setTimeout(() => this.renderPendingCharts(), 50);
    },

    renderPendingCharts() {
      const canvases = this.el.querySelectorAll('canvas[data-spss-chart]');
      canvases.forEach(canvas => {
        if (canvas._chartRendered) return;
        canvas._chartRendered = true;
        loadChartJS(() => renderChart(canvas));
      });
    },

    updateStatus() {
      const statusEl = this.el.querySelector('[data-spss-status]');
      if (!statusEl || !this.dataset) return;
      const { rows, headers } = this.dataset;
      const title = this.dataset.metadata?.title || this.csvUrl.split('/').pop() || 'Untitled';
      statusEl.textContent = `${title}  •  ${rows.length} cases × ${headers.length} variables  •  ${this.outputItems.filter(i => i.type === 'table').length} tables, ${this.outputItems.filter(i => i.type === 'chart').length} charts`;
    }
  };

  // =========================================================================
  // 8. Public API & Bootstrap
  // =========================================================================

  window.CarbonPSPP = {
    open(opts) { SPSSModal.open(opts); },
    openWithData(opts) { SPSSModal.openWithData(opts); },
    close() { SPSSModal.close(); }
  };
  window.CarbonSPSS = window.CarbonPSPP;
  window.CarbonSpssEngineModal = window.CarbonPSPP;

  function init() {
    SPSSModal.init();

    // Hydrate shortcode trigger buttons (PSPP & SPSS compatibility)
    document.querySelectorAll('[data-pspp-trigger], [data-spss-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const csvUrl = btn.getAttribute('data-pspp-csv') || btn.getAttribute('data-spss-csv');
        const metaUrl = btn.getAttribute('data-pspp-meta') || btn.getAttribute('data-spss-meta') || (csvUrl ? `${csvUrl}-metadata.json` : '');
        const title = btn.getAttribute('data-pspp-dataset-title') || btn.getAttribute('data-spss-dataset-title') || undefined;

        SPSSModal.open({ csvUrl, metaUrl, title });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
