// IBM Carbon Live Timezone Clock Widget

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const clockWidgets = document.querySelectorAll('.carbon-main-bar__clock');
    if (!clockWidgets.length) return;

    clockWidgets.forEach(widget => {
      const timeDisplay = widget.querySelector('.carbon-clock-time');
      const tzBadge = widget.querySelector('.carbon-clock-tz');
      const targetTimezone = widget.getAttribute('data-timezone') || 'Europe/London';
      let showLocal = widget.getAttribute('data-mode') === 'local';

      function updateClock() {
        const now = new Date();
        const activeTz = showLocal ? undefined : targetTimezone;

        try {
          const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: activeTz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });

          const timeString = formatter.format(now);
          if (timeDisplay) {
            timeDisplay.textContent = timeString;
          }

          if (tzBadge) {
            if (showLocal) {
              const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
              tzBadge.textContent = 'LOCAL';
              tzBadge.setAttribute('title', `Local Timezone: ${localTz}`);
            } else {
              const tzShort = targetTimezone.split('/').pop().replace('_', ' ');
              tzBadge.textContent = tzShort;
              tzBadge.setAttribute('title', `Configured Timezone: ${targetTimezone}`);
            }
          }
        } catch (err) {
          if (timeDisplay) {
            timeDisplay.textContent = now.toTimeString().split(' ')[0];
          }
        }
      }

      // Allow clicking to toggle between Local Time and Target Timezone
      widget.addEventListener('click', (e) => {
        e.preventDefault();
        showLocal = !showLocal;
        updateClock();
      });

      updateClock();
      setInterval(updateClock, 1000);
    });
  });
})();
