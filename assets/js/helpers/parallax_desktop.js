function parallaxDesktop() {
    if (window.matchMedia("(min-width: 769px)").matches) {
      document.addEventListener("DOMContentLoaded", function () {
        const bgBack = document.querySelector(".bgBack");
        const bgMiddle = document.querySelector(".bgMiddle");
        const bgFront = document.querySelector(".bgFront");

        let lastX = 0;
        let autoMovementX = 0;
        let autoMovementSpeed = 0.5;

        // Sensibilidades configurables
        const sensitivities = {
          bgBack: 4,
          bgMiddle: 2.5,
          bgFront: 1.5,
        };

        // Actualiza las capas según el movimiento
        const updateLayers = (deltaX) => {
          bgBack.style.transform = `translate(-50%, -50%) translate(${
            -deltaX * sensitivities.bgBack - autoMovementX
          }px, 0)`;
          bgMiddle.style.transform = `translate(-50%, -50%) translate(${
            deltaX * sensitivities.bgMiddle + autoMovementX
          }px, 0)`;
          bgFront.style.transform = `translate(-50%, -50%) translate(${
            -deltaX * sensitivities.bgFront + autoMovementX
          }px, 0)`;
        };

        // Reinicia las posiciones
        const resetPositions = () => {
          [bgBack, bgMiddle, bgFront].forEach((layer) => {
            layer.style.transition = "transform 0.5s ease";
            layer.style.transform = "translate(-50%, -50%)";
          });
        };

        // Manejo del movimiento del ratón
        const mouseMoveHandler = (event) => {
          const deltaX = event.clientX - lastX;
          lastX = event.clientX;

          updateLayers(deltaX);
        };

        // Detectar cuando el mouse entra y sale del viewport
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseleave", resetPositions);

        // Lógica para el movimiento automático en escritorios
        setInterval(() => {
          autoMovementX += autoMovementSpeed;
          if (autoMovementX > 10 || autoMovementX < -10) {
            autoMovementSpeed *= -1; // Cambia de dirección
          }
          updateLayers(0); // Actualiza las capas con el movimiento automático
        }, 30);
      });
    }
  }

  export default parallaxDesktop;
