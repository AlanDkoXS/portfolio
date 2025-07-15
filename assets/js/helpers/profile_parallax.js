function profileParallax() {
  const container = document.querySelector('.home__image');
  const background = document.querySelector('.home__image--background');
  const sprite = document.querySelector('.home__image--sprite');

  if (!container || !background || !sprite) {
    console.warn('Parallax elements not found - functionality disabled');
    return;
  }

  function moveLayers(moveX, moveY) {
    background.style.transform = `translate(${moveX * 0.3}px, ${moveY * -0.3}px)`;
    sprite.style.transform = `translate(${moveX * 0.1}px, ${moveY * -0.1}px)`;
  }

  container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const moveX = (x / rect.width) * 100 - 50;
    const moveY = (y / rect.height) * 100 - 50;
    moveLayers(moveX, moveY);
  });

  window.addEventListener('deviceorientation', (event) => {
    if (event.gamma === null || event.beta === null) {
      console.log('This device does not support tilt');
      return;
    }
    const moveX = event.gamma * 1;
    const moveY = -event.beta * 1;
    moveLayers(moveX, moveY);
  });

  container.addEventListener('mouseleave', () => {
    background.style.transform = 'translate(0, 0)';
    sprite.style.transform = 'translate(0, 0)';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  profileParallax();
});

export default profileParallax;
