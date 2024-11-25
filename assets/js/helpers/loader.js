const loaderContainer = document.querySelector('.loader');
const spriteImage = document.querySelector('.home__sprite');

function loader() {
  window.addEventListener('load', () => {
    loaderContainer.classList.add('loader--hidden');

    setTimeout(() => {
      spriteImage.classList.add('animate');
    }, 500);
  });
}

export default loader;
