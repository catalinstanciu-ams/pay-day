import {
  appState,
  CLOCK_FONT_LABELS,
  DEFAULT_CLOCK_FONT_INDEX,
  DEFAULT_PALETTE_INDEX,
  DEFAULT_THEME,
  elements,
  MAX_CLOCK_SIZE_STEP,
  MIN_CLOCK_SIZE_STEP,
  PALETTE_LABELS,
  storage,
  setSaveMessage
} from "./shared.js";

const CSS_PALETTE_COUNT = 10;

const GENERATED_PROPERTIES = [
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

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePaletteVars(hue) {
  const h = ((hue % 360) + 360) % 360;
  const isDark = appState.theme === "dark";

  if (isDark) {
    return {
      "--bg-base": hslToHex(h, 20, 5),
      "--bg-depth": hslToHex(h, 20, 15),
      "--bg-accent": `${hslToHex(h, 70, 60)}2e`,
      "--bg-accent-2": `${hslToHex(h, 70, 50)}1f`,
      "--panel-bg": `${hslToHex(h, 20, 10)}b8`,
      "--panel-border": `${hslToHex(h, 70, 60)}2e`,
      "--panel-shadow": "0 20px 60px rgba(0, 0, 0, 0.35)",
      "--text-main": hslToHex(h, 20, 95),
      "--text-muted": `${hslToHex(h, 20, 90)}b8`,
      "--text-soft": `${hslToHex(h, 20, 90)}8a`,
      "--accent": hslToHex(h, 70, 60),
      "--accent-strong": hslToHex(h, 70, 50),
      "--input-bg": "rgba(255, 255, 255, 0.07)",
      "--button-bg": `${hslToHex(h, 70, 60)}2e`,
      "--button-hover": `${hslToHex(h, 70, 60)}47`,
      "--card-bg": `${hslToHex(h, 20, 15)}d1`,
      "--card-border": `${hslToHex(h, 70, 60)}24`,
      "--grid-line": `${hslToHex(h, 70, 60)}4d`
    };
  }

  return {
    "--bg-base": hslToHex(h, 20, 98),
    "--bg-depth": hslToHex(h, 20, 90),
    "--bg-accent": `${hslToHex(h, 70, 60)}47`,
    "--bg-accent-2": `${hslToHex(h, 70, 50)}2e`,
    "--panel-bg": "rgba(255, 255, 255, 0.76)",
    "--panel-border": `${hslToHex(h, 20, 20)}1f`,
    "--panel-shadow": "0 24px 60px rgba(0, 0, 0, 0.18)",
    "--text-main": hslToHex(h, 20, 20),
    "--text-muted": `${hslToHex(h, 20, 30)}b8`,
    "--text-soft": `${hslToHex(h, 20, 30)}85`,
    "--accent": hslToHex(h, 70, 40),
    "--accent-strong": hslToHex(h, 70, 30),
    "--input-bg": `${hslToHex(h, 20, 20)}0d`,
    "--button-bg": `${hslToHex(h, 70, 40)}1f`,
    "--button-hover": `${hslToHex(h, 70, 40)}2e`,
    "--card-bg": "rgba(255, 255, 255, 0.72)",
    "--card-border": `${hslToHex(h, 20, 20)}1a`,
    "--grid-line": `${hslToHex(h, 20, 50)}4d`
  };
}

function applyGeneratedPalette(index) {
  const hue = (index * 12) % 360;
  const vars = generatePaletteVars(hue);

  for (const [property, value] of Object.entries(vars)) {
    document.body.style.setProperty(property, value);
  }
}

function clearGeneratedPalette() {
  GENERATED_PROPERTIES.forEach((property) => {
    document.body.style.removeProperty(property);
  });
}

export function renderTheme(theme) {
  document.body.dataset.theme = theme;
  elements.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

export function applyDynamicTheme(hue) {
  const normalizedHue = ((Number.parseInt(hue, 10) % 360) + 360) % 360;
  const vars = generatePaletteVars(normalizedHue);

  for (const [property, value] of Object.entries(vars)) {
    document.body.style.setProperty(property, value);
  }

  return normalizedHue;
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

  if (appState.paletteIndex >= CSS_PALETTE_COUNT) {
    applyGeneratedPalette(appState.paletteIndex);
  } else {
    clearGeneratedPalette();
  }
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
  renderPalette();

  await storage.set({ theme: appState.theme });
}

export async function shiftPalette(delta) {
  const count = PALETTE_LABELS.length;

  appState.paletteIndex = ((appState.paletteIndex + delta) % count + count) % count;
  renderPalette();
  setSaveMessage(`Colors: ${PALETTE_LABELS[appState.paletteIndex]}.`);

  await storage.set({ paletteIndex: appState.paletteIndex });
}

export async function randomizeTheme() {
  const index = Math.floor(Math.random() * PALETTE_LABELS.length);

  appState.paletteIndex = index;
  renderPalette();
  setSaveMessage(`Colors: ${PALETTE_LABELS[index]}.`);

  await storage.set({ paletteIndex: index });
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
