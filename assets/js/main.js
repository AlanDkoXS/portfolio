/**
 * Main Application File
 * Orchestrates the initialization and management of the portfolio website
 */

// ---------------------------
// MODULE IMPORTS
// ---------------------------
// Shared with the resume and project pages
import { commonSteps } from './helpers/common.js';

// UI Components
import loader from './helpers/loader.js';
import activeMenu from './helpers/activeMenu.js';
import { cardCarousel } from './helpers/cardCarousel.js';
import { closeModal } from './helpers/close-modal.js';
import initObserver from './helpers/observer.js';
import skillsMarquee from './helpers/skills_marquee.js';

// Visual Effects
import ParallaxEffect from './helpers/parallax.js';
import profileParallax from './helpers/profile_parallax.js';
import SnowEffect from './helpers/snow-effect.js';

// Functionality
import { displayConsoleLogo } from './helpers/console-logo.js';
import resetToHome from './helpers/reload_page.js';
import sendEmail from './helpers/send_form.js';
// EmailJS is loaded by send_form.js when the form is used

// ---------------------------
// ERROR HANDLING
// ---------------------------
/**
 * Centralized error handler
 * @param {Error} error - The error that occurred
 * @param {string} context - The context where the error occurred
 */
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
};

// ---------------------------
// INITIALIZATION GROUPS
// ---------------------------

/**
 * Run in this order after the loader and the language. Each group is
 * isolated: an error inside one is reported under its name and skips the rest
 * of that group, not the following groups.
 */
const INIT_GROUPS = [
  // Theme follows the system; the toggle stores an override (see auto-dark-mode.js)
  ['setupDarkMode', [commonSteps.theme, commonSteps.lamp]],

  // Third-party scripts, off the critical path: GTM is injected when the
  // browser is idle; EmailJS loads when the contact form is used. Nothing here
  // is awaited, so a slow or blocked CDN can't delay the UI.
  ['loadExternalResources', [commonSteps.analytics]],

  [
    'initializeUIComponents',
    [
      // Navigation and menu
      activeMenu,
      commonSteps.navMenu,
      resetToHome,
      // UI Components
      cardCarousel,
      initObserver,
      skillsMarquee,
      closeModal,
    ],
  ],

  // Parallax effects, then seasonal effects
  ['initializeVisualEffects', [() => ParallaxEffect.init(), profileParallax, commonSteps.snow]],

  // Footer year and email handling
  ['initializeFunctionalities', [commonSteps.footerYear, sendEmail]],
];

const runGroup = ([name, steps]) => {
  try {
    for (const step of steps) step();
  } catch (error) {
    handleError(error, name);
  }
};

/**
 * Set up resource cleanup on page unload
 */
const setupCleanup = () => {
  window.addEventListener('beforeunload', () => {
    SnowEffect.destroy();
  });
};

// ---------------------------
// MAIN INITIALIZATION
// ---------------------------

/**
 * Main initialization function
 */
const initialize = () => {
  try {
    // Display console logo
    displayConsoleLogo();

    // Loading screen
    loader();

    // Apply detected language right away (an error here stops everything)
    commonSteps.language();

    // Theme right away too, then the rest
    INIT_GROUPS.forEach(runGroup);

    // Set up system event handlers
    setupCleanup();
  } catch (error) {
    handleError(error, 'initialize');
  }
};

// ---------------------------
// EVENT LISTENERS
// ---------------------------

// Initialize on DOM content loaded.
// Responsive home text (home + about merged on desktop) lives in
// switchLanguages.js so it stays in the selected language.
document.addEventListener('DOMContentLoaded', initialize);
