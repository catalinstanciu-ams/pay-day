const DEFAULT_PAYDAY = 10;
const DEFAULT_THEME = "dark";
const DEFAULT_PALETTE_INDEX = 0;
const DEFAULT_CLOCK_FONT_INDEX = 0;
const DEFAULT_CLOCK_SIZE_STEP = 4;
const DEFAULT_HIDE_SECONDS = false;
const MIN_CLOCK_SIZE_STEP = 0;
const MAX_CLOCK_SIZE_STEP = 8;
const PALETTE_LABELS = [
  "Ocean",
  "Sunset",
  "Mint",
  "Candy",
  "Lime",
  "Ember",
  "Glacier",
  "Sand",
  "Neon",
  "Plum"
];
const CLOCK_FONT_LABELS = [
  "Display",
  "Condensed",
  "Serif",
  "Mono",
  "Futura"
];

const storage = {
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

const elements = {
  clock: document.getElementById("clock"),
  dateLabel: document.getElementById("date-label"),
  paydayStatus: document.getElementById("payday-status"),
  paydayTarget: document.getElementById("payday-target"),
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
  paletteRandomize: document.getElementById("palette-randomize"),
  secondsToggle: document.getElementById("seconds-toggle"),
  paydayInput: document.getElementById("payday-input"),
  saveMessage: document.getElementById("save-message"),
  settingsForm: document.getElementById("settings-form"),
  settingsPanel: document.getElementById("settings-panel"),
  settingsToggle: document.getElementById("settings-toggle"),
  themeToggle: document.getElementById("theme-toggle")
};

const formatters = {
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

const appState = {
  paydayDay: DEFAULT_PAYDAY,
  theme: DEFAULT_THEME,
  paletteIndex: DEFAULT_PALETTE_INDEX,
  settingsOpen: false,
  clockFontIndex: DEFAULT_CLOCK_FONT_INDEX,
  clockSizeStep: DEFAULT_CLOCK_SIZE_STEP,
  hideSeconds: DEFAULT_HIDE_SECONDS
};

function clampPaydayDay(day) {
  const numericDay = Number.parseInt(day, 10);
  if (Number.isNaN(numericDay)) {
    return DEFAULT_PAYDAY;
  }

  return Math.min(31, Math.max(1, numericDay));
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function createPaydayDate(year, monthIndex, paydayDay) {
  const validDay = Math.min(paydayDay, daysInMonth(year, monthIndex));
  return new Date(year, monthIndex, validDay, 0, 0, 0, 0);
}

function getCountdownParts(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function getPaydayState(now, paydayDay) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayPayday = createPaydayDate(now.getFullYear(), now.getMonth(), paydayDay);

  if (startOfToday.getTime() === todayPayday.getTime()) {
    const nextMonthDate = createPaydayDate(now.getFullYear(), now.getMonth() + 1, paydayDay);
    return {
      isPaydayToday: true,
      nextPayday: nextMonthDate,
      displayPayday: todayPayday
    };
  }

  if (startOfToday < todayPayday) {
    return {
      isPaydayToday: false,
      nextPayday: todayPayday,
      displayPayday: todayPayday
    };
  }

  const nextMonthDate = createPaydayDate(now.getFullYear(), now.getMonth() + 1, paydayDay);
  return {
    isPaydayToday: false,
    nextPayday: nextMonthDate,
    displayPayday: nextMonthDate
  };
}

function renderTheme(theme) {
  document.body.dataset.theme = theme;
  elements.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

function normalizePaletteIndex(value) {
  const index = Number.parseInt(value, 10);
  if (Number.isNaN(index) || index < 0) {
    return DEFAULT_PALETTE_INDEX;
  }

  return index % PALETTE_LABELS.length;
}

function renderPalette() {
  document.body.dataset.palette = String(appState.paletteIndex);
}

function normalizeClockFontIndex(value) {
  const index = Number.parseInt(value, 10);
  if (Number.isNaN(index) || index < 0) {
    return DEFAULT_CLOCK_FONT_INDEX;
  }

  return index % CLOCK_FONT_LABELS.length;
}

function renderClockFont() {
  document.body.dataset.clockFont = String(appState.clockFontIndex);
}

function normalizeClockSizeStep(value) {
  const step = Number.parseInt(value, 10);
  if (Number.isNaN(step)) {
    return DEFAULT_CLOCK_SIZE_STEP;
  }

  return Math.min(MAX_CLOCK_SIZE_STEP, Math.max(MIN_CLOCK_SIZE_STEP, step));
}

function getClockSizeScale(step) {
  return 0.7 + step * 0.1;
}

function renderClockSize() {
  const scale = getClockSizeScale(appState.clockSizeStep);
  document.documentElement.style.setProperty("--clock-size-scale", String(scale));
  elements.clockSizeLabel.textContent = `${Math.round(scale * 100)}%`;
}

function renderSecondsVisibility() {
  elements.secondsCard.hidden = appState.hideSeconds;
  elements.countdown.dataset.hideSeconds = String(appState.hideSeconds);
  elements.secondsToggle.textContent = appState.hideSeconds ? "Show seconds" : "Hide seconds";
}

function renderSettingsPanel() {
  elements.settingsPanel.hidden = !appState.settingsOpen;
  elements.settingsToggle.setAttribute("aria-expanded", String(appState.settingsOpen));
}

function renderClock(now) {
  elements.clock.textContent = appState.hideSeconds
    ? formatters.timeNoSeconds.format(now)
    : formatters.time.format(now);
  elements.dateLabel.textContent = formatters.date.format(now);
}

function renderCountdown(now) {
  const paydayState = getPaydayState(now, appState.paydayDay);
  const diffMs = paydayState.nextPayday.getTime() - now.getTime();
  const countdown = getCountdownParts(diffMs);

  if (paydayState.isPaydayToday) {
    elements.paydayStatus.textContent = "Payday today";
    elements.paydayTarget.textContent = `Next cycle starts on ${formatters.shortDate.format(paydayState.nextPayday)}`;
  } else {
    elements.paydayStatus.textContent = `${countdown.days} day${countdown.days === 1 ? "" : "s"} left`;
    elements.paydayTarget.textContent = `Next payday: ${formatters.shortDate.format(paydayState.displayPayday)}`;
  }

  elements.daysValue.textContent = String(countdown.days).padStart(2, "0");
  elements.hoursValue.textContent = String(countdown.hours).padStart(2, "0");
  elements.minutesValue.textContent = String(countdown.minutes).padStart(2, "0");
  elements.secondsValue.textContent = String(countdown.seconds).padStart(2, "0");
}

function render() {
  const now = new Date();
  renderClock(now);
  renderCountdown(now);
}

async function savePaydayDay(day) {
  const paydayDay = clampPaydayDay(day);
  appState.paydayDay = paydayDay;
  elements.paydayInput.value = String(paydayDay);
  await storage.set({ paydayDay });
  elements.saveMessage.textContent = `Saved recurring payday as day ${paydayDay}.`;
  render();
}

async function toggleTheme() {
  appState.theme = appState.theme === "dark" ? "light" : "dark";
  renderTheme(appState.theme);
  await storage.set({ theme: appState.theme });
}

async function randomizePalette() {
  let nextIndex = appState.paletteIndex;

  if (PALETTE_LABELS.length > 1) {
    while (nextIndex === appState.paletteIndex) {
      nextIndex = Math.floor(Math.random() * PALETTE_LABELS.length);
    }
  }

  appState.paletteIndex = nextIndex;
  renderPalette();
  elements.saveMessage.textContent = `Colors: ${PALETTE_LABELS[appState.paletteIndex]}.`;
  await storage.set({ paletteIndex: appState.paletteIndex });
}

async function cycleClockFont() {
  appState.clockFontIndex = (appState.clockFontIndex + 1) % CLOCK_FONT_LABELS.length;
  renderClockFont();
  elements.saveMessage.textContent = `Clock font: ${CLOCK_FONT_LABELS[appState.clockFontIndex]}.`;
  await storage.set({ clockFontIndex: appState.clockFontIndex });
}

async function adjustClockSize(delta) {
  const nextStep = Math.min(
    MAX_CLOCK_SIZE_STEP,
    Math.max(MIN_CLOCK_SIZE_STEP, appState.clockSizeStep + delta)
  );

  if (nextStep === appState.clockSizeStep) {
    return;
  }

  appState.clockSizeStep = nextStep;
  renderClockSize();
  elements.saveMessage.textContent = `Clock size: ${elements.clockSizeLabel.textContent}.`;
  await storage.set({ clockSizeStep: appState.clockSizeStep });
}

async function toggleSecondsVisibility() {
  appState.hideSeconds = !appState.hideSeconds;
  renderSecondsVisibility();
  render();
  elements.saveMessage.textContent = appState.hideSeconds ? "Seconds hidden." : "Seconds shown.";
  await storage.set({ hideSeconds: appState.hideSeconds });
}

function toggleSettings(forceValue) {
  appState.settingsOpen = typeof forceValue === "boolean" ? forceValue : !appState.settingsOpen;
  renderSettingsPanel();
}

async function initialize() {
  const saved = await storage.get([
    "paydayDay",
    "theme",
    "paletteIndex",
    "clockFontIndex",
    "clockSizeStep",
    "hideSeconds"
  ]);
  appState.paydayDay = clampPaydayDay(saved.paydayDay ?? DEFAULT_PAYDAY);
  appState.theme = saved.theme === "light" ? "light" : DEFAULT_THEME;
  appState.paletteIndex = normalizePaletteIndex(saved.paletteIndex);
  appState.clockFontIndex = normalizeClockFontIndex(saved.clockFontIndex);
  appState.clockSizeStep = normalizeClockSizeStep(saved.clockSizeStep);
  appState.hideSeconds = Boolean(saved.hideSeconds ?? DEFAULT_HIDE_SECONDS);

  elements.paydayInput.value = String(appState.paydayDay);
  renderTheme(appState.theme);
  renderPalette();
  renderClockFont();
  renderClockSize();
  renderSecondsVisibility();
  renderSettingsPanel();
  render();

  elements.settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await savePaydayDay(elements.paydayInput.value);
  });

  elements.settingsToggle.addEventListener("click", () => {
    toggleSettings();
  });

  elements.themeToggle.addEventListener("click", async () => {
    await toggleTheme();
  });

  elements.paletteRandomize.addEventListener("click", async () => {
    await randomizePalette();
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
    if (!appState.settingsOpen) {
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
    if (event.key === "Escape" && appState.settingsOpen) {
      toggleSettings(false);
    }
  });

  setInterval(render, 1000);
}

initialize();
