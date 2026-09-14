// IBM Carbon UI Shell Navbar Search Engine
// Offline-first instant search integrated directly into the top navbar

(function () {
  let searchIndex = null;
  let indexPromise = null;
  let activeIndex = -1;
  let currentResults = [];

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMatches(text, query) {
    if (!text) return '';
    if (!query || !query.trim()) return escapeHtml(text);

    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return escapeHtml(text);

    const escapedTerms = terms.map(t => escapeRegex(escapeHtml(t)));
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    return escapeHtml(text).replace(pattern, '<mark class="cds--header__search-highlight">$1</mark>');
  }

  function extractSnippet(item, query) {
    const raw = item.summary || item.content || item.description || '';
    if (!raw) return '';
    const clean = raw.replace(/\s+/g, ' ').trim();
    if (!query) return clean.slice(0, 100) + (clean.length > 100 ? '...' : '');

    const terms = query.trim().toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const lower = clean.toLowerCase();

    let firstIndex = -1;
    for (const term of terms) {
      const idx = lower.indexOf(term);
      if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
        firstIndex = idx;
      }
    }

    if (firstIndex === -1) {
      return clean.slice(0, 100) + (clean.length > 100 ? '...' : '');
    }

    const start = Math.max(0, firstIndex - 25);
    const end = Math.min(clean.length, firstIndex + 85);
    let snippet = clean.slice(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < clean.length) snippet = snippet + '...';

    return snippet;
  }

  async function loadSearchIndex(indexUrl) {
    if (searchIndex) return searchIndex;
    if (indexPromise) return indexPromise;

    indexPromise = (async () => {
      try {
        const url = indexUrl || '/index.json';
        const response = await fetch(url);
        if (response.ok) {
          searchIndex = await response.json();
        }
      } catch (err) {
        console.error('Failed to load search index', err);
      } finally {
        indexPromise = null;
      }
      return searchIndex;
    })();

    return indexPromise;
  }

  function getSearchElements() {
    const container = document.querySelector('.js-header-search');
    const input = document.querySelector('.js-header-search-input');
    const menu = document.querySelector('.js-header-search-menu');
    const results = document.querySelector('.js-header-search-results');
    const status = document.querySelector('.js-header-search-status');
    const clearBtn = document.querySelector('.js-header-search-clear');
    const toggleBtn = document.querySelector('.js-header-search-toggle');

    return { container, input, menu, results, status, clearBtn, toggleBtn };
  }

  function openNavbarSearch() {
    const { container, input, menu } = getSearchElements();
    if (!container || !input) return;

    container.classList.add('is-expanded', 'is-active');
    input.setAttribute('aria-expanded', 'true');
    if (menu) menu.hidden = false;

    // Load search index
    const indexUrl = input.getAttribute('data-search-index') || '/index.json';
    loadSearchIndex(indexUrl).then(() => {
      if (input.value.trim().length >= 2) {
        performSearch(input.value);
      }
    });

    setTimeout(() => {
      input.focus();
      if (input.value) input.select();
    }, 30);
  }

  function closeNavbarSearch() {
    const { container, input, menu, results } = getSearchElements();
    if (!container) return;

    container.classList.remove('is-expanded', 'is-active');
    if (input) {
      input.setAttribute('aria-expanded', 'false');
      input.blur();
    }
    if (menu) menu.hidden = true;
    activeIndex = -1;
    updateHighlightedResult();
  }

  function clearSearchInput() {
    const { container, input, results, status } = getSearchElements();
    if (!input) return;

    if (!input.value && container && container.classList.contains('is-expanded')) {
      closeNavbarSearch();
      return;
    }

    input.value = '';
    if (container) container.classList.remove('has-query');
    currentResults = [];
    activeIndex = -1;
    if (results) results.innerHTML = '';
    if (status) {
      status.textContent = 'Type at least 2 characters to search...';
    }
    input.focus();
  }

  function updateHighlightedResult() {
    const { results, input } = getSearchElements();
    if (!results) return;

    const items = results.querySelectorAll('.cds--header__search-item');
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add('is-highlighted');
        item.setAttribute('aria-selected', 'true');
        if (input) input.setAttribute('aria-activedescendant', item.id);
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('is-highlighted');
        item.setAttribute('aria-selected', 'false');
      }
    });

    if (activeIndex === -1 && input) {
      input.removeAttribute('aria-activedescendant');
    }
  }

  async function performSearch(query) {
    const { container, input, menu, results, status } = getSearchElements();
    if (!results || !status) return;

    const trimmed = (query || '').trim();

    if (menu) menu.hidden = false;

    if (!trimmed || trimmed.length < 2) {
      if (container) container.classList.remove('has-query');
      status.textContent = 'Type at least 2 characters to search...';
      results.innerHTML = '';
      currentResults = [];
      activeIndex = -1;
      return;
    }

    if (container) container.classList.add('has-query');

    if (!searchIndex) {
      status.textContent = 'Loading search index...';
      results.innerHTML = '';
      const indexUrl = input ? input.getAttribute('data-search-index') : '/index.json';
      await loadSearchIndex(indexUrl);
      if (input && input.value.trim() !== trimmed) return;
      if (!searchIndex) {
        status.textContent = 'Failed to load search index.';
        return;
      }
    }

    const q = trimmed.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    // Scoring algorithm
    const scored = [];
    for (const item of searchIndex) {
      const title = (item.title || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const section = (item.section || '').toLowerCase();
      const tags = (item.tags || []).map(t => t.toLowerCase());
      const categories = (item.categories || []).map(c => c.toLowerCase());

      let score = 0;

      // Exact title match
      if (title === q) {
        score += 200;
      } else if (title.startsWith(q)) {
        score += 100;
      } else if (title.includes(q)) {
        score += 60;
      }

      // Check all terms in title
      const allTermsInTitle = terms.every(t => title.includes(t));
      if (allTermsInTitle) score += 40;

      // Tags / Categories
      for (const t of tags) {
        if (t === q) score += 50;
        else if (t.includes(q)) score += 25;
      }
      for (const c of categories) {
        if (c === q) score += 40;
        else if (c.includes(q)) score += 20;
      }

      // Section match
      if (section === q) score += 30;

      // Summary & Content
      if (summary.includes(q)) score += 20;
      if (content.includes(q)) score += 10;

      // Any term matches in summary or content
      let termMatches = 0;
      for (const term of terms) {
        if (summary.includes(term)) termMatches += 5;
        if (content.includes(term)) termMatches += 2;
      }
      score += termMatches;

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    currentResults = scored.slice(0, 8).map(s => s.item);

    if (currentResults.length === 0) {
      status.innerHTML = `No results found for "<strong>${escapeHtml(trimmed)}</strong>"`;
      results.innerHTML = '';
      activeIndex = -1;
      return;
    }

    status.textContent = `${currentResults.length} result${currentResults.length === 1 ? '' : 's'} found:`;

    const html = currentResults.map((item, idx) => {
      const sectionName = item.section ? item.section.toUpperCase() : 'PAGE';
      const snippet = extractSnippet(item, trimmed);
      const highlightedTitle = highlightMatches(item.title, trimmed);
      const highlightedSnippet = highlightMatches(snippet, trimmed);
      const itemId = `cds-search-item-${idx}`;

      return `
        <li class="cds--header__search-item" id="${itemId}" role="option" aria-selected="false" data-index="${idx}" data-url="${item.permalink}">
          <a href="${item.permalink}" class="cds--header__search-link" tabindex="-1">
            <div class="cds--header__search-item-header">
              <span class="cds--header__search-item-title">${highlightedTitle}</span>
              <span class="cds--tag cds--tag--sm cds--tag--blue">${escapeHtml(sectionName)}</span>
            </div>
            ${highlightedSnippet ? `<p class="cds--header__search-item-snippet">${highlightedSnippet}</p>` : ''}
          </a>
        </li>
      `;
    }).join('');

    results.innerHTML = html;
    activeIndex = -1;

    // Attach click and mouseenter handlers
    results.querySelectorAll('.cds--header__search-item').forEach((elem, idx) => {
      elem.addEventListener('mouseenter', () => {
        activeIndex = idx;
        updateHighlightedResult();
      });
      elem.addEventListener('click', () => {
        closeNavbarSearch();
      });
    });
  }

  function initNavbarSearch() {
    const { container, input, clearBtn, toggleBtn, results } = getSearchElements();
    if (!input) return;

    // Input events
    input.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });

    input.addEventListener('focus', () => {
      openNavbarSearch();
    });

    input.addEventListener('keydown', (e) => {
      const itemCount = currentResults.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (itemCount > 0) {
          activeIndex = (activeIndex + 1) % itemCount;
          updateHighlightedResult();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (itemCount > 0) {
          activeIndex = (activeIndex - 1 + itemCount) % itemCount;
          updateHighlightedResult();
        }
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < itemCount) {
          e.preventDefault();
          const targetUrl = currentResults[activeIndex].permalink;
          closeNavbarSearch();
          window.location.href = targetUrl;
        } else if (itemCount > 0) {
          e.preventDefault();
          const targetUrl = currentResults[0].permalink;
          closeNavbarSearch();
          window.location.href = targetUrl;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (input.value) {
          clearSearchInput();
        } else {
          closeNavbarSearch();
        }
      }
    });

    // Toggle button click (especially useful for mobile)
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (container && container.classList.contains('is-expanded')) {
          closeNavbarSearch();
        } else {
          openNavbarSearch();
        }
      });
    }

    // Clear / Close button click
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearSearchInput();
      });
    }

    // External triggers (widget bar, 404 page buttons)
    document.querySelectorAll('.js-open-search').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openNavbarSearch();
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!container) return;
      if (!container.contains(e.target) && !e.target.closest('.js-open-search')) {
        closeNavbarSearch();
      }
    });

    // Global keyboard shortcuts: '/' or 'Cmd+K' / 'Ctrl+K' to open; 'Escape' to close
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) ||
        (document.activeElement && document.activeElement.isContentEditable);

      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isInputActive) {
        e.preventDefault();
        openNavbarSearch();
      } else if (e.key === 'Escape') {
        closeNavbarSearch();
      }
    });

    // Preload index on idle or hover over toggle
    if (toggleBtn) {
      toggleBtn.addEventListener('mouseenter', () => {
        const indexUrl = input.getAttribute('data-search-index') || '/index.json';
        loadSearchIndex(indexUrl);
      }, { once: true });
    }

    // URL query param support (?q=... or ?search=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get('q') || urlParams.get('search');
      if (initialQuery) {
        input.value = initialQuery;
        openNavbarSearch();
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbarSearch);
  } else {
    initNavbarSearch();
  }
})();
