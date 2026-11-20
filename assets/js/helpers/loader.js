const loaderContainer = document.querySelector('.loader');
const spriteImage = document.querySelector('.home__image');

// Never keep the visitor waiting longer than this, even if some asset hangs.
const MAX_WAIT_MS = 3000;

function loader() {
  let done = false;

  const hide = () => {
    if (done) return;
    done = true;

    if (loaderContainer) {
      loaderContainer.classList.add('loader--hidden');
    }

    setTimeout(() => {
      if (spriteImage) {
        spriteImage.classList.add('animate');
      }
    }, 500);
  };

  // main.js awaits external scripts before calling this, so `load`
  // may already have fired; in that case hide right away.
  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
    setTimeout(hide, MAX_WAIT_MS);
  }
}

export default loader;
