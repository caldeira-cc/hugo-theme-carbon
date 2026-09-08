// ==============================================================================
// IBM Carbon Design System v11 — Theme State Manager (Dual-Style: Light / Dark)
// File: assets/js/theme.js
// ==============================================================================

(function () {
  const STORAGE_KEY = 'carbon-theme-preference';
  const VALID_PREFERENCES = ['system', 'light', 'dark'];

  /**
   * Reads system OS color scheme
   * @returns {'light'|'dark'}
   */
  function getSystemScheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Reads stored user preference from localStorage or default attribute
   * @returns {'system'|'light'|'dark'}
   */
  function getSavedPreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_PREFERENCES.includes(saved)) {
      return saved;
    }
    const defaultMode = document.documentElement.getAttribute('data-carbon-theme') || 'system';
    return VALID_PREFERENCES.includes(defaultMode) ? defaultMode : 'system';
  }

  /**
   * Resolves active visual style ('light' or 'dark') given a preference
   * @param {string} preference - 'system' | 'light' | 'dark'
   * @returns {'light'|'dark'}
   */
  function resolveActiveTheme(preference) {
    if (preference === 'light') return 'light';
    if (preference === 'dark') return 'dark';
    return getSystemScheme();
  }

  /**
   * Applies the selected theme to the document and updates storage & UI controls
   * @param {string} preference - 'system' | 'light' | 'dark'
   * @param {boolean} save - Whether to persist preference in localStorage
   */
  function applyTheme(preference, save = true) {
    const pref = VALID_PREFERENCES.includes(preference) ? preference : 'system';
    const activeTheme = resolveActiveTheme(pref);

    document.documentElement.setAttribute('data-carbon-theme', activeTheme);
    document.documentElement.setAttribute('data-theme-preference', pref);

    if (save) {
      localStorage.setItem(STORAGE_KEY, pref);
    }

    // Synchronize select dropdown if present
    const themeSelect = document.getElementById('theme-switcher-select');
    if (themeSelect) {
      themeSelect.value = pref;
    }

    // Synchronize toggle button if present
    const toggleBtn = document.getElementById('theme-switcher-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('data-active-theme', activeTheme);
      toggleBtn.setAttribute('aria-label', `Current theme: ${activeTheme}. Click to toggle.`);
    }

    // Dispatch custom event for dynamic charts, maps & Web Workers
    window.dispatchEvent(new CustomEvent('carbon-theme-changed', {
      detail: {
        theme: activeTheme,
        preference: pref,
        isDark: activeTheme === 'dark'
      }
    }));
  }

  // Initialize immediately on script execution
  const initialPref = getSavedPreference();
  applyTheme(initialPref, false);

  // Live listener for OS / Browser color scheme changes when on 'system'
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentPref = localStorage.getItem(STORAGE_KEY) || 'system';
      if (currentPref === 'system') {
        applyTheme('system', false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  /**
   * Binds UI event listeners once DOM is ready
   */
  function bindUI() {
    // 1. Select element
    const themeSelect = document.getElementById('theme-switcher-select');
    if (themeSelect) {
      themeSelect.value = getSavedPreference();
      themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value, true);
      });
    }

    // 2. Toggle button (cycles light <-> dark)
    const toggleBtn = document.getElementById('theme-switcher-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentActive = document.documentElement.getAttribute('data-carbon-theme') || 'light';
        const nextTheme = currentActive === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindUI);
  } else {
    bindUI();
  }

  // Export to window for programmatic control
  window.CarbonTheme = {
    get: getSavedPreference,
    getActive: () => document.documentElement.getAttribute('data-carbon-theme') || 'light',
    set: (mode) => applyTheme(mode, true),
    isDark: () => document.documentElement.getAttribute('data-carbon-theme') === 'dark',
    standardModes: VALID_PREFERENCES
  };
})();
