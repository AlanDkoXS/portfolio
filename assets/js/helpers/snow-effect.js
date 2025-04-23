// snow-effect.js
const createSnowEffect = () => {
  // Check if we're in the Christmas period (Dec 12 - Jan 6)
  function isChristmasPeriod() {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const day = today.getDate();

    // Period from December 12 to January 6
    return (month === 11 && day >= 12) || (month === 0 && day <= 6);
  }

  function createSnowflake() {
    const flake = document.createElement('div');
    flake.classList.add('snow');

    // Random initial position
    const startPosition = Math.random() * window.innerWidth;
    const delay = Math.random() * 10; // Random delay
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
    if (!isChristmasPeriod()) return;

    // Create snow container if it doesn't exist
    let snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) {
      snowContainer = document.createElement('div');
      snowContainer.className = 'snow-container';
      document.body.insertBefore(snowContainer, document.body.firstChild);
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

    // Replace fallen snowflakes
    setInterval(() => {
      const flakes = snowContainer.children;
      for (let flake of flakes) {
        const rect = flake.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          snowContainer.removeChild(flake);
          snowContainer.appendChild(createSnowflake());
        }
      }
    }, 1000);
  }

  function destroySnow() {
    // Remove snow container if it exists
    const snowContainer = document.querySelector('.snow-container');
    if (snowContainer) {
      document.body.removeChild(snowContainer);
    }

    // Remove styles if they exist
    const styleSheet = document.querySelector('#snow-styles');
    if (styleSheet) {
      document.head.removeChild(styleSheet);
    }
  }

  return {
    init: initSnow,
    destroy: destroySnow,
  };
};

const snowEffect = createSnowEffect();
export default snowEffect;
