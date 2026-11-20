/**
 * Main Application File
 * Orchestrates the initialization and management of the portfolio website
 */

// ---------------------------
// MODULE IMPORTS
// ---------------------------
// UI Components
import loader from "./helpers/loader.js";
import activeMenu from "./helpers/activeMenu.js";
import { cardCarousel } from "./helpers/cardCarousel.js";
import { closeModal } from "./helpers/close-modal.js";
import initObserver from "./helpers/observer.js";
import skillsMarquee from "./helpers/skills_marquee.js";

// Visual Effects
import ParallaxEffect from "./helpers/parallax.js";
import profileParallax from "./helpers/profile_parallax.js";
import SnowEffect from "./helpers/snow-effect.js";
import { setAutoDarkMode } from "./helpers/auto-dark-mode.js";

// Functionality
import updateDateYear from "./helpers/date_updater.js";
import resetToHome from "./helpers/reload_page.js";
import sendEmail from "./helpers/send_form.js";
import switchLanguages from "./helpers/switchLanguages.js";

// External Services
import { loadGoogleTagManager } from "./helpers/google-tag-manager.js";
import { loadEmailJS } from "./helpers/email-js.js";

// ---------------------------
// APPLICATION STATE
// ---------------------------
const AppState = {
  isLoading: true,
  isDarkMode: false,
  currentLanguage: "en",
  isMenuOpen: false,
};

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
  // Future implementation: error reporting system
};

// ---------------------------
// CONSOLE LOGO
// ---------------------------

/**
 * Display ASCII logo in console
 */
const displayConsoleLogo = () => {
  const logo = `
%c    ___    __                ____        _       __                   
%c   /   |  / /___ _____      / __ \\__  __(_)___  / /_____ _____  ____ _
%c  / /| | / / __ \`/ __ \\    / / / / / / / / __ \\/ __/ __ \`/ __ \\/ __ \`/
%c / ___ |/ / /_/ / / / /   / /_/ / /_/ / / / / / /_/ /_/ / / / / /_/ / 
%c/_/  |_/_/\\__,_/_/ /_/    \\___\\_\\__,_/_/_/ /_/\\__/\\__,_/_/ /_/\\__,_/  
%c
%c🚀 Hello! Welcome to my portfolio
%c💻 Full Stack Designer & Developer
%c🌐 https://www.alanquintana.pro
%c📧 Contact: https://www.linkedin.com/in/alanxs/
%c
%c💡 Interested in collaborating? Let's talk!
  `;

  const styles = [
    "color: #6366f1; font-weight: bold;", // Line 1
    "color: #8b5cf6; font-weight: bold;", // Line 2
    "color: #a855f7; font-weight: bold;", // Line 3
    "color: #c084fc; font-weight: bold;", // Line 4
    "color: #d8b4fe; font-weight: bold;", // Line 5
    "color: #e9d5ff;", // Empty line
    "color: #10b981; font-size: 16px; font-weight: bold;", // Welcome
    "color: #059669; font-size: 14px;", // Description
    "color: #0891b2; font-size: 14px;", // URL
    "color: #0e7490; font-size: 14px;", // Contact
    "color: #64748b;", // Empty line
    "color: #f59e0b; font-size: 16px; font-weight: bold;", // Call to action
  ];

  console.log(logo, ...styles);
};

// ---------------------------
// INITIALIZATION FUNCTIONS
// ---------------------------

/**
 * Initialize UI components
 */
const initializeUIComponents = async () => {
  try {
    // Navigation and menu
    activeMenu();
    resetToHome();

    // UI Components
    cardCarousel();
    initObserver();
    skillsMarquee();
    closeModal();
  } catch (error) {
    handleError(error, "initializeUIComponents");
  }
};

/**
 * Initialize visual effects
 */
const initializeVisualEffects = () => {
  try {
    // Parallax effects
    ParallaxEffect.init();
    profileParallax();

    // Seasonal effects
    SnowEffect.init();
  } catch (error) {
    handleError(error, "initializeVisualEffects");
  }
};

/**
 * Initialize core functionalities
 */
const initializeFunctionalities = () => {
  try {
    // Date updater
    updateDateYear();

    // Email handling
    sendEmail();
  } catch (error) {
    handleError(error, "initializeFunctionalities");
  }
};

/**
 * Load external resources asynchronously
 */
const loadExternalResources = async () => {
  try {
    await Promise.all([loadGoogleTagManager(), loadEmailJS()]);
  } catch (error) {
    handleError(error, "loadExternalResources");
  }
};

/**
 * Configure dark mode functionality
 */
const setupDarkMode = () => {
  try {
    // Theme follows the system; the toggle stores an override (see auto-dark-mode.js)
    setAutoDarkMode();
    AppState.isDarkMode = document.body.getAttribute("data-theme") === "dark";
  } catch (error) {
    handleError(error, "setupDarkMode");
  }
};

/**
 * Set up page visibility handling
 */
const setupVisibilityHandler = () => {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  });
};

/**
 * Set up resource cleanup on page unload
 */
const setupCleanup = () => {
  window.addEventListener("beforeunload", () => {
    SnowEffect.destroy();
    // Additional resource cleanup can be added here
  });
};

// ---------------------------
// MAIN INITIALIZATION
// ---------------------------

/**
 * Main initialization function
 */
const initialize = async () => {
  try {
    // Display console logo
    displayConsoleLogo();

    // Loading screen: start before awaiting third-party scripts so a slow
    // or blocked CDN (EmailJS, GTM) can't keep the loader on screen
    loader();

    // Apply detected language right away (avoids an English flash for
    // Spanish visitors while third-party scripts load)
    switchLanguages();

    // Theme right away too, before awaiting third-party scripts
    setupDarkMode();

    // Third-party scripts (GTM, EmailJS)
    await loadExternalResources();

    // Initialize main components
    await initializeUIComponents();

    // Initialize visual effects
    initializeVisualEffects();

    // Initialize functionalities
    initializeFunctionalities();

    // Set up system event handlers
    setupVisibilityHandler();
    setupCleanup();

    // Mark as loaded
    AppState.isLoading = false;
  } catch (error) {
    handleError(error, "initialize");
  }
};

// ---------------------------
// EVENT LISTENERS
// ---------------------------

// Initialize on DOM content loaded.
// Responsive home text (home + about merged on desktop) lives in
// switchLanguages.js so it stays in the selected language.
document.addEventListener("DOMContentLoaded", initialize);

// Global error handlers
window.addEventListener("error", (event) => {
  handleError(event.error, "window.error");
});

window.addEventListener("unhandledrejection", (event) => {
  handleError(event.reason, "unhandledrejection");
});
