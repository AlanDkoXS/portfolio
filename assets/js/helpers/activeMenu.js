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
 * Updates the active navigation link based on the current scroll position
 */
function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 100; // Adding offset for better UX

  sectionsDOM.forEach((section, index) => {
    // Check if the section is currently in view
    if (
      scrollPosition >= section.offsetTop &&
      scrollPosition < section.offsetTop + section.offsetHeight
    ) {
      // Remove active class from the currently active link
      const activeLink = navbarListDOM.querySelector('.navbar__link.active');
      if (activeLink) {
        activeLink.classList.remove('active');
      }

      // Add active class to the link corresponding to the current section
      navbarLinksDOM[index].classList.add('active');
    }
  });
}

/**
 * Handles mobile-specific menu behavior
 */
function handleMobileMenu() {
  if (window.innerWidth <= 768) {
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
  // Add debounced scroll event listener for better performance
  window.addEventListener('scroll', debounce(updateActiveNavLink));

  // Initialize mobile menu handling
  handleMobileMenu();

  // Re-initialize mobile menu on window resize
  window.addEventListener(
    'resize',
    debounce(() => {
      handleMobileMenu();
    }, 100),
  );

  // Run once on page load to set the initial active link
  updateActiveNavLink();
}

export default activeMenu;
