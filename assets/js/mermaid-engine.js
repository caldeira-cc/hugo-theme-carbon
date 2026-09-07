/**
 * IBM Carbon Design System v11 — Mermaid Flowchart & Diagram Engine
 * Renders declarative Mermaid flowcharts and diagrams using IBM Plex Mono typography.
 * Automatically synchronises diagram styling with Carbon light and dark themes.
 */

(function () {
  'use strict';

  let mermaidLoaded = false;
  let mermaidLoading = false;
  const renderQueue = [];

  /**
   * Determine current active Carbon theme scheme
   * @returns {'light'|'dark'}
   */
  function getThemeScheme() {
    const theme = document.documentElement.getAttribute('data-carbon-theme') || 'white';
    return (theme === 'g90' || theme === 'g100') ? 'dark' : 'light';
  }

  /**
   * Generate Carbon-aligned Mermaid theme configuration
   * Enforces IBM Plex Mono typography throughout nodes, edges, labels, and subgraphs.
   */
  function getMermaidConfig() {
    const isDark = getThemeScheme() === 'dark';

    if (isDark) {
      return {
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: "'IBM Plex Mono', monospace, -apple-system, sans-serif",
        fontSize: 13,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 50
        },
        themeVariables: {
          fontFamily: "'IBM Plex Mono', monospace, -apple-system, sans-serif",
          fontSize: '13px',
          darkMode: true,
          background: '#161616',
          primaryColor: '#262626',
          primaryTextColor: '#f4f4f4',
          primaryBorderColor: '#0f62fe',
          lineColor: '#8d8d8d',
          textColor: '#f4f4f4',
          mainBkg: '#262626',
          secondBkg: '#1e1e1e',
          edgeLabelBackground: '#1e1e1e',
          nodeBorder: '#0f62fe',
          clusterBkg: '#1e1e1e',
          clusterBorder: '#393939',
          defaultLinkColor: '#8d8d8d',
          titleColor: '#f4f4f4',
          activeNodeBorderColor: '#0f62fe',
          nodeTextColor: '#f4f4f4'
        }
      };
    } else {
      return {
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: "'IBM Plex Mono', monospace, -apple-system, sans-serif",
        fontSize: 13,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 50
        },
        themeVariables: {
          fontFamily: "'IBM Plex Mono', monospace, -apple-system, sans-serif",
          fontSize: '13px',
          darkMode: false,
          background: '#fbfbfb',
          primaryColor: '#f4f4f4',
          primaryTextColor: '#161616',
          primaryBorderColor: 'rgb(105, 162, 128)',
          lineColor: '#525252',
          textColor: '#161616',
          mainBkg: '#ffffff',
          secondBkg: '#f4f4f4',
          edgeLabelBackground: '#ffffff',
          nodeBorder: 'rgb(105, 162, 128)',
          clusterBkg: '#f4f4f4',
          clusterBorder: '#e0e0e0',
          defaultLinkColor: '#525252',
          titleColor: '#161616',
          activeNodeBorderColor: '#0f62fe',
          nodeTextColor: '#161616'
        }
      };
    }
  }

  /**
   * Lazy load local self-hosted Mermaid library
   */
  function loadMermaid(callback) {
    if (mermaidLoaded && window.mermaid) {
      callback();
      return;
    }

    renderQueue.push(callback);
    if (mermaidLoading) return;
    mermaidLoading = true;

    const script = document.createElement('script');
    script.src = '/lib/mermaid/mermaid.min.js';
    script.onload = () => {
      mermaidLoaded = true;
      mermaidLoading = false;
      renderQueue.forEach(cb => cb());
      renderQueue.length = 0;
    };
    script.onerror = () => {
      mermaidLoading = false;
      console.warn('[MermaidEngine] Failed to load local /lib/mermaid/mermaid.min.js');
    };
    document.head.appendChild(script);
  }

  /**
   * Render all Mermaid containers on the page
   */
  async function renderAllMermaid() {
    const elements = document.querySelectorAll('.mermaid');
    if (!elements.length) return;

    loadMermaid(async () => {
      if (!window.mermaid) return;

      const config = getMermaidConfig();
      window.mermaid.initialize(config);

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        // Cache original raw syntax for re-rendering on theme switch
        if (!el._rawMermaid) {
          el._rawMermaid = el.getAttribute('data-raw-source') || el.textContent.trim();
        }

        const id = el.id || `mermaid-svg-${i}-${Date.now()}`;
        try {
          const { svg } = await window.mermaid.render(`${id}-render`, el._rawMermaid);
          el.innerHTML = svg;
          el.classList.add('mermaid--rendered');
        } catch (err) {
          console.error('[MermaidEngine] Render error:', err);
          el.innerHTML = `<div style="padding: 1rem; color: var(--cds-support-error); font-family: var(--cds-font-mono, monospace); font-size: 0.8125rem;">
            Failed to render Mermaid diagram: ${err.message || 'Syntax error'}
          </div>`;
        }
      }
    });
  }

  /**
   * Setup copy buttons for diagram sources
   */
  function setupCopyButtons() {
    document.querySelectorAll('.js-mermaid-copy').forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;

      btn.addEventListener('click', () => {
        const source = btn.getAttribute('data-source') || '';
        if (!source) return;

        navigator.clipboard.writeText(source).then(() => {
          const label = btn.querySelector('.carbon-mermaid-copy-label');
          const original = label ? label.textContent : 'Source';
          if (label) label.textContent = 'Copied!';
          btn.classList.add('is-copied');

          setTimeout(() => {
            if (label) label.textContent = original;
            btn.classList.remove('is-copied');
          }, 1800);
        });
      });
    });
  }

  /**
   * Watch for dynamic theme changes on <html> attribute
   */
  function observeThemeChanges() {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-carbon-theme') {
          renderAllMermaid();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-carbon-theme']
    });
  }

  function init() {
    renderAllMermaid();
    setupCopyButtons();
    observeThemeChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.renderAllMermaid = renderAllMermaid;
})();
