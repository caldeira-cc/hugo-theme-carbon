// IBM Carbon Theme State Manager (Default Sage Identity + Section-Aware Showcase)

(function () {
  const STORAGE_KEY = 'carbon-theme-preference';
  const SHOWCASE_THEMES = ['white', 'g10', 'g90', 'g100'];
  const LIGHT_THEMES = ['light', 'default_light', 'white', 'g10'];
  const DARK_THEMES = ['dark', 'default_dark', 'g90', 'g100'];

  function isThemeSection() {
    const sectionAttr = document.documentElement.getAttribute('data-section');
    if (sectionAttr === 'theme') return true;
    if (sectionAttr === '_default') return false;
    const path = window.location.pathname;
    return path === '/theme' || path.startsWith('/theme/') || path.includes('/theme/');
  }

  function getSystemScheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedPreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return 'system';
  }

  function getAllowedThemes() {
    const attr = document.documentElement.getAttribute('data-allowed-themes');
    return attr ? attr.split(',').map(s => s.trim()).filter(Boolean) : null;
  }

  function resolveActiveTheme(preference) {
    const inShowcase = isThemeSection();
    const systemScheme = getSystemScheme();
    const allowed = getAllowedThemes();

    if (allowed && allowed.length > 0) {
      if (!preference || preference === 'system') {
        return systemScheme === 'dark' ? (allowed.includes('g90') ? 'g90' : allowed[allowed.length - 1]) : (allowed.includes('g10') ? 'g10' : allowed[0]);
      }
      if (preference === 'light') {
        return allowed.includes('g10') ? 'g10' : allowed[0];
      }
      if (preference === 'dark') {
        return allowed.includes('g90') ? 'g90' : allowed[allowed.length - 1];
      }
      if (allowed.includes(preference)) {
        return preference;
      }
      return systemScheme === 'dark' ? (allowed.includes('g90') ? 'g90' : allowed[allowed.length - 1]) : (allowed.includes('g10') ? 'g10' : allowed[0]);
    }

    if (!preference || preference === 'system') {
      if (inShowcase) {
        return systemScheme === 'dark' ? 'g100' : 'white';
      }
      return systemScheme === 'dark' ? 'dark' : 'light';
    }

    if (preference === 'light') {
      return inShowcase ? 'white' : 'light';
    }

    if (preference === 'dark') {
      return inShowcase ? 'g100' : 'dark';
    }

    // Showcase theme chosen (e.g. khaki, crimson, teal, etc.)
    if (SHOWCASE_THEMES.includes(preference)) {
      if (inShowcase) {
        return preference;
      }
      // On _default section, fallback to standard light/dark based on theme type
      return LIGHT_THEMES.includes(preference) ? 'light' : 'dark';
    }

    return inShowcase ? (systemScheme === 'dark' ? 'g100' : 'white') : (systemScheme === 'dark' ? 'dark' : 'light');
  }

  function applyTheme(preference, save = true) {
    const pref = preference || 'system';
    const activeTheme = resolveActiveTheme(pref);

    document.documentElement.setAttribute('data-carbon-theme', activeTheme);
    document.documentElement.setAttribute('data-theme-preference', pref);

    if (save) {
      localStorage.setItem(STORAGE_KEY, pref);
    }

    // Synchronize select element if present
    const themeSelect = document.getElementById('theme-switcher-select');
    if (themeSelect) {
      const hasPrefOption = Array.from(themeSelect.options).some(opt => opt.value === pref);
      const hasActiveOption = Array.from(themeSelect.options).some(opt => opt.value === activeTheme);
      
      if (hasPrefOption) {
        themeSelect.value = pref;
      } else if (hasActiveOption) {
        themeSelect.value = activeTheme;
      } else if (Array.from(themeSelect.options).some(opt => opt.value === 'system')) {
        themeSelect.value = 'system';
      }
    }

    // Dispatch custom event for dynamic charts, maps & islands
    window.dispatchEvent(new CustomEvent('carbon-theme-changed', {
      detail: {
        theme: activeTheme,
        preference: pref,
        isDark: DARK_THEMES.includes(activeTheme),
        isThemeSection: isThemeSection()
      }
    }));
  }

  // Initialize immediately on script execution to avoid flash of unstyled theme
  const initialPref = getSavedPreference();
  applyTheme(initialPref, false);

  // Live listener for OS / Browser color scheme change
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

  function bindUI() {
    const themeSelect = document.getElementById('theme-switcher-select');
    if (themeSelect) {
      const currentPref = getSavedPreference();
      const activeTheme = resolveActiveTheme(currentPref);
      const hasPrefOption = Array.from(themeSelect.options).some(opt => opt.value === currentPref);
      
      if (hasPrefOption) {
        themeSelect.value = currentPref;
      } else if (Array.from(themeSelect.options).some(opt => opt.value === activeTheme)) {
        themeSelect.value = activeTheme;
      }

      themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value, true);
      });
    }

    // Toggle button support (cycles light/dark)
    const toggleBtn = document.getElementById('theme-switcher-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentActive = document.documentElement.getAttribute('data-carbon-theme') || 'light';
        const isCurrentLight = LIGHT_THEMES.includes(currentActive);
        const inShowcase = isThemeSection();

        if (inShowcase) {
          const next = isCurrentLight ? 'g100' : 'white';
          applyTheme(next, true);
        } else {
          const next = isCurrentLight ? 'dark' : 'light';
          applyTheme(next, true);
        }
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
    getActive: () => document.documentElement.getAttribute('data-carbon-theme'),
    set: applyTheme,
    isThemeSection: isThemeSection,
    themes: SHOWCASE_THEMES,
    standardModes: ['system', 'light', 'dark']
  };
})();
