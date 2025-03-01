import translations from '/assets/js/languages/translations.js';

// Función para detectar el idioma preferido del usuario
const detectUserLanguage = () => {
  const languages = navigator.languages || [navigator.language || navigator.userLanguage];

  // Convertir a array si no lo es
  const languageList = Array.isArray(languages) ? languages : [languages];

  // Buscar el primer idioma que coincida con español
  const isSpanishPreferred = languageList.some((lang) => {
    const langCode = lang.toLowerCase();
    return (
      langCode.startsWith('es') ||
      langCode.includes('419') || // América Latina
      langCode.includes('034') // España
    );
  });

  return isSpanishPreferred ? 'es' : 'en';
};

// Estado actual del idioma
let currentLanguage = detectUserLanguage();

// Exportar función para obtener mensajes de validación
export const getValidationMessages = () => translations.validation[currentLanguage];

// Función para actualizar textos en una sección específica
const updateSectionText = (selector, key, lang) => {
  const element = document.querySelector(selector);
  if (element && translations[key]) {
    element.textContent = translations[key][lang] || translations[key]['en'];
  }
};

// Función para actualizar etiquetas de habilidades
const updateSkillsTags = (selector, key, lang) => {
  const elements = document.querySelectorAll(selector);
  if (elements && translations[key]) {
    elements.forEach((tag, index) => {
      tag.textContent = translations[key][lang][index] || translations[key]['en'][index];
    });
  }
};

// Función para actualizar textos de proyectos
const updateProjectText = (lang) => {
  const titles = document.querySelectorAll('.project__title');
  const descriptions = document.querySelectorAll('.project__description');

  titles.forEach((title, index) => {
    const titleKey = `projectTitle${index + 1}`;
    const descriptionKey = `projectDescription${index + 1}`;

    if (title && descriptions[index]) {
      title.textContent = translations[titleKey][lang] || translations[titleKey]['en'];
      descriptions[index].textContent =
        translations[descriptionKey][lang] || translations[descriptionKey]['en'];
    }
  });
};

// Función para gestionar el contenido responsivo
const handleResponsiveContent = (lang) => {
  const homeDescription = document.querySelector('.home__description');
  const isDesktop = window.innerWidth >= 992;

  if (isDesktop && homeDescription) {
    // Obtener los textos según el idioma
    const homeText = translations.homeDescription[lang] || translations.homeDescription['en'];
    const aboutText = translations.aboutDescription[lang] || translations.aboutDescription['en'];

    // Combinar las descripciones
    homeDescription.innerHTML = `
      ${homeText}
      <br><br>
      ${aboutText}
    `;
  } else if (homeDescription) {
    // En móvil, solo mostrar el texto del home
    homeDescription.textContent =
      translations.homeDescription[lang] || translations.homeDescription['en'];
  }
};

// Función para aplicar los cambios de idioma
const applyLanguageChanges = (lang) => {
  currentLanguage = lang; // Actualizar el estado global del idioma

  const navLinks = [
    { selector: '.navbar__link[href="#home"]', key: 'navHome' },
    { selector: '.navbar__link[href="#about"]', key: 'navAbout' },
    { selector: '.navbar__link[href="#skills"]', key: 'navSkills' },
    { selector: '.navbar__link[href="#projects"]', key: 'navProjects' },
    { selector: '.navbar__link[href="#contact"]', key: 'navContact' },
  ];

  navLinks.forEach((link) => updateSectionText(link.selector, link.key, lang));

  // Home Section
  updateSectionText('.home__title', 'homeTitle', lang);
  // La descripción del home se maneja a través de handleResponsiveContent
  updateSectionText('.btn.btn--primary[href="#about"]', 'aboutButton', lang);
  updateSectionText('#resume-btn', 'resumeButton', lang);
  updateSectionText('.btn.btn--primary[href="#skills"]', 'skillsButton', lang);
  updateSectionText('.btn.btn--primary[href="#projects"]', 'projectButton', lang);

  // About Section
  updateSectionText('#about .section__title', 'aboutTitle', lang);
  updateSectionText('.about__description', 'aboutDescription', lang);

  // Skills Section
  updateSectionText('#skills .section__title', 'skillsTitle', lang);
  updateSectionText('.skills__description', 'skillsDescription', lang);
  updateSectionText('.skills__tags-title', 'skillsTagsTitle', lang);
  updateSkillsTags('.skills__tag', 'skillsTags', lang);
  updateSectionText('.skills__title', 'skillsDesignTools', lang);
  updateSectionText('.skills__frontend-tools-title', 'skillsFrontendTools', lang);
  updateSectionText('.skills__backend-tools-title', 'skillsBackendTools', lang);
  updateSectionText('.skills__development-tools-title', 'skillsDevelopmentTools', lang);

  // Project Section
  updateSectionText('#projects .section__title', 'projectsTitle', lang);
  updateSectionText('.project__subtitle', 'projectSubtitle', lang);
  updateProjectText(lang);

  // Contact Section
  updateSectionText('#contact .section__title', 'contactTitle', lang);
  updateSectionText('.contact__info-title', 'contactInfoTitle', lang);
  updateSectionText('.contact__info-description', 'contactInfoDescription', lang);
  updateSectionText('.contact__form-title', 'contactFormTitle', lang);

  // Form Labels
  const formElements = {
    name: document.querySelector('.contact__form-label[for="name"]'),
    email: document.querySelector('.contact__form-label[for="email"]'),
    subject: document.querySelector('.contact__form-label[for="subject"]'),
    message: document.querySelector('.contact__form-label[for="message"]'),
  };

  Object.entries(formElements).forEach(([key, element]) => {
    if (element && translations.contactForm[lang][key]) {
      element.textContent = translations.contactForm[lang][key];
    }
  });

  // Submit Button
  const submitButton = document.querySelector('.contact__form-button');
  if (submitButton) {
    submitButton.innerHTML = `<strong>${translations.contactForm[lang].send}</strong>`;
  }

  // Manejar el contenido responsivo
  handleResponsiveContent(lang);

  // Language Change Event
  window.dispatchEvent(
    new CustomEvent('languageChange', {
      detail: {
        language: lang,
        validationMessages: translations.validation[lang],
      },
    }),
  );

  // Modal Updates
  const modalText = document.querySelector('#modal .modal-content p');
  if (modalText) {
    modalText.textContent = translations.contactForm[lang].formSuccess;
  }

  const closeButton = document.querySelector('#btn_close-modal strong');
  if (closeButton) {
    closeButton.textContent = translations.contactForm[lang].close;
  }

  // Footer Section
  updateSectionText('.footer__description', 'footerDescription', lang);
  updateSectionText('.footer__copyright', 'footerCopyright', lang);
};

// Función principal para alternar idiomas
const switchLanguages = () => {
  const languageToggle = document.getElementById('language-toggle');
  if (!languageToggle) return; // Evitar errores si el toggle no existe

  // Establecer el idioma inicial basado en la preferencia del usuario
  const initialLang = detectUserLanguage();
  languageToggle.checked = initialLang === 'es';

  // Aplicar el idioma detectado al cargar la página
  applyLanguageChanges(initialLang);

  // Escuchar el evento de cambio del toggle
  languageToggle.addEventListener('change', function () {
    const lang = this.checked ? 'es' : 'en';
    applyLanguageChanges(lang);
  });

  // Añadir listener para cambios de tamaño de ventana
  window.addEventListener('resize', () => {
    handleResponsiveContent(currentLanguage);
  });
};

export default switchLanguages;
