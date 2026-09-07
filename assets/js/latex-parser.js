/**
 * IBM Carbon Design System v11 — LaTeX & Mathematical Typesetting Engine
 * Default Typography: IBM Plex Math (Self-hosted WOFF2)
 * Features:
 * - Dynamic loading of self-hosted KaTeX engine
 * - Automatic rendering of inline ($...$, \(...\)) and block ($$...$$, \[...\]) LaTeX
 * - Renders custom {{< math >}} shortcode components with copy action & equation numbers
 * - Strict font family mapping to 'IBM Plex Math'
 */

class CarbonLatexParser {
  constructor() {
    this.isLoaded = false;
    this.init();
  }

  async init() {
    await this.loadDependencies();
    this.renderAllMath();
    this.bindCopyButtons();
  }

  async loadDependencies() {
    const assetBase = (document.documentElement.getAttribute('data-asset-base') || window.CARBON_ASSET_BASE || '').replace(/\/+$/, '');
    const cssUrl = assetBase ? `${assetBase}/lib/katex/katex.min.css` : '/lib/katex/katex.min.css';
    const jsUrl = assetBase ? `${assetBase}/lib/katex/katex.min.js` : '/lib/katex/katex.min.js';
    const autoRenderUrl = assetBase ? `${assetBase}/lib/katex/auto-render.min.js` : '/lib/katex/auto-render.min.js';

    // 1. Ensure KaTeX CSS is loaded
    if (!document.querySelector('link[href*="katex.min.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      document.head.appendChild(link);
    }

    // 2. Load KaTeX Core JS if not already loaded
    if (typeof window.katex === 'undefined') {
      await this.loadScript(jsUrl);
    }

    // 3. Load KaTeX Auto-Render extension
    if (typeof window.renderMathInElement === 'undefined') {
      await this.loadScript(autoRenderUrl);
    }

    this.isLoaded = true;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  renderAllMath() {
    if (!this.isLoaded || typeof window.katex === 'undefined') return;

    // A. Render explicit shortcode / data-latex elements
    const mathElements = document.querySelectorAll('[data-latex]');
    mathElements.forEach(el => {
      const latex = el.getAttribute('data-latex');
      const isDisplay = el.getAttribute('data-display') === 'true';
      if (latex) {
        try {
          window.katex.render(latex, el, {
            displayMode: isDisplay,
            throwOnError: false,
            output: 'htmlAndMathml'
          });
        } catch (err) {
          console.warn('KaTeX render error on element:', err);
        }
      }
    });

    // B. Auto-render inline & block math across prose containers
    if (typeof window.renderMathInElement === 'function') {
      const proseContainers = document.querySelectorAll('.carbon-prose, main, article');
      proseContainers.forEach(container => {
        try {
          window.renderMathInElement(container, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\[', right: '\\]', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false }
            ],
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
            throwOnError: false
          });
        } catch (err) {
          console.warn('Auto-render math error:', err);
        }
      });
    }
  }

  bindCopyButtons() {
    const copyBtns = document.querySelectorAll('.js-copy-latex-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const latex = btn.getAttribute('data-latex');
        if (!latex) return;

        try {
          await navigator.clipboard.writeText(latex);
          const originalText = btn.innerHTML;
          btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 32 32" fill="currentColor"><path d="M14 21.414l-5.707-5.707 1.414-1.414L14 18.586l12.293-12.293 1.414 1.414z"/></svg>
            Copied!
          `;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy LaTeX:', err);
        }
      });
    });
  }
}

export function initLatexParser() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CarbonLatexParser());
  } else {
    new CarbonLatexParser();
  }
}
