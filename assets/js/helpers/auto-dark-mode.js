// Automatic theme: if the visitor's system is in dark mode, dark.
// Otherwise (light mode is every device's default, so it can't be told
// apart from a choice) it follows a schedule in local time: dark from
// 18:00 to 6:00, light the rest of the day; it switches at the exact hour
// even with the page still open. The button (lamp / moon-sun) stores an
// override in localStorage.theme ('light' | 'dark') that lasts only until the
// next scheduled switch (localStorage.themeUntil, timestamp); then automatic returns.
// The theme is reflected in <meta name="color-scheme">, which the CSS reads (see
// _variables.css). The inline <head> script applies the same before painting
// (without JS, the meta stays "light dark" and the system is followed).
import { localStore } from './storage.js';

const STORAGE_KEY = 'theme';
const UNTIL_KEY = 'themeUntil';
const DARK_FROM = 18; // hour when dark mode starts
const DARK_UNTIL = 6; // hour when light mode returns

const isDarkHour = (hour) => hour >= DARK_FROM || hour < DARK_UNTIL;

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const scheduledTheme = (date = new Date()) =>
  systemDark.matches || isDarkHour(date.getHours()) ? 'dark' : 'light';

// Next scheduled switch (18:00 or 6:00) after `date`
const nextBoundary = (date = new Date()) => {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  const hour = date.getHours();
  if (hour >= DARK_UNTIL && hour < DARK_FROM) {
    next.setHours(DARK_FROM);
  } else {
    if (hour >= DARK_FROM) next.setDate(next.getDate() + 1);
    next.setHours(DARK_UNTIL);
  }
  return next.getTime();
};

// The second step of each pair only runs if the first one worked
const clearStoredOverride = () => localStore.remove(STORAGE_KEY) && localStore.remove(UNTIL_KEY);

const readOverride = () => {
  const value = localStore.get(STORAGE_KEY);
  const until = Number(localStore.get(UNTIL_KEY));
  if ((value === 'dark' || value === 'light') && Date.now() < until) return value;
  // expired (or from the previous version, with no date): cleared
  clearStoredOverride();
  return null;
};

// Storage unavailable: the theme still applies, it just isn't remembered
const writeOverride = (value) => {
  if (value) {
    if (localStore.set(STORAGE_KEY, value)) localStore.set(UNTIL_KEY, String(nextBoundary()));
  } else {
    clearStoredOverride();
  }
};

let override = null; // override in effect on this page (even if it can't be stored)
let overrideUntil = 0;

// An override lasts until the next scheduled switch
const setOverride = (value) => {
  override = value;
  overrideUntil = value ? nextBoundary() : 0;
};

const expireOverride = () => {
  if (Date.now() >= overrideUntil) override = null;
};

const renderedTheme = () => (override && Date.now() < overrideUntil ? override : scheduledTheme());

const sync = (toggle) => {
  const theme = renderedTheme();
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.content = theme;
  if (toggle) toggle.checked = theme === 'dark';
  document.body.setAttribute('data-theme', theme);
  // the lamp (lamp.js) reflects its state with aria-pressed
  const lamp = document.querySelector('.lamp');
  if (lamp) lamp.setAttribute('aria-pressed', String(theme === 'dark'));
};

export function setAutoDarkMode() {
  const toggle = document.querySelector('.navbar__toggle--darkmode-input');
  setOverride(readOverride());
  sync(toggle);

  if (!toggle || toggle.dataset.themeBound) return;
  toggle.dataset.themeBound = 'true';

  toggle.addEventListener('change', () => {
    // The user asks for "the opposite of what they see now"
    const target = renderedTheme() === 'dark' ? 'light' : 'dark';
    // If it matches the schedule, they're undoing their override: nothing is stored
    setOverride(target === scheduledTheme() ? null : target);
    writeOverride(override);
    sync(toggle);
  });

  // Automatic switch at the exact hour with the page open. Timers are
  // frozen in background tabs or with the phone locked, so it's
  // also re-checked when returning to the tab.
  let timer;
  const refresh = () => {
    expireOverride();
    sync(toggle);
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(refresh, nextBoundary() - Date.now() + 1000);
  };
  schedule();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });

  // The system switched to/from dark mode
  systemDark.addEventListener('change', () => sync(toggle));

  // Change made from another tab
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== UNTIL_KEY) return;
    setOverride(readOverride());
    sync(toggle);
  });
}
