import translations from '/assets/js/languages/translations.js';

const updateSectionText = (selector, key, lang) => {
  const element = document.querySelector(selector);
  if (element && translations[key]) {
    element.textContent = translations[key][lang] || translations[key]['en'];
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
