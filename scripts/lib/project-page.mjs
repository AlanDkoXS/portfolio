// HTML of a project case-study page. Used by scripts/build-i18n.mjs, which
// then runs the result through the same i18n render as the home page (so the
// shared header/footer get their texts) and writes:
//   en → /projects/<slug>/index.html
//   es → /es/proyectos/<slug>/index.html

export const SITE = 'https://www.alanquintana.pro';

export const homePath = (lang) => (lang === 'en' ? '/' : '/es/');
export const projectPath = (project, lang) =>
  lang === 'en' ? `/projects/${project.slug}/` : `/es/proyectos/${project.slug}/`;

const UI = {
  en: {
    home: 'Home',
    projects: 'Projects',
    breadcrumb: 'Breadcrumb',
    demo: 'View live demo',
    code: 'View code',
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
    ctaButton: 'Contact me',
    by: 'by Alan Quintana',
    descriptionWith: (p) => `${p.en.tagline} ${p.en.kind} by Alan Quintana, built with ${p.stack.slice(0, 3).join(', ')}.`,
    alt: (p, kind) => `${p.en.title} on ${kind === 'desktop' ? 'desktop' : 'mobile'}`,
    dark: ' (dark mode)',
  },
  es: {
    home: 'Inicio',
    projects: 'Proyectos',
    breadcrumb: 'Ruta de navegación',
    demo: 'Ver demo en vivo',
    code: 'Ver código',
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
    ctaButton: 'Contáctame',
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
    const dir = kind === 'desktop' ? 'desktop/' : '';
    const [w, h] = kind === 'desktop' ? [1280, 800] : [560, 700];
    const file = `${p.image}${dark ? '-dark' : ''}.webp`;
    return `<img class="${dark ? 'if-dark' : 'if-light'}" src="/assets/img/project_img/${dir}${file}" alt="${esc(ui.alt(p, kind) + (dark ? ui.dark : ''))}" width="${w}" height="${h}" ${attrs} />`;
  };
  const figure = (kind) => {
    const first = kind === 'desktop' ? 'fetchpriority="high"' : 'loading="lazy"';
    const imgs = [img(kind, false, first)];
    if (p.dark) imgs.push(img(kind, true, 'loading="lazy"'));
    return `<figure class="project-media__${kind}${p.dark ? ' has-dark' : ''}">
  ${imgs.join('\n  ')}
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
  const pagerLink = (q, rel) =>
    `<a class="project-pager__link project-pager__link--${rel}" href="${projectPath(q, lang)}" rel="${rel}">
  <span class="project-pager__label">${rel === 'prev' ? '<i class="bx bx-left-arrow-alt" aria-hidden="true"></i> ' + ui.prev : ui.next + ' <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>'}</span>
  <span class="project-pager__title">${esc(q[lang].title)}</span>
</a>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Tema: sigue al sistema; el botón guarda una excepción en localStorage.theme. -->
    <meta name="color-scheme" content="light dark" />
    <script>
      try {
        const t = localStorage.getItem('theme');
        if (t === 'light' || t === 'dark') document.querySelector('meta[name="color-scheme"]').content = t;
      } catch {}
    </script>
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

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="/assets/css/main.css" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon.png" />

    <script type="module">
      import switchLanguages from '/assets/js/helpers/switchLanguages.js';
      import { setAutoDarkMode } from '/assets/js/helpers/auto-dark-mode.js';
      import updateDateYear from '/assets/js/helpers/date_updater.js';
      import { loadGoogleTagManager } from '/assets/js/helpers/google-tag-manager.js';
      loadGoogleTagManager();
      document.addEventListener('DOMContentLoaded', () => {
        switchLanguages();
        setAutoDarkMode();
        updateDateYear();
      });
    </script>
  </head>

  <body class="project-page">
${header}

    <main>
      <nav class="breadcrumb grid--container" aria-label="${ui.breadcrumb}">
        <ol>
          <li><a href="${home}">${ui.home}</a></li>
          <li><a href="${home}#projects">${ui.projects}</a></li>
          <li aria-current="page">${esc(c.title)}</li>
        </ol>
      </nav>

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
