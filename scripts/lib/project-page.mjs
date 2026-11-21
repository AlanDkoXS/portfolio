// HTML of a project case-study page. Used by scripts/build-i18n.mjs, which
// then runs the result through the same i18n render as the home page (so the
// shared header/footer get their texts) and writes:
//   en → /projects/<slug>/index.html
//   es → /es/proyectos/<slug>/index.html

export const SITE = 'https://alanquintana.pro';

export const homePath = (lang) => (lang === 'en' ? '/' : '/es/');
export const projectPath = (project, lang) =>
  lang === 'en' ? `/projects/${project.slug}/` : `/es/proyectos/${project.slug}/`;

const UI = {
  en: {
    home: 'Home',
    projects: 'Projects',
    back: 'Back to projects',
    demo: 'See the live demo',
    code: 'Check out the code',
    screenshots: 'Screenshots',
    desktop: 'Desktop',
    mobile: 'Mobile',
    overview: 'Overview',
    features: 'Features',
    built: 'How it’s built',
    stack: 'Technologies',
    pager: 'More projects',
    prev: 'Previous project',
    next: 'Next project',
    ctaTitle: 'Have a project in mind?',
    ctaText: 'I design and build web applications that look good and are easy to use. Let’s talk about yours.',
    ctaButton: 'Write to me',
    by: 'by Alan Quintana',
    descriptionWith: (p) => `${p.en.tagline} ${p.en.kind} by Alan Quintana, built with ${p.stack.slice(0, 3).join(', ')}.`,
    alt: (p, kind) => `${p.en.title} on ${kind === 'desktop' ? 'desktop' : 'mobile'}`,
    dark: ' (dark mode)',
  },
  es: {
    home: 'Inicio',
    projects: 'Proyectos',
    back: 'Volver a proyectos',
    demo: 'Mira la demo en vivo',
    code: 'Revisa el código',
    screenshots: 'Capturas',
    desktop: 'Escritorio',
    mobile: 'Móvil',
    overview: 'Resumen',
    features: 'Funcionalidades',
    built: 'Cómo está hecho',
    stack: 'Tecnologías',
    pager: 'Más proyectos',
    prev: 'Proyecto anterior',
    next: 'Proyecto siguiente',
    ctaTitle: '¿Tienes un proyecto en mente?',
    ctaText: 'Diseño y desarrollo aplicaciones web que se ven bien y son fáciles de usar. Platiquemos del tuyo.',
    ctaButton: 'Escríbeme',
    by: 'de Alan Quintana',
    descriptionWith: (p) => `${p.es.tagline} ${p.es.kind} de Alan Quintana, hecha con ${p.stack.slice(0, 3).join(', ')}.`,
    alt: (p, kind) => `${p.es.title} en ${kind === 'desktop' ? 'escritorio' : 'móvil'}`,
    dark: ' (modo oscuro)',
  },
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const indent = (html, n) =>
  html
    .split('\n')
    .map((l) => (l ? ' '.repeat(n) + l : l))
    .join('\n');

// Header of the home page adapted to a subpage: section links point to the home.
export function adaptHeader(header, lang) {
  const home = homePath(lang);
  return header
    .replace('class="navbar__logo flex--container" href="#"', `class="navbar__logo flex--container" href="${home}"`)
    .replace(/class="navbar__link( active)?" href="#(\w+)"/g, (_m, _a, id) =>
      `class="navbar__link" href="${home}${id === 'home' ? '' : `#${id}`}"`,
    );
}

function screenshots(p, lang, ui) {
  const img = (kind, dark, attrs) => {
    // móvil: captura de teléfono completa (390×844), no la 4:5 de las tarjetas del home
    const dir = kind === 'desktop' ? 'desktop/' : 'mobile/';
    const [w, h] = kind === 'desktop' ? [1280, 800] : [390, 844];
    const file = `${p.image}${dark ? '-dark' : ''}.webp`;
    return `<img class="${dark ? 'if-dark' : 'if-light'}" src="/assets/img/project_img/${dir}${file}" alt="${esc(ui.alt(p, kind) + (dark ? ui.dark : ''))}" width="${w}" height="${h}" ${attrs} />`;
  };
  const figure = (kind) => {
    const first = kind === 'desktop' ? 'fetchpriority="high"' : 'loading="lazy"';
    const imgs = [img(kind, false, first)];
    if (p.dark) imgs.push(img(kind, true, 'loading="lazy"'));
    return `<figure class="project-media__${kind}${p.dark ? ' has-dark' : ''}">
  <span class="project-media__frame">
    ${imgs.join('\n    ')}
  </span>
  <figcaption>${ui[kind]}</figcaption>
</figure>`;
  };
  return `<div class="project-media grid--container" role="group" aria-label="${ui.screenshots}">
${indent(figure('desktop'), 2)}
${indent(figure('mobile'), 2)}
</div>`;
}

function jsonLd(p, lang, ui) {
  const c = p[lang];
  const pageUrl = SITE + projectPath(p, lang);
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: c.title,
        description: c.tagline,
        url: p.demo,
        mainEntityOfPage: pageUrl,
        image: `${SITE}/assets/img/project_img/og/${p.image}.jpg`,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web',
        dateCreated: String(p.year),
        inLanguage: lang,
        author: { '@type': 'Person', name: 'Alan Quintana', url: SITE + homePath(lang) },
        sameAs: [p.repo],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: ui.home, item: SITE + homePath(lang) },
          { '@type': 'ListItem', position: 2, name: ui.projects, item: `${SITE}${homePath(lang)}#projects` },
          { '@type': 'ListItem', position: 3, name: c.title, item: pageUrl },
        ],
      },
    ],
  };
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

export function projectPage({ project: p, lang, prev, next, header, footer }) {
  const ui = UI[lang];
  const c = p[lang];
  const home = homePath(lang);
  const url = SITE + projectPath(p, lang);
  const urlEn = SITE + projectPath(p, 'en');
  const urlEs = SITE + projectPath(p, 'es');
  const title = `${c.title} · ${c.kind} | Alan Quintana`;
  // Google corta ~160 caracteres: la frase de tecnologías solo si cabe
  const full = ui.descriptionWith(p);
  const description = full.length <= 160 ? full : c.tagline;
  const ogImage = `${SITE}/assets/img/project_img/og/${p.image}.jpg`;
  // Botón solo con "Proyecto anterior/siguiente"; el nombre del proyecto va
  // debajo en texto pequeño (y el lector de pantalla lo lee como descripción)
  const pagerLink = (q, rel) =>
    `<div class="project-pager__item project-pager__item--${rel}">
  <a class="btn btn--ghost project-pager__link" href="${projectPath(q, lang)}" rel="${rel}" aria-describedby="pager-${rel}">${rel === 'prev' ? '<i class="bx bx-chevron-left" aria-hidden="true"></i> ' + ui.prev : ui.next + ' <i class="bx bx-chevron-right" aria-hidden="true"></i>'}</a>
  <p class="project-pager__title" id="pager-${rel}">${esc(q[lang].title)}</p>
</div>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Respeta el tamaño de texto del sistema: Android/Chrome lo aplica al tamaño
         base (rem) en vez de hacer zoom a toda la página -->
    <meta name="text-scale" content="scale" />
    <!-- Tema: oscuro si el sistema está en modo oscuro; si no, por horario (oscuro de
         18:00 a 6:00, hora local). El botón guarda una excepción hasta el siguiente
         cambio (localStorage.theme / themeUntil).
         Se aplica antes de pintar; sin JS se sigue al sistema. -->
    <meta name="color-scheme" content="light dark" />
    <script>
      {
        const h = new Date().getHours();
        let t = matchMedia('(prefers-color-scheme: dark)').matches || h >= 18 || h < 6 ? 'dark' : 'light';
        try {
          const o = localStorage.getItem('theme');
          if ((o === 'light' || o === 'dark') && Date.now() < Number(localStorage.getItem('themeUntil'))) t = o;
        } catch {}
        document.querySelector('meta[name="color-scheme"]').content = t;
      }
    </script>${
      lang === 'en'
        ? `
    <script>
      // Igual que el home: navegador en español (sin elección guardada en
      // localStorage "lang") → versión en español de este proyecto
      try {
        const pref = localStorage.getItem('lang');
        const langs = navigator.languages || [navigator.language || ''];
        const wantsEs = pref ? pref === 'es' : langs.some((l) => /^es\\b/i.test(l));
        if (wantsEs) location.replace('${projectPath(p, 'es')}' + location.hash);
      } catch {}
    </script>`
        : ''
    }
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="author" content="Alan Quintana" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="en" href="${urlEn}" />
    <link rel="alternate" hreflang="es" href="${urlEs}" />
    <link rel="alternate" hreflang="x-default" href="${urlEn}" />

    <!-- Open Graph / Twitter -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'es_MX'}" />
    <meta name="twitter:card" content="summary_large_image" />

    <script type="application/ld+json">
${indent(jsonLd(p, lang, ui), 6)}
    </script>

    <link rel="stylesheet" href="/assets/css/main.css" />
    <link rel="preload" href="/assets/fonts/dm-sans/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/outfit/outfit-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/poppins/poppins-300-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/boxicons/boxicons.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon.png" />

    <script type="module">
      import switchLanguages from '/assets/js/helpers/switchLanguages.js';
      import { setAutoDarkMode } from '/assets/js/helpers/auto-dark-mode.js';
      import lamp from '/assets/js/helpers/lamp.js';
      import navMenu from '/assets/js/helpers/nav_menu.js';
      import ParallaxEffect from '/assets/js/helpers/parallax.js';
      import SnowEffect from '/assets/js/helpers/snow-effect.js';
      import updateDateYear from '/assets/js/helpers/date_updater.js';
      import { loadGoogleTagManager } from '/assets/js/helpers/google-tag-manager.js';
      loadGoogleTagManager();
      document.addEventListener('DOMContentLoaded', () => {
        switchLanguages();
        setAutoDarkMode();
        lamp();
        navMenu();
        ParallaxEffect.init();
        SnowEffect.init();
        updateDateYear();
      });
    </script>
  </head>

  <body class="project-page">
    <!-- Fondo: mismas texturas que el home (grano + capas con parallax) -->
    <div class="background-container bgGrain"></div>
    <div class="background-container">
      <svg class="background-container bgBack" aria-hidden="true">
        <use href="/assets/img/bgBack.svg#bgBack"></use>
      </svg>
      <svg class="background-container bgMiddle" aria-hidden="true">
        <use href="/assets/img/bgMiddle.svg#bgMiddle"></use>
      </svg>
      <svg class="background-container bgFront" aria-hidden="true">
        <use href="/assets/img/bgFront.svg#bgFront"></use>
      </svg>
    </div>

${header}

    <main>
      <div class="project-back grid--container">
        <a class="btn btn--ghost project-back__link" href="${home}#projects">
          <i class="bx bx-chevron-left" aria-hidden="true"></i> ${ui.back}
        </a>
      </div>

      <article>
        <header class="project-hero grid--container">
          <p class="project-hero__kind">${esc(c.kind)} · ${p.year}</p>
          <h1 class="project-hero__title">${esc(c.title)}</h1>
          <p class="project-hero__tagline">${esc(c.tagline)}</p>
          <div class="project-hero__actions">
            <a class="btn btn--primary" href="${p.demo}" target="_blank" rel="noopener">
              <i class="bx bx-link-external" aria-hidden="true"></i> ${ui.demo}
            </a>
            <a class="btn btn--ghost" href="${p.repo}" target="_blank" rel="noopener">
              <i class="bx bxl-github" aria-hidden="true"></i> ${ui.code}
            </a>
          </div>
        </header>

${indent(screenshots(p, lang, ui), 8)}

        <div class="project-body grid--container">
          <section class="project-body__block">
            <h2>${ui.overview}</h2>
${c.overview.map((t) => `            <p>${esc(t)}</p>`).join('\n')}
          </section>

          <section class="project-body__block">
            <h2>${ui.features}</h2>
            <ul class="project-list">
${c.features.map((t) => `              <li>${esc(t)}</li>`).join('\n')}
            </ul>
          </section>

          <section class="project-body__block">
            <h2>${ui.built}</h2>
            <ul class="project-list">
${c.highlights.map((t) => `              <li>${esc(t)}</li>`).join('\n')}
            </ul>
            <h3>${ui.stack}</h3>
            <ul class="project-stack">
${p.stack.map((t) => `              <li>${esc(t)}</li>`).join('\n')}
            </ul>
          </section>
        </div>
      </article>

      <nav class="project-pager grid--container" aria-label="${ui.pager}">
${indent(pagerLink(prev, 'prev'), 8)}
${indent(pagerLink(next, 'next'), 8)}
      </nav>

      <section class="project-cta grid--container">
        <h2>${ui.ctaTitle}</h2>
        <p>${ui.ctaText}</p>
        <a class="btn btn--primary" href="${home}#contact">${ui.ctaButton}</a>
      </section>
    </main>

${footer}
  </body>
</html>
`;
}
