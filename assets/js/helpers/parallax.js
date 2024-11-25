function parallax() {
  document.addEventListener('DOMContentLoaded', function () {
    const bgBack = document.querySelector('.bgBack');
    const bgMiddle = document.querySelector('.bgMiddle');
    const bgFront = document.querySelector('.bgFront');

    let lastX = 0;
    let lastY = 0;

    const originalPositions = {
      bgBack: { x: 0, y: 0 },
      bgMiddle: { x: 0, y: 0 },
      bgFront: { x: 0, y: 0 },
    };

    let autoMovementX = 0;
    let autoMovementSpeed = 0.5;
    let isMobile = window.matchMedia('(max-width: 768px)').matches;

    const updateLayers = (deltaX, deltaY, gamma, beta) => {
      const bgBackSensitivity = 4;
      const bgMiddleSensitivity = 2.5;
      const bgFrontSensitivity = 1.5;

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

    const resetPositions = () => {
      bgBack.style.transition = 'transform 0.5s ease';
      bgMiddle.style.transition = 'transform 0.5s ease';
      bgFront.style.transition = 'transform 0.5s ease';

      bgBack.style.transform = `translate(-50%, -50%)`;
      bgMiddle.style.transform = `translate(-50%, -50%)`;
      bgFront.style.transform = `translate(-50%, -50%)`;
    };

    const touchMoveHandler = (event) => {
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastX;
      lastX = touch.clientX;

      updateLayers(deltaX, 0, 0, 0);
    };

    window.addEventListener('deviceorientation', function (event) {
      const gamma = event.gamma;
      const beta = event.beta;

      updateLayers(0, 0, gamma, beta);
    });

    document.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      lastX = touch.clientX;
    });

    document.addEventListener('touchmove', touchMoveHandler, { passive: true });

    document.addEventListener('touchend', resetPositions);

    if (isMobile) {
      setInterval(() => {
        autoMovementX += autoMovementSpeed;
        if (autoMovementX > 10 || autoMovementX < -10) {
          autoMovementSpeed *= -1;
        }
        updateLayers(0, 0, 0, 0);
      }, 30);
    }
  });
}

export default parallax;
