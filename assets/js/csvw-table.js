/**
 * IBM Carbon Design System v11 — W3C CSVW Interactive Tabular Data Engine
 * Fully aligned with Carbon React DataTable component hierarchy & standards.
 * Powered by asynchronous Web Workers with GNU PSPP statistical suite integration,
 * Variable View metadata editor, live descriptive analytics, summary rows (totals/averages),
 * dynamic KPI telemetry bindings, and GeoJSON spatial coordination.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Worker Instance Pool / Manager with Full Synchronous Main-Thread Engine
  // -------------------------------------------------------------------------
  let workerInstance = null;
  let workerSupported = typeof window.Worker !== 'undefined';
  let activeWorkerUrl = '/js/workers/csvw-worker.js';
  const pendingWorkerCallbacks = new Map();
  const pendingWorkerMessages = new Map();
  let workerMsgId = 0;

  // Synchronous CSV Parser Fallback (RFC 4180 compliant)
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
        if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        rowObj[h] = val;
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  }

  // Synchronous Descriptive Statistics (SPSS/PSPP standard)
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

    const q1 = nums[Math.floor(n * 0.25)];
    const median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)];
    const q3 = nums[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

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
        if (expected > 0) chiSquare += Math.pow(observed - expected, 2) / expected;
      });
    });

    const df = (rowCategories.length - 1) * (colCategories.length - 1);
    return { rowName, colName, rowCategories, colCategories, table, rowTotals, colTotals, grandTotal, chiSquare: Number(chiSquare.toFixed(4)), df };
  }

  function computeCorrelation(xVals, yVals, xName = 'X', yName = 'Y') {
    const pairs = [];
    for (let i = 0; i < Math.min(xVals.length, yVals.length); i++) {
      const x = parseFloat(String(xVals[i]).replace(/[^0-9.-]+/g, ''));
      const y = parseFloat(String(yVals[i]).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(x) && !isNaN(y)) pairs.push([x, y]);
    }
    const n = pairs.length;
    if (n < 2) return null;

    const sumX = pairs.reduce((acc, p) => acc + p[0], 0);
    const sumY = pairs.reduce((acc, p) => acc + p[1], 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    let num = 0, denX = 0, denY = 0;
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
    const tStat = r2 < 1 ? (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r2) : 0;

    return { n, r: Number(r.toFixed(4)), r2: Number(r2.toFixed(4)), tStat: Number(tStat.toFixed(4)), slope: Number(slope.toFixed(4)), intercept: Number(intercept.toFixed(4)), xName, yName };
  }

  function executeFallback(msg) {
    if (!msg || !msg.type) return { fallback: true };
    switch (msg.type) {
      case 'PARSE_CSV': {
        const parsed = parseCSV(msg.csvText, msg.delimiter || ',');
        return {
          type: 'PARSE_CSV_RESULT',
          id: msg.id,
          headers: parsed.headers,
          rows: parsed.rows,
          fallback: true
        };
      }
      case 'COMPUTE_DESCRIPTIVES': {
        const results = {};
        if (msg.columns && typeof msg.columns === 'object') {
          Object.keys(msg.columns).forEach(col => {
            results[col] = computeDescriptives(msg.columns[col]);
          });
        }
        return {
          type: 'DESCRIPTIVES_RESULT',
          id: msg.id,
          results,
          fallback: true
        };
      }
      case 'FILTER_SORT': {
        let filtered = Array.isArray(msg.rows) ? [...msg.rows] : [];
        if (msg.query) {
          const q = msg.query.toLowerCase().trim();
          filtered = filtered.filter(row =>
            Object.keys(row).some(k => !k.startsWith('_') && String(row[k] ?? '').toLowerCase().includes(q))
          );
        }
        if (msg.columnFilters && typeof msg.columnFilters === 'object') {
          Object.keys(msg.columnFilters).forEach(col => {
            const val = msg.columnFilters[col]?.toLowerCase().trim();
            if (val) {
              filtered = filtered.filter(row => String(row[col] ?? '').toLowerCase().includes(val));
            }
          });
        }
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
        return {
          type: 'FILTER_SORT_RESULT',
          id: msg.id,
          rows: filtered,
          totalFiltered: filtered.length,
          fallback: true
        };
      }
      case 'COMPUTE_FREQUENCIES': {
        const results = computeFrequencies(msg.values || []);
        return {
          type: 'FREQUENCIES_RESULT',
          id: msg.id,
          column: msg.column,
          results,
          fallback: true
        };
      }
      case 'COMPUTE_CROSSTAB': {
        const results = computeCrosstab(msg.rowVals || [], msg.colVals || [], msg.rowName, msg.colName);
        return {
          type: 'CROSSTAB_RESULT',
          id: msg.id,
          results,
          fallback: true
        };
      }
      case 'COMPUTE_CORRELATION': {
        const results = computeCorrelation(msg.xVals || [], msg.yVals || [], msg.xName, msg.yName);
        return {
          type: 'CORRELATION_RESULT',
          id: msg.id,
          xName: msg.xName,
          yName: msg.yName,
          results,
          fallback: true
        };
      }
      default:
        return { type: msg.type + '_RESULT', fallback: true };
    }
  }

  function getWorker(customUrl) {
    if (!workerSupported) return null;
    const targetUrl = customUrl || activeWorkerUrl;
    if (!workerInstance || (customUrl && customUrl !== activeWorkerUrl)) {
      if (workerInstance) {
        try { workerInstance.terminate(); } catch (_) {}
      }
      activeWorkerUrl = targetUrl;
      try {
        workerInstance = new Worker(targetUrl);
        workerInstance.onmessage = function (e) {
          const data = e.data;
          if (data && data.id && pendingWorkerCallbacks.has(data.id)) {
            const cb = pendingWorkerCallbacks.get(data.id);
            pendingWorkerCallbacks.delete(data.id);
            pendingWorkerMessages.delete(data.id);
            cb(data);
          }
        };
        workerInstance.onerror = function (err) {
          console.warn('[CSVW Engine] Worker error, falling back to main thread:', err);
          workerSupported = false;
          // Immediately resolve all pending callbacks using synchronous fallback
          for (const [id, cb] of pendingWorkerCallbacks.entries()) {
            const pendingMsg = pendingWorkerMessages.get(id);
            pendingWorkerCallbacks.delete(id);
            pendingWorkerMessages.delete(id);
            if (pendingMsg) cb(executeFallback(pendingMsg));
          }
          if (workerInstance) {
            try { workerInstance.terminate(); } catch (_) {}
            workerInstance = null;
          }
        };
      } catch (err) {
        console.warn('[CSVW Engine] Could not initialize Web Worker, using main thread fallback:', err);
        workerSupported = false;
        return null;
      }
    }
    return workerInstance;
  }

  function postToWorker(msg, customUrl) {
    return new Promise(resolve => {
      const worker = getWorker(customUrl);
      if (worker && workerSupported) {
        const id = `msg-${++workerMsgId}`;
        msg.id = id;

        let timeoutId = null;
        const wrappedCallback = (res) => {
          if (timeoutId) clearTimeout(timeoutId);
          pendingWorkerCallbacks.delete(id);
          pendingWorkerMessages.delete(id);
          resolve(res);
        };

        // 2-second watchdog guard: if worker hangs or network stalls, fall back to synchronous execution
        timeoutId = setTimeout(() => {
          console.warn(`[CSVW Engine] Worker timeout on ${msg.type} after 2000ms, using main-thread fallback.`);
          workerSupported = false;
          wrappedCallback(executeFallback(msg));
        }, 2000);

        pendingWorkerCallbacks.set(id, wrappedCallback);
        pendingWorkerMessages.set(id, msg);
        try {
          worker.postMessage(msg);
        } catch (postErr) {
          console.warn('[CSVW Engine] Failed to post message to worker, using fallback:', postErr);
          wrappedCallback(executeFallback(msg));
        }
      } else {
        // Fallback for environments where Web Workers are disabled or unavailable
        resolve(executeFallback(msg));
      }
    });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  // -------------------------------------------------------------------------
  // 2. CSVW Table Controller Constructor
  // -------------------------------------------------------------------------
  class CsvwTableController {
    constructor(container) {
      this.container = container;
      this.workerUrl = container.getAttribute('data-worker-url') || '/js/workers/csvw-worker.js';
      this.csvUrl = container.getAttribute('data-csv');
      this.metaUrl = container.getAttribute('data-metadata');
      this.title = container.getAttribute('data-title') || 'CSVW Interactive Data Explorer';
      this.description = container.getAttribute('data-description') || 'W3C CSV on the Web (CSVW) Tabular Dataset';
      
      // Parse Features
      const featAttr = container.getAttribute('data-features') || 'stats,variableView,pspp,export,search,filter,pagination';
      this.features = new Set(featAttr.split(',').map(f => f.trim().toLowerCase()));
      if (this.features.has('spss')) this.features.add('pspp');

      // Selected Variables / Columns filter
      const varsAttr = container.getAttribute('data-variables');
      this.selectedVariables = varsAttr ? varsAttr.split(',').map(v => v.trim()).filter(Boolean) : null;

      // Summary Row: "totals" | "averages" | "both" | "none"
      this.summaryRowMode = (container.getAttribute('data-summary-row') || 'none').toLowerCase();

      this.rawCsv = '';
      this.metadata = {};
      this.headers = [];
      this.rows = [];
      this.filteredRows = [];

      // State
      this.activeTab = 'data'; // 'data' | 'variables' | 'stats'
      this.currentPage = 1;
      this.pageSize = parseInt(container.getAttribute('data-page-size'), 10) || 10;
      this.sortColumn = null;
      this.sortDirection = 'asc';
      this.searchQuery = '';
      this.columnFilters = {};
      this.descriptives = null;
      this.selectedRow = null;

      // Render initial Carbon Skeleton state while initializing
      this.renderSkeleton();
      this.init();
    }

    renderSkeleton() {
      this.container.innerHTML = `
        <div class="carbon-csvw-suite cds--data-table-container">
          <div class="cds--data-table-header">
            <div class="cds--skeleton__text cds--skeleton__text--heading" style="width: 40%;"></div>
            <div class="cds--skeleton__text" style="width: 60%;"></div>
          </div>
          <div class="cds--table-toolbar" style="margin-bottom: 1rem;">
            <div class="cds--skeleton__placeholder" style="height: 32px; width: 240px;"></div>
          </div>
          <table class="cds--data-table cds--data-table--skeleton">
            <thead>
              <tr>
                <th><div class="cds--skeleton__text" style="width: 30px;"></div></th>
                <th><div class="cds--skeleton__text" style="width: 120px;"></div></th>
                <th><div class="cds--skeleton__text" style="width: 100px;"></div></th>
                <th><div class="cds--skeleton__text" style="width: 80px;"></div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="4"><div class="cds--skeleton__text" style="width: 100%;"></div></td></tr>
              <tr><td colspan="4"><div class="cds--skeleton__text" style="width: 90%;"></div></td></tr>
              <tr><td colspan="4"><div class="cds--skeleton__text" style="width: 95%;"></div></td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    async init() {
      // 1. Check embedded data
      const embeddedCsv = this.container.querySelector('.raw-csv-data');
      const embeddedMeta = this.container.querySelector('.raw-meta-data');

      if (embeddedMeta && embeddedMeta.textContent) {
        try { this.metadata = JSON.parse(embeddedMeta.textContent.trim()); } catch (_) {}
      }
      if (embeddedCsv && embeddedCsv.textContent) {
        this.rawCsv = embeddedCsv.textContent.trim();
      }

      // 2. Fetch CSV if needed
      if (!this.rawCsv && this.csvUrl) {
        try {
          const res = await fetch(this.csvUrl);
          if (res.ok) {
            this.rawCsv = (await res.text()).trim();
          } else {
            console.error(`[CSVW] Failed to load CSV file from ${this.csvUrl}: HTTP ${res.status} ${res.statusText}`);
          }
        } catch (e) {
          console.error('[CSVW] Failed to load CSV file:', e);
        }
      }

      // 3. Automatic CSVW Metadata Resolution if not explicitly supplied
      const resolvedMetaUrl = this.metaUrl || (this.csvUrl ? `${this.csvUrl}-metadata.json` : '');
      if (Object.keys(this.metadata).length === 0 && resolvedMetaUrl) {
        try {
          const res = await fetch(resolvedMetaUrl);
          if (res.ok) {
            this.metadata = await res.json();
          }
        } catch (e) {
          // Non-blocking: table still operates gracefully
        }
      }

      // 4. Parse CSV with Web Worker (or synchronous fallback)
      if (this.rawCsv) {
        try {
          const parsed = await postToWorker({
            type: 'PARSE_CSV',
            csvText: this.rawCsv,
            delimiter: ','
          }, this.workerUrl);
          this.headers = parsed.headers || [];
          this.rows = parsed.rows || [];
          this.filteredRows = [...this.rows];
        } catch (parseErr) {
          console.warn('[CSVW] Worker parsing error, executing fallback:', parseErr);
          const fallbackParsed = parseCSV(this.rawCsv, ',');
          this.headers = fallbackParsed.headers || [];
          this.rows = fallbackParsed.rows || [];
          this.filteredRows = [...this.rows];
        }
      }

      // 5. Compute Statistics in Web Worker
      try {
        await this.computeStats();
      } catch (statsErr) {
        console.warn('[CSVW] computeStats error:', statsErr);
      }

      // 6. Update any linked KPI cards in DOM
      try {
        this.updateLinkedKPIs();
      } catch (kpiErr) {
        console.warn('[CSVW] updateLinkedKPIs error:', kpiErr);
      }

      // 7. Render Full Component
      try {
        this.render();
      } catch (renderErr) {
        console.error('[CSVW] render error:', renderErr);
      }

      // 8. Listen for GeoJSON Map events
      window.addEventListener('carbon:map-marker-click', e => {
        if (e.detail && e.detail.properties) {
          const name = e.detail.properties.name || e.detail.properties.id || e.detail.properties.city || '';
          if (name) {
            this.searchQuery = name;
            this.currentPage = 1;
            this.applyFilterAndRender();
          }
        }
      });
    }

    async computeStats() {
      const numericColumns = {};
      this.headers.forEach(h => {
        const vals = this.rows.map(r => r[h]);
        numericColumns[h] = vals;
      });

      const res = await postToWorker({
        type: 'COMPUTE_DESCRIPTIVES',
        columns: numericColumns
      }, this.workerUrl);

      if (res && res.results) {
        this.descriptives = res.results;
      }
    }

    updateLinkedKPIs() {
      if (!this.descriptives) return;
      if (!this.searchQuery && Object.keys(this.columnFilters).length === 0) return;

      const suiteRoot = this.container.closest('[data-analytics-suite]') || this.container.closest('.carbon-dashboard') || document;

      suiteRoot.querySelectorAll('[data-kpi-variable]').forEach(kpiEl => {
        const varName = kpiEl.getAttribute('data-kpi-variable');
        const calcType = (kpiEl.getAttribute('data-kpi-calc') || 'mean').toLowerCase();
        const prefix = kpiEl.getAttribute('data-kpi-prefix') || '';
        const suffix = kpiEl.getAttribute('data-kpi-suffix') || '';

        const stat = this.descriptives[varName];
        let val = '—';

        if (stat) {
          if (calcType === 'sum') val = stat.sum.toLocaleString();
          else if (calcType === 'mean' || calcType === 'avg') val = stat.mean.toLocaleString();
          else if (calcType === 'count') val = stat.n.toLocaleString();
          else if (calcType === 'median') val = stat.median.toLocaleString();
          else if (calcType === 'min') val = stat.min.toLocaleString();
          else if (calcType === 'max') val = stat.max.toLocaleString();
          else if (calcType === 'stddev') val = stat.stdDev.toLocaleString();
        } else if (calcType === 'count') {
          val = this.filteredRows.length.toLocaleString();
        }

        const valEl = kpiEl.querySelector('.carbon-kpi-tile__value, [data-kpi-val]');
        if (valEl) {
          valEl.textContent = `${prefix}${val}${suffix}`;
        }
      });
    }

    async applyFilterAndRender() {
      const res = await postToWorker({
        type: 'FILTER_SORT',
        rows: this.rows,
        query: this.searchQuery,
        columnFilters: this.columnFilters,
        sortColumn: this.sortColumn,
        sortDirection: this.sortDirection
      }, this.workerUrl);

      this.filteredRows = res.rows || [];
      this.renderBodyAndPagination();
    }

    render() {
      this.container.innerHTML = `
        <div class="carbon-csvw-suite cds--data-table-container">
          ${this.renderHeader()}
          ${this.renderToolbar()}
          <div class="carbon-csvw-content-area">
            ${this.activeTab === 'data' ? this.renderDataView() : ''}
            ${this.activeTab === 'variables' ? this.renderVariableView() : ''}
            ${this.activeTab === 'stats' ? this.renderStatsView() : ''}
          </div>
          ${this.activeTab === 'data' ? this.renderPagination() : ''}
        </div>
      `;

      this.bindEvents();
    }

    renderHeader() {
      return `
        <div class="cds--data-table-header">
          <div class="carbon-csvw-header-meta">
            <h3 class="cds--data-table-header__title">${escapeHtml(this.title)}</h3>
            <p class="cds--data-table-header__description">${escapeHtml(this.description)}</p>
          </div>
          <div class="carbon-csvw-header-actions" style="display: flex; gap: 1rem; align-items: center;">
            ${this.features.has('variableview') ? `
              <div class="cds--content-switcher cds--content-switcher--sm" role="tablist" aria-label="Table View Selector" style="margin: 0;">
                <button type="button" class="cds--content-switcher__btn carbon-csvw-tab-btn ${this.activeTab === 'data' ? 'cds--content-switcher--selected is-selected' : ''}" data-tab="data" role="tab" aria-selected="${this.activeTab === 'data'}">Data View</button>
                <button type="button" class="cds--content-switcher__btn carbon-csvw-tab-btn ${this.activeTab === 'variables' ? 'cds--content-switcher--selected is-selected' : ''}" data-tab="variables" role="tab" aria-selected="${this.activeTab === 'variables'}">Variable View</button>
                ${this.features.has('stats') ? `
                  <button type="button" class="cds--content-switcher__btn carbon-csvw-tab-btn ${this.activeTab === 'stats' ? 'cds--content-switcher--selected is-selected' : ''}" data-tab="stats" role="tab" aria-selected="${this.activeTab === 'stats'}">Descriptives</button>
                ` : ''}
              </div>
            ` : ''}

            ${(this.features.has('pspp') || this.features.has('spss')) ? `
              <button type="button" class="cds--btn cds--btn--sm cds--btn--secondary carbon-csvw-spss-btn" data-action="open-pspp" title="Open dataset in GNU PSPP Statistical Analysis Studio">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M4 4h4v24H4zm8 8h4v16h-4zm8-4h4v20h-4zm8 10h4v10h-4z"/></svg>
                <span>PSPP Studio</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    renderToolbar() {
      return `
        <section class="cds--table-toolbar" role="toolbar" aria-label="Data table toolbar">
          <div class="cds--table-toolbar-content" style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
            ${this.features.has('search') ? `
              <div class="cds--table-toolbar-search cds--search cds--search--sm">
                <label id="search-label-${this.title}" class="cds--label" for="search-input-${this.title}">Search</label>
                <input type="text" class="cds--search-input csvw-search-input" id="search-input-${this.title}" placeholder="Search dataset (Web Worker)..." value="${escapeHtml(this.searchQuery)}" aria-label="Search dataset">
                <svg class="cds--search-magnifier" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15 13.9L11.4 10.3C12.4 9.1 13 7.6 13 6c0-3.9-3.1-7-7-7S-1 2.1-1 6s3.1 7 7 7c1.6 0 3.1-.6 4.3-1.6l3.6 3.6 1.1-1.1zM1 6c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z"/>
                </svg>
                ${this.searchQuery ? `
                  <button class="cds--search-close" type="button" aria-label="Clear search">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"/></svg>
                  </button>
                ` : ''}
              </div>
            ` : '<div></div>'}

            <div class="cds--table-toolbar-actions" style="display: flex; gap: 0.5rem; align-items: center;">
              ${this.csvUrl ? `
                <a href="${escapeHtml(this.csvUrl)}" download class="cds--btn cds--btn--ghost cds--btn--sm" title="Download source CSV file">
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zM6 12l1.4 1.4L15 18.2V2h2v16.2l7.6-7.6L26 12 16 22 6 12z"/></svg>
                  <span>CSV</span>
                </a>
              ` : ''}
              ${this.csvUrl || this.metaUrl ? `
                <a href="${escapeHtml(this.metaUrl || (this.csvUrl + '-metadata.json'))}" download class="cds--btn cds--btn--ghost cds--btn--sm" title="Download W3C CSVW Schema Metadata (JSON-LD)">
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor"><path d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zM6 12l1.4 1.4L15 18.2V2h2v16.2l7.6-7.6L26 12 16 22 6 12z"/></svg>
                  <span>CSVW Meta</span>
                </a>
              ` : ''}
            </div>
          </div>
        </section>
      `;
    }

    renderDataView() {
      const columns = this.getColumns();
      const totalItems = this.filteredRows.length;
      const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
      if (this.currentPage > totalPages) this.currentPage = totalPages;
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const paginatedRows = this.filteredRows.slice(startIndex, startIndex + this.pageSize);

      return `
        <div class="cds--table-wrapper carbon-csvw-table-wrapper">
          <table class="cds--data-table cds--data-table--zebra cds--data-table--sort" aria-label="${escapeHtml(this.title)}">
            <thead>
              <tr>
                <th scope="col" style="width: 48px; text-align: center; color: var(--cds-text-secondary); font-family: var(--cds-font-mono, monospace);">#</th>
                ${columns.map(col => {
                  const isSorted = this.sortColumn === col.name;
                  return `
                    <th scope="col" aria-sort="${isSorted ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}">
                      <button type="button" class="cds--table-sort is-sortable ${isSorted ? 'cds--table-sort--active' : ''}" data-col="${col.name}">
                        <span class="cds--table-sort__flex">
                          <span class="cds--table-header-label">${escapeHtml(col.title)}</span>
                          <span class="cds--table-sort__icon-container">
                            <svg class="cds--table-sort__icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              ${isSorted && this.sortDirection === 'desc' 
                                ? '<path d="M12.3 9.3L8 13.6 3.7 9.3l.7-.7 3.6 3.6V2h1v10.2l3.6-3.6z"/>'
                                : '<path d="M3.7 6.7L8 2.4l4.3 4.3-.7.7L8 3.8V14H7V3.8L3.4 7.4z"/>'
                              }
                            </svg>
                          </span>
                        </span>
                      </button>
                    </th>
                  `;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${paginatedRows.length === 0 ? `
                <tr>
                  <td colspan="${Math.max(columns.length + 1, 1)}" style="text-align: center; padding: 2.5rem; color: var(--cds-text-secondary);">
                    ${(!this.rawCsv && this.headers.length === 0) 
                      ? (this.csvUrl ? `Unable to load dataset from ${escapeHtml(this.csvUrl)}.` : 'No dataset loaded.') 
                      : 'No matching records found.'}
                  </td>
                </tr>
              ` : paginatedRows.map((row, idx) => `
                <tr class="carbon-csvw-row ${this.selectedRow === row._id ? 'cds--data-table__row--selected is-selected' : ''}" data-row-id="${row._id}">
                  <td style="text-align: center; color: var(--cds-text-secondary); font-family: var(--cds-font-mono, monospace); font-size: 0.75rem;">
                    ${startIndex + idx + 1}
                  </td>
                  ${columns.map(col => {
                    const val = row[col.name] !== undefined ? row[col.name] : '';
                    return `<td>${this.formatCellValue(col, val, row)}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
            ${this.renderSummaryRows(columns)}
          </table>
        </div>
      `;
    }

    renderSummaryRows(columns) {
      if (this.summaryRowMode === 'none' || !this.descriptives) return '';

      const showTotals = this.summaryRowMode === 'totals' || this.summaryRowMode === 'both';
      const showAverages = this.summaryRowMode === 'averages' || this.summaryRowMode === 'both';

      let html = '<tfoot class="carbon-csvw-tfoot">';

      if (showTotals) {
        html += `
          <tr class="carbon-csvw-summary-row carbon-csvw-summary-row--total" style="background-color: var(--cds-layer-02); font-weight: 600; border-top: 2px solid var(--cds-border-subtle-00);">
            <td style="text-align: center; font-size: 0.75rem; color: var(--cds-text-secondary); font-family: var(--cds-font-mono, monospace);">Σ</td>
            ${columns.map((col, idx) => {
              const stat = this.descriptives[col.name];
              if (idx === 0) {
                return `<td><span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.32px; color: var(--cds-text-secondary);">Total</span></td>`;
              }
              if (stat && stat.sum !== undefined) {
                return `<td style="font-family: var(--cds-font-mono, monospace); color: var(--cds-text-primary);">${stat.sum.toLocaleString()}</td>`;
              }
              return `<td style="color: var(--cds-text-helper); font-family: var(--cds-font-mono, monospace);">—</td>`;
            }).join('')}
          </tr>
        `;
      }

      if (showAverages) {
        html += `
          <tr class="carbon-csvw-summary-row carbon-csvw-summary-row--average" style="background-color: var(--cds-layer-02); font-weight: 600; border-top: 1px solid var(--cds-border-subtle-00);">
            <td style="text-align: center; font-size: 0.75rem; color: var(--cds-text-secondary); font-family: var(--cds-font-mono, monospace);">μ</td>
            ${columns.map((col, idx) => {
              const stat = this.descriptives[col.name];
              if (idx === 0) {
                return `<td><span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.32px; color: var(--cds-text-secondary);">Average</span></td>`;
              }
              if (stat && stat.mean !== undefined) {
                return `<td style="font-family: var(--cds-font-mono, monospace); color: var(--cds-interactive-01);">${stat.mean.toLocaleString()}</td>`;
              }
              return `<td style="color: var(--cds-text-helper); font-family: var(--cds-font-mono, monospace);">—</td>`;
            }).join('')}
          </tr>
        `;
      }

      html += '</tfoot>';
      return html;
    }

    renderVariableView() {
      const columns = this.getColumns();

      return `
        <div class="carbon-spss-variable-view cds--table-wrapper">
          <table class="cds--data-table cds--data-table--compact cds--data-table--zebra" aria-label="PSPP Variable View">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Label</th>
                <th scope="col">Decimals</th>
                <th scope="col">Measure</th>
                <th scope="col">Role</th>
                <th scope="col">Align</th>
                <th scope="col">Missing</th>
              </tr>
            </thead>
            <tbody>
              ${columns.map(col => {
                const stat = this.descriptives?.[col.name];
                const isNumeric = stat !== null && stat !== undefined;
                const measure = isNumeric ? 'Scale' : 'Nominal';

                return `
                  <tr>
                    <td style="font-family: var(--cds-font-mono, monospace); font-weight: 600;">${escapeHtml(col.name)}</td>
                    <td><span class="cds--tag cds--tag--sm ${isNumeric ? 'cds--tag--green' : 'cds--tag--purple'}">${isNumeric ? 'Numeric' : 'String'}</span></td>
                    <td>${escapeHtml(col.title)}</td>
                    <td style="font-family: var(--cds-font-mono, monospace);">${isNumeric ? '2' : '0'}</td>
                    <td><span class="cds--tag cds--tag--outline cds--tag--sm">${measure}</span></td>
                    <td><span class="cds--tag cds--tag--outline cds--tag--sm">Input</span></td>
                    <td>${isNumeric ? 'Right' : 'Left'}</td>
                    <td>None</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    renderStatsView() {
      if (!this.descriptives) {
        return `<div style="padding: 2rem; text-align: center; color: var(--cds-text-secondary);">Calculating background statistics with Web Worker...</div>`;
      }

      const colsWithStats = Object.keys(this.descriptives).filter(k => this.descriptives[k] !== null);

      return `
        <div class="carbon-csvw-stats-panel" style="padding: 1rem 0;">
          <h4 class="cds--type-heading-02" style="margin-bottom: 1rem;">Descriptive Statistics Summary (GNU PSPP / Web Worker)</h4>
          <div class="cds--table-wrapper">
            <table class="cds--data-table cds--data-table--compact cds--data-table--zebra" aria-label="Descriptive Statistics">
              <thead>
                <tr>
                  <th scope="col">Variable</th>
                  <th scope="col">N</th>
                  <th scope="col">Mean (μ)</th>
                  <th scope="col">Std. Error (SE)</th>
                  <th scope="col">Std. Deviation (σ)</th>
                  <th scope="col">Variance (σ²)</th>
                  <th scope="col">Min</th>
                  <th scope="col">Max</th>
                  <th scope="col">Median</th>
                  <th scope="col">IQR</th>
                </tr>
              </thead>
              <tbody>
                ${colsWithStats.map(col => {
                  const s = this.descriptives[col];
                  return `
                    <tr>
                      <td style="font-family: var(--cds-font-mono, monospace); font-weight: 600;">${escapeHtml(col)}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.n}</td>
                      <td style="font-family: var(--cds-font-mono, monospace); font-weight: 600; color: var(--cds-interactive-01);">${s.mean}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.stdErr}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.stdDev}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.variance}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.min}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.max}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.median}</td>
                      <td style="font-family: var(--cds-font-mono, monospace);">${s.iqr}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderPagination() {
      const totalItems = this.filteredRows.length;
      const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
      const startIndex = (this.currentPage - 1) * this.pageSize;

      return `
        <div class="cds--pagination" role="navigation" aria-label="Pagination">
          <div class="cds--pagination__left">
            <label class="cds--pagination__text" for="page-size-${this.title}">Items per page:</label>
            <div class="cds--select cds--select--inline">
              <select id="page-size-${this.title}" class="cds--select-input csvw-page-size-select" aria-label="Items per page">
                <option value="5" ${this.pageSize === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
                <option value="25" ${this.pageSize === 25 ? 'selected' : ''}>25</option>
                <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${this.pageSize === 100 ? 'selected' : ''}>100</option>
              </select>
            </div>
            <span class="cds--pagination__text">${totalItems === 0 ? 0 : startIndex + 1}–${Math.min(startIndex + this.pageSize, totalItems)} of ${totalItems} items</span>
          </div>

          <div class="cds--pagination__right">
            <span class="cds--pagination__text">Page ${this.currentPage} of ${totalPages}</span>
            <div class="cds--pagination__control-buttons">
              <button class="cds--btn cds--btn--ghost cds--btn--sm cds--btn--icon-only cds--pagination__button cds--pagination__button--backward csvw-prev-btn" ${this.currentPage <= 1 ? 'disabled' : ''} aria-label="Previous page">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M10 13L4 8l6-5 1.4 1.4L6.8 8l4.6 3.6z"/></svg>
              </button>
              <button class="cds--btn cds--btn--ghost cds--btn--sm cds--btn--icon-only cds--pagination__button cds--pagination__button--forward csvw-next-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} aria-label="Next page">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l6 5-6 5-1.4-1.4L9.2 8 4.6 4.4z"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderBodyAndPagination() {
      const contentArea = this.container.querySelector('.carbon-csvw-content-area');
      if (contentArea) {
        contentArea.innerHTML = this.activeTab === 'data' ? this.renderDataView() : 
                               (this.activeTab === 'variables' ? this.renderVariableView() : this.renderStatsView());
      }
      const paginationArea = this.container.querySelector('.cds--pagination');
      if (paginationArea && this.activeTab === 'data') {
        paginationArea.outerHTML = this.renderPagination();
      }
      this.bindDataEvents();
    }

    getColumns() {
      let rawCols = [];
      if (this.metadata.tableSchema && this.metadata.tableSchema.columns) {
        rawCols = this.metadata.tableSchema.columns.map(col => ({
          name: col.name,
          title: col.titles || col.name,
          datatype: col.datatype || 'string',
          variableStyle: col['cds-variable-style'] || col['cdsVariableStyle'] || null
        }));
      } else {
        rawCols = this.headers.map(h => ({
          name: h,
          title: h,
          datatype: 'string',
          variableStyle: null
        }));
      }

      // Merge any CSV headers not declared in metadata schema
      if (this.headers && this.headers.length > 0) {
        const existingNames = new Set(rawCols.map(c => c.name));
        this.headers.forEach(h => {
          if (!existingNames.has(h)) {
            rawCols.push({ name: h, title: h, datatype: 'string', variableStyle: null });
          }
        });
      }

      if (this.selectedVariables && this.selectedVariables.length > 0) {
        return rawCols.filter(c => this.selectedVariables.includes(c.name));
      }
      return rawCols;
    }

    applyCarbonStyle(val, style) {
      if (!style) return escapeHtml(val);

      // 1. Object specification: { type: 'tag', color: 'green', outline: true } or { class: '...' }
      if (typeof style === 'object') {
        if (style.class) {
          return `<span class="${escapeHtml(style.class)}">${escapeHtml(val)}</span>`;
        }
        const tagType = style.type || 'tag';
        if (tagType === 'tag') {
          const color = style.color || 'gray';
          const size = style.size ? `cds--tag--${style.size}` : 'cds--tag--sm';
          const outline = style.outline ? 'cds--tag--outline' : '';
          return `<span class="cds--tag cds--tag--${escapeHtml(color)} ${size} ${outline}`.trim() + `">${escapeHtml(val)}</span>`;
        }
        if (tagType === 'mono') {
          return `<span style="font-family: var(--cds-font-mono, monospace);">${escapeHtml(val)}</span>`;
        }
        if (tagType === 'code') {
          return `<code class="cds--snippet cds--snippet--inline">${escapeHtml(val)}</code>`;
        }
        if (tagType === 'badge') {
          return `<span class="cds--badge cds--badge--${escapeHtml(style.color || 'blue')}">${escapeHtml(val)}</span>`;
        }
      }

      // 2. String specification: "tag:green", "green", "cds--tag cds--tag--green", "code", "mono"
      if (typeof style === 'string') {
        const s = style.trim();

        // Direct Carbon CSS class
        if (s.startsWith('cds--')) {
          return `<span class="${escapeHtml(s)}">${escapeHtml(val)}</span>`;
        }

        // Tag format: "tag:green", "tag:warm-gray", or shorthand color names "green", "red", etc.
        const tagColorMatch = s.match(/^(?:tag:)?(red|magenta|purple|blue|cyan|teal|green|gray|cool-gray|warm-gray|high-contrast|outline)$/i);
        if (tagColorMatch) {
          const color = tagColorMatch[1].toLowerCase();
          return `<span class="cds--tag cds--tag--${color} cds--tag--sm">${escapeHtml(val)}</span>`;
        }

        // Outline tag format: "outline:green", "tag:outline:blue"
        const outlineMatch = s.match(/^(?:tag:)?outline:([a-z-]+)$/i);
        if (outlineMatch) {
          const color = outlineMatch[1].toLowerCase();
          return `<span class="cds--tag cds--tag--${color} cds--tag--outline cds--tag--sm">${escapeHtml(val)}</span>`;
        }

        // Code / inline snippet
        if (s === 'code' || s === 'snippet') {
          return `<code class="cds--snippet cds--snippet--inline">${escapeHtml(val)}</code>`;
        }

        // Monospace font
        if (s === 'mono' || s === 'monospace') {
          return `<span style="font-family: var(--cds-font-mono, monospace);">${escapeHtml(val)}</span>`;
        }

        // Badge format
        if (s.startsWith('badge')) {
          const bColor = s.includes(':') ? s.split(':')[1].trim() : 'blue';
          return `<span class="cds--badge cds--badge--${escapeHtml(bColor)}">${escapeHtml(val)}</span>`;
        }

        // Bold / strong
        if (s === 'bold' || s === 'strong') return `<strong>${escapeHtml(val)}</strong>`;
        if (s === 'italic' || s === 'em') return `<em>${escapeHtml(val)}</em>`;
      }

      return escapeHtml(val);
    }

    formatCellValue(col, val, row) {
      if (val === '' || val === null || val === undefined) return '<span style="color: var(--cds-text-helper);">—</span>';

      // Check for custom, metadata-driven Carbon Design System variable styles ('cds-variable-style')
      const styleDef = col.variableStyle;
      if (styleDef && (typeof styleDef === 'object' || typeof styleDef === 'string')) {
        let matchedStyle = null;

        if (typeof styleDef === 'object') {
          // Exact match
          if (styleDef[val] !== undefined) {
            matchedStyle = styleDef[val];
          } else {
            // Case-insensitive match
            const strVal = String(val).toLowerCase().trim();
            for (const key of Object.keys(styleDef)) {
              if (key.toLowerCase().trim() === strVal) {
                matchedStyle = styleDef[key];
                break;
              }
            }
          }
          // Default / wildcard fallback
          if (!matchedStyle && (styleDef['*'] !== undefined || styleDef['_default'] !== undefined)) {
            matchedStyle = styleDef['*'] !== undefined ? styleDef['*'] : styleDef['_default'];
          }
        } else if (typeof styleDef === 'string' && styleDef.trim() !== '') {
          matchedStyle = styleDef.trim();
        }

        if (matchedStyle) {
          return this.applyCarbonStyle(val, matchedStyle);
        }
      }

      // When cds-variable-style is empty or unconfigured, ensure no added non-numeric style is added to the variable.
      // Standard numeric formatting is applied only for numeric datatypes per Carbon specs.
      if (col.datatype === 'number' || col.datatype === 'integer' || col.datatype === 'float' || typeof val === 'number') {
        return `<span style="font-family: var(--cds-font-mono, monospace);">${escapeHtml(val)}</span>`;
      }

      return escapeHtml(val);
    }

    bindEvents() {
      // Tab switcher
      this.container.querySelectorAll('.carbon-csvw-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeTab = btn.getAttribute('data-tab');
          this.render();
        });
      });

      // PSPP Modal Trigger
      this.container.querySelector('[data-action="open-pspp"]')?.addEventListener('click', () => {
        if (window.CarbonPSPP) {
          window.CarbonPSPP.openWithData({
            title: this.title,
            csvText: this.rawCsv,
            rows: this.rows,
            headers: this.headers,
            metadata: this.metadata
          });
        }
      });

      // Search input
      const searchInput = this.container.querySelector('.csvw-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          this.searchQuery = e.target.value;
          this.currentPage = 1;
          this.applyFilterAndRender();
        });
      }

      const searchClose = this.container.querySelector('.cds--search-close');
      if (searchClose && searchInput) {
        searchClose.addEventListener('click', () => {
          searchInput.value = '';
          this.searchQuery = '';
          this.currentPage = 1;
          this.applyFilterAndRender();
        });
      }

      this.bindDataEvents();
    }

    bindDataEvents() {
      // Sort columns
      this.container.querySelectorAll('.is-sortable').forEach(th => {
        th.addEventListener('click', () => {
          const colName = th.getAttribute('data-col');
          if (this.sortColumn === colName) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            this.sortColumn = colName;
            this.sortDirection = 'asc';
          }
          this.applyFilterAndRender();
        });
      });

      // Page size select
      const pageSizeSelect = this.container.querySelector('.csvw-page-size-select');
      if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', e => {
          this.pageSize = parseInt(e.target.value, 10);
          this.currentPage = 1;
          this.renderBodyAndPagination();
        });
      }

      // Prev page
      const prevBtn = this.container.querySelector('.csvw-prev-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (this.currentPage > 1) {
            this.currentPage--;
            this.renderBodyAndPagination();
          }
        });
      }

      // Next page
      const nextBtn = this.container.querySelector('.csvw-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const totalPages = Math.ceil(this.filteredRows.length / this.pageSize) || 1;
          if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderBodyAndPagination();
          }
        });
      }

      // Row Selection
      this.container.querySelectorAll('.carbon-csvw-row').forEach(row => {
        row.addEventListener('click', () => {
          const rowId = row.getAttribute('data-row-id');
          this.selectedRow = this.selectedRow === rowId ? null : rowId;
          this.renderBodyAndPagination();
        });
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. Global Bootstrapper
  // -------------------------------------------------------------------------
  function initAllCsvwTables() {
    document.querySelectorAll('.carbon-csvw-table').forEach(el => {
      if (!el.__csvw_controller) {
        el.__csvw_controller = new CsvwTableController(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCsvwTables);
  } else {
    initAllCsvwTables();
  }

  window.initCsvwTables = initAllCsvwTables;
  window.CsvwTableController = CsvwTableController;
})();
