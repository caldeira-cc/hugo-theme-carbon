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

  // 2. Tabs & Tab Panels Interactivity (Carbon React v11 Specification)
  const tabContainers = document.querySelectorAll('.cds--tabs');
  tabContainers.forEach(container => {
    const isVertical = container.classList.contains('cds--tabs--vertical');
    const tabList = container.querySelector('.cds--tab--list, .cds--tabs__nav');
    const tabs = Array.from(container.querySelectorAll('.cds--tabs__nav-item, .cds--tabs__nav-link, .cds--tabs__tab'));
    const panels = Array.from(container.querySelectorAll('.cds--tab-content, .cds--tabs__panel'));
    const prevBtn = container.querySelector('.cds--tab--overflow-nav-button--previous');
    const nextBtn = container.querySelector('.cds--tab--overflow-nav-button--next');

    function activateTab(index, setFocus = false) {
      if (index < 0 || index >= tabs.length) return;
      const targetTab = tabs[index];
      if (targetTab.hasAttribute('disabled') || targetTab.getAttribute('aria-disabled') === 'true') return;

      tabs.forEach((t, i) => {
        const isSelected = i === index;
        t.classList.toggle('cds--tabs__nav-item--selected', isSelected);
        t.classList.toggle('cds--tabs__tab--selected', isSelected);
        t.classList.toggle('is-active', isSelected);
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        t.setAttribute('tabindex', isSelected ? '0' : '-1');
      });

      panels.forEach((p, i) => {
        const isSelected = i === index;
        p.classList.toggle('is-active', isSelected);
        if (isSelected) {
          p.removeAttribute('hidden');
        } else {
          p.setAttribute('hidden', '');
        }
      });

      if (setFocus) {
        targetTab.focus();
      }

      if (tabList && targetTab) {
        targetTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        // If clicked on dismiss close icon, handle dismiss
        if (e.target.closest('.cds--tabs__nav-item--close-icon')) {
          e.preventDefault();
          e.stopPropagation();
          const panel = panels[index];
          tab.remove();
          if (panel) panel.remove();
          const remainingTabs = Array.from(container.querySelectorAll('.cds--tabs__nav-item, .cds--tabs__nav-link, .cds--tabs__tab'));
          if (remainingTabs.length > 0) {
            const nextIdx = Math.min(index, remainingTabs.length - 1);
            remainingTabs[nextIdx].click();
          }
          return;
        }

        e.preventDefault();
        activateTab(index);
      });

      // Keyboard navigation per W3C APG / Carbon React
      tab.addEventListener('keydown', (e) => {
        const enabledTabs = tabs.filter(t => !t.hasAttribute('disabled') && t.getAttribute('aria-disabled') !== 'true');
        const currentEnabledIdx = enabledTabs.indexOf(tab);
        if (currentEnabledIdx === -1) return;

        let targetIdx = -1;
        if ((!isVertical && e.key === 'ArrowRight') || (isVertical && e.key === 'ArrowDown')) {
          e.preventDefault();
          targetIdx = (currentEnabledIdx + 1) % enabledTabs.length;
        } else if ((!isVertical && e.key === 'ArrowLeft') || (isVertical && e.key === 'ArrowUp')) {
          e.preventDefault();
          targetIdx = (currentEnabledIdx - 1 + enabledTabs.length) % enabledTabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          targetIdx = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          targetIdx = enabledTabs.length - 1;
        } else if (e.key === 'Delete' && tab.querySelector('.cds--tabs__nav-item--close-icon')) {
          e.preventDefault();
          tab.querySelector('.cds--tabs__nav-item--close-icon')?.click();
          return;
        }

        if (targetIdx !== -1) {
          const newTab = enabledTabs[targetIdx];
          const newIndex = tabs.indexOf(newTab);
          activateTab(newIndex, true);
        }
      });
    });

    // Overflow scroll buttons
    if (tabList) {
      function updateOverflowButtons() {
        if (!prevBtn || !nextBtn) return;
        const hasOverflow = tabList.scrollWidth > tabList.clientWidth + 2;
        if (!hasOverflow) {
          prevBtn.classList.add('cds--tab--overflow-nav-button--hidden');
          nextBtn.classList.add('cds--tab--overflow-nav-button--hidden');
          return;
        }
        prevBtn.classList.toggle('cds--tab--overflow-nav-button--hidden', tabList.scrollLeft <= 2);
        nextBtn.classList.toggle('cds--tab--overflow-nav-button--hidden', tabList.scrollLeft + tabList.clientWidth >= tabList.scrollWidth - 2);
      }

      tabList.addEventListener('scroll', updateOverflowButtons);
      window.addEventListener('resize', updateOverflowButtons);
      setTimeout(updateOverflowButtons, 50);

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          tabList.scrollBy({ left: -200, behavior: 'smooth' });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          tabList.scrollBy({ left: 200, behavior: 'smooth' });
        });
      }
    }
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
  const closeNotificationBtns = document.querySelectorAll(
    '.cds--toast-notification__close-button, .cds--inline-notification__close-button, .cds--actionable-notification__close-button'
  );
  closeNotificationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const notification = btn.closest('.cds--toast-notification, .cds--inline-notification, .cds--actionable-notification');
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
