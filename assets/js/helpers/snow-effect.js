// Seasonal snow (Dec 12 - Jan 6, see isSnowSeason), unless the user asks for
// reduced motion. common.js only imports this module when both allow it.
import { isSnowSeason, prefersReducedMotion } from './motion.js';

const createSnowEffect = () => {
  // A flake with a random position, speed and opacity. The first ones start
  // falling at random moments (up to 10s); a flake that replaces one that has
  // reached the bottom starts right away, so the snowfall stays continuous.
  function createSnowflake({ delayed = true } = {}) {
    const flake = document.createElement('div');
    flake.classList.add('snow');

    // Random initial position
    const startPosition = Math.random() * window.innerWidth;
    const delay = delayed ? Math.random() * 10 : 0; // Random delay
    const duration = 5 + Math.random() * 10; // Random duration between 5-15s

    Object.assign(flake.style, {
      left: `${startPosition}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      opacity: 0.1 + Math.random() * 0.9,
    });

    return flake;
  }

  function initSnow() {
    if (prefersReducedMotion()) return;
    if (!isSnowSeason()) return;

    // Create snow container if it doesn't exist
    let snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) {
      snowContainer = document.createElement('div');
      snowContainer.className = 'snow-container';
      document.body.prepend(snowContainer);
    }

    // Add styles if they don't exist
    if (!document.querySelector('#snow-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'snow-styles';
      styleSheet.textContent = `
          .snow-container {
            position: fixed;
            width: 100%;
            height: 100vh;
            top: 0;
            left: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 9999;
          }
          .snow {
            position: absolute;
            top: -10px;
            width: 5px;
            height: 5px;
            background: white;
            border-radius: 50%;
            filter: drop-shadow(0 0 10px white);
            animation: fall linear infinite;
          }
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
        `;
      document.head.appendChild(styleSheet);
    }

    // Create initial snowflakes
    const numberOfFlakes = 50;
    for (let i = 0; i < numberOfFlakes; i++) {
      snowContainer.appendChild(createSnowflake());
    }

    // Each time a flake's fall starts over (top of the screen again), it's
    // replaced by a new one somewhere else and at another speed. One listener
    // for all of them (the event bubbles), and nothing is measured: the old
    // timer read every flake's position (a layout) once per second.
    if (!snowContainer.dataset.bound) {
      snowContainer.dataset.bound = 'true';
      snowContainer.addEventListener('animationiteration', (event) => {
        if (event.target.classList.contains('snow')) event.target.replaceWith(createSnowflake({ delayed: false }));
      });
    }
  }

  function destroySnow() {
    // Remove snow container if it exists
    const snowContainer = document.querySelector('.snow-container');
    snowContainer?.remove();

    // Remove styles if they exist
    const styleSheet = document.querySelector('#snow-styles');
    styleSheet?.remove();
  }

  return {
    init: initSnow,
    destroy: destroySnow,
  };
};

const snowEffect = createSnowEffect();
export { snowEffect };
