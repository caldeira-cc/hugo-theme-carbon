// IBM Carbon UI Shell & Navigation Interactions

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const isDesktop = () => window.matchMedia('(min-width: 66rem)').matches;

    // -------------------------------------------------------------
    // 1. Sidebar & Mobile Off-Canvas Drawer Controls
    // -------------------------------------------------------------
    const overlay = document.getElementById('carbon-drawer-overlay');
    const leftDrawer = document.getElementById('carbon-drawer-left');
    const rightDrawer = document.getElementById('carbon-drawer-right');

    const leftToggleBtns = document.querySelectorAll('.js-open-left-drawer, .js-toggle-left-sidebar');
    const rightToggleBtns = document.querySelectorAll('.js-open-right-drawer, .js-toggle-right-sidebar');
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

    function updateSidebarToggleStates() {
      const leftCollapsed = document.body.classList.contains('sidebar-left-collapsed');
      leftToggleBtns.forEach(btn => {
        btn.classList.toggle('is-collapsed', leftCollapsed);
        btn.classList.toggle('cds--header__menu-toggle--active', !leftCollapsed);
        btn.classList.toggle('is-active', !leftCollapsed);
        btn.setAttribute('aria-expanded', (!leftCollapsed).toString());
      });

      const rightCollapsed = document.body.classList.contains('sidebar-right-collapsed');
      rightToggleBtns.forEach(btn => {
        btn.classList.toggle('is-collapsed', rightCollapsed);
        btn.classList.toggle('cds--header__action--active', !rightCollapsed);
        btn.classList.toggle('is-active', !rightCollapsed);
        btn.setAttribute('aria-expanded', (!rightCollapsed).toString());
      });
    }

    function toggleLeftSidebar() {
      if (isDesktop()) {
        document.body.classList.toggle('sidebar-left-collapsed');
        updateSidebarToggleStates();
      } else {
        if (leftDrawer && leftDrawer.classList.contains('is-open')) {
          closeAllDrawers();
        } else {
          openDrawer(leftDrawer);
        }
      }
    }

    function toggleRightSidebar() {
      if (isDesktop()) {
        document.body.classList.toggle('sidebar-right-collapsed');
        updateSidebarToggleStates();
      } else {
        if (rightDrawer && rightDrawer.classList.contains('is-open')) {
          closeAllDrawers();
        } else {
          openDrawer(rightDrawer);
        }
      }
    }

    // Reset any legacy sidebar persistence keys so layout defaults to natural state
    try {
      localStorage.removeItem('carbon-sidebar-left-collapsed');
      localStorage.removeItem('carbon-sidebar-right-collapsed');
    } catch (e) {}
    updateSidebarToggleStates();

    leftToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleLeftSidebar();
      });
    });

    rightToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleRightSidebar();
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

    // Keyboard navigation (Escape key & Sidebar toggles)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDrawers();
        submenuParents.forEach(item => {
          item.classList.remove('is-open');
          const btn = item.querySelector('button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      } else if (e.altKey && e.key === '[') {
        e.preventDefault();
        toggleLeftSidebar();
      } else if (e.altKey && e.key === ']') {
        e.preventDefault();
        toggleRightSidebar();
      }
    });

    // -------------------------------------------------------------
    // 3. Table of Contents Scroll-Spy
    // -------------------------------------------------------------
    const tocLinks = Array.from(document.querySelectorAll('.carbon-sidebar-right__toc a, .cds--side-nav__toc a, .carbon-mobile-drawer a'));
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
