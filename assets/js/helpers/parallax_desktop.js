function parallaxDesktop() {
  if (window.matchMedia('(min-width: 769px)').matches) {
    document.addEventListener('DOMContentLoaded', function () {
      const bgBack = document.querySelector('.bgBack');
      const bgMiddle = document.querySelector('.bgMiddle');
      const bgFront = document.querySelector('.bgFront');

      let lastX = 0;
      let autoMovementX = 0;
      let autoMovementSpeed = 0.5;

      const sensitivities = {
        bgBack: 4,
        bgMiddle: 2.5,
        bgFront: 1.5,
      };

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

      const resetPositions = () => {
        [bgBack, bgMiddle, bgFront].forEach((layer) => {
          layer.style.transition = 'transform 0.5s ease';
          layer.style.transform = 'translate(-50%, -50%)';
        });
      };

      const mouseMoveHandler = (event) => {
        const deltaX = event.clientX - lastX;
        lastX = event.clientX;

        updateLayers(deltaX);
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseleave', resetPositions);

      setInterval(() => {
        autoMovementX += autoMovementSpeed;
        if (autoMovementX > 10 || autoMovementX < -10) {
          autoMovementSpeed *= -1;
        }
        updateLayers(0);
      }, 30);
    });
  }
}

export default parallaxDesktop;
