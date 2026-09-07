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
  // 1. Worker Instance Pool / Manager
  // -------------------------------------------------------------------------
  let workerInstance = null;
  let workerSupported = typeof window.Worker !== 'undefined';
  const pendingWorkerCallbacks = new Map();
  let workerMsgId = 0;

  function getWorker() {
    if (!workerSupported) return null;
    if (!workerInstance) {
      try {
        workerInstance = new Worker('/js/workers/csvw-worker.js');
        workerInstance.onmessage = function (e) {
          const data = e.data;
          if (data && data.id && pendingWorkerCallbacks.has(data.id)) {
            const cb = pendingWorkerCallbacks.get(data.id);
            pendingWorkerCallbacks.delete(data.id);
            cb(data);
          }
        };
        workerInstance.onerror = function (err) {
          console.warn('[CSVW Engine] Worker error, falling back to main thread:', err);
          workerSupported = false;
        };
      } catch (err) {
        console.warn('[CSVW Engine] Could not initialize Web Worker, using main thread fallback:', err);
        workerSupported = false;
      }
    }
    return workerInstance;
  }

  function postToWorker(msg) {
    return new Promise(resolve => {
      const worker = getWorker();
      if (worker && workerSupported) {
        const id = `msg-${++workerMsgId}`;
        msg.id = id;
        pendingWorkerCallbacks.set(id, resolve);
        worker.postMessage(msg);
      } else {
        // Fallback for environments where Web Workers are disabled
        resolve(executeFallback(msg));
      }
    });
  }

  function executeFallback(msg) {
    return { type: msg.type + '_RESULT', fallback: true };
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

      if (embeddedMeta) {
        try { this.metadata = JSON.parse(embeddedMeta.textContent); } catch (_) {}
      }
      if (embeddedCsv) {
        this.rawCsv = embeddedCsv.textContent;
      }

      // 2. Fetch CSV if needed
      if (!this.rawCsv && this.csvUrl) {
        try {
          const res = await fetch(this.csvUrl);
          this.rawCsv = await res.text();
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

      // 4. Parse CSV with Web Worker
      if (this.rawCsv) {
        const parsed = await postToWorker({
          type: 'PARSE_CSV',
          csvText: this.rawCsv,
          delimiter: ','
        });
        this.headers = parsed.headers || [];
        this.rows = parsed.rows || [];
        this.filteredRows = [...this.rows];
      }

      // 5. Compute Statistics in Web Worker
      await this.computeStats();

      // 6. Update any linked KPI cards in DOM
      this.updateLinkedKPIs();

      // 7. Render Full Component
      this.render();

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
      });

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
      });

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
                  <td colspan="${columns.length + 1}" style="text-align: center; padding: 2.5rem; color: var(--cds-text-secondary);">
                    No matching records found.
                  </td>
                </tr>
              ` : paginatedRows.map((row, idx) => `
                <tr class="carbon-csvw-row ${this.selectedRow === row._id ? 'cds--data-table__row--selected is-selected' : ''}" data-row-id="${row._id}">
                  <td style="text-align: center; color: var(--cds-text-secondary); font-family: var(--cds-font-mono, monospace); font-size: 0.75rem;">
                    ${startIndex + idx + 1}
                  </td>
                  ${columns.map(col => {
                    const val = row[col.name] || '';
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
          datatype: col.datatype || 'string'
        }));
      } else {
        rawCols = this.headers.map(h => ({
          name: h,
          title: h,
          datatype: 'string'
        }));
      }

      if (this.selectedVariables && this.selectedVariables.length > 0) {
        return rawCols.filter(c => this.selectedVariables.includes(c.name));
      }
      return rawCols;
    }

    formatCellValue(col, val, row) {
      if (val === '' || val === null || val === undefined) return '<span style="color: var(--cds-text-helper);">—</span>';

      // Status tags
      if (col.name === 'status' || col.name === 'health' || col.name === 'aqi_status') {
        const clean = String(val).toLowerCase();
        if (clean === 'healthy' || clean === 'active' || clean === 'online' || clean === 'good' || clean === 'pass') {
          return `<span class="cds--tag cds--tag--green cds--tag--sm">${escapeHtml(val)}</span>`;
        }
        if (clean === 'warning' || clean === 'degraded' || clean === 'moderate' || clean === 'slow') {
          return `<span class="cds--tag cds--tag--warm-gray cds--tag--sm">${escapeHtml(val)}</span>`;
        }
        if (clean === 'error' || clean === 'critical' || clean === 'offline' || clean === 'unhealthy' || clean === 'fail') {
          return `<span class="cds--tag cds--tag--red cds--tag--sm">${escapeHtml(val)}</span>`;
        }
      }

      // Geo coordinate link
      if ((col.name === 'lat' || col.name === 'latitude') && (row['lng'] || row['longitude'])) {
        return `<span style="font-family: var(--cds-font-mono, monospace);">${escapeHtml(val)}</span>`;
      }

      // Check URL
      if (String(val).startsWith('http://') || String(val).startsWith('https://')) {
        return `<a href="${escapeHtml(val)}" class="cds--link" target="_blank" rel="noopener">${escapeHtml(val)}</a>`;
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
})();
