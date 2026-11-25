// Project covers are defined in the CSS (so they change with the
// light/dark mode); here the section only gets .is-near when it comes close,
// and the CSS requests them from then on. The same signal is passed on to
// `onNear` (main.js loads the contact form with it).
// The visual entry of the sections no longer depends on JS: it's CSS
// (scroll-driven animations in _section.css), so the content shows even if
// this script doesn't run.

const createObserver = (onNear) => {
  // Improved Intersection Observer configuration
  const observerOptions = {
    // As soon as any part of the section enters the margin: with a
    // percentage, tall sections would load late
    threshold: 0,
    // Margin to start loading before the section reaches the screen
    rootMargin: '400px 0px',
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      const target = entry.target;

      if (entry.isIntersecting) {
        // Signal for the CSS (#projects covers)
        target.classList.add('is-near');
        onNear?.(target);

        // Everything pending has been loaded
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  return observer;
};

const observeSections = (observer) => {
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => {
    observer.observe(section);
  });
};

/**
 * @param {{ onNear?: (section: Element) => void }} [options] called once per
 *   section, when it first gets within 400px of the viewport
 */
const observeProjectCovers = ({ onNear } = {}) => {
  const observer = createObserver(onNear);
  observeSections(observer);
};

export { observeProjectCovers };
