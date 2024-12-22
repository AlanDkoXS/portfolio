// snow-effect.js
const createSnowEffect = () => {
  // Verificar si estamos en el período navideño (12 dic - 6 ene)
  function isChristmasPeriod() {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const day = today.getDate();

    // Período del 12 de diciembre al 6 de enero
    return (month === 11 && day >= 12) || (month === 0 && day <= 6);
  }

  function createSnowflake() {
    const flake = document.createElement('div');
    flake.classList.add('snow');

    // Posición inicial aleatoria
    const startPosition = Math.random() * window.innerWidth;
    const delay = Math.random() * 10; // Retraso aleatorio
    const duration = 5 + Math.random() * 10; // Duración aleatoria entre 5-15s

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

    // Crear el contenedor de nieve si no existe
    let snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) {
      snowContainer = document.createElement('div');
      snowContainer.className = 'snow-container';
      document.body.insertBefore(snowContainer, document.body.firstChild);
    }

    // Añadir estilos si no existen
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

    // Crear copos de nieve iniciales
    const numberOfFlakes = 50;
    for (let i = 0; i < numberOfFlakes; i++) {
      snowContainer.appendChild(createSnowflake());
    }

    // Reemplazar copos que han caído
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

  return {
    init: initSnow,
  };
};

const snowEffect = createSnowEffect();
export default snowEffect;
