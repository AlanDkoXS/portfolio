/**
 * Main Application File
 * Orchestrates the initialization and management of the portfolio website.
 * Only what the first screen needs is imported up front; the rest is imported
 * on demand (see LAZY STEPS) so the first load fetches less JavaScript.
 */

// ---------------------------
// MODULE IMPORTS
// ---------------------------
// Shared with the resume and project pages
import { commonSteps } from './helpers/common.js';

// UI Components
import { loader, heroReady } from './helpers/loader.js';
import { activeMenu } from './helpers/active-menu.js';
import { cardCarousel } from './helpers/card-carousel.js';
import { setupContactDialog } from './helpers/contact-dialog.js';
import { observeProjectCovers } from './helpers/project-covers.js';
import { skillsMarquee } from './helpers/skills-marquee.js';

// Functionality
import { resetToHome } from './helpers/reset-to-home.js';
import { prefersReducedMotion } from './helpers/motion.js';
import { addFieldValidationListeners } from './helpers/form-validation.js';
import { loadStep, onIdle } from './helpers/lazy.js';

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
// LAZY STEPS
// ---------------------------
// Each one is isolated like a group below: a failed download or start is
// reported under its name (lazy.js) and doesn't affect anything else.

// ASCII logo in the console: nobody needs it before the page is idle
const showConsoleLogo = () =>
  onIdle(() => loadStep('displayConsoleLogo', () => import('./helpers/console-logo.js'), (m) => m.displayConsoleLogo()));

// Hero parallax (background layers, then the portrait; on touch devices both
// import tilt.js): once the hero is shown and the browser is idle, within half
// a second (it's above the fold). Never with reduced motion, where both keep
// everything still.
const PARALLAX_IDLE_MS = 500;
const startParallax = () => {
  if (prefersReducedMotion()) return;
  const start = () =>
    loadStep(
      'initializeVisualEffects',
      () => Promise.all([import('./helpers/parallax.js'), import('./helpers/profile-parallax.js')]),
      ([{ parallaxEffect }, { profileParallax }]) => {
        parallaxEffect.init();
        profileParallax();
      },
    );
  heroReady.then(() => onIdle(start, PARALLAX_IDLE_MS));
};

// Contact form: each field is validated on blur from the start (that feedback
// can't wait for a download). The sending part (contact-form.js, which brings
// EmailJS on the first use) is imported when #contact first gets within 400px
// of the viewport (the signal that loads the project covers) or, at the latest,
// on the first focus or pointer inside the form. Until it's ready a submit is held
// (the form has no action: it would reload the page with the fields in the
// URL) and sent again once the module has started.
let loadContactForm = () => {};
const deferContactForm = () => {
  const form = document.getElementById('form');
  if (!form) return;

  addFieldValidationListeners();

  let inUse = false;
  let ready = null;

  const load = () =>
    (ready ??= loadStep('initContactForm', () => import('./helpers/contact-form.js'), (m) => {
      m.initContactForm({ inUse });
      // Started: from here on the module handles everything
      form.removeEventListener('focusin', onUse);
      form.removeEventListener('pointerdown', onUse);
      form.removeEventListener('submit', holdSubmit);
      return true;
    }).then((started) => {
      if (!started) ready = null; // failed: the next use tries again
      return started;
    }));

  function onUse() {
    inUse = true;
    load();
  }
  // Only one held submit is sent again (with the last submitter): a double
  // click or a second Enter while waiting must not send the message twice
  // (once started, contact-form.js disables the button while sending)
  let heldSubmitter;
  let holding = false;
  function holdSubmit(event) {
    event.preventDefault();
    heldSubmitter = event.submitter;
    if (holding) return;
    holding = true;
    load().then((started) => {
      holding = false;
      if (started) form.requestSubmit(heldSubmitter);
    });
  }
  loadContactForm = load;

  form.addEventListener('focusin', onUse);
  form.addEventListener('pointerdown', onUse);
  form.addEventListener('submit', holdSubmit);
};

// Sections that got near the viewport (project-covers.js). The projects
// carousel is not imported on demand like the form: laying the cards out after
// the page has been painted once changes how Chrome rasterizes the scaled side
// cards (text/shadow anti-aliasing), so it starts with the page as before.
const onSectionNear = (section) => {
  if (section.id === 'contact') loadContactForm();
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
      // UI Components (the covers' signal also loads the contact form)
      cardCarousel,
      () => observeProjectCovers({ onNear: onSectionNear }),
      skillsMarquee,
      setupContactDialog,
    ],
  ],

  // Parallax effects, then seasonal effects (both on demand)
  ['initializeVisualEffects', [startParallax, commonSteps.snow]],

  // Footer year and the contact form (its sending part on demand)
  ['initializeFunctionalities', [commonSteps.footerYear, deferContactForm]],
];

const runGroup = ([name, steps]) => {
  try {
    for (const step of steps) step();
  } catch (error) {
    handleError(error, name);
  }
};

// ---------------------------
// MAIN INITIALIZATION
// ---------------------------

/**
 * Main initialization function
 */
const initialize = () => {
  try {
    // Console logo, when idle
    showConsoleLogo();

    // Loading screen
    loader();

    // Apply detected language right away (an error here stops everything)
    commonSteps.language();

    // Theme right away too, then the rest
    INIT_GROUPS.forEach(runGroup);
  } catch (error) {
    handleError(error, 'initialize');
  }
};

// ---------------------------
// EVENT LISTENERS
// ---------------------------

// Initialize on DOM content loaded.
// Responsive home text (home + about merged on desktop) lives in
// language-switcher.js so it stays in the selected language.
document.addEventListener('DOMContentLoaded', initialize);
