const createObserver = () => {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        const target = entry.target;

        if (entry.isIntersecting) {
          target.classList.add('visible');
        } else {
          target.classList.remove('visible');
        }
      });
    },
    {
      threshold: 0.1,
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
