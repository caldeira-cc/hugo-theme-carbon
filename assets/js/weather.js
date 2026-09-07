// Weather Widget - Open-Meteo REST API Integration

(function () {
  const WEATHER_CODES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Heavy showers',
    82: 'Violent showers',
    95: 'Thunderstorm',
  };

  function initWeather() {
    const weatherElement = document.getElementById('carbon-weather-widget');
    if (!weatherElement) return;

    const lat = weatherElement.getAttribute('data-lat') || '41.11';
    const lon = weatherElement.getAttribute('data-lon') || '-73.71';
    const units = weatherElement.getAttribute('data-units') || 'metric';

    const tempUnitParam = units === 'imperial' ? '&temperature_unit=fahrenheit' : '';
    const tempUnitSymbol = units === 'imperial' ? '°F' : '°C';

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true${tempUnitParam}`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data && data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          const condition = WEATHER_CODES[code] || 'Cloudy';

          weatherElement.innerHTML = `
            <span class="weather-temp">${temp}${tempUnitSymbol}</span>
            <span class="weather-cond">(${condition})</span>
          `;
          weatherElement.setAttribute('title', `Live Weather: ${condition}, ${temp}${tempUnitSymbol}`);
        }
      })
      .catch(err => {
        console.warn('Live weather fetch failed, showing fallback', err);
        weatherElement.innerHTML = `<span class="weather-temp">21°C</span> <span class="weather-cond">(Clear)</span>`;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeather);
  } else {
    initWeather();
  }
})();
