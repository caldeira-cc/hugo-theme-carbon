// Cookie Consent Manager — GDPR-Compliant Cookie Consent System
// Manages cookie categories: Essential (always on), Analytics, Advertising
// Persists preferences in localStorage, gates third-party scripts

(function () {
  const STORAGE_KEY = 'carbon-cookie-consent';
  const CONSENT_VERSION = '1.0';

  // Default consent state
  const DEFAULT_CONSENT = {
    version: CONSENT_VERSION,
    timestamp: null,
    categories: {
      essential: true,    // Always true, cannot be disabled
      analytics: false,
      advertising: false
    }
  };

  // Read saved consent from localStorage
  function getSavedConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Invalidate if consent version changed
      if (parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  // Save consent to localStorage
  function saveConsent(consent) {
    consent.timestamp = new Date().toISOString();
    consent.version = CONSENT_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  }

  // Check if a specific category is consented
  function hasConsent(category) {
    const consent = getSavedConsent();
    if (!consent) return false;
    if (category === 'essential') return true;
    return consent.categories[category] === true;
  }

  // Apply consent: inject or remove scripts based on consent state
  function applyConsent(consent) {
    // Google Ads — only inject if advertising consent is granted
    if (consent.categories.advertising) {
      injectGoogleAds();
    } else {
      removeGoogleAds();
    }

    // Dispatch a custom event so other scripts can react
    window.dispatchEvent(new CustomEvent('carbon-consent-updated', { detail: consent }));
  }

  // Inject Google Ads script if not already present and config enables it
  function injectGoogleAds() {
    const adsContainer = document.querySelector('[data-google-ads-publisher]');
    if (!adsContainer) return;

    const publisherId = adsContainer.getAttribute('data-google-ads-publisher');
    if (!publisherId) return;

    // Don't inject twice
    if (document.getElementById('google-ads-script')) return;

    const script = document.createElement('script');
    script.id = 'google-ads-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    document.head.appendChild(script);
  }

  // Remove Google Ads script if present
  function removeGoogleAds() {
    const existing = document.getElementById('google-ads-script');
    if (existing) existing.remove();
  }

  // Show the cookie banner
  function showBanner() {
    const banner = document.getElementById('carbon-cookie-banner');
    if (banner) {
      banner.classList.add('is-visible');
      banner.setAttribute('aria-hidden', 'false');
    }
  }

  // Hide the cookie banner
  function hideBanner() {
    const banner = document.getElementById('carbon-cookie-banner');
    if (banner) {
      banner.classList.remove('is-visible');
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  // Show the preferences modal
  function showPreferencesModal() {
    const modal = document.getElementById('carbon-cookie-modal');
    if (!modal) return;

    // Sync toggle states with current consent
    const consent = getSavedConsent() || DEFAULT_CONSENT;
    const analyticsToggle = modal.querySelector('#cookie-toggle-analytics');
    const advertisingToggle = modal.querySelector('#cookie-toggle-advertising');
    if (analyticsToggle) analyticsToggle.checked = consent.categories.analytics;
    if (advertisingToggle) advertisingToggle.checked = consent.categories.advertising;

    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus trap — focus the first interactive element
    const firstFocusable = modal.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  // Hide the preferences modal
  function hidePreferencesModal() {
    const modal = document.getElementById('carbon-cookie-modal');
    if (modal) {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // Accept all cookies
  function acceptAll() {
    const consent = {
      version: CONSENT_VERSION,
      timestamp: null,
      categories: {
        essential: true,
        analytics: true,
        advertising: true
      }
    };
    saveConsent(consent);
    applyConsent(consent);
    hideBanner();
    hidePreferencesModal();
  }

  // Reject all optional cookies
  function rejectAll() {
    const consent = {
      version: CONSENT_VERSION,
      timestamp: null,
      categories: {
        essential: true,
        analytics: false,
        advertising: false
      }
    };
    saveConsent(consent);
    applyConsent(consent);
    hideBanner();
    hidePreferencesModal();
  }

  // Save preferences from modal toggles
  function savePreferences() {
    const modal = document.getElementById('carbon-cookie-modal');
    if (!modal) return;

    const analyticsToggle = modal.querySelector('#cookie-toggle-analytics');
    const advertisingToggle = modal.querySelector('#cookie-toggle-advertising');

    const consent = {
      version: CONSENT_VERSION,
      timestamp: null,
      categories: {
        essential: true,
        analytics: analyticsToggle ? analyticsToggle.checked : false,
        advertising: advertisingToggle ? advertisingToggle.checked : false
      }
    };
    saveConsent(consent);
    applyConsent(consent);
    hideBanner();
    hidePreferencesModal();
  }

  // Attach event listeners
  function bindEvents() {
    // Banner buttons
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-cookie-action]');
      if (!target) return;

      e.preventDefault();

      const action = target.getAttribute('data-cookie-action');
      switch (action) {
        case 'accept-all':
          acceptAll();
          break;
        case 'reject-all':
          rejectAll();
          break;
        case 'manage-preferences':
          hideBanner();
          showPreferencesModal();
          break;
        case 'save-preferences':
          savePreferences();
          break;
        case 'close-modal':
          hidePreferencesModal();
          break;
        case 'open-settings':
          showPreferencesModal();
          break;
      }
    });

    // Close modal on backdrop click
    const modal = document.getElementById('carbon-cookie-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) hidePreferencesModal();
      });
    }

    // ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hidePreferencesModal();
      }
    });
  }

  // Initialize on DOMContentLoaded
  function init() {
    bindEvents();

    const savedConsent = getSavedConsent();
    if (savedConsent) {
      // Apply saved consent silently (no banner)
      applyConsent(savedConsent);
    } else {
      // First visit — show the banner
      showBanner();
    }
  }

  // Expose global API for other scripts to check consent
  window.CarbonCookieConsent = {
    hasConsent,
    getConsent: getSavedConsent,
    openSettings: showPreferencesModal,
    acceptAll,
    rejectAll
  };

  document.addEventListener('DOMContentLoaded', init);
})();
