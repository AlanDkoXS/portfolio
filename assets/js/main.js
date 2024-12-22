import loader from './helpers/loader.js';
import parallaxMobile from './helpers/parallax_mobile.js';
import parallaxDesktop from './helpers/parallax_desktop.js';
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
import snowEffect from './helpers/snow-effect.js';

// Función para inicializar todos los componentes
const initializeComponents = () => {
  initObserver();
  cardCarousel();
  loader();
  resetToHome();
  activeMenu();
  parallaxMobile();
  parallaxDesktop();
  profileParallax();
  updateDateYear();
  sendEmail();
  switchLanguages();
  closeModal();
  snowEffect.init(); // Inicializamos el efecto de nieve
};

// Event listener para cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async function () {
  // Primero cargamos las dependencias externas
  await loadGoogleTagManager();
  await loadEmailJS();

  // Configuramos el modo oscuro
  setAutoDarkMode();

  // Inicializamos todos los componentes
  initializeComponents();
});
