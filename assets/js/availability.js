// IBM Carbon Availability, Working Schedule & Timetable Engine

(function () {
  const config = {
    timezone: 'Europe/London',
    schedule: {
      1: { name: 'Monday', enabled: true, start: 10, end: 18 },
      2: { name: 'Tuesday', enabled: true, start: 10, end: 18 },
      3: { name: 'Wednesday', enabled: true, start: 10, end: 18 },
      4: { name: 'Thursday', enabled: true, start: 10, end: 18 },
      5: { name: 'Friday', enabled: true, start: 10, end: 18 },
      6: { name: 'Saturday', enabled: false, start: null, end: null },
      0: { name: 'Sunday', enabled: false, start: null, end: null }
    },
    vacations: [
      { name: 'Summer Break', start: '2026-08-15', end: '2026-08-22', note: 'Annual Summer Leave — Offline / No meeting availability' },
      { name: 'Summer Bank Holiday', start: '2026-08-31', end: '2026-08-31', note: 'Public Bank Holiday' },
      { name: 'Quarterly Systems Planning', start: '2026-10-12', end: '2026-10-14', note: 'Out of Office — Systems Offsite' },
      { name: 'Year-End Recess', start: '2026-12-24', end: '2026-12-31', note: 'Winter Break & Year-End Closure' }
    ]
  };

  function getTimeInZone(date, tz) {
    try {
      const invDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
      const diff = date.getTime() - invDate.getTime();
      return new Date(date.getTime() - diff);
    } catch (e) {
      return date;
    }
  }

  function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function evaluateStatus(date = new Date()) {
    const zoneDate = getTimeInZone(date, config.timezone);
    const isoDate = formatDateISO(zoneDate);
    const dayOfWeek = zoneDate.getDay(); // 0: Sun, 1: Mon, ...
    const hourDec = zoneDate.getHours() + (zoneDate.getMinutes() / 60) + (zoneDate.getSeconds() / 3600);

    // 1. Vacation / Holiday Check
    for (const v of config.vacations) {
      if (isoDate >= v.start && isoDate <= v.end) {
        return {
          status: 'ON_VACATION',
          label: 'ON VACATION',
          badgeClass: 'cds--tag--purple',
          dotClass: 'status-vacation',
          title: `Vacation Active: ${v.name}`,
          desc: v.note || 'Currently on scheduled vacation leave. Routine reviews and meetings are paused.',
          vacation: v,
          zoneDate
        };
      }
    }

    // 2. Weekend Check
    const dayCfg = config.schedule[dayOfWeek];
    if (!dayCfg || !dayCfg.enabled) {
      return {
        status: 'WEEKEND',
        label: 'WEEKEND (UNAVAILABLE)',
        badgeClass: 'cds--tag--gray',
        dotClass: 'status-weekend',
        title: 'Weekend Off-Duty Recess',
        desc: 'Saturdays and Sundays are off-duty. Standard working schedule resumes Monday at 10:00 BST.',
        zoneDate
      };
    }

    // 3. Working Hours Check (10:00 - 18:00)
    if (hourDec >= dayCfg.start && hourDec < dayCfg.end) {
      const rem = dayCfg.end - hourDec;
      const remH = Math.floor(rem);
      const remM = Math.floor((rem - remH) * 60);

      return {
        status: 'AVAILABLE',
        label: 'AVAILABLE NOW',
        badgeClass: 'cds--tag--green',
        dotClass: 'status-available',
        title: 'Within Standard Working Hours (10:00 — 18:00)',
        desc: `Active working window open. Available for consultations and reviews (Remaining today: ${remH}h ${remM}m).`,
        zoneDate
      };
    } else if (hourDec < dayCfg.start) {
      const wait = dayCfg.start - hourDec;
      const waitH = Math.floor(wait);
      const waitM = Math.floor((wait - waitH) * 60);

      return {
        status: 'OUT_OF_OFFICE',
        label: 'OUT OF OFFICE',
        badgeClass: 'cds--tag--red',
        dotClass: 'status-out_of_office',
        title: 'Before Working Hours',
        desc: `Work schedule begins today at 10:00 BST (in ${waitH}h ${waitM}m).`,
        zoneDate
      };
    } else {
      return {
        status: 'OUT_OF_OFFICE',
        label: 'OUT OF OFFICE',
        badgeClass: 'cds--tag--red',
        dotClass: 'status-out_of_office',
        title: 'After Working Hours',
        desc: 'Daily schedule closed at 18:00 BST. Resumes next working morning at 10:00 BST.',
        zoneDate
      };
    }
  }

  function updateMainBarWidgets(evalResult) {
    const widgets = document.querySelectorAll('.carbon-main-bar__availability');
    widgets.forEach(w => {
      const dot = w.querySelector('.carbon-availability-dot');
      const text = w.querySelector('.carbon-availability-text');
      if (dot) {
        dot.className = `carbon-availability-dot ${evalResult.dotClass}`;
      }
      if (text) {
        text.textContent = evalResult.label;
      }
      w.setAttribute('title', `${evalResult.title} — Click to view full Timetable`);
    });
  }

  function updateAvailabilityPage(evalResult) {
    // 1. Hero Card Badges and Text
    const badge = document.getElementById('avail-hero-badge');
    const dot = document.getElementById('avail-hero-dot');
    const title = document.getElementById('avail-hero-title');
    const desc = document.getElementById('avail-hero-desc');

    if (badge) {
      badge.className = `cds--tag ${evalResult.badgeClass}`;
      badge.textContent = evalResult.label;
    }
    if (dot) {
      dot.className = `carbon-availability-dot ${evalResult.dotClass}`;
    }
    if (title) {
      title.textContent = evalResult.title;
    }
    if (desc) {
      desc.textContent = evalResult.desc;
    }

    // 2. Clocks
    const authorClock = document.getElementById('avail-clock-author');
    const visitorClock = document.getElementById('avail-clock-visitor');

    if (authorClock) {
      const zStr = evalResult.zoneDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      authorClock.textContent = zStr;
    }

    if (visitorClock) {
      const visitorNow = new Date();
      const vStr = visitorNow.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      visitorClock.textContent = vStr;
    }

    // 3. Vacation Alert Banner
    const vacBanner = document.getElementById('avail-vacation-banner');
    if (vacBanner) {
      if (evalResult.status === 'ON_VACATION' && evalResult.vacation) {
        vacBanner.style.display = 'flex';
        const nameEl = document.getElementById('avail-vacation-name');
        const datesEl = document.getElementById('avail-vacation-dates');
        if (nameEl) nameEl.textContent = evalResult.vacation.name;
        if (datesEl) datesEl.textContent = `${evalResult.vacation.start} to ${evalResult.vacation.end}`;
      } else {
        vacBanner.style.display = 'none';
      }
    }

    // 4. Highlight Active Day in 7-Day Grid
    const activeDayNum = evalResult.zoneDate.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const activeKey = dayKeys[activeDayNum];

    document.querySelectorAll('.app-schedule-day').forEach(el => {
      const dayAttr = el.getAttribute('data-day');
      if (dayAttr === activeKey) {
        el.classList.add('is-current-day');
      } else {
        el.classList.remove('is-current-day');
      }
    });

    // 5. Update Holiday Table Status
    const todayIso = formatDateISO(evalResult.zoneDate);
    const tbody = document.getElementById('avail-holiday-tbody');
    if (tbody) {
      let html = '';
      config.vacations.forEach(v => {
        let tag = '<span class="cds--tag cds--tag--outline">Scheduled</span>';
        if (todayIso >= v.start && todayIso <= v.end) {
          tag = '<span class="cds--tag cds--tag--purple">ON VACATION</span>';
        } else if (todayIso > v.end) {
          tag = '<span class="cds--tag cds--tag--gray">Past</span>';
        }
        html += `
          <tr>
            <td><strong>${v.name}</strong></td>
            <td><code class="carbon-tree-path">${v.start}</code></td>
            <td><code class="carbon-tree-path">${v.end}</code></td>
            <td>${tag}</td>
            <td style="color: var(--cds-text-secondary); font-size: 0.8125rem;">${v.note}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }
  }

  function tick() {
    const evalResult = evaluateStatus();
    updateMainBarWidgets(evalResult);
    updateAvailabilityPage(evalResult);
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for external callers
  window.CarbonAvailability = {
    evaluate: evaluateStatus
  };
})();
