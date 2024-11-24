const initParallax = () => {
    const bgBack = document.querySelector('.bgBack');
    const bgMiddle = document.querySelector('.bgMiddle');
    const bgFront = document.querySelector('.bgFront');

    let lastX = 0;
    let lastY = 0;

    // Guardar las posiciones originales
    const originalPositions = {
      bgBack: { x: 0, y: 0 },
      bgMiddle: { x: 0, y: 0 },
      bgFront: { x: 0, y: 0 },
    };

    // Variables para el movimiento automático
    let autoMovementX = 0;
    let autoMovementSpeed = 0.5; // Velocidad del movimiento automático
    let isMobile = window.matchMedia('(max-width: 768px)').matches; // Detección de dispositivos móviles

    // Función para actualizar la posición de las capas
    const updateLayers = (deltaX, deltaY, gamma, beta) => {
      const bgBackSensitivity = 4; // Sensibilidad para el bgGrain
      const bgMiddleSensitivity = 2.5; // Sensibilidad para el bgMiddle
      const bgFrontSensitivity = 1.5; // Sensibilidad para el bgFront

      // Movimiento inverso en bgGrain y bgFront, movimiento normal en bgMiddle
      bgBack.style.transform = `translate(-50%, -50%) translate(${
        -deltaX * bgBackSensitivity - gamma * 4 - autoMovementX
      }px, 0)`;
      bgMiddle.style.transform = `translate(-50%, -50%) translate(${
        deltaX * bgMiddleSensitivity + gamma * 2 + autoMovementX
      }px, 0)`;
      bgFront.style.transform = `translate(-50%, -50%) translate(${
        -deltaX * bgFrontSensitivity - gamma * 2 + autoMovementX
      }px, 0)`;
    };

    // Función para volver a la posición original
    const resetPositions = () => {
      bgBack.style.transition = 'transform 0.5s ease'; // Transición suave
      bgMiddle.style.transition = 'transform 0.5s ease'; // Transición suave
      bgFront.style.transition = 'transform 0.5s ease'; // Transición suave

      bgBack.style.transform = `translate(-50%, -50%)`;
      bgMiddle.style.transform = `translate(-50%, -50%)`;
      bgFront.style.transform = `translate(-50%, -50%)`;
    };

    const touchMoveHandler = (event) => {
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastX;
      lastX = touch.clientX;

      updateLayers(deltaX, 0, 0, 0); // Solo movimiento horizontal
    };

    window.addEventListener('deviceorientation', function (event) {
      const gamma = event.gamma; // Movimiento lateral
      const beta = event.beta; // Movimiento hacia adelante y hacia atrás

      updateLayers(0, 0, gamma, beta); // Aquí puedes decidir si quieres usar beta
    });

    document.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      lastX = touch.clientX;
    });

    document.addEventListener('touchmove', touchMoveHandler, { passive: true });

    // Evento para detectar cuando se deja de tocar
    document.addEventListener('touchend', resetPositions);

    // Movimiento automático solo en móviles
    if (isMobile) {
      setInterval(() => {
        autoMovementX += autoMovementSpeed;
        if (autoMovementX > 10 || autoMovementX < -10) {
          autoMovementSpeed *= -1; // Cambiar dirección cuando alcanza el límite
        }
        updateLayers(0, 0, 0, 0); // Actualiza las capas con el movimiento automático
      }, 30); // Intervalo de tiempo en milisegundos
    }
  };

  // Exporta la función para que la puedas importar en otro archivo
  export default initParallax;
