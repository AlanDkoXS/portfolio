// Bootstrap shared by every page (home, resume, project pages): the steps
// they all run, under one name each, so a page imports a single module.
import switchLanguages from './switchLanguages.js';
import { setAutoDarkMode } from './auto-dark-mode.js';
import lamp from './lamp.js';
import navMenu from './nav_menu.js';
import updateDateYear from './date_updater.js';
import SnowEffect from './snow-effect.js';
import { loadGoogleTagManager } from './google-tag-manager.js';

// In their canonical order. Every step tolerates pages without its elements.
export const commonSteps = {
  language: switchLanguages, // texts in the page language + language toggle
  theme: setAutoDarkMode, // light/dark theme; must run before the lamp
  lamp, // hanging lamp (theme switch)
  navMenu, // mobile hamburger menu
  footerYear: updateDateYear,
  snow: () => SnowEffect.init(), // seasonal
  analytics: loadGoogleTagManager, // deferred, never awaited
};

/**
 * Runs the shared steps: all of them in canonical order, or only the named
 * ones in the order given. Pages interleave their own helpers between steps
 * and start analytics at different moments, so each one passes its own list;
 * an error in a step skips the rest of that call.
 * @param {(keyof typeof commonSteps)[]} [names]
 */
export function initCommon(names = Object.keys(commonSteps)) {
  for (const name of names) commonSteps[name]();
}
