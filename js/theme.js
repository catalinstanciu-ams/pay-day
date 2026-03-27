import {
  appState,
  CLOCK_FONT_LABELS,
  DEFAULT_CLOCK_FONT_INDEX,
  DEFAULT_DYNAMIC_HUE,
  DEFAULT_PALETTE_INDEX,
  DEFAULT_THEME,
  elements,
  MAX_CLOCK_SIZE_STEP,
  MIN_CLOCK_SIZE_STEP,
  PALETTE_LABELS,
  storage,
  setSaveMessage
} from "./shared.js";

const DYNAMIC_THEME_PROPERTIES = [
  "--bg-base",
  "--bg-depth",
  "--bg-accent",
  "--bg-accent-2",
  "--panel-bg",
  "--panel-border",
  "--panel-shadow",
  "--text-main",
  "--text-muted",
  "--text-soft",
  "--accent",
  "--accent-strong",
  "--input-bg",
  "--button-bg",
  "--button-hover",
  "--card-bg",
  "--card-border",
  "--grid-line"
];

export function renderTheme(theme) {
  document.body.dataset.theme = theme;
  elements.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

export function normalizeDynamicHue(value, fallbackHue = DEFAULT_DYNAMIC_HUE) {
  const hue = Number.parseInt(value, 10);

  if (Number.isNaN(hue)) {
    return fallbackHue;
  }

  return ((hue % 360) + 360) % 360;
}

export function applyDynamicTheme(hue) {
  const normalizedHue = normalizeDynamicHue(hue);
  const isDark = appState.theme === "dark";

  if (isDark) {
    document.body.style.setProperty("--bg-base", `hsl(${normalizedHue}, 20%, 5%)`);
    document.body.style.setProperty("--bg-depth", `hsl(${normalizedHue}, 20%, 15%)`);
    document.body.style.setProperty("--bg-accent", `hsla(${normalizedHue}, 70%, 60%, 0.18)`);
    document.body.style.setProperty("--bg-accent-2", `hsla(${normalizedHue}, 70%, 50%, 0.12)`);
    document.body.style.setProperty("--panel-bg", `hsla(${normalizedHue}, 20%, 10%, 0.72)`);
    document.body.style.setProperty("--panel-border", `hsla(${normalizedHue}, 70%, 60%, 0.18)`);
    document.body.style.setProperty("--panel-shadow", "0 20px 60px rgba(0, 0, 0, 0.35)");
    document.body.style.setProperty("--text-main", `hsl(${normalizedHue}, 20%, 95%)`);
    document.body.style.setProperty("--text-muted", `hsla(${normalizedHue}, 20%, 90%, 0.72)`);
    document.body.style.setProperty("--text-soft", `hsla(${normalizedHue}, 20%, 90%, 0.54)`);
    document.body.style.setProperty("--accent", `hsl(${normalizedHue}, 70%, 60%)`);
    document.body.style.setProperty("--accent-strong", `hsl(${normalizedHue}, 70%, 50%)`);
    document.body.style.setProperty("--input-bg", "rgba(255, 255, 255, 0.07)");
    document.body.style.setProperty("--button-bg", `hsla(${normalizedHue}, 70%, 60%, 0.18)`);
    document.body.style.setProperty("--button-hover", `hsla(${normalizedHue}, 70%, 60%, 0.28)`);
    document.body.style.setProperty("--card-bg", `hsla(${normalizedHue}, 20%, 15%, 0.82)`);
    document.body.style.setProperty("--card-border", `hsla(${normalizedHue}, 70%, 60%, 0.14)`);
    document.body.style.setProperty("--grid-line", `hsla(${normalizedHue}, 70%, 60%, 0.3)`);
  } else {
    document.body.style.setProperty("--bg-base", `hsl(${normalizedHue}, 20%, 98%)`);
    document.body.style.setProperty("--bg-depth", `hsl(${normalizedHue}, 20%, 90%)`);
    document.body.style.setProperty("--bg-accent", `hsla(${normalizedHue}, 70%, 60%, 0.28)`);
    document.body.style.setProperty("--bg-accent-2", `hsla(${normalizedHue}, 70%, 50%, 0.18)`);
    document.body.style.setProperty("--panel-bg", "rgba(255, 255, 255, 0.76)");
    document.body.style.setProperty("--panel-border", `hsla(${normalizedHue}, 20%, 20%, 0.12)`);
    document.body.style.setProperty("--panel-shadow", "0 24px 60px rgba(0, 0, 0, 0.18)");
    document.body.style.setProperty("--text-main", `hsl(${normalizedHue}, 20%, 20%)`);
    document.body.style.setProperty("--text-muted", `hsla(${normalizedHue}, 20%, 30%, 0.72)`);
    document.body.style.setProperty("--text-soft", `hsla(${normalizedHue}, 20%, 30%, 0.52)`);
    document.body.style.setProperty("--accent", `hsl(${normalizedHue}, 70%, 40%)`);
    document.body.style.setProperty("--accent-strong", `hsl(${normalizedHue}, 70%, 30%)`);
    document.body.style.setProperty("--input-bg", `hsla(${normalizedHue}, 20%, 20%, 0.05)`);
    document.body.style.setProperty("--button-bg", `hsla(${normalizedHue}, 70%, 40%, 0.12)`);
    document.body.style.setProperty("--button-hover", `hsla(${normalizedHue}, 70%, 40%, 0.18)`);
    document.body.style.setProperty("--card-bg", "rgba(255, 255, 255, 0.72)");
    document.body.style.setProperty("--card-border", `hsla(${normalizedHue}, 20%, 20%, 0.1)`);
    document.body.style.setProperty("--grid-line", `hsla(${normalizedHue}, 20%, 50%, 0.3)`);
  }

  return normalizedHue;
}

export function clearDynamicTheme() {
  DYNAMIC_THEME_PROPERTIES.forEach((property) => {
    document.body.style.removeProperty(property);
  });
}

export async function setDynamicTheme(hue, message = null) {
  const normalizedHue = applyDynamicTheme(hue);

  appState.dynamicHue = normalizedHue;
  appState.isDynamicTheme = true;
  setSaveMessage(message ?? `Colors: Custom ${normalizedHue}deg.`);

  await storage.set({
    isDynamicTheme: true,
    dynamicHue: normalizedHue
  });
}

export async function randomizeTheme() {
  const hue = Math.floor(Math.random() * 360);
  await setDynamicTheme(hue, `Colors: Random ${hue}deg.`);
}

export function normalizePaletteIndex(value) {
  const index = Number.parseInt(value, 10);
  if (Number.isNaN(index) || index < 0) {
    return DEFAULT_PALETTE_INDEX;
  }

  return index % PALETTE_LABELS.length;
}

export function renderPalette() {
  document.body.dataset.palette = String(appState.paletteIndex);
}

export function normalizeClockFontIndex(value) {
  const index = Number.parseInt(value, 10);
  if (Number.isNaN(index) || index < 0) {
    return DEFAULT_CLOCK_FONT_INDEX;
  }

  return index % CLOCK_FONT_LABELS.length;
}

export function renderClockFont() {
  document.body.dataset.clockFont = String(appState.clockFontIndex);
}

export function normalizeClockSizeStep(value, fallbackStep) {
  const step = Number.parseInt(value, 10);
  if (Number.isNaN(step)) {
    return fallbackStep;
  }

  return Math.min(MAX_CLOCK_SIZE_STEP, Math.max(MIN_CLOCK_SIZE_STEP, step));
}

export function getClockSizeScale(step) {
  return 0.7 + step * 0.1;
}

export function renderClockSize() {
  const scale = getClockSizeScale(appState.clockSizeStep);
  document.documentElement.style.setProperty("--clock-size-scale", String(scale));
  elements.clockSizeLabel.textContent = `${Math.round(scale * 100)}%`;
}

export async function toggleTheme() {
  appState.theme = appState.theme === "dark" ? "light" : DEFAULT_THEME;
  renderTheme(appState.theme);

  if (appState.isDynamicTheme) {
    applyDynamicTheme(appState.dynamicHue);
  }

  await storage.set({ theme: appState.theme });
}

export async function shiftPalette(delta) {
  const count = PALETTE_LABELS.length;

  appState.isDynamicTheme = false;
  appState.paletteIndex = ((appState.paletteIndex + delta) % count + count) % count;
  clearDynamicTheme();
  renderPalette();
  setSaveMessage(`Colors: ${PALETTE_LABELS[appState.paletteIndex]}.`);

  await storage.set({
    isDynamicTheme: false,
    paletteIndex: appState.paletteIndex
  });
}

export async function cycleClockFont() {
  appState.clockFontIndex = (appState.clockFontIndex + 1) % CLOCK_FONT_LABELS.length;
  renderClockFont();
  setSaveMessage(`Clock font: ${CLOCK_FONT_LABELS[appState.clockFontIndex]}.`);
  await storage.set({ clockFontIndex: appState.clockFontIndex });
}

export async function adjustClockSize(delta) {
  const nextStep = Math.min(
    MAX_CLOCK_SIZE_STEP,
    Math.max(MIN_CLOCK_SIZE_STEP, appState.clockSizeStep + delta)
  );

  if (nextStep === appState.clockSizeStep) {
    return;
  }

  appState.clockSizeStep = nextStep;
  renderClockSize();
  setSaveMessage(`Clock size: ${elements.clockSizeLabel.textContent}.`);
  await storage.set({ clockSizeStep: appState.clockSizeStep });
}
