// Lazy loading of images marked with data-src / data-background inside the
// sections. Project covers are defined in the CSS (so they change with the
// light/dark mode); here the section only gets .is-near when it comes close,
// and the CSS requests them from then on.
// The visual entry of the sections no longer depends on JS: it's CSS
// (scroll-driven animations in _section.css), so the content shows even if
// this script doesn't run.

const createObserver = () => {
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

        // Load images inside the section if they have data-src
        const lazyImages = target.querySelectorAll('img[data-src]');
        lazyImages.forEach((img) => {
          // Replace src with data-src
          img.src = img.dataset.src;
          // Optional: also update srcset if present
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          // Remove the data- attributes once loaded
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
        });

        // Load deferred background images
        const lazyBackgrounds = target.querySelectorAll('[data-background]');
        lazyBackgrounds.forEach((element) => {
          element.style.backgroundImage = `url('${element.dataset.background}')`;
          element.removeAttribute('data-background');
        });

        // Everything pending has been loaded
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  return observer;
};

const observeSections = (observer) => {
  // Select both sections and any other elements that want to be observed
  const sections = document.querySelectorAll('.section, [data-observe]');
  sections.forEach((section) => {
    observer.observe(section);
  });
};

// Improved function to initialize the observer
const initObserver = () => {
  const observer = createObserver();
  observeSections(observer);

  // Use the same observer for elements outside the sections
  const standaloneElements = document.querySelectorAll('[data-lazy-load]');
  standaloneElements.forEach((element) => {
    observer.observe(element);
  });

  return observer; // Return the observer for possible future use
};

export default initObserver;
