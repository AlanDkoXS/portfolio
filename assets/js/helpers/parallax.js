const bgBack = document.querySelector(".bgBack");
const bgMiddle = document.querySelector(".bgMiddle");
const bgFront = document.querySelector(".bgFront");

function parallax() {
  let lastX = 0;
  let lastY = 0;
  let targetX = 0;
  let targetY = 0;
  const smoothing = 0.1;

  let autoMovementX = 0;
  let autoMovementY = 0;
  const autoSpeed = 0.1;
  const autoLimitX = 20;
  const autoLimitY = 10;
  let autoDirectionX = 1;
  let autoDirectionY = 1;

  let resetTimer;
  let isMoving = true;

  const updateLayers = (deltaX, deltaY) => {
    const bgBackSensitivity = 4;
    const bgMiddleSensitivity = 2.5;
    const bgFrontSensitivity = 1.5;

    bgBack.style.transform = `translate(-50%, -50%) translate(${
      -deltaX * bgBackSensitivity
    }px, ${-deltaY * bgBackSensitivity}px)`;
    bgMiddle.style.transform = `translate(-50%, -50%) translate(${
      deltaX * bgMiddleSensitivity
    }px, ${deltaY * bgMiddleSensitivity}px)`;
    bgFront.style.transform = `translate(-50%, -50%) translate(${
      -deltaX * bgFrontSensitivity
    }px, ${-deltaY * bgFrontSensitivity}px)`;
  };

  const handleMouseMove = (e) => {
    targetX = (window.innerWidth / 2 - e.pageX) / 50;
    targetY = (window.innerHeight / 2 - e.pageY) / 100;

    clearTimeout(resetTimer);
    isMoving = true;
    resetTimer = setTimeout(() => {
      isMoving = false;
      resetPositions();
    }, 2000);
  };

  const handleDeviceOrientation = (event) => {
    const gamma = event.gamma;
    const beta = event.beta;

    targetX = (gamma / 90) * 8;
    targetY = (beta / 90) * 1;

    clearTimeout(resetTimer);
    isMoving = true;
    resetTimer = setTimeout(() => {
      isMoving = false;
      resetPositions();
    }, 2000);
  };

  document.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("deviceorientation", handleDeviceOrientation);

  const smoothMove = () => {
    if (isMoving) {
      lastX += (targetX - lastX) * smoothing;
      lastY += (targetY - lastY) * smoothing;

      if (Math.abs(autoMovementX) >= autoLimitX) {
        autoDirectionX *= -1;
      }
      if (Math.abs(autoMovementY) >= autoLimitY) {
        autoDirectionY *= -1;
      }

      autoMovementX += autoDirectionX * autoSpeed;
      autoMovementY += autoDirectionY * autoSpeed;

      lastX += autoMovementX * 0.1;
      lastY += autoMovementY * 0.1;

      updateLayers(lastX, lastY);
    }

    requestAnimationFrame(smoothMove);
  };

  smoothMove();

  document.addEventListener("mouseleave", () => {
    resetPositions();
  });

  const resetPositions = () => {
    bgBack.style.transition = "transform 0.5s ease";
    bgMiddle.style.transition = "transform 0.5s ease";
    bgFront.style.transition = "transform 0.5s ease";

    bgBack.style.transform = `translate(-50%, -50%)`;
    bgMiddle.style.transform = `translate(-50%, -50%)`;
    bgFront.style.transform = `translate(-50%, -50%)`;

    autoMovementX = 0;
    autoMovementY = 0;
  };
}

const isMobile = window.innerWidth <= 768; // Considera como móvil si el ancho es menor o igual a 768px

if (isMobile) {
    setInterval(() => {
      autoMovementX += autoMovementSpeed;
      if (autoMovementX > 10 || autoMovementX < -10) {
        autoMovementSpeed *= -1; // Cambiar dirección cuando alcanza el límite
      }
      updateLayers(0, 0, 0, 0); // Actualiza las capas con el movimiento automático
    }, 30); // Intervalo de tiempo en milisegundos
  }



export default parallax;
