const loaderContainer = document.querySelector('.loader');
const spriteImage = document.querySelector('.home__sprite'); // Selecciona la imagen del sprite

function loader() {
  window.addEventListener('load', () => {
    loaderContainer.classList.add('loader--hidden'); // Oculta el loader

    // Después de que el loader se oculta, activamos la animación de la imagen
    setTimeout(() => {
      spriteImage.classList.add('animate'); // Inicia la animación
    }, 500); // Le damos un pequeño retraso para asegurar que el loader se haya ocultado
  });
}

export default loader;
