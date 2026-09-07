/**
 * IBM Carbon Design System v11 — MapLibre GL Vector Tile Engine & Modal Controller
 * Renders GPU-accelerated CARTO Vector Tiles with custom IBM Dark and Light color schemes,
 * user-configurable layer toggles (Roads, Buildings, Labels, Boundaries),
 * IBM Plex Sans typography, and bidirectional GeoJSON data binding.
 *
 * Base map styles are pre-built CARTO vector tile JSONs with IBM Carbon color tokens:
 *   /lib/maplibre/carbon-vector-dark.json  (93 layers, CARTO Dark Matter base)
 *   /lib/maplibre/carbon-vector-light.json (93 layers, CARTO Positron base)
 */

(function () {
  'use strict';

  const MAPLIBRE_CSS_URL = '/lib/maplibre/maplibre-gl.css';
  const MAPLIBRE_JS_URL = '/lib/maplibre/maplibre-gl.js';
  const STYLE_DARK_URL = '/lib/maplibre/carbon-vector-dark.json';
  const STYLE_LIGHT_URL = '/lib/maplibre/carbon-vector-light.json';

  // ==========================================
  // Layer ID mappings for CARTO-based styles
  // ==========================================
  const LAYER_CATEGORIES = {
    roads: [
      'tunnel_service_case', 'tunnel_minor_case', 'tunnel_sec_case', 'tunnel_pri_case',
      'tunnel_trunk_case', 'tunnel_mot_case', 'tunnel_path',
      'tunnel_service_fill', 'tunnel_minor_fill', 'tunnel_sec_fill', 'tunnel_pri_fill',
      'tunnel_trunk_fill', 'tunnel_mot_fill', 'tunnel_rail', 'tunnel_rail_dash',
      'road_service_case', 'road_minor_case', 'road_pri_case_ramp', 'road_trunk_case_ramp',
      'road_mot_case_ramp', 'road_sec_case_noramp', 'road_pri_case_noramp',
      'road_trunk_case_noramp', 'road_mot_case_noramp', 'road_path',
      'road_service_fill', 'road_minor_fill', 'road_pri_fill_ramp', 'road_trunk_fill_ramp',
      'road_mot_fill_ramp', 'road_sec_fill_noramp', 'road_pri_fill_noramp',
      'road_trunk_fill_noramp', 'road_mot_fill_noramp', 'rail', 'rail_dash',
      'bridge_service_case', 'bridge_minor_case', 'bridge_sec_case', 'bridge_pri_case',
      'bridge_trunk_case', 'bridge_mot_case', 'bridge_path',
      'bridge_service_fill', 'bridge_minor_fill', 'bridge_sec_fill', 'bridge_pri_fill',
      'bridge_trunk_fill', 'bridge_mot_fill',
      'aeroway-runway', 'aeroway-taxiway',
      'roadname_minor', 'roadname_sec', 'roadname_pri', 'roadname_major'
    ],
    buildings: ['building', 'building-top', 'housenumber'],
    labels: [
      'waterway_label', 'watername_ocean', 'watername_sea', 'watername_lake',
      'watername_lake_line', 'place_hamlet', 'place_suburbs', 'place_villages',
      'place_town', 'place_country_2', 'place_country_1', 'place_state',
      'place_continent', 'place_city_r6', 'place_city_r5',
      'place_city_dot_r7', 'place_city_dot_r4', 'place_city_dot_r2',
      'place_city_dot_z7', 'place_capital_dot_z7',
      'poi_stadium', 'poi_park'
    ],
    boundaries: [
      'boundary_county', 'boundary_state',
      'boundary_country_outline', 'boundary_country_inner'
    ]
  };

  let mapLibreLoadPromise = null;

  /** Cache for fetched style JSONs (avoids re-fetching on theme toggle) */
  const styleCache = {};

  function ensureMapLibre() {
    if (window.maplibregl) return Promise.resolve(window.maplibregl);
    if (mapLibreLoadPromise) return mapLibreLoadPromise;

    mapLibreLoadPromise = new Promise((resolve, reject) => {
      if (!document.querySelector(`link[href*="maplibre-gl"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = MAPLIBRE_CSS_URL;
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = MAPLIBRE_JS_URL;
      script.async = true;
      script.onload = () => {
        if (window.maplibregl) {
          resolve(window.maplibregl);
        } else {
          reject(new Error('MapLibre GL failed to initialize'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load MapLibre GL script'));
      document.head.appendChild(script);
    });

    return mapLibreLoadPromise;
  }

  function isDarkTheme() {
    const theme = document.documentElement.getAttribute('data-carbon-theme') || '';
    return theme === 'g90' || theme === 'g100' || theme === 'dark';
  }

  /**
   * Fetches and caches the pre-built IBM Carbon vector style JSON.
   * Applies layer visibility configuration and projection before returning.
   * @param {string} mode - 'dark' | 'light' | 'auto'
   * @param {object} layerConfig - { roads, buildings, labels, boundaries }
   * @param {string} projection - 'mercator' | 'globe'
   * @returns {Promise<object>} MapLibre style spec
   */
  async function getCarbonVectorStyle(mode = 'auto', layerConfig = {}, projection = 'mercator') {
    const activeDark = mode === 'dark' || (mode === 'auto' && isDarkTheme());
    const url = activeDark ? STYLE_DARK_URL : STYLE_LIGHT_URL;
    const config = Object.assign({ roads: true, buildings: true, labels: true, boundaries: true }, layerConfig);
    const projType = projection === 'globe' ? 'globe' : 'mercator';

    // Fetch and cache
    if (!styleCache[url]) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        styleCache[url] = await resp.json();
      } catch (err) {
        console.warn('[CarbonMap] Failed to load vector style from', url, err);
        // Return a minimal fallback so the map still renders
        return createFallbackStyle(activeDark, projType);
      }
    }

    // Deep-clone and apply layer visibility & projection
    const style = JSON.parse(JSON.stringify(styleCache[url]));
    style.projection = { type: projType };

    // Build a Set of layer IDs that should be hidden
    const hiddenLayers = new Set();
    for (const [cat, ids] of Object.entries(LAYER_CATEGORIES)) {
      if (!config[cat]) {
        ids.forEach(id => hiddenLayers.add(id));
      }
    }

    style.layers.forEach(layer => {
      if (hiddenLayers.has(layer.id)) {
        if (!layer.layout) layer.layout = {};
        layer.layout.visibility = 'none';
      }
    });

    return style;
  }

  /** Minimal inline fallback if external JSON cannot be fetched */
  function createFallbackStyle(activeDark, projType = 'mercator') {
    const bg = activeDark ? '#161616' : '#f4f4f4';
    return {
      version: 8,
      name: 'IBM Carbon Fallback',
      projection: { type: projType },
      glyphs: '/lib/maplibre/fonts/{fontstack}/{range}.pbf',
      sources: {},
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': bg } }
      ]
    };
  }

  // Generate GeoJSON popup HTML using Carbon v11 tokens
  function createGeoJSONPopupHtml(props) {
    const title = props.name || props.title || props.id || 'Spatial Feature';
    const category = props.category || props.type || '';

    let rows = '';
    for (const [key, value] of Object.entries(props)) {
      if (['name', 'title', 'id', 'category'].includes(key)) continue;
      if (typeof value === 'object' && value !== null) continue;

      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      let formattedVal = value;
      if (typeof value === 'boolean') formattedVal = value ? 'Yes' : 'No';

      rows += `
        <tr>
          <th class="carbon-map-popup__key">${formattedKey}</th>
          <td class="carbon-map-popup__val">${formattedVal}</td>
        </tr>
      `;
    }

    return `
      <div class="carbon-map-popup">
        <div class="carbon-map-popup__header">
          ${category ? `<span class="cds--tag cds--tag--blue cds--tag--sm">${category}</span>` : ''}
          <h5 class="carbon-map-popup__title">${title}</h5>
        </div>
        ${rows ? `
          <table class="carbon-map-popup__table">
            <tbody>${rows}</tbody>
          </table>
        ` : ''}
      </div>
    `;
  }

  // ==========================================
  // Map Controller Class (MapLibre GL Vector Engine)
  // ==========================================
  class CarbonMapController {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.getElementById(container) : container;
      this.options = Object.assign({
        center: [0, 20],
        zoom: 1.8,
        theme: 'auto',
        projection: 'mercator',
        roads: true,
        buildings: true,
        labels: true,
        boundaries: true
      }, options);

      this.projection = this.options.projection === 'globe' ? 'globe' : 'mercator';
      this.map = null;
      this.layerConfig = {
        roads: this.options.roads !== false,
        buildings: this.options.buildings !== false,
        labels: this.options.labels !== false,
        boundaries: this.options.boundaries !== false
      };
      this.geoJsonData = null;
      this.markers = [];
      this.onMouseMove = null;
    }

    async init() {
      if (!this.container) return;
      const maplibregl = await ensureMapLibre();

      let center = [0, 20];
      if (this.options.lng !== undefined && this.options.lat !== undefined && !isNaN(parseFloat(this.options.lng))) {
        center = [parseFloat(this.options.lng), parseFloat(this.options.lat)];
      } else if (Array.isArray(this.options.center)) {
        center = [parseFloat(this.options.center[1]), parseFloat(this.options.center[0])];
      }

      // Load pre-built IBM Carbon CARTO vector style with active projection
      const initialStyle = await getCarbonVectorStyle(this.options.theme, this.layerConfig, this.projection);

      this.map = new maplibregl.Map({
        container: this.container,
        style: initialStyle,
        center: center,
        zoom: parseFloat(this.options.zoom) || 1.8,
        attributionControl: false
      });

      this.map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-left');
      this.map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      this.map.on('mousemove', (e) => {
        if (this.onMouseMove) {
          this.onMouseMove(e.lngLat.lat.toFixed(4), e.lngLat.lng.toFixed(4));
        }
      });

      this.map.on('error', (e) => {
        const err = (e && e.error) ? e.error : e;
        const msg = err ? (err.stack || err.message || String(err)) : 'Unknown error';
        console.error('[MapLibre Error Stack]:', msg);
      });

      this.map.on('sourcedata', (e) => {
        if (e.isSourceLoaded) {
          console.log('[MapLibre source loaded]', e.sourceId, e.dataType);
        }
      });

      this.map.on('style.load', () => {
        console.log('[MapLibre style loaded successfully]');
      });

      this.map.on('load', () => {
        console.log('[MapLibre map loaded]');
        if (this.geoJsonData) {
          this.renderGeoJsonLayer();
        }
      });

      // Observe Carbon theme mutations
      this.observeThemeChanges();
    }

    observeThemeChanges() {
      const observer = new MutationObserver(async () => {
        if (this.map && this.options.theme === 'auto') {
          const newStyle = await getCarbonVectorStyle('auto', this.layerConfig, this.projection);
          this.map.setStyle(newStyle);
          this.map.once('style.load', () => {
            if (this.geoJsonData) this.renderGeoJsonLayer();
          });
        }
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-carbon-theme']
      });
    }

    setLayerVisibility(category, visible) {
      this.layerConfig[category] = !!visible;
      if (!this.map) return;

      const targetLayers = LAYER_CATEGORIES[category] || [];
      const val = visible ? 'visible' : 'none';

      targetLayers.forEach(layerId => {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', val);
        }
      });
    }

    setRoads(enabled) { this.setLayerVisibility('roads', enabled); }
    setBuildings(enabled) { this.setLayerVisibility('buildings', enabled); }
    setLabels(enabled) { this.setLayerVisibility('labels', enabled); }
    setBoundaries(enabled) { this.setLayerVisibility('boundaries', enabled); }

    async setThemeMode(mode) {
      this.options.theme = mode;
      if (!this.map) return;
      const newStyle = await getCarbonVectorStyle(mode, this.layerConfig, this.projection);
      this.map.setStyle(newStyle);
      this.map.once('style.load', () => {
        if (this.geoJsonData) this.renderGeoJsonLayer();
      });
    }

    setProjection(projectionType) {
      const proj = projectionType === 'globe' ? 'globe' : 'mercator';
      this.projection = proj;
      this.options.projection = proj;
      if (!this.map) return;

      if (typeof this.map.setProjection === 'function') {
        this.map.setProjection({ type: proj });
      } else if (this.map.isStyleLoaded()) {
        const style = this.map.getStyle();
        style.projection = { type: proj };
        this.map.setStyle(style);
      }
    }

    loadGeoJSON(data) {
      this.geoJsonData = data;
      if (this.map && this.map.isStyleLoaded()) {
        this.renderGeoJsonLayer();
      }
    }

    renderGeoJsonLayer() {
      if (!this.map || !this.geoJsonData) return;

      // Clear previous HTML DOM markers
      this.markers.forEach(m => m.remove());
      this.markers = [];

      // Add or update vector layers for Polygons and LineStrings
      if (this.map.getSource('carbon-custom-geojson')) {
        this.map.getSource('carbon-custom-geojson').setData(this.geoJsonData);
      } else {
        this.map.addSource('carbon-custom-geojson', {
          type: 'geojson',
          data: this.geoJsonData
        });

        // Polygons (Translucent Sage Green fill)
        this.map.addLayer({
          id: 'carbon-custom-polygons',
          type: 'fill',
          source: 'carbon-custom-geojson',
          filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'MultiPolygon']],
          paint: {
            'fill-color': '#69a280',
            'fill-opacity': 0.2
          }
        });

        // Polygon Outlines (Sage Green outline)
        this.map.addLayer({
          id: 'carbon-custom-polygon-outlines',
          type: 'line',
          source: 'carbon-custom-geojson',
          filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'MultiPolygon']],
          paint: {
            'line-color': '#69a280',
            'line-width': 1.8,
            'line-opacity': 0.85
          }
        });

        // LineStrings (Dashed Faded Jeans Blue lines for connectivity / cables)
        this.map.addLayer({
          id: 'carbon-custom-lines',
          type: 'line',
          source: 'carbon-custom-geojson',
          filter: ['any', ['==', '$type', 'LineString'], ['==', '$type', 'MultiLineString']],
          paint: {
            'line-color': '#7a9eb3',
            'line-width': 2.5,
            'line-dasharray': [3, 2],
            'line-opacity': 0.85
          }
        });
      }

      // Extract points for custom Carbon pulsing DOM markers & compute bounds
      const features = this.geoJsonData.features || (this.geoJsonData.type === 'Feature' ? [this.geoJsonData] : []);
      const bounds = new window.maplibregl.LngLatBounds();
      let hasValidCoords = false;

      const extendCoords = (c) => {
        if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
          bounds.extend(c);
          hasValidCoords = true;
        } else if (Array.isArray(c)) {
          c.forEach(extendCoords);
        }
      };

      features.forEach(feature => {
        if (!feature.geometry) return;
        extendCoords(feature.geometry.coordinates);

        if (feature.geometry.type === 'Point') {
          const coords = feature.geometry.coordinates;

          const el = document.createElement('div');
          el.className = 'carbon-map-marker';
          el.innerHTML = `
            <div class="carbon-map-marker__ring"></div>
            <div class="carbon-map-marker__dot"></div>
          `;

          const popupHtml = createGeoJSONPopupHtml(feature.properties || {});
          const popup = new window.maplibregl.Popup({
            offset: 12,
            className: 'carbon-maplibre-popup-wrapper',
            maxWidth: '320px'
          }).setHTML(popupHtml);

          const marker = new window.maplibregl.Marker({ element: el })
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(this.map);

          this.markers.push(marker);
        }
      });

      // Fit map bounds if data features exist
      if (hasValidCoords && !bounds.isEmpty()) {
        this.map.fitBounds(bounds, { padding: 50, maxZoom: 8, duration: 800 });
      }
    }

    resetView() {
      if (!this.map) return;
      let center = [0, 20];
      if (this.options.lng !== undefined && this.options.lat !== undefined && !isNaN(parseFloat(this.options.lng))) {
        center = [parseFloat(this.options.lng), parseFloat(this.options.lat)];
      } else if (Array.isArray(this.options.center)) {
        center = [parseFloat(this.options.center[1]), parseFloat(this.options.center[0])];
      }
      this.map.flyTo({ center: center, zoom: parseFloat(this.options.zoom) || 1.8, duration: 800 });
    }

    resize() {
      if (this.map) this.map.resize();
    }
  }

  // ==========================================
  // Modal Dialog Controller
  // ==========================================
  const CarbonGeoJsonModal = {
    modalEl: null,
    mapController: null,

    init() {
      this.modalEl = document.getElementById('carbon-geojson-modal');
      if (!this.modalEl) return;

      // Close handlers
      this.modalEl.querySelectorAll('[data-map-action="close-modal"]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
      });

      // Layer theme tabs
      this.modalEl.querySelectorAll('[data-map-layer]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.modalEl.querySelectorAll('[data-map-layer]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const mode = btn.getAttribute('data-map-layer');
          if (this.mapController) {
            this.mapController.setThemeMode(mode === 'topographic' ? 'dark' : mode);
          }
        });
      });

      // Projection switcher tabs (2D Flat vs 3D Globe)
      this.modalEl.querySelectorAll('[data-map-projection-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.modalEl.querySelectorAll('[data-map-projection-btn]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const proj = btn.getAttribute('data-map-projection-btn');
          if (this.mapController) {
            this.mapController.setProjection(proj);
          }
        });
      });

      // Toggles
      ['roads', 'buildings', 'labels', 'boundaries'].forEach(cat => {
        const toggle = this.modalEl.querySelector(`[data-map-toggle="${cat}"]`);
        if (toggle) {
          toggle.addEventListener('change', (e) => {
            if (this.mapController) this.mapController.setLayerVisibility(cat, e.target.checked);
          });
        }
      });

      // Tools
      this.modalEl.querySelector('[data-map-tool="fit-bounds"]')?.addEventListener('click', () => {
        if (this.mapController) this.mapController.renderGeoJsonLayer();
      });

      this.modalEl.querySelector('[data-map-tool="reset-view"]')?.addEventListener('click', () => {
        if (this.mapController) this.mapController.resetView();
      });

      // Global delegation for modal trigger buttons
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-map-modal-trigger]');
        if (!trigger) return;
        e.preventDefault();

        const config = {
          title: trigger.getAttribute('data-map-title') || 'Geographic Map Explorer',
          caption: trigger.getAttribute('data-map-caption') || '',
          theme: trigger.getAttribute('data-map-theme') || 'auto',
          projection: trigger.getAttribute('data-map-projection') || 'mercator',
          roads: trigger.getAttribute('data-map-roads') !== 'false',
          buildings: trigger.getAttribute('data-map-buildings') !== 'false',
          labels: trigger.getAttribute('data-map-labels') !== 'false',
          boundaries: trigger.getAttribute('data-map-boundaries') === 'true',
          src: trigger.getAttribute('data-map-src') || ''
        };

        this.open(config);
      });
    },

    isOpen() {
      return this.modalEl && this.modalEl.classList.contains('is-visible');
    },

    async open(config = {}) {
      if (!this.modalEl) this.init();
      if (!this.modalEl) return;

      const titleEl = this.modalEl.querySelector('#carbon-geojson-modal-title');
      const captionEl = this.modalEl.querySelector('#carbon-geojson-modal-caption');
      const statBadge = this.modalEl.querySelector('[data-map-stat="features"]');
      const coordsDisplay = this.modalEl.querySelector('[data-map-coords]');
      const loader = this.modalEl.querySelector('[data-map-loader]');
      const downloadBtn = this.modalEl.querySelector('#carbon-geojson-modal-download-btn');

      if (titleEl) titleEl.textContent = config.title || 'Geographic Data Explorer';
      if (captionEl) captionEl.textContent = config.caption || 'Displaying spatial vector features with MapLibre GL GPU acceleration.';

      if (downloadBtn) {
        if (config.src) {
          downloadBtn.href = config.src;
          downloadBtn.style.display = 'inline-flex';
        } else {
          downloadBtn.style.display = 'none';
        }
      }

      // Sync projection UI in modal
      const activeProj = config.projection || 'mercator';
      this.modalEl.querySelectorAll('[data-map-projection-btn]').forEach(btn => {
        const isSelected = btn.getAttribute('data-map-projection-btn') === activeProj;
        btn.classList.toggle('is-active', isSelected);
      });

      this.modalEl.classList.add('is-visible');
      this.modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (loader) loader.style.display = 'flex';

      await ensureMapLibre();

      const mapContainer = document.getElementById('carbon-geojson-modal-map');
      if (!this.mapController && mapContainer) {
        this.mapController = new CarbonMapController(mapContainer, {
          theme: config.theme || 'auto',
          projection: activeProj,
          roads: config.roads,
          buildings: config.buildings,
          labels: config.labels,
          boundaries: config.boundaries
        });
        await this.mapController.init();

        this.mapController.onMouseMove = (lat, lon) => {
          if (coordsDisplay) {
            coordsDisplay.textContent = `Lat: ${lat}, Lon: ${lon}`;
          }
        };
      } else if (this.mapController) {
        await this.mapController.setThemeMode(config.theme || 'auto');
        this.mapController.setProjection(activeProj);
        this.mapController.setRoads(config.roads);
        this.mapController.setBuildings(config.buildings);
        this.mapController.setLabels(config.labels);
        this.mapController.setBoundaries(config.boundaries);
        this.mapController.resize();
      }

      // Fetch GeoJSON if source is provided
      if (config.src) {
        try {
          const resp = await fetch(config.src);
          if (resp.ok) {
            const data = await resp.json();
            this.mapController.loadGeoJSON(data);
            const count = (data.features || []).length;
            if (statBadge) statBadge.textContent = `${count} features`;
          }
        } catch (err) {
          console.warn('[MapLibre] Failed to fetch GeoJSON:', err);
        }
      }

      setTimeout(() => {
        if (loader) loader.style.display = 'none';
        if (this.mapController) this.mapController.resize();
      }, 300);
    },

    close() {
      if (!this.modalEl) return;
      this.modalEl.classList.remove('is-visible');
      this.modalEl.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  // ==========================================
  // Auto-Initialize Inline Map Cards
  // ==========================================
  function initInlineMapCards() {
    document.querySelectorAll('.carbon-map-card__canvas[data-geojson-map]').forEach(async canvas => {
      if (canvas._carbonMapController) return;

      const src = canvas.getAttribute('data-map-src');
      const theme = canvas.getAttribute('data-map-theme') || 'auto';
      const projection = canvas.getAttribute('data-map-projection') || 'mercator';
      const lat = canvas.getAttribute('data-map-lat');
      const lng = canvas.getAttribute('data-map-lng');
      const zoom = canvas.getAttribute('data-map-zoom');
      const roads = canvas.getAttribute('data-map-roads') !== 'false';
      const buildings = canvas.getAttribute('data-map-buildings') !== 'false';
      const labels = canvas.getAttribute('data-map-labels') !== 'false';
      const boundaries = canvas.getAttribute('data-map-boundaries') === 'true';

      const ctrl = new CarbonMapController(canvas, {
        theme,
        projection,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        zoom: zoom ? parseFloat(zoom) : undefined,
        roads,
        buildings,
        labels,
        boundaries
      });
      canvas._carbonMapController = ctrl;

      await ctrl.init();

      // Bind card toolbar toggles
      const card = canvas.closest('.carbon-map-card');
      if (card) {
        card.querySelectorAll('[data-map-toggle]').forEach(input => {
          input.addEventListener('change', (e) => {
            const cat = input.getAttribute('data-map-toggle');
            ctrl.setLayerVisibility(cat, e.target.checked);
          });
        });

        card.querySelectorAll('[data-map-set-type]').forEach(btn => {
          btn.addEventListener('click', () => {
            card.querySelectorAll('[data-map-set-type]').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            const mode = btn.getAttribute('data-map-set-type');
            ctrl.setThemeMode(mode);
          });
        });

        card.querySelectorAll('[data-map-set-projection]').forEach(btn => {
          btn.addEventListener('click', () => {
            card.querySelectorAll('[data-map-set-projection]').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            const proj = btn.getAttribute('data-map-set-projection');
            ctrl.setProjection(proj);
          });
        });
      }

      if (src) {
        try {
          const resp = await fetch(src);
          if (resp.ok) {
            const data = await resp.json();
            ctrl.loadGeoJSON(data);
          }
        } catch (err) {
          console.warn('[MapLibre] Could not load GeoJSON:', err);
        }
      }
    });
  }

  window.CarbonMapController = CarbonMapController;
  window.CarbonGeoJsonModal = CarbonGeoJsonModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initInlineMapCards();
      CarbonGeoJsonModal.init();
    });
  } else {
    initInlineMapCards();
    CarbonGeoJsonModal.init();
  }
})();
