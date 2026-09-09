// IBM Carbon Design System v11 Vanilla Interactive Component Handlers

export function initCarbonComponents() {
  // 1. Accordion Interactivity
  const accordionHeadings = document.querySelectorAll('.cds--accordion__heading');
  accordionHeadings.forEach(heading => {
    heading.addEventListener('click', () => {
      const item = heading.closest('.cds--accordion__item');
      if (!item) return;
      const isActive = item.classList.contains('cds--accordion__item--active');
      
      if (isActive) {
        item.classList.remove('cds--accordion__item--active');
        heading.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('cds--accordion__item--active');
        heading.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 2. Tabs & Tab Panels Interactivity
  const tabContainers = document.querySelectorAll('.cds--tabs');
  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.cds--tabs__tab');
    const panels = container.querySelectorAll('.cds--tabs__panel');

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => {
          t.classList.remove('cds--tabs__tab--selected', 'is-active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => {
          p.classList.remove('is-active');
        });

        tab.classList.add('cds--tabs__tab--selected', 'is-active');
        tab.setAttribute('aria-selected', 'true');

        if (panels[index]) {
          panels[index].classList.add('is-active');
        }
      });
    });
  });

  // 3. Content Switcher Interactivity
  const switchers = document.querySelectorAll('.cds--content-switcher');
  switchers.forEach(switcher => {
    const buttons = switcher.querySelectorAll('.cds--content-switcher__btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        buttons.forEach(b => {
          b.classList.remove('cds--content-switcher--selected', 'is-selected');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('cds--content-switcher--selected', 'is-selected');
        btn.setAttribute('aria-selected', 'true');

        const targetSelector = btn.getAttribute('data-target');
        if (targetSelector) {
          const targets = document.querySelectorAll(`[data-switcher-group="${switcher.id || 'default'}"]`);
          targets.forEach(t => t.style.display = 'none');
          const activeTarget = document.querySelector(targetSelector);
          if (activeTarget) activeTarget.style.display = '';
        }
      });
    });
  });

  // 4. Overflow Menu Interactivity
  const overflowMenus = document.querySelectorAll('.cds--overflow-menu');
  overflowMenus.forEach(menu => {
    const trigger = menu.querySelector('.cds--overflow-menu__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('is-open');
      overflowMenus.forEach(m => m.classList.remove('is-open'));
      if (!isOpen) {
        menu.classList.add('is-open');
      }
    });
  });

  document.addEventListener('click', () => {
    overflowMenus.forEach(menu => menu.classList.remove('is-open'));
  });

  // 5. Toast / Notification Dismissal
  const closeNotificationBtns = document.querySelectorAll('.cds--toast-notification__close-button, .cds--inline-notification__close-button');
  closeNotificationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const notification = btn.closest('.cds--toast-notification, .cds--inline-notification');
      if (notification) {
        notification.style.transition = 'opacity 150ms ease, transform 150ms ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-4px)';
        setTimeout(() => notification.remove(), 160);
      }
    });
  });

  // 6. Carbon AI Label (AILabel / Slug) Interactivity
  const aiLabels = document.querySelectorAll('.cds--ai-label');
  aiLabels.forEach(label => {
    const btn = label.querySelector('.cds--ai-label__button');
    const popover = label.querySelector('.cds--ai-label__popover');
    const closeBtn = label.querySelector('.cds--ai-label__close-button');
    if (!btn || !popover) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = popover.classList.contains('is-open');
      document.querySelectorAll('.cds--ai-label__popover.is-open').forEach(p => {
        p.classList.remove('is-open');
        p.setAttribute('hidden', '');
        const parentBtn = p.closest('.cds--ai-label')?.querySelector('.cds--ai-label__button');
        if (parentBtn) parentBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        popover.classList.add('is-open');
        popover.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.remove('is-open');
        popover.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      });
    }

    popover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.cds--ai-label__popover.is-open').forEach(p => {
      p.classList.remove('is-open');
      p.setAttribute('hidden', '');
      const parentBtn = p.closest('.cds--ai-label')?.querySelector('.cds--ai-label__button');
      if (parentBtn) parentBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.cds--ai-label__popover.is-open').forEach(p => {
        p.classList.remove('is-open');
        p.setAttribute('hidden', '');
        const parentBtn = p.closest('.cds--ai-label')?.querySelector('.cds--ai-label__button');
        if (parentBtn) {
          parentBtn.setAttribute('aria-expanded', 'false');
          parentBtn.focus();
        }
      });
    }
  });
}
