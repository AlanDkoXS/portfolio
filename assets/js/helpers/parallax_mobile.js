function parallaxMobile() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.addEventListener('DOMContentLoaded', function () {
        const bgBack = document.querySelector('.bgBack');
        const bgMiddle = document.querySelector('.bgMiddle');
        const bgFront = document.querySelector('.bgFront');

        let autoMovementX = 0;
        let autoMovementSpeed = 0.5;

        const updateLayers = (gamma, beta) => {
          const bgBackSensitivity = 4;
          const bgMiddleSensitivity = 2.5;
          const bgFrontSensitivity = 1.5;

          bgBack.style.transform = `translate(-50%, -50%) translate(${
            -gamma * bgBackSensitivity - autoMovementX
          }px, 0)`;
          bgMiddle.style.transform = `translate(-50%, -50%) translate(${
            gamma * bgMiddleSensitivity + autoMovementX
          }px, 0)`;
          bgFront.style.transform = `translate(-50%, -50%) translate(${
            -gamma * bgFrontSensitivity + autoMovementX
          }px, 0)`;
        };

        window.addEventListener('deviceorientation', function (event) {
          const gamma = event.gamma;
          const beta = event.beta;

          updateLayers(gamma, beta);
        });

        // Auto movement logic for mobile
        setInterval(() => {
          autoMovementX += autoMovementSpeed;
          if (autoMovementX > 10 || autoMovementX < -10) {
            autoMovementSpeed *= -1;
          }
          updateLayers(0, 0);
        }, 30);

        document.addEventListener('touchend');
      });
    }
  }

  export default parallaxMobile();
