import { appState, elements } from "./shared.js";

const FETCH_INTERVAL_MS = 5 * 60 * 1000;

const WMO_CODES = {
  0: { desc: "Clear sky", icon: "☀️" },
  1: { desc: "Mainly clear", icon: "🌤️" },
  2: { desc: "Partly cloudy", icon: "⛅" },
  3: { desc: "Overcast", icon: "☁️" },
  45: { desc: "Fog", icon: "🌫️" },
  48: { desc: "Rime fog", icon: "🌫️" },
  51: { desc: "Light drizzle", icon: "🌦️" },
  53: { desc: "Moderate drizzle", icon: "🌦️" },
  55: { desc: "Dense drizzle", icon: "🌧️" },
  61: { desc: "Slight rain", icon: "🌧️" },
  63: { desc: "Moderate rain", icon: "🌧️" },
  65: { desc: "Heavy rain", icon: "🌧️" },
  71: { desc: "Slight snow", icon: "❄️" },
  73: { desc: "Moderate snow", icon: "❄️" },
  75: { desc: "Heavy snow", icon: "❄️" },
  77: { desc: "Snow grains", icon: "❄️" },
  80: { desc: "Slight showers", icon: "🌦️" },
  81: { desc: "Moderate showers", icon: "🌧️" },
  82: { desc: "Violent showers", icon: "🌧️" },
  85: { desc: "Slight snow showers", icon: "🌨️" },
  86: { desc: "Heavy snow showers", icon: "🌨️" },
  95: { desc: "Thunderstorm", icon: "⛈️" },
  96: { desc: "Thunderstorm with hail", icon: "⛈️" },
  99: { desc: "Heavy thunderstorm", icon: "⛈️" }
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let weatherTimer = null;
let currentCoords = null;

function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: "Unknown", icon: "🌡️" };
}

function renderCurrent(data) {
  if (!data?.current) return;
  const { temperature_2m, weather_code } = data.current;
  const info = getWeatherInfo(weather_code);
  elements.weatherIcon.textContent = info.icon;
  elements.weatherTemp.textContent = `${Math.round(temperature_2m)}°C`;
  elements.weatherDesc.textContent = info.desc;
}

function renderForecast(data) {
  if (!data?.daily) return;
  const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;
  elements.weatherForecast.innerHTML = "";

  for (let i = 0; i < 5 && i < time.length; i++) {
    const date = new Date(time[i] + "T00:00:00");
    const info = getWeatherInfo(weather_code[i]);

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `
      <span class="forecast-day-name">${DAY_NAMES[date.getDay()]}</span>
      <span class="forecast-icon">${info.icon}</span>
      <span class="forecast-temps">
        <span class="forecast-high">${Math.round(temperature_2m_max[i])}°</span>
        <span class="forecast-low">${Math.round(temperature_2m_min[i])}°</span>
      </span>
    `;
    elements.weatherForecast.appendChild(card);
  }
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  if (!data?.results?.length) return null;
  return { lat: data.results[0].latitude, lon: data.results[0].longitude };
}

async function fetchWeather() {
  try {
    const city = appState.weatherCity || "Bucharest";

    if (!currentCoords || currentCoords._city !== city) {
      const coords = await geocodeCity(city);
      if (!coords) return;
      currentCoords = { lat: coords.lat, lon: coords.lon, _city: city };
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentCoords.lat}&longitude=${currentCoords.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const response = await fetch(url);
    if (!response.ok) return;
    const data = await response.json();
    renderCurrent(data);
    renderForecast(data);
  } catch {
    /* silently fail */
  }
}

export function initWeather() {
  currentCoords = null;
  fetchWeather();
  if (weatherTimer) clearInterval(weatherTimer);
  weatherTimer = setInterval(fetchWeather, FETCH_INTERVAL_MS);
}

export function setWeatherCity() {
  currentCoords = null;
  fetchWeather();
}
