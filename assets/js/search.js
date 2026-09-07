// Client-Side Instant Search Engine

(function () {
  let searchIndex = null;
  let isLoading = false;

  async function loadSearchIndex() {
    if (searchIndex || isLoading) return;
    isLoading = true;
    try {
      const response = await fetch('/index.json');
      if (response.ok) {
        searchIndex = await response.json();
      }
    } catch (err) {
      console.error('Failed to load search index', err);
    } finally {
      isLoading = false;
    }
  }

  function openSearchModal() {
    const modal = document.getElementById('carbon-search-modal');
    const input = document.getElementById('carbon-search-input');
    if (!modal || !input) return;

    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    loadSearchIndex();
    setTimeout(() => input.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closeSearchModal() {
    const modal = document.getElementById('carbon-search-modal');
    if (!modal) return;

    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function performSearch(query) {
    const resultsContainer = document.getElementById('carbon-search-results');
    if (!resultsContainer) return;

    if (!query || query.trim().length < 2) {
      resultsContainer.innerHTML = '<li class="carbon-search-modal__empty">Type at least 2 characters to search across documentation, blog posts, and datasets.</li>';
      return;
    }

    if (!searchIndex || searchIndex.length === 0) {
      resultsContainer.innerHTML = '<li class="carbon-search-modal__empty">Loading search index...</li>';
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = searchIndex.filter(item => {
      const title = (item.title || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const tags = (item.tags || []).map(t => t.toLowerCase()).join(' ');
      const categories = (item.categories || []).map(c => c.toLowerCase()).join(' ');
      
      return title.includes(q) || summary.includes(q) || content.includes(q) || tags.includes(q) || categories.includes(q);
    });

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<li class="carbon-search-modal__empty">No results found for "<strong>${escapeHtml(query)}</strong>"</li>`;
      return;
    }

    const html = matches.slice(0, 10).map(item => `
      <li class="carbon-search-modal__item">
        <a href="${item.permalink}">
          <div class="result-title">${escapeHtml(item.title)}</div>
          <div class="result-summary">${escapeHtml(item.summary || item.description || '')}</div>
        </a>
      </li>
    `).join('');

    resultsContainer.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Search trigger buttons
    const triggerBtns = document.querySelectorAll('.js-open-search');
    triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearchModal();
      });
    });

    // Close buttons
    const closeBtns = document.querySelectorAll('.js-close-search');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', closeSearchModal);
    });

    // Modal background click
    const modal = document.getElementById('carbon-search-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSearchModal();
      });
    }

    // Search input typing
    const searchInput = document.getElementById('carbon-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
      });
    }

    // Keyboard shortcuts: '/' or 'Cmd+K' / 'Ctrl+K', and 'Escape'
    document.addEventListener('keydown', (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === 'Escape') {
        closeSearchModal();
      }
    });
  });
})();
