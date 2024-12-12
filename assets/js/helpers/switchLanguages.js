const translations = {
  navHome: {
    en: 'Home',
    es: 'Inicio',
  },
  navAbout: {
    en: 'About me',
    es: 'Sobre mí',
  },
  navSkills: {
    en: 'Skills',
    es: 'Habilidades',
  },
  navPortfolio: {
    en: 'Portfolio',
    es: 'Portafolio',
  },
  navProjects: {
    en: 'Projects',
    es: 'Proyectos',
  },
  navContact: {
    en: 'Contact',
    es: 'Contacto',
  },
  homeTitle: {
    en: 'Hi there!',
    es: '¡Hola!',
  },
  homeDescription: {
    en: "I'm Alan, a full stack designer, passionate about design, technology, and development.",
    es: 'Soy Alan, diseñador full stack, apasionado por el diseño, la tecnología y el desarrollo.',
  },
  aboutButton: {
    en: 'About me',
    es: 'Acerca de mí',
  },
  resumeButton: {
    en: 'Resume',
    es: 'CV',
  },
  portfolioButton: {
    en: 'Portfolio',
    es: 'Portafolio',
  },
  projectButton: {
    en: 'Projects',
    es: 'Proyectos',
  },
  aboutTitle: {
    en: 'About me',
    es: 'Sobre mí',
  },
  aboutDescription: {
    en: 'I can help you develop modern, responsive, and functional web applications tailored to your business needs. My approach combines visually appealing design with a seamless user experience, ensuring that the applications are not only aesthetically pleasing but also intuitive and easy to use.',
    es: 'Puedo ayudarte a desarrollar aplicaciones web modernas, responsivas y funcionales, adaptadas a las necesidades de tu negocio. Mi enfoque combina un diseño visualmente atractivo con una experiencia de usuario fluida, asegurando que las aplicaciones no solo sean estéticamente agradables, sino también intuitivas y fáciles de usar.',
  },
  skillsTitle: {
    en: 'Skills',
    es: 'Habilidades',
  },
  skillsDescription: {
    en: 'Leveraging technologies like HTML, CSS, JavaScript, React, and Node.js, I build scalable and efficient solutions, from interactive interfaces to complete backend systems. My goal is to create digital tools that streamline processes, enhance user engagement, and add value to your business.',
    es: 'Aprovechando tecnologías como HTML, CSS, JavaScript, React y Node.js, creo soluciones escalables y eficientes, desde interfaces interactivas hasta sistemas backend completos. Mi objetivo es crear herramientas digitales que optimicen procesos, mejoren la interacción con los usuarios y aporten valor a tu negocio.',
  },
  skillsTagsTitle: {
    en: 'Soft Skills',
    es: 'Habilidades Blandas',
  },
  skillsTags: {
    en: ['Responsible', 'Teamwork', 'Creative', 'Autodidact', 'Proactive'],
    es: [
      'Responsable',
      'Trabajo en Equipo',
      'Creativo',
      'Autodidacta',
      'Proactivo',
    ],
  },
  portfolioTitle: {
    en: 'Portfolio',
    es: 'Portafolio',
  },
  designsTitle: {
    en: 'My Designs',
    es: 'Mis Diseños',
  },
  projectsTitle: {
    en: 'Projects',
    es: 'Proyectos',
  },
  projectsName: {
    en: 'Projects',
    es: 'Proyectos',
  },
  projectsDescription: {
    en: 'Coming Soon',
    es: 'Próximamente',
  },
  contactTitle: {
    en: 'Contact',
    es: 'Contacto',
  },
  contactInfoTitle: {
    en: 'Contact Info',
    es: 'Información de Contacto',
  },
  contactInfoDescription: {
    en: 'Say Hello',
    es: 'Dí Hola',
  },
  contactFormTitle: {
    en: 'Send Message',
    es: 'Enviar Mensaje',
  },
  contactFormName: {
    en: 'Name',
    es: 'Nombre',
  },
  contactFormMail: {
    en: 'Email',
    es: 'Correo',
  },
  contactFormSubject: {
    en: 'Subject',
    es: 'Asunto',
  },
  contactFormMessage: {
    en: 'Message',
    es: 'Mensaje',
  },
  footerDescription: {
    en: 'Made with ❤️. Thanks to my tutor Alejandra Olazagasti',
    es: 'Hecho con ❤️. Gracias a mi tutora Alejandra Olazagasti',
  },
  contactFormButton: {
    en: 'Send',
    es: 'Enviar',
  },
  footerCopyright: {
    en: 'All rights reserved',
    es: 'Todos los derechos reservados',
  },
};

const updateSectionText = (selector, key, lang) => {
  const element = document.querySelector(selector);
  if (element && translations[key]) {
    element.textContent = translations[key][lang] || translations[key]['en']; // Fallback a inglés
  }
};

const updateSkillsTags = (selector, key, lang) => {
  const elements = document.querySelectorAll(selector);
  if (elements && translations[key]) {
    elements.forEach((tag, index) => {
      tag.textContent =
        translations[key][lang][index] || translations[key]['en'][index];
    });
  }
};

const switchLanguages = () => {
  const languageToggle = document.getElementById('language-toggle');

  languageToggle.addEventListener('change', function () {
    const lang = this.checked ? 'es' : 'en';

    const navLinks = [
      { selector: '.navbar__link[href="#home"]', key: 'navHome' },
      { selector: '.navbar__link[href="#about"]', key: 'navAbout' },
      { selector: '.navbar__link[href="#skills"]', key: 'navSkills' },
      { selector: '.navbar__link[href="#portfolio"]', key: 'navPortfolio' },
      { selector: '.navbar__link[href="#projects"]', key: 'navProjects' },
      { selector: '.navbar__link[href="#contact"]', key: 'navContact' },
    ];
    navLinks.forEach((link) =>
      updateSectionText(link.selector, link.key, lang)
    );

    updateSectionText('.home__title', 'homeTitle', lang);
    updateSectionText('.home__description', 'homeDescription', lang);
    updateSectionText('.btn.btn--primary[href="#about"]', 'aboutButton', lang);
    updateSectionText(
      '.btn.btn--primary[href="/assets/html/resume.html"]',
      'resumeButton',
      lang
    );
    updateSectionText(
      '.btn.btn--primary[href="#portfolio"]',
      'portfolioButton',
      lang
    );
    updateSectionText(
      '.btn.btn--primary[href="#projects"]',
      'projectButton',
      lang
    );

    // About Section
    updateSectionText('#about .section__title', 'aboutTitle', lang);
    updateSectionText('.about__description', 'aboutDescription', lang);

    // Skills Section
    updateSectionText('#skills .section__title', 'skillsTitle', lang);
    updateSectionText('.skills__description', 'skillsDescription', lang);
    updateSectionText('.skills__tags-title', 'skillsTagsTitle', lang);
    updateSkillsTags('.skills__tag', 'skillsTags', lang);

    // Portfolio Section
    updateSectionText('.portfolio__title', 'portfolioTitle', lang);
    updateSectionText('.designs__title', 'designsTitle', lang);

    // Project Section
    updateSectionText('#projects .section__title', 'projectsTitle', lang);
    updateSectionText('.projects__name', 'projectsName', lang);
    updateSectionText('.projects__description', 'projectsDescription', lang);

    // Contact Section
    updateSectionText('#contact .section__title', 'contactTitle', lang);
    updateSectionText('.contact__info-title', 'contactInfoTitle', lang);
    updateSectionText(
      '.contact__info-description',
      'contactInfoDescription',
      lang
    );
    updateSectionText('.contact__form-title', 'contactFormTitle', lang);
    updateSectionText(
      '.contact__form-label[for="name"]',
      'contactFormName',
      lang
    );
    updateSectionText(
      '.contact__form-label[for="email"]',
      'contactFormEmail',
      lang
    );
    updateSectionText(
      '.contact__form-label[for="subject"]',
      'contactFormSubject',
      lang
    );
    updateSectionText(
      '.contact__form-label[for="message"]',
      'contactFormMessage',
      lang
    );
    updateSectionText('.contact__form-button', 'contactFormButton', lang);

    // Footer Section
    updateSectionText('.footer__description', 'footerDescription', lang);
    updateSectionText('.footer__copyright', 'footerCopyright', lang);
  });
};

export default switchLanguages;
