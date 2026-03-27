import {
  appState,
  DEFAULT_HIDE_SECONDS,
  DEFAULT_PAYDAY,
  elements,
  formatters,
  storage,
  setSaveMessage
} from "./shared.js";

export function clampPaydayDay(day) {
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

export function renderSecondsVisibility() {
  elements.secondsCard.hidden = appState.hideSeconds;
  elements.countdown.dataset.hideSeconds = String(appState.hideSeconds);
  elements.secondsToggle.textContent = appState.hideSeconds ? "Show seconds" : "Hide seconds";
}

export function renderClock(now) {
  elements.clock.textContent = appState.hideSeconds
    ? formatters.timeNoSeconds.format(now)
    : formatters.time.format(now);
  elements.dateLabel.textContent = formatters.date.format(now);
}

export function renderCountdown(now) {
  const paydayState = getPaydayState(now, appState.paydayDay);
  const diffMs = paydayState.nextPayday.getTime() - now.getTime();
  const countdown = getCountdownParts(diffMs);

  if (paydayState.isPaydayToday) {
    elements.paydayStatus.textContent = "Payday today";
    elements.paydayTarget.textContent = `Next cycle starts on ${formatters.shortDate.format(paydayState.nextPayday)}`;
  } else {
    elements.paydayStatus.textContent = `${countdown.days} day${countdown.days === 1 ? "" : "s"} till payday`;
    elements.paydayTarget.textContent = `Next payday: ${formatters.shortDate.format(paydayState.displayPayday)}`;
  }

  elements.daysValue.textContent = String(countdown.days).padStart(2, "0");
  elements.hoursValue.textContent = String(countdown.hours).padStart(2, "0");
  elements.minutesValue.textContent = String(countdown.minutes).padStart(2, "0");
  elements.secondsValue.textContent = String(countdown.seconds).padStart(2, "0");
}

export function renderClockAndCountdown() {
  const now = new Date();
  renderClock(now);
  renderCountdown(now);
}

export async function savePaydayDay(day) {
  const paydayDay = clampPaydayDay(day);
  appState.paydayDay = paydayDay;
  elements.paydayInput.value = String(paydayDay);
  await storage.set({ paydayDay });
  setSaveMessage(`Saved recurring payday as day ${paydayDay}.`);
  renderClockAndCountdown();
}

export async function toggleSecondsVisibility() {
  appState.hideSeconds = !appState.hideSeconds;
  renderSecondsVisibility();
  renderClockAndCountdown();
  setSaveMessage(appState.hideSeconds ? "Seconds hidden." : "Seconds shown.");
  await storage.set({ hideSeconds: appState.hideSeconds });
}

export function normalizeHideSeconds(value) {
  return Boolean(value ?? DEFAULT_HIDE_SECONDS);
}
