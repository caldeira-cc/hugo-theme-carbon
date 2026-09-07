// IBM Carbon Design System v11 — Code Snippets & Code Modal Controller
// Provides file loading, syntax highlighting (highlight.js), clipboard copy,
// in-file search, and a fullscreen theme-adaptive modal viewer.

(function () {
  // -----------------------------------------------------------------------
  // highlight.js lazy loader
  // -----------------------------------------------------------------------
  let hljsLoaded = false;
  let hljsLoading = false;
  const hljsCallbacks = [];

  function loadHighlightJS(cb) {
    if (hljsLoaded && window.hljs) { cb(); return; }
    hljsCallbacks.push(cb);
    if (hljsLoading) return;
    hljsLoading = true;

    const script = document.createElement('script');
    script.src = '/lib/highlight/highlight.min.js';
    script.onload = () => {
      hljsLoaded = true;
      // Register common aliases
      hljsCallbacks.forEach(fn => fn());
      hljsCallbacks.length = 0;
    };
    script.onerror = () => {
      hljsLoading = false;
      console.warn('[CodeSnippet] Local Highlight.js failed to load');
      hljsCallbacks.forEach(fn => fn());
      hljsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  }

  function highlightElement(el) {
    if (window.hljs && el) {
      try { window.hljs.highlightElement(el); } catch (_) { /* ignore */ }
    }
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function copyWithFeedback(btn, text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const label = btn.querySelector('.carbon-copy-label') || btn.querySelector('span');
      const orig = label ? label.textContent : 'Copy';
      if (label) label.textContent = 'Copied!';
      btn.classList.add('is-copied');
      setTimeout(() => {
        if (label) label.textContent = orig;
        btn.classList.remove('is-copied');
      }, 1800);
    });
  }

  // -----------------------------------------------------------------------
  // Carbon Code Modal Singleton
  // -----------------------------------------------------------------------
  const CarbonCodeModal = {
    el: null,
    titleEl: null, langEl: null, statsEl: null,
    searchInput: null, matchCountEl: null,
    wrapToggle: null, linesToggle: null,
    gutterEl: null, codeEl: null, codeAreaPre: null,
    copyBtn: null, downloadBtn: null,
    code: '', title: '', lang: '', src: '',

    init() {
      if (this.el) return;
      this.el = document.getElementById('carbon-code-modal');
      if (!this.el) return;

      this.titleEl      = this.el.querySelector('#carbon-code-modal-title');
      this.langEl       = this.el.querySelector('[data-code-modal-lang]');
      this.statsEl      = this.el.querySelector('[data-code-modal-stats]');
      this.searchInput   = this.el.querySelector('[data-code-modal-search-input]');
      this.matchCountEl  = this.el.querySelector('[data-code-modal-match-count]');
      this.wrapToggle    = this.el.querySelector('[data-code-modal-wrap-toggle]');
      this.linesToggle   = this.el.querySelector('[data-code-modal-lines-toggle]');
      this.gutterEl      = this.el.querySelector('[data-code-modal-gutter]');
      this.codeEl        = this.el.querySelector('[data-code-modal-code] code');
      this.codeAreaPre   = this.el.querySelector('[data-code-modal-code]');
      this.copyBtn       = this.el.querySelector('[data-code-modal-copy-btn]');
      this.downloadBtn   = this.el.querySelector('[data-code-modal-download-btn]');

      // Close
      this.el.querySelectorAll('[data-code-modal-close]').forEach(b =>
        b.addEventListener('click', () => this.close())
      );

      // Keys
      document.addEventListener('keydown', e => {
        if (!this.isOpen()) return;
        if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        else if (e.key === '/' && document.activeElement !== this.searchInput) {
          e.preventDefault();
          this.searchInput?.focus();
        }
      });

      // Toggles
      this.wrapToggle?.addEventListener('change', () => {
        this.codeAreaPre?.classList.toggle('is-wrapped', this.wrapToggle.checked);
      });
      this.linesToggle?.addEventListener('change', () => {
        if (this.gutterEl) this.gutterEl.style.display = this.linesToggle.checked ? '' : 'none';
      });

      // Copy
      this.copyBtn?.addEventListener('click', () => copyWithFeedback(this.copyBtn, this.code));

      // Download
      this.downloadBtn?.addEventListener('click', () => this.download());

      // Search
      this.searchInput?.addEventListener('input', () => this.search(this.searchInput.value));
    },

    isOpen() { return this.el?.classList.contains('is-visible'); },

    open({ title = 'Source', lang = 'text', src = '', code = '' }) {
      this.init();
      if (!this.el) return;

      this.title = title;
      this.lang  = lang;
      this.src   = src;
      this.code  = code;

      if (this.titleEl) this.titleEl.textContent = title;
      if (this.langEl) this.langEl.textContent = lang.toUpperCase();

      const lines = code ? code.split('\n') : [];
      const bytes = new Blob([code]).size;
      const size  = bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
      if (this.statsEl) this.statsEl.textContent = `${lines.length} lines · ${size}`;

      // Gutter
      if (this.gutterEl) {
        this.gutterEl.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
      }

      // Code + syntax highlight
      if (this.codeEl) {
        this.codeEl.textContent = code;
        this.codeEl.className = lang ? `language-${lang}` : '';
        this.codeEl.removeAttribute('data-highlighted');
        loadHighlightJS(() => highlightElement(this.codeEl));
      }

      // Reset search
      if (this.searchInput) this.searchInput.value = '';
      if (this.matchCountEl) this.matchCountEl.textContent = '';

      // Show
      this.el.classList.add('is-visible');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },

    close() {
      if (!this.el) return;
      this.el.classList.remove('is-visible');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    download() {
      if (!this.code) return;
      const blob = new Blob([this.code], { type: 'text/plain;charset=utf-8' });
      const name = this.title.includes('.') ? this.title
                 : `${this.title.toLowerCase().replace(/\s+/g, '-')}.${this.lang || 'txt'}`;
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob), download: name
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    },

    search(query) {
      if (!this.codeEl) return;
      if (!query?.trim()) {
        // Restore highlighted code
        this.codeEl.textContent = this.code;
        this.codeEl.removeAttribute('data-highlighted');
        highlightElement(this.codeEl);
        if (this.matchCountEl) this.matchCountEl.textContent = '';
        return;
      }
      try {
        const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        let count = 0;
        const html = this.code.split('\n').map(line => {
          const m = line.match(re);
          if (m) count += m.length;
          return escapeHtml(line).replace(re, '<mark class="carbon-code-highlight">$1</mark>');
        }).join('\n');
        this.codeEl.innerHTML = html;
        if (this.matchCountEl) this.matchCountEl.textContent = count ? `${count} match${count > 1 ? 'es' : ''}` : 'No matches';
      } catch (_) {
        this.codeEl.textContent = this.code;
      }
    }
  };

  // -----------------------------------------------------------------------
  // Hydrate code-file shortcode instances ([data-code-snippet])
  // -----------------------------------------------------------------------
  function initCodeSnippets() {
    document.querySelectorAll('[data-code-snippet]').forEach(snippet => {
      if (snippet._carbonInit) return;
      snippet._carbonInit = true;

      const src       = snippet.getAttribute('data-code-src');
      const title     = snippet.getAttribute('data-code-title') || (src ? src.split('/').pop() : 'Source');
      const lang      = snippet.getAttribute('data-code-lang') || 'text';
      const rawStore  = snippet.querySelector('.carbon-code-raw-store');
      const preEl     = snippet.querySelector('.carbon-code-snippet__pre');
      const codeEl    = snippet.querySelector('.carbon-code-snippet__pre code');
      const linesEl   = snippet.querySelector('[data-snippet-lines]');
      const loadingEl = snippet.querySelector('[data-code-loading]');
      const copyBtn   = snippet.querySelector('[data-code-action="copy"]');
      const modalBtn  = snippet.querySelector('[data-code-action="modal"]');

      let codeText = rawStore ? rawStore.textContent : (codeEl ? codeEl.textContent : '');

      function update(text) {
        codeText = text;
        if (codeEl) { codeEl.textContent = text; highlightElement(codeEl); }
        if (preEl) preEl.style.display = '';
        if (loadingEl) loadingEl.style.display = 'none';
        if (linesEl && text) linesEl.textContent = `${text.trim().split('\n').length} lines`;
      }

      if (!codeText && src) {
        fetch(src).then(r => { if (!r.ok) throw r; return r.text(); })
          .then(update)
          .catch(() => {
            if (loadingEl) loadingEl.innerHTML = `<span style="color:var(--cds-support-error)">Failed to load ${escapeHtml(src)}</span>`;
          });
      } else if (codeText) {
        // Highlight at load if hljs available (lazy-load it)
        loadHighlightJS(() => update(codeText));
      }

      copyBtn?.addEventListener('click', () => copyWithFeedback(copyBtn, codeText));
      modalBtn?.addEventListener('click', () => {
        CarbonCodeModal.open({ title, lang, src: src || '', code: codeText });
      });
    });
  }

  // -----------------------------------------------------------------------
  // Enhance standard Markdown code blocks (Hugo Chroma .highlight / plain <pre>)
  // -----------------------------------------------------------------------
  function enhanceStandardCodeBlocks() {
    const containers = document.querySelectorAll(
      '.carbon-prose .highlight, .carbon-article .highlight'
    );

    containers.forEach(highlight => {
      if (highlight.closest('.carbon-code-snippet') || highlight.closest('.carbon-code-modal') || highlight._carbonEnhanced) return;
      highlight._carbonEnhanced = true;

      const codeCell = highlight.querySelector('table.lntable td:last-child code') || highlight.querySelector('code');
      const codeText = codeCell ? codeCell.textContent : highlight.textContent;
      const lines = codeText.trim().split('\n').length;

      let lang = 'code';
      const dl = codeCell?.getAttribute('data-lang');
      if (dl) lang = dl;
      else if (codeCell?.className) {
        const m = codeCell.className.match(/language-([a-zA-Z0-9_-]+)/);
        if (m) lang = m[1];
      }

      const wrapper = buildSnippetWrapper(lang, lines, codeText);
      highlight.parentNode.insertBefore(wrapper, highlight);
      wrapper.querySelector('.carbon-code-snippet__body').appendChild(highlight);
    });

    // Standalone <pre> (not inside .highlight)
    document.querySelectorAll('.carbon-prose pre, .carbon-article pre').forEach(pre => {
      if (pre.closest('.carbon-code-snippet') || pre.closest('.highlight') || pre.closest('.carbon-code-modal') || pre._carbonEnhanced) return;
      pre._carbonEnhanced = true;

      const codeEl = pre.querySelector('code') || pre;
      const codeText = codeEl.textContent;
      const lines = codeText.trim().split('\n').length;
      let lang = 'text';
      const m = codeEl.className?.match(/language-([a-zA-Z0-9_-]+)/);
      if (m) lang = m[1];

      const wrapper = buildSnippetWrapper(lang, lines, codeText);
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.querySelector('.carbon-code-snippet__body').appendChild(pre);
    });
  }

  /** Build the wrapper element for an enhanced code block */
  function buildSnippetWrapper(lang, lines, codeText) {
    const snippet = document.createElement('div');
    snippet.className = 'carbon-code-snippet';

    // Header — simplified: just lang badge + copy button
    const header = document.createElement('div');
    header.className = 'carbon-code-snippet__header';
    header.innerHTML = `
      <div class="carbon-code-snippet__meta">
        <span class="cds--tag cds--tag--purple cds--tag--sm carbon-code-snippet__lang-tag">${escapeHtml(lang)}</span>
        <span class="carbon-code-snippet__line-count">${lines} lines</span>
      </div>
      <div class="carbon-code-snippet__actions">
        <button type="button" class="carbon-code-snippet__btn" data-code-action="copy" title="Copy code" aria-label="Copy code">
          <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
            <path d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"/>
            <path d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z"/>
          </svg>
          <span class="carbon-copy-label">Copy</span>
        </button>
        <button type="button" class="carbon-code-snippet__btn" data-code-action="modal" title="Expand" aria-label="Open in modal">
          <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
            <path d="M28 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H10V6h18Z"/>
            <path d="M18 26H4V16h2v-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2h-2Z"/>
          </svg>
        </button>
      </div>`;

    const body = document.createElement('div');
    body.className = 'carbon-code-snippet__body is-scrollable';

    snippet.appendChild(header);
    snippet.appendChild(body);

    // Bind events
    header.querySelector('[data-code-action="copy"]')?.addEventListener('click', function () {
      copyWithFeedback(this, codeText);
    });
    header.querySelector('[data-code-action="modal"]')?.addEventListener('click', () => {
      CarbonCodeModal.open({ title: `${lang.toUpperCase()} Snippet`, lang, code: codeText });
    });

    return snippet;
  }

  // -----------------------------------------------------------------------
  // Bootstrap
  // -----------------------------------------------------------------------
  function init() {
    CarbonCodeModal.init();
    loadHighlightJS(() => {
      initCodeSnippets();
      enhanceStandardCodeBlocks();
    });
  }

  window.CarbonCodeModal = CarbonCodeModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
