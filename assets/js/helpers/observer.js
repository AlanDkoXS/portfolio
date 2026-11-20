// Carga diferida (lazy loading) de imágenes marcadas con data-src /
// data-background dentro de las secciones. Las carátulas de proyectos las
// define el CSS (para cambiar según el modo claro/oscuro); aquí solo se marca
// la sección con .is-near al acercarse, y el CSS las pide a partir de ahí.
// La aparición visual de las secciones ya no depende de JS: es CSS
// (scroll-driven animations en _section.css), así el contenido se ve aunque
// este script no corra.

const createObserver = () => {
  // Configuración mejorada del Intersection Observer
  const observerOptions = {
    // En cuanto cualquier parte de la sección entra en el margen: con un
    // porcentaje, en secciones altas cargaría tarde
    threshold: 0,
    // Margen para empezar a cargar antes de que la sección llegue a la pantalla
    rootMargin: '400px 0px',
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      const target = entry.target;

      if (entry.isIntersecting) {
        // Señal para el CSS (carátulas de #projects)
        target.classList.add('is-near');

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

        // Ya cargó lo que tenía pendiente
        observer.unobserve(target);
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

// Función mejorada para inicializar el observador
const initObserver = () => {
  const observer = createObserver();
  observeSections(observer);

  // Utilizar el mismo observador para elementos fuera de las secciones
  const standaloneElements = document.querySelectorAll('[data-lazy-load]');
  standaloneElements.forEach((element) => {
    observer.observe(element);
  });

  return observer; // Devolvemos el observador para posible uso futuro
};

export default initObserver;
