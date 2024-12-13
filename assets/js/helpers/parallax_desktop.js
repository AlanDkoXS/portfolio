function parallaxDesktop() {
  if (window.matchMedia('(min-width: 769px)').matches) {
    document.addEventListener('DOMContentLoaded', function () {
      const bgBack = document.querySelector('.bgBack');
      const bgMiddle = document.querySelector('.bgMiddle');
      const bgFront = document.querySelector('.bgFront');

      let lastX = 0;
      let lastY = 0;
      let lastMoveTime = Date.now();
      const resetDelay = 300;

      const sensitivities = {
        bgBack: { x: 4, y: 1 },
        bgMiddle: { x: 2.5, y: 1.5 },
        bgFront: { x: 1.5, y: 2 },
      };

      const updateLayers = (deltaX, deltaY) => {
        bgBack.style.transform = `translate(-50%, -50%) translate(${
          -deltaX * sensitivities.bgBack.x
        }px, ${-deltaY * sensitivities.bgBack.y}px)`;

        bgMiddle.style.transform = `translate(-50%, -50%) translate(${
          deltaX * sensitivities.bgMiddle.x
        }px, ${deltaY * sensitivities.bgMiddle.y}px)`;

        bgFront.style.transform = `translate(-50%, -50%) translate(${
          -deltaX * sensitivities.bgFront.x
        }px, ${deltaY * sensitivities.bgFront.y}px)`;
      };

      const resetPositions = () => {
        [bgBack, bgMiddle, bgFront].forEach((layer) => {
          layer.style.transition = 'transform 0.5s ease';
          layer.style.transform = 'translate(-50%, -50%)';
        });
      };

      const mouseMoveHandler = (event) => {
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        updateLayers(deltaX, deltaY);
        lastMoveTime = Date.now();
      };

      const mouseLeaveHandler = () => {
        resetPositions();
      };

      const checkIfMouseStopped = () => {
        if (Date.now() - lastMoveTime > resetDelay) {
          resetPositions();
        }
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseleave', mouseLeaveHandler);

      setInterval(checkIfMouseStopped, 100);
    });
  }
}

export default parallaxDesktop;
