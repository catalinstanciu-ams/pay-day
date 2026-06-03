export const DEFAULT_PAYDAY = 10;
export const DEFAULT_THEME = "dark";
export const DEFAULT_PALETTE_INDEX = 0;
export const DEFAULT_CLOCK_FONT_INDEX = 0;
export const DEFAULT_CLOCK_SIZE_STEP = 4;
export const DEFAULT_HIDE_SECONDS = false;
export const DEFAULT_CUSTOM_COUNTDOWN_DAYS = 30;
export const DEFAULT_CUSTOM_COUNTDOWN_TEXT = "payday";
export const DEFAULT_IS_DYNAMIC_THEME = false;
export const DEFAULT_DYNAMIC_HUE = 0;
export const DEFAULT_WEATHER_CITY = "Bucharest";
export const MIN_CLOCK_SIZE_STEP = 0;
export const MAX_CLOCK_SIZE_STEP = 8;

export const PALETTE_LABELS = [
  "Ocean",
  "Sunset",
  "Mint",
  "Candy",
  "Lime",
  "Ember",
  "Glacier",
  "Sand",
  "Neon",
  "Plum",
  "Rosewood",
  "Arctic",
  "Volcanic",
  "Lavender",
  "Forest",
  "Copper",
  "Twilight",
  "Sage",
  "Coral",
  "Midnight",
  "Terracotta",
  "Denim",
  "Mulberry",
  "Jade",
  "Blush",
  "Graphite",
  "Honey",
  "Cobalt",
  "Orchid",
  "Moss",
  "Berry",
  "Flint",
  "Marigold",
  "Teal",
  "Peach",
  "Storm",
  "Wine",
  "Lagoon",
  "Ash",
  "Crimson"
];

export const CLOCK_FONT_LABELS = [
  "Display",
  "Condensed",
  "Serif",
  "Mono",
  "Futura"
];

export const storage = {
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  },
  set(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, resolve);
    });
  }
};

export const elements = {
  clock: document.getElementById("clock"),
  dateLabel: document.getElementById("date-label"),
  paydayStatus: document.getElementById("payday-status"),
  paydayTarget: document.getElementById("payday-target"),
  customCountdownStatus: document.getElementById("custom-countdown-status"),
  heroPanel: document.getElementById("hero-panel"),
  countdown: document.getElementById("countdown"),
  daysValue: document.getElementById("days-value"),
  hoursValue: document.getElementById("hours-value"),
  minutesValue: document.getElementById("minutes-value"),
  secondsCard: document.getElementById("seconds-card"),
  secondsValue: document.getElementById("seconds-value"),
  clockSizeDown: document.getElementById("clock-size-down"),
  clockSizeUp: document.getElementById("clock-size-up"),
  clockSizeLabel: document.getElementById("clock-size-label"),
  palettePrev: document.getElementById("palette-prev"),
  paletteNext: document.getElementById("palette-next"),
  randomizeTheme: document.getElementById("randomize-theme"),
  customizeTheme: document.getElementById("customize-theme"),
  themeCustomizePopup: document.getElementById("theme-customize-popup"),
  themeHueSlider: document.getElementById("theme-hue-slider"),
  themeHueValue: document.getElementById("theme-hue-value"),
  themeApplyButton: document.getElementById("theme-apply-btn"),
  themeCancelButton: document.getElementById("theme-cancel-btn"),
  secondsToggle: document.getElementById("seconds-toggle"),
  paydayInput: document.getElementById("payday-input"),
  customCountdownDaysInput: document.getElementById("custom-countdown-days-input"),
  customCountdownTextInput: document.getElementById("custom-countdown-text-input"),
  saveMessage: document.getElementById("save-message"),
  settingsForm: document.getElementById("settings-form"),
  settingsPanel: document.getElementById("settings-panel"),
  settingsToggle: document.getElementById("settings-toggle"),
  themeToggle: document.getElementById("theme-toggle"),
  weatherColumn: document.getElementById("weather-column"),
  weatherCityInput: document.getElementById("weather-city-input"),
  weatherIcon: document.getElementById("weather-icon"),
  weatherTemp: document.getElementById("weather-temp"),
  weatherDesc: document.getElementById("weather-desc"),
  weatherForecast: document.getElementById("weather-forecast"),
  bookmarksRootLinks: document.getElementById("bookmarks-root-links"),
  bookmarksFolders: document.getElementById("bookmarks-folders"),
  bookmarksMessage: document.getElementById("bookmarks-message")
};

export const formatters = {
  time: new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }),
  timeNoSeconds: new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }),
  date: new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }),
  shortDate: new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
};

export const appState = {
  paydayDay: DEFAULT_PAYDAY,
  theme: DEFAULT_THEME,
  paletteIndex: DEFAULT_PALETTE_INDEX,
  settingsOpen: false,
  clockFontIndex: DEFAULT_CLOCK_FONT_INDEX,
  clockSizeStep: DEFAULT_CLOCK_SIZE_STEP,
  hideSeconds: DEFAULT_HIDE_SECONDS,
  isDynamicTheme: DEFAULT_IS_DYNAMIC_THEME,
  dynamicHue: DEFAULT_DYNAMIC_HUE,
  customCountdownDays: DEFAULT_CUSTOM_COUNTDOWN_DAYS,
  customCountdownText: DEFAULT_CUSTOM_COUNTDOWN_TEXT,
  customCountdownTargetMs: 0,
  weatherCity: DEFAULT_WEATHER_CITY
};

export function setSaveMessage(message) {
  elements.saveMessage.textContent = message;
}
