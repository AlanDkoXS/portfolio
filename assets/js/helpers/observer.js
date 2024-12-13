// Crear el observer
const createObserver = () => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const target = entry.target;

          // Si la sección está visible
          if (entry.isIntersecting) {
            target.classList.add('visible'); // Hace visible la sección
          } else {
            target.classList.remove('visible'); // Oculta la sección cuando no está visible
          }
        });
      },
      {
        threshold: 0.2, // Umbral de visibilidad para considerar que la sección está "visible"
      }
    );

    return observer;
  };

  // Observar todas las secciones
  const observeSections = (observer) => {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
      observer.observe(section); // Comienza a observar cada sección
    });
  };

  // Función que inicializa el observer
  const initObserver = () => {
    const observer = createObserver();
    observeSections(observer);
  };

  // Exportar la función initObserver
  export default initObserver;
