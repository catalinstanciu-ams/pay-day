import {
  appState,
  DEFAULT_CLOCK_SIZE_STEP,
  DEFAULT_CUSTOM_COUNTDOWN_DAYS,
  DEFAULT_CUSTOM_COUNTDOWN_TEXT,
  DEFAULT_HIDE_SECONDS,
  DEFAULT_PAYDAY,
  DEFAULT_THEME,
  DEFAULT_WEATHER_CITY,
  elements,
  storage,
  setSaveMessage
} from "./js/shared.js";
import {
  clampPaydayDay,
  createCustomCountdownTargetMs,
  normalizeHideSeconds,
  normalizeCustomCountdownDays,
  normalizeCustomCountdownText,
  renderClockAndCountdown,
  renderSecondsVisibility,
  savePaydayDay,
  saveCustomCountdown,
  toggleSecondsVisibility
} from "./js/clock.js";
import { loadAndRenderBookmarks } from "./js/bookmarks.js";
import { initWeather, setWeatherCity } from "./js/weather.js";
import {
  adjustClockSize,
  applyDynamicTheme,
  cycleClockFont,
  normalizeClockFontIndex,
  normalizeClockSizeStep,
  normalizePaletteIndex,
  randomizeTheme,
  renderClockFont,
  renderClockSize,
  renderPalette,
  renderTheme,
  shiftPalette,
  toggleTheme
} from "./js/theme.js";

function toggleSettings(forceValue) {
  appState.settingsOpen = typeof forceValue === "boolean" ? forceValue : !appState.settingsOpen;
  renderSettingsPanel();
}

function renderSettingsPanel() {
  elements.settingsPanel.hidden = !appState.settingsOpen;
  elements.settingsToggle.setAttribute("aria-expanded", String(appState.settingsOpen));
}

function getHueForPalette(index) {
  if (index >= 10) {
    return (index * 12) % 360;
  }

  return 0;
}

function closeThemeCustomization(restorePreview) {
  if (restorePreview) {
    renderPalette();
  }

  elements.themeCustomizePopup.hidden = true;
}

function openThemeCustomization() {
  const hue = getHueForPalette(appState.paletteIndex);

  elements.themeHueSlider.value = String(hue);
  elements.themeHueValue.textContent = `${hue} deg`;
  applyDynamicTheme(hue);
  elements.themeCustomizePopup.hidden = false;
}

async function initialize() {
  const saved = await storage.get([
    "paydayDay",
    "theme",
    "paletteIndex",
    "clockFontIndex",
    "clockSizeStep",
    "hideSeconds",
    "customCountdownDays",
    "customCountdownText",
    "customCountdownTargetMs",
    "weatherCity"
  ]);

  appState.paydayDay = clampPaydayDay(saved.paydayDay ?? DEFAULT_PAYDAY);
  appState.theme = saved.theme === "light" ? "light" : DEFAULT_THEME;
  appState.paletteIndex = normalizePaletteIndex(saved.paletteIndex);
  appState.clockFontIndex = normalizeClockFontIndex(saved.clockFontIndex);
  appState.clockSizeStep = normalizeClockSizeStep(saved.clockSizeStep, DEFAULT_CLOCK_SIZE_STEP);
  appState.hideSeconds = normalizeHideSeconds(saved.hideSeconds ?? DEFAULT_HIDE_SECONDS);
  appState.customCountdownDays = normalizeCustomCountdownDays(saved.customCountdownDays ?? DEFAULT_CUSTOM_COUNTDOWN_DAYS);
  appState.customCountdownText = normalizeCustomCountdownText(saved.customCountdownText ?? DEFAULT_CUSTOM_COUNTDOWN_TEXT);
  appState.weatherCity = saved.weatherCity || DEFAULT_WEATHER_CITY;
  const customCountdownTargetMs = Number.parseInt(saved.customCountdownTargetMs, 10);
  appState.customCountdownTargetMs =
    Number.isFinite(customCountdownTargetMs) && customCountdownTargetMs > 0
      ? customCountdownTargetMs
      : createCustomCountdownTargetMs(appState.customCountdownDays);

  elements.paydayInput.value = String(appState.paydayDay);
  elements.customCountdownDaysInput.value = String(appState.customCountdownDays);
  elements.customCountdownTextInput.value = appState.customCountdownText;
  elements.weatherCityInput.value = appState.weatherCity;

  if (!Number.isFinite(customCountdownTargetMs) || customCountdownTargetMs <= 0) {
    await storage.set({ customCountdownTargetMs: appState.customCountdownTargetMs });
  }
  renderTheme(appState.theme);
  renderPalette();

  renderClockFont();
  renderClockSize();
  renderSecondsVisibility();
  renderSettingsPanel();
  renderClockAndCountdown();
  await loadAndRenderBookmarks();
  initWeather();

  elements.settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await savePaydayDay(elements.paydayInput.value);
    await saveCustomCountdown(
      elements.customCountdownDaysInput.value,
      elements.customCountdownTextInput.value
    );
    const newCity = elements.weatherCityInput.value.trim() || DEFAULT_WEATHER_CITY;
    appState.weatherCity = newCity;
    await storage.set({ weatherCity: newCity });
    setWeatherCity();
  });

  elements.settingsToggle.addEventListener("click", () => {
    toggleSettings();
  });

  elements.themeToggle.addEventListener("click", async () => {
    await toggleTheme();
  });

  elements.palettePrev.addEventListener("click", async () => {
    await shiftPalette(-1);
  });

  elements.paletteNext.addEventListener("click", async () => {
    await shiftPalette(1);
  });

  elements.randomizeTheme.addEventListener("click", async () => {
    await randomizeTheme();
  });

  elements.customizeTheme.addEventListener("click", () => {
    openThemeCustomization();
  });

  elements.themeHueSlider.addEventListener("input", () => {
    const hue = ((Number.parseInt(elements.themeHueSlider.value, 10) % 360) + 360) % 360;
    elements.themeHueValue.textContent = `${hue} deg`;
    applyDynamicTheme(hue);
  });

  elements.themeApplyButton.addEventListener("click", async () => {
    const hue = ((Number.parseInt(elements.themeHueSlider.value, 10) % 360) + 360) % 360;
    const paletteIndex = 10 + Math.round(hue / 12);

    appState.paletteIndex = paletteIndex % 40;
    renderPalette();
    setSaveMessage(`Colors: ${appState.paletteIndex >= 10 ? `Hue ${hue}deg` : appState.paletteIndex}.`);
    await storage.set({ paletteIndex: appState.paletteIndex });
    closeThemeCustomization(false);
  });

  elements.themeCancelButton.addEventListener("click", () => {
    closeThemeCustomization(true);
  });

  elements.themeCustomizePopup.addEventListener("click", (event) => {
    if (event.target === elements.themeCustomizePopup) {
      closeThemeCustomization(true);
    }
  });

  elements.secondsToggle.addEventListener("click", async () => {
    await toggleSecondsVisibility();
  });

  elements.clockSizeDown.addEventListener("click", async () => {
    await adjustClockSize(-1);
  });

  elements.clockSizeUp.addEventListener("click", async () => {
    await adjustClockSize(1);
  });

  elements.heroPanel.addEventListener("contextmenu", async (event) => {
    event.preventDefault();
    await cycleClockFont();
  });

  document.addEventListener("click", (event) => {
    if (!appState.settingsOpen || !elements.themeCustomizePopup.hidden) {
      return;
    }

    if (
      elements.settingsPanel.contains(event.target) ||
      elements.settingsToggle.contains(event.target)
    ) {
      return;
    }

    toggleSettings(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.themeCustomizePopup.hidden) {
      closeThemeCustomization(true);
      return;
    }

    if (event.key === "Escape" && appState.settingsOpen) {
      toggleSettings(false);
    }
  });

  setInterval(render, 1000);
}

function render() {
  renderClockAndCountdown();
}

initialize();
