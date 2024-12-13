function parallaxMobile() {
  if (window.matchMedia('(max-width: 768px)').matches) {
    document.addEventListener('DOMContentLoaded', function () {
      const bgBack = document.querySelector('.bgBack');
      const bgMiddle = document.querySelector('.bgMiddle');
      const bgFront = document.querySelector('.bgFront');

      let autoMovementX = 0;
      let autoMovementY = 0;
      let autoMovementSpeedX = 0.5;
      let autoMovementSpeedY = 0.1;

      const updateLayers = (gamma, beta) => {
        const bgBackSensitivityX = 4;
        const bgMiddleSensitivityX = 2.5;
        const bgFrontSensitivityX = 1.5;
        const bgBackSensitivityY = 1;
        const bgMiddleSensitivityY = .5;
        const bgFrontSensitivityY = .3;

        bgBack.style.transform = `translate(-50%, -50%) translate(${
          -gamma * bgBackSensitivityX - autoMovementX
        }px, ${-beta * bgBackSensitivityY - autoMovementY}px)`;
        bgMiddle.style.transform = `translate(-50%, -50%) translate(${
          gamma * bgMiddleSensitivityX + autoMovementX
        }px, ${beta * bgMiddleSensitivityY + autoMovementY}px)`;
        bgFront.style.transform = `translate(-50%, -50%) translate(${
          -gamma * bgFrontSensitivityX + autoMovementX
        }px, ${-beta * bgFrontSensitivityY + autoMovementY}px)`;
      };

      window.addEventListener('deviceorientation', function (event) {
        const gamma = event.gamma;
        const beta = event.beta;

        updateLayers(gamma, beta);
      });

      setInterval(() => {
        autoMovementX += autoMovementSpeedX;
        autoMovementY += autoMovementSpeedY;
        if (autoMovementX > 10 || autoMovementX < -10) {
          autoMovementSpeedX *= -1;
        }
        if (autoMovementY > 10 || autoMovementY < -10) {
          autoMovementSpeedY *= -1;
        }
        updateLayers(0, 0);
      }, 30);

      document.addEventListener('touchend', () => {});
    });
  }
}

export default parallaxMobile;
