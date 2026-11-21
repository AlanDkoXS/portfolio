/**
 * Active Menu Module
 * Handles highlighting the current section in the navigation menu
 * and adjusts the navigation display on mobile devices.
 */

// DOM element selectors
const navbarListDOM = document.querySelector('.navbar__list');
const navbarLinksDOM = document.querySelectorAll('.navbar__link');
const sectionsDOM = document.querySelectorAll('section');

/**
 * Helper function to limit the frequency of function execution during events
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @param {boolean} immediate - Whether to execute the function immediately
 * @return {Function} The debounced function
 */
function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Marca el enlace de la sección que cruza la línea media de la pantalla.
 * IntersectionObserver en vez de calcular posiciones en cada scroll: no
 * depende de cuándo llegan los eventos (con el scroll suave del menú el
 * cálculo anterior se quedaba en la sección de partida).
 * El estado se refleja también con aria-current para lectores de pantalla.
 */
function setActiveLink(id) {
  // Por href, no por posición: secciones sin enlace no cambian la marca
  const link = [...navbarLinksDOM].find((a) => a.getAttribute('href').endsWith(`#${id}`));
  if (!link) return;
  navbarLinksDOM.forEach((a) => {
    const active = a === link;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

function observeSections() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    },
    // una línea horizontal a media pantalla
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  );
  sectionsDOM.forEach((section) => section.id && observer.observe(section));
}

/**
 * Handles mobile-specific menu behavior
 */
function handleMobileMenu() {
  if (window.innerWidth <= 600) {
    // Add a scroll event listener to toggle the menu visibility on mobile
    window.addEventListener(
      'scroll',
      debounce(() => {
        navbarListDOM.classList.toggle('hidden', window.scrollY > 0);
      }),
    );
  }
}

/**
 * Initializes the active menu functionality
 */
function activeMenu() {
  observeSections();

  // Initialize mobile menu handling
  handleMobileMenu();

  // Re-initialize mobile menu on window resize
  window.addEventListener(
    'resize',
    debounce(() => {
      handleMobileMenu();
    }, 100),
  );

}

export default activeMenu;
