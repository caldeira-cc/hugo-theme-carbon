/**
 * IBM Carbon Design System v11 — Static Dataset Dashboard & Analytics Controller
 * Handles Multi-Widget Coordination, KPI Metrics, Modal Expand, and GeoJSON Leaflet Sync.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Dashboard Modal Manager
  // -------------------------------------------------------------------------
  const CarbonDashboardModal = {
    modalEl: null,
    titleEl: null,
    subtitleEl: null,
    bodyEl: null,

    init() {
      this.modalEl = document.getElementById('carbon-dashboard-modal');
      if (!this.modalEl) return;

      this.titleEl = this.modalEl.querySelector('[data-dashboard-modal-title]');
      this.subtitleEl = this.modalEl.querySelector('[data-dashboard-modal-subtitle]');
      this.bodyEl = this.modalEl.querySelector('[data-dashboard-modal-body]');

      // Bind close buttons
      this.modalEl.querySelectorAll('[data-dashboard-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      // ESC key to close
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.modalEl.classList.contains('is-active')) {
          this.close();
        }
      });

      // Bind Modal Launchers
      document.querySelectorAll('[data-action="launch-modal-dashboard"]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          const targetId = btn.getAttribute('data-target');
          const template = document.getElementById(`${targetId}-content`);
          const tile = btn.closest('.carbon-dashboard-modal-tile') || btn.closest('.carbon-dashboard-modal-launcher');
          const title = tile?.querySelector('.cds--type-heading-03')?.textContent || 'Data Analytics Dashboard';
          const subtitle = tile?.querySelector('.cds--type-body-short-01')?.textContent || '';

          if (template) {
            this.open({
              title,
              subtitle,
              contentHtml: template.innerHTML
            });
          }
        });
      });

      // Bind Expand Buttons on Inline Dashboards
      document.querySelectorAll('[data-action="expand-dashboard-modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetSel = btn.getAttribute('data-target');
          const dash = document.querySelector(targetSel);
          if (!dash) return;

          const title = dash.querySelector('.carbon-dashboard__title')?.textContent || 'Dashboard View';
          const subtitle = dash.querySelector('.carbon-dashboard__description')?.textContent || '';
          const bodyClone = dash.querySelector('.carbon-dashboard__body')?.cloneNode(true);

          if (bodyClone) {
            this.open({
              title,
              subtitle,
              contentNode: bodyClone
            });
          }
        });
      });
    },

    open({ title, subtitle, contentHtml, contentNode }) {
      if (!this.modalEl) this.init();
      if (!this.modalEl) return;

      if (this.titleEl && title) this.titleEl.textContent = title;
      if (this.subtitleEl && subtitle) this.subtitleEl.textContent = subtitle;

      if (this.bodyEl) {
        this.bodyEl.innerHTML = '';
        if (contentNode) {
          this.bodyEl.appendChild(contentNode);
        } else if (contentHtml) {
          this.bodyEl.innerHTML = contentHtml;
        }

        // Re-initialize CSVW tables inside modal
        if (window.CsvwTableController) {
          this.bodyEl.querySelectorAll('.carbon-csvw-table[data-csv], .carbon-csvw-table[data-metadata]').forEach(el => {
            new window.CsvwTableController(el);
          });
        }

        // Resize any maps inside modal
        setTimeout(() => {
          this.bodyEl.querySelectorAll('.carbon-map-card__canvas, .carbon-geojson-map-container').forEach(canvas => {
            if (canvas._carbonMapController) {
              canvas._carbonMapController.resize();
            } else if (canvas._leaflet_map) {
              canvas._leaflet_map.invalidateSize();
            }
          });
        }, 300);
      }

      this.modalEl.classList.add('is-active');
      this.modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },

    close() {
      if (!this.modalEl) return;
      this.modalEl.classList.remove('is-active');
      this.modalEl.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  function initDashboard() {
    CarbonDashboardModal.init();

    // Initial Map Invalidation / Resize on tab or card mount
    setTimeout(() => {
      document.querySelectorAll('.carbon-map-card__canvas').forEach(canvas => {
        if (canvas._carbonMapController) {
          canvas._carbonMapController.resize();
        } else if (canvas._leaflet_map) {
          canvas._leaflet_map.invalidateSize();
        }
      });
    }, 400);
  }

  window.CarbonDashboardModal = CarbonDashboardModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
