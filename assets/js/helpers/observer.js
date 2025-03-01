// Mejora del observer.js para implementar lazy loading de secciones

const createObserver = () => {
  // Configuración mejorada del Intersection Observer
  const observerOptions = {
    // Umbral más bajo para comenzar a cargar contenido antes de que sea completamente visible
    threshold: 0.1,
    // Margen para comenzar a observar antes de que el elemento entre en viewport
    rootMargin: '200px 0px',
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      const target = entry.target;

      if (entry.isIntersecting) {
        // Añadir clase para mostrar la sección cuando está visible
        target.classList.add('visible');

        // Cargar imágenes dentro de la sección si tienen data-src
        const lazyImages = target.querySelectorAll('img[data-src]');
        lazyImages.forEach((img) => {
          // Reemplazar src con data-src
          img.src = img.dataset.src;
          // Opcional: también actualizar srcset si existe
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          // Eliminar los atributos data- una vez cargados
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
        });

        // Cargar background images diferidos
        const lazyBackgrounds = target.querySelectorAll('[data-background]');
        lazyBackgrounds.forEach((element) => {
          element.style.backgroundImage = `url('${element.dataset.background}')`;
          element.removeAttribute('data-background');
        });

        // Dejar de observar elementos que ya han sido procesados si no necesitan animaciones constantes
        if (target.dataset.observeOnce === 'true') {
          observer.unobserve(target);
        }
      } else {
        // Si la sección no está intersectando, quitamos la clase
        // Esto es opcional y depende del diseño - puede ayudar a reducir carga de renderizado
        if (!target.hasAttribute('data-keep-visible')) {
          target.classList.remove('visible');
        }
      }
    });
  }, observerOptions);

  return observer;
};

const observeSections = (observer) => {
  // Seleccionamos tanto secciones como otros elementos que quieran ser observados
  const sections = document.querySelectorAll('.section, [data-observe]');
  sections.forEach((section) => {
    observer.observe(section);
  });
};

// Optimización para el carrusel de proyectos - carga diferida de imágenes de proyecto
const initProjectImagesLazyLoad = () => {
  const projectCards = document.querySelectorAll('.project__card');

  // Modificar el HTML para usar data-background en lugar de background-image directamente
  projectCards.forEach((card, index) => {
    const imageContainer = card.querySelector('.project__image--container');
    if (imageContainer) {
      // Eliminar el estilo inline si existe
      imageContainer.style.backgroundImage = '';

      // Añadir el data-attribute con la ruta correcta
      const projectNumber = index + 1;
      const imagePath = `/assets/img/project_img/${getProjectImageName(projectNumber)}.webp`;
      imageContainer.setAttribute('data-background', imagePath);
    }
  });
};

// Función helper para determinar el nombre de la imagen según el índice
function getProjectImageName(index) {
  const imageNames = ['marvel', 'CRUD', 'rick', 'weather', 'cookie'];
  return imageNames[index - 1] || 'default';
}

// Función mejorada para inicializar el observador
const initObserver = () => {
  const observer = createObserver();
  observeSections(observer);
  initProjectImagesLazyLoad();

  // Utilizar el mismo observador para elementos fuera de las secciones
  const standaloneElements = document.querySelectorAll('[data-lazy-load]');
  standaloneElements.forEach((element) => {
    observer.observe(element);
  });

  return observer; // Devolvemos el observador para posible uso futuro
};

export default initObserver;
