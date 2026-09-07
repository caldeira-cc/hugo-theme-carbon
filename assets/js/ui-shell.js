// IBM Carbon UI Shell & Navigation Interactions

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Mobile Off-Canvas Drawer Controls
    // -------------------------------------------------------------
    const overlay = document.getElementById('carbon-drawer-overlay');
    const leftDrawer = document.getElementById('carbon-drawer-left');
    const rightDrawer = document.getElementById('carbon-drawer-right');

    const openLeftBtns = document.querySelectorAll('.js-open-left-drawer');
    const openRightBtns = document.querySelectorAll('.js-open-right-drawer');
    const closeBtns = document.querySelectorAll('.js-close-drawer');

    function openDrawer(drawer) {
      if (!drawer) return;
      closeAllDrawers();
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      if (overlay) {
        overlay.classList.add('is-open');
      }
      document.body.style.overflow = 'hidden';
    }

    function closeAllDrawers() {
      if (leftDrawer) {
        leftDrawer.classList.remove('is-open');
        leftDrawer.setAttribute('aria-hidden', 'true');
      }
      if (rightDrawer) {
        rightDrawer.classList.remove('is-open');
        rightDrawer.setAttribute('aria-hidden', 'true');
      }
      if (overlay) {
        overlay.classList.remove('is-open');
      }
      document.body.style.overflow = '';
    }

    openLeftBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer(leftDrawer);
      });
    });

    openRightBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer(rightDrawer);
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', closeAllDrawers);
    });

    if (overlay) {
      overlay.addEventListener('click', closeAllDrawers);
    }

    // -------------------------------------------------------------
    // 2. Global Navbar Submenu Dropdown Toggles (Click & Touch)
    // -------------------------------------------------------------
    const submenuParents = document.querySelectorAll('.cds--header__menu-item.has-children');

    submenuParents.forEach(item => {
      const button = item.querySelector('button');
      if (!button) return;

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = item.classList.contains('is-open');

        // Close other open submenus
        submenuParents.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('button');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current submenu
        if (isOpen) {
          item.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Close open menus on outside click
    document.addEventListener('click', () => {
      submenuParents.forEach(item => {
        item.classList.remove('is-open');
        const btn = item.querySelector('button');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Keyboard navigation (Escape key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDrawers();
        submenuParents.forEach(item => {
          item.classList.remove('is-open');
          const btn = item.querySelector('button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // -------------------------------------------------------------
    // 3. Table of Contents Scroll-Spy
    // -------------------------------------------------------------
    const tocLinks = Array.from(document.querySelectorAll('.carbon-sidebar-right__toc a, .carbon-mobile-drawer a'));
    if (tocLinks.length > 0) {
      const targetIds = tocLinks.map(l => l.getAttribute('href')).filter(h => h && h.startsWith('#')).map(h => h.slice(1));
      const targetElements = targetIds.map(id => document.getElementById(id)).filter(Boolean);

      if (targetElements.length > 0) {
        const updateActiveToc = () => {
          const scrollPos = window.scrollY + 140;
          let currentEl = null;

          for (let i = targetElements.length - 1; i >= 0; i--) {
            if (targetElements[i].offsetTop <= scrollPos) {
              currentEl = targetElements[i];
              break;
            }
          }

          if (!currentEl && targetElements.length > 0 && window.scrollY < 200) {
            currentEl = targetElements[0];
          }

          if (currentEl && currentEl.id) {
            tocLinks.forEach(link => {
              if (link.getAttribute('href') === `#${currentEl.id}`) {
                link.classList.add('is-active');
              } else {
                link.classList.remove('is-active');
              }
            });
          }
        };

        window.addEventListener('scroll', updateActiveToc, { passive: true });
        updateActiveToc();
      }
    }
  });
})();
