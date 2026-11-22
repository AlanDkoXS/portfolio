import { prefersReducedMotion } from './motion.js';
import { isCoarsePointer } from './viewport.js';

function profileParallax() {
  const container = document.querySelector('.home__image');
  const background = document.querySelector('.home__image--background');
  const sprite = document.querySelector('.home__image--sprite');

  if (!container || !background || !sprite) return;
  if (prefersReducedMotion()) return;

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

  // Touch devices: follow the phone tilt, relative and auto-recentering.
  // Only while the portrait is on screen: off it, the shared tilt loop skips it.
  // tilt.js is only downloaded on touch devices.
  if (isCoarsePointer()) {
    import('./tilt.js')
      .then(({ subscribeTilt }) => {
        const tilt = subscribeTilt(({ gamma, beta }) => moveLayers(gamma * 0.6, -beta * 0.6), { active: false }); // subtler than with the mouse
        new IntersectionObserver(([entry]) => tilt.setActive(entry.isIntersecting)).observe(container);
      })
      .catch((error) => console.error('Error in profileParallax:', error));
  }
}

export { profileParallax };
