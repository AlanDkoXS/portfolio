import { createTilt } from './tilt.js';

function profileParallax() {
  const container = document.querySelector('.home__image');
  const background = document.querySelector('.home__image--background');
  const sprite = document.querySelector('.home__image--sprite');

  if (!container || !background || !sprite) return;

  function moveLayers(moveX, moveY) {
    background.style.transform = `translate(${moveX * 0.3}px, ${moveY * -0.3}px)`;
    sprite.style.transform = `translate(${moveX * 0.1}px, ${moveY * -0.1}px)`;
  }

  // Desktop: follow the mouse over the picture
  container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const moveX = (x / rect.width) * 100 - 50;
    const moveY = (y / rect.height) * 100 - 50;
    moveLayers(moveX, moveY);
  });

  container.addEventListener('mouseleave', () => moveLayers(0, 0));

  // Touch devices: follow the phone tilt, relative and auto-recentering
  if (window.matchMedia('(pointer: coarse)').matches) {
    const tilt = createTilt();
    const tick = (now) => {
      const { gamma, beta } = tilt.update(now);
      moveLayers(gamma, -beta);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

export default profileParallax;
