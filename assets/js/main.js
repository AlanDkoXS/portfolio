// Importación de módulos
import loader from './helpers/loader.js';
import ParallaxEffect from './helpers/parallax.js';
import profileParallax from './helpers/profile_parallax.js';
import activeMenu from './helpers/selected_menu.js';
import updateDateYear from './helpers/date_updater.js';
import resetToHome from './helpers/reload_page.js';
import sendEmail from './helpers/send_form.js';
import switchLanguages from './helpers/switchLanguages.js';
import { cardCarousel } from './helpers/cardCarousel.js';
import { setAutoDarkMode } from './helpers/auto-dark-mode.js';
import { loadGoogleTagManager } from './helpers/google-tag-manager.js';
import { loadEmailJS } from './helpers/email-js.js';
import initObserver from './helpers/observer.js';
import { closeModal } from './helpers/close-modal.js';
import SnowEffect from './helpers/snow-effect.js';

// Estado global de la aplicación
const AppState = {
  isLoading: true,
  isDarkMode: false,
  currentLanguage: 'en',
  isMenuOpen: false,
};

// Función para manejar errores
const handleError = (error, context) => {
  console.error(`Error en ${context}:`, error);
  // Aquí podrías implementar un sistema de reporting de errores
};

// Función para inicializar componentes de la UI
const initializeUIComponents = async () => {
  try {
    // Inicializar loader
    loader();

    // Inicializar menú y navegación
    activeMenu();
    resetToHome();

    // Inicializar carrusel
    cardCarousel();

    // Inicializar observador de intersección
    initObserver();

    // Inicializar manejador de modales
    closeModal();
  } catch (error) {
    handleError(error, 'initializeUIComponents');
  }
};

// Función para inicializar efectos visuales
const initializeVisualEffects = () => {
  try {
    // Inicializar efectos de parallax
    ParallaxEffect.init();
    profileParallax();

    // Inicializar efecto de nieve si es temporada
    SnowEffect.init();
  } catch (error) {
    handleError(error, 'initializeVisualEffects');
  }
};

// Función para inicializar funcionalidades
const initializeFunctionalities = () => {
  try {
    // Inicializar actualizador de año
    updateDateYear();

    // Inicializar manejador de emails
    sendEmail();

    // Inicializar cambio de idiomas
    switchLanguages();
  } catch (error) {
    handleError(error, 'initializeFunctionalities');
  }
};

// Función para cargar recursos externos
const loadExternalResources = async () => {
  try {
    await Promise.all([loadGoogleTagManager(), loadEmailJS()]);
  } catch (error) {
    handleError(error, 'loadExternalResources');
  }
};

// Función para manejar el modo oscuro
const setupDarkMode = () => {
  try {
    setAutoDarkMode();

    // Observer para cambios en preferencias del sistema
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener((e) => {
      AppState.isDarkMode = e.matches;
      setAutoDarkMode();
    });
  } catch (error) {
    handleError(error, 'setupDarkMode');
  }
};

// Función para manejar la visibilidad de la página
const setupVisibilityHandler = () => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  });
};

// Función para manejar la limpieza de recursos
const setupCleanup = () => {
  window.addEventListener('beforeunload', () => {
    SnowEffect.destroy();
    // Aquí puedes agregar más limpieza de recursos si es necesario
  });
};

// Función principal de inicialización
const initialize = async () => {
  try {
    // Cargar recursos externos primero
    await loadExternalResources();

    // Configurar modo oscuro
    setupDarkMode();

    // Inicializar componentes principales
    await initializeUIComponents();

    // Inicializar efectos visuales
    initializeVisualEffects();

    // Inicializar funcionalidades
    initializeFunctionalities();

    // Configurar manejadores de eventos del sistema
    setupVisibilityHandler();
    setupCleanup();

    // Marcar como cargado
    AppState.isLoading = false;
  } catch (error) {
    handleError(error, 'initialize');
  }
};

// Event listener para el DOMContentLoaded
document.addEventListener('DOMContentLoaded', initialize);

// Manejar errores no capturados
window.addEventListener('error', (event) => {
  handleError(event.error, 'window.error');
});

window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason, 'unhandledrejection');
});
