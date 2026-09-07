// Ad Management Module — IBM Carbon Design System v11
// Handles consent gating, AdSense push lifecycle, Ad Modal dialogs, and dismissal interactions

(function () {
  const SESSION_DISMISSED_KEY = 'carbon-ad-dismissed-';

  // Check if advertising consent is currently active
  function isAdvertisingConsented() {
    if (window.CarbonCookieConsent && typeof window.CarbonCookieConsent.hasConsent === 'function') {
      return window.CarbonCookieConsent.hasConsent('advertising');
    }
    try {
      const raw = localStorage.getItem('carbon-cookie-consent');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed.categories && parsed.categories.advertising === true;
    } catch (e) {
      return false;
    }
  }

  // Update visual state of all ad slots based on consent
  function updateAdSlotsState(consented) {
    const adSlots = document.querySelectorAll('.carbon-ad-slot, .carbon-ad-modal');
    adSlots.forEach((slot) => {
      if (consented) {
        slot.classList.add('is-consented');
      } else {
        slot.classList.remove('is-consented');
      }
    });

    if (consented) {
      pushGoogleAds();
    }
  }

  // Push pending Google Ads units to adsbygoogle array
  function pushGoogleAds() {
    const uninitializedAds = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
    if (uninitializedAds.length === 0) return;

    try {
      uninitializedAds.forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (e) {
      console.debug('Carbon Ads: Note on adsbygoogle push', e);
    }
  }

  // Open the Ad Modal dialog
  function openModal() {
    const modal = document.getElementById('carbon-ad-modal');
    if (!modal) return;

    // Check if modal slot is consented
    if (isAdvertisingConsented()) {
      modal.classList.add('is-consented');
    } else {
      modal.classList.remove('is-consented');
    }

    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first focusable item
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  // Close the Ad Modal dialog
  function closeModal() {
    const modal = document.getElementById('carbon-ad-modal');
    if (!modal) return;

    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Handle dismissible ad slots (sidebar, bottom dock, etc.)
  function dismissSlot(slotElement) {
    if (!slotElement) return;
    const pos = slotElement.getAttribute('data-ad-slot-position') || 'slot';
    
    // Animate collapse / hide
    slotElement.style.transition = 'opacity 0.25s ease, transform 0.25s ease, max-height 0.25s ease';
    slotElement.style.opacity = '0';
    slotElement.style.transform = 'scale(0.96)';
    slotElement.style.maxHeight = '0';
    slotElement.style.overflow = 'hidden';
    slotElement.style.marginTop = '0';
    slotElement.style.marginBottom = '0';
    slotElement.style.paddingTop = '0';
    slotElement.style.paddingBottom = '0';
    slotElement.style.border = 'none';

    setTimeout(() => {
      slotElement.style.display = 'none';
    }, 260);

    // Record dismissal for this session
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY + pos, 'true');
    } catch (e) {}
  }

  // Restore session dismissals on page load
  function applyDismissedSlots() {
    const adSlots = document.querySelectorAll('.carbon-ad-slot[data-ad-slot-position]');
    adSlots.forEach((slot) => {
      const pos = slot.getAttribute('data-ad-slot-position');
      try {
        if (sessionStorage.getItem(SESSION_DISMISSED_KEY + pos) === 'true') {
          slot.style.display = 'none';
        }
      } catch (e) {}
    });
  }

  // Bind click & keyboard events
  function bindEvents() {
    // Click delegation for ad actions
    document.addEventListener('click', (e) => {
      // Trigger modal open
      const trigger = e.target.closest('[data-ad-trigger="modal"]');
      if (trigger) {
        e.preventDefault();
        openModal();
        return;
      }

      // Close modal
      const closeAction = e.target.closest('[data-ad-action="close-modal"]');
      if (closeAction) {
        e.preventDefault();
        closeModal();
        return;
      }

      // Dismiss ad slot
      const dismissAction = e.target.closest('[data-ad-action="dismiss"]');
      if (dismissAction) {
        e.preventDefault();
        const slot = dismissAction.closest('.carbon-ad-slot');
        if (slot) dismissSlot(slot);
        return;
      }
    });

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('carbon-ad-modal');
        if (modal && modal.classList.contains('is-visible')) {
          closeModal();
        }
      }
    });

    // Listen for consent updates from Cookie Consent module
    window.addEventListener('carbon-consent-updated', (e) => {
      const consented = e.detail && e.detail.categories && e.detail.categories.advertising === true;
      updateAdSlotsState(consented);
    });
  }

  // Initialize
  function init() {
    bindEvents();
    applyDismissedSlots();
    
    // Initial state check
    const consented = isAdvertisingConsented();
    updateAdSlotsState(consented);
  }

  // Expose global CarbonAds API
  window.CarbonAds = {
    openModal,
    closeModal,
    refreshAds: pushGoogleAds,
    hasConsent: isAdvertisingConsented,
    dismissSlot
  };

  document.addEventListener('DOMContentLoaded', init);
})();
