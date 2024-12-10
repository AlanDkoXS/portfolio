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
    en: 'Self-taught graphic designer with over 3 years of experience in digital illustration, branding, and photography. I specialize in creating impactful visual designs with a mobile-first approach. Currently, I am updating my knowledge on Full Stack Web Development and have acquired skills in HTML, CSS, JavaScript, React, and Node.js.',
    es: 'Diseñador gráfico autodidacta con más de 3 años de experiencia en ilustración digital, branding y fotografía. Me especializo en crear diseños visuales impactantes con un enfoque en el diseño mobile-first. Estoy actualizando mis conocimientos sobre Desarrollo Web Full Stack y he adquirido habilidades en HTML, CSS, JavaScript, React y Node.js.',
  },

  skillsTitle: {
    en: 'Skills',
    es: 'Habilidades',
  },
  skillsDescription: {
    en: 'I have a diverse skill set in graphic design, web development, and project management. Proficient in Adobe Creative Suite (Photoshop, Illustrator, After Effects) and Figma, I create engaging visuals. My web development knowledge includes HTML, CSS, JavaScript, and React, enabling me to build interactive user interfaces. I also have strong interpersonal skills, such as effective communication and creativity, which enhance my collaboration in team environments.',
    es: 'Tengo un conjunto diverso de habilidades en diseño gráfico, desarrollo web y gestión de proyectos. Soy competente en Adobe Creative Suite (Photoshop, Illustrator, After Effects) y Figma, creando visuales atractivos. Mi conocimiento en desarrollo web incluye HTML, CSS, JavaScript y React, lo que me permite construir interfaces de usuario interactivas. También tengo fuertes habilidades interpersonales, como comunicación efectiva y creatividad, que mejoran mi colaboración en entornos de equipo.',
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
    es: 'Illustraciones',
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
    en: 'ComingSoon',
    es: 'Proximamente',
  },

  contactTitle: {
    en: 'Contact',
    es: 'Contacto',
  },
  contactFormTitle: {
    en: 'Send Message',
    es: 'Enviar Mensaje',
  },
  nameLabel: {
    en: 'Name',
    es: 'Nombre',
  },
  emailLabel: {
    en: 'Email',
    es: 'Correo Electrónico',
  },
  subjectLabel: {
    en: 'Subject',
    es: 'Asunto',
  },
  messageLabel: {
    en: 'Text',
    es: 'Texto',
  },
  submitSuccessMessage: {
    en: 'Form submitted successfully!',
    es: '¡Formulario enviado con éxito!',
  },
  closeButton: {
    en: 'Close',
    es: 'Cerrar',
  },
  sendButton: {
    en: 'Send',
    es: 'Enviar',
  },
  footerDescription: {
    en: 'Made with ❤️. Thanks to my tutor Alejandra Olazagasti',
    es: 'Hecho con ❤️. Gracias a mi tutora Alejandra Olazagasti',
  },
  footerCopyright: {
    en: 'All rights reserved',
    es: 'Todos los derechos reservados',
  },
};

const setTextContent = (selector, key, lang) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = translations[key][lang];
  }
};

const setTextContentForMultipleElements = (selectors, key, lang) => {
  selectors.forEach((selector) => setTextContent(selector, key, lang));
};

const setSkillsTags = (lang) => {
  const skillsTags = document.querySelectorAll('.skills__tag');
  skillsTags.forEach((tag, index) => {
    tag.textContent = translations.skillsTags[lang][index];
  });
};

const switchLanguages = () => {
  const languageToggle = document.getElementById('language-toggle');

  languageToggle.addEventListener('change', function () {
    const lang = this.checked ? 'es' : 'en';

    // Navbar
    setTextContentForMultipleElements(
      [
        '.navbar__link[href="#home"]',
        '.navbar__link[href="#about"]',
        '.navbar__link[href="#skills"]',
        '.navbar__link[href="#portfolio"]',
        '.navbar__link[href="#projects"]',
        '.navbar__link[href="#contact"]',
      ],
      'navHome',
      lang
    );

    // Home Section
    setTextContent('.home__title', 'homeTitle', lang);
    setTextContent('.home__description', 'homeDescription', lang);

    // Buttons
    setTextContent('.btn.btn--primary[href="#about"]', 'aboutButton', lang);
    setTextContent(
      '.btn.btn--primary[href="assets/resume.pdf"]',
      'resumeButton',
      lang
    );
    setTextContent(
      '.btn.btn--primary[href="#portfolio"]',
      'portfolioButton',
      lang
    );
    setTextContent(
      '.btn.btn--primary[href="#projects"]',
      'projectButton',
      lang
    );

    // About Section
    setTextContent('#about .section__title', 'aboutTitle', lang);
    setTextContent('.about__description', 'aboutDescription', lang);

    // Skills Section
    setTextContent('#skills .section__title', 'skillsTitle', lang);
    setTextContent('.skills__tags-title', 'skillsTagsTitle', lang);
    setSkillsTags(lang);

    // Portfolio Section
    setTextContent('.portfolio__title', 'portfolioTitle', lang);
    setTextContent('.designs__title', 'designsTitle', lang);
    setTextContent('#projects .section__title', 'projectsTitle', lang);
    setTextContent('.projects__name', 'projectsName', lang);
    setTextContent('.projects__description', 'projectsDescription', lang);

    // Contact Section
    setTextContent('#contact .section__title', 'contactTitle', lang);
    setTextContent('.contact__form-title', 'contactFormTitle', lang);
    setTextContent('.contact__form-label[for="name"]', 'nameLabel', lang);
    setTextContent('.contact__form-label[for="email"]', 'emailLabel', lang);
    setTextContent('.contact__form-label[for="subject"]', 'subjectLabel', lang);
    setTextContent('.contact__form-label[for="message"]', 'messageLabel', lang);
    setTextContent('.contact__form-button', 'sendButton', lang);
    setTextContent('#modal', 'submitSuccessMessage', lang);
    setTextContent('#btn_close-modal', 'closeButton', lang);

    // Footer Section
    setTextContent('.footer__description', 'footerDescription', lang);
    const currentYear = new Date().getFullYear();
    setTextContent('.footer__copyright', 'footerCopyright', lang);
    document.querySelector('.footer__copyright').textContent =
      `© ${currentYear}, ${translations.footerCopyright[lang]}`;
  });
};

export default switchLanguages;
