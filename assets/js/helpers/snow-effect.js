// snow-effect.js
function createSnowEffect() {
  // Verificar si estamos en el período navideño (12 dic - 6 ene)
  function isChristmasPeriod() {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const day = today.getDate();

    // Período del 12 de diciembre al 6 de enero
    if (month === 11 && day >= 12) return true; // Diciembre desde el 12
    if (month === 0 && day <= 6) return true; // Enero hasta el 6
    return false;
  }

  function initSnow() {
    if (!isChristmasPeriod()) return;

    // Crear el contenedor de nieve
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-container';

    // Crear los copos de nieve
    for (let i = 0; i < 100; i++) {
      const snow = document.createElement('div');
      snow.className = 'snow';
      snowContainer.appendChild(snow);
    }

    // Añadir al body
    document.body.insertBefore(snowContainer, document.body.firstChild);

    // Añadir estilos dinámicamente
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .snow-container {
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 9999;
      }

      .snow {
        position: absolute;
        width: 5px;
        height: 5px;
        background: white;
        border-radius: 50%;
        filter: drop-shadow(0 0 2px white);
      }
    `;

    // Generar animaciones únicas para cada copo
    for (let i = 0; i < 100; i++) {
      const randomX = Math.random() * 100;
      const randomOffset = (Math.random() - 0.5) * 10;
      const randomXEnd = randomX + randomOffset;
      const fallDuration = 10 + Math.random() * 20;
      const fallDelay = -Math.random() * 30;

      styleSheet.textContent += `
        .snow:nth-child(${i + 1}) {
          opacity: ${0.2 + Math.random() * 0.3};
          transform: translate(${randomX}vw, -10px);
          animation: fall-${i} ${fallDuration}s ${fallDelay}s linear infinite;
        }

        @keyframes fall-${i} {
          to {
            transform: translate(${randomXEnd}vw, 100vh);
          }
        }
      `;
    }

    document.head.appendChild(styleSheet);
  }

  return {
    init: initSnow,
  };
}

export const snowEffect = createSnowEffect();
export default snowEffect;
