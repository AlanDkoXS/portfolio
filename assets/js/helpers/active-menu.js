/**
 * Active Menu Module
 * Handles highlighting the current section in the navigation menu.
 */

// DOM element selectors
const navbarLinksDOM = document.querySelectorAll('.navbar__link');
const sectionsDOM = document.querySelectorAll('section');

/**
 * Marks the link of the section that crosses the middle line of the screen.
 * IntersectionObserver instead of computing positions on every scroll: it
 * doesn't depend on when the events arrive (with the menu's smooth scroll
 * the previous calculation stayed on the starting section).
 * The state is also reflected with aria-current for screen readers.
 */
function setActiveLink(id) {
  // By href, not by position: sections without a link don't change the mark
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
    // a horizontal line at mid-screen
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  );
  sectionsDOM.forEach((section) => section.id && observer.observe(section));
}

/**
 * Initializes the active menu functionality
 */
function activeMenu() {
  observeSections();
}

export { activeMenu };
