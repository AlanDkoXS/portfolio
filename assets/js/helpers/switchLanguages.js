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
      es: ['Responsable', 'Trabajo en Equipo', 'Creativo', 'Autodidacta', 'Proactivo'],
    },
    portfolioTitle: {
      en: 'Portfolio',
      es: 'Portafolio',
    },
    contactTitle: {
      en: 'Contact',
      es: 'Contacto',
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

  // Función para actualizar texto de una sección
  const updateSectionText = (selector, key, lang) => {
    const element = document.querySelector(selector);
    if (element && translations[key]) {
      element.textContent = translations[key][lang] || translations[key]['en']; // Fallback a inglés
    }
  };

  // Función para actualizar etiquetas dinámicas
  const updateSkillsTags = (selector, key, lang) => {
    const elements = document.querySelectorAll(selector);
    if (elements && translations[key]) {
      elements.forEach((tag, index) => {
        tag.textContent = translations[key][lang][index] || translations[key]['en'][index];
      });
    }
  };

  // Función principal para manejar el cambio de idioma
  const switchLanguages = () => {
    const languageToggle = document.getElementById('language-toggle');

    languageToggle.addEventListener('change', function () {
      const lang = this.checked ? 'es' : 'en';

      // Navbar
      const navLinks = [
        { selector: '.navbar__link[href="#home"]', key: 'navHome' },
        { selector: '.navbar__link[href="#about"]', key: 'navAbout' },
        { selector: '.navbar__link[href="#skills"]', key: 'navSkills' },
        { selector: '.navbar__link[href="#portfolio"]', key: 'navPortfolio' },
        { selector: '.navbar__link[href="#projects"]', key: 'navProjects' },
        { selector: '.navbar__link[href="#contact"]', key: 'navContact' },
      ];
      navLinks.forEach(link => updateSectionText(link.selector, link.key, lang));

      // Home Section
      updateSectionText('.home__title', 'homeTitle', lang);
      updateSectionText('.home__description', 'homeDescription', lang);
      updateSectionText('.btn.btn--primary[href="#about"]', 'aboutButton', lang);
      updateSectionText('.btn.btn--primary[href="/assets/html/resume.html"]', 'resumeButton', lang);

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

      // Contact Section
      updateSectionText('#contact .section__title', 'contactTitle', lang);

      // Footer Section
      updateSectionText('.footer__description', 'footerDescription', lang);
      const currentYear = new Date().getFullYear();
      document.querySelector('.footer__copyright').textContent = `© ${currentYear}, ${translations.footerCopyright[lang]}`;
    });
  };

  export default switchLanguages;
