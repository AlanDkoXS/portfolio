// HTML of a project case-study page. Used by scripts/build-i18n.mjs, which
// then runs the result through the same i18n render as the home page (so the
// shared header/footer get their texts) and writes:
//   en → /projects/<slug>/index.html
//   es → /es/proyectos/<slug>/index.html

import { escapeAttr } from './html.mjs';
import { t } from './render.mjs';
import { SITE, fail, homePath, projectPath } from './site.mjs';

// Texts that only exist on the project pages
const TEXTS = {
  en: {
    back: 'Back to projects',
    screenshots: 'Screenshots',
    desktop: 'Desktop',
    mobile: 'Mobile',
    overview: 'Overview',
    features: 'Features',
    built: 'How it’s built',
    stack: 'Technologies',
    pager: 'More projects',
    prev: 'Previous',
    next: 'Next',
    ctaTitle: 'Have a project in mind?',
    ctaText: 'I design and build web applications that look good and are easy to use. Let’s talk about yours.',
    ctaButton: 'Write to me',
    descriptionWith: (p) => `${p.en.tagline} ${p.en.kind} by Alan Quintana, built with ${p.stack.slice(0, 3).join(', ')}.`,
    alt: (p, kind) => `${p.en.title} on ${kind === 'desktop' ? 'desktop' : 'mobile'}`,
    dark: ' (dark mode)',
  },
  es: {
    back: 'Volver a proyectos',
    screenshots: 'Capturas',
    desktop: 'Escritorio',
    mobile: 'Móvil',
    overview: 'Resumen',
    features: 'Funcionalidades',
    built: 'Cómo está hecho',
    stack: 'Tecnologías',
    pager: 'Más proyectos',
    prev: 'Anterior',
    next: 'Siguiente',
    ctaTitle: '¿Tienes un proyecto en mente?',
    ctaText: 'Diseño y desarrollo aplicaciones web que se ven bien y son fáciles de usar. Platiquemos del tuyo.',
    ctaButton: 'Escríbeme',
    descriptionWith: (p) => `${p.es.tagline} ${p.es.kind} de Alan Quintana, hecha con ${p.stack.slice(0, 3).join(', ')}.`,
    alt: (p, kind) => `${p.es.title} en ${kind === 'desktop' ? 'escritorio' : 'móvil'}`,
    dark: ' (modo oscuro)',
  },
};

// Texts shared with the home page come from translations.js (a missing key
// is reported by failOnMissing() like any other translation)
const uiTexts = (lang) => ({
  ...TEXTS[lang],
  home: t('navHome', lang),
  projects: t('navProjects', lang),
  demo: t('projectLinks.demo', lang),
  code: t('projectLinks.code', lang),
});

const indent = (html, n) =>
  html
    .split('\n')
    .map((l) => (l ? ' '.repeat(n) + l : l))
    .join('\n');

// Every value goes through escapeAttr, text nodes included (they get &quot;
// too): the committed pages were generated that way
/** One `<tag>item</tag>` line per item, indented n spaces */
const list = (items, tag, n) =>
  items.map((item) => `${' '.repeat(n)}<${tag}>${escapeAttr(item)}</${tag}>`).join('\n');

/** Joins blocks with line breaks, leaving out the ones that are null */
const blocks = (...parts) => parts.filter((part) => part !== null).join('\n');

/**
 * Header (with the hanging lamp, which goes right after it) and footer of the
 * home page, shared by every project page.
 */
export function homeChrome(homeHtml) {
  const header = homeHtml.match(/ {4}<header class="header">[\s\S]*?<\/header>\n(?: {4}<!-- Hanging lamp[\s\S]*?<\/button>)?/)?.[0];
  const footer = homeHtml.match(/ {4}<footer class="footer section">[\s\S]*?<\/footer>/)?.[0];
  if (!header || !footer) fail('Could not find the header/footer in index.html');
  if (!header.includes('class="lamp"')) {
    fail('Could not find the hanging lamp (class="lamp") right after the header in index.html');
  }
  return { header, footer };
}

// Header of the home page adapted to a subpage: section links point to the home.
export function adaptHeader(header, lang) {
  const home = homePath(lang);
  return header
    .replace('class="navbar__logo flex--container" href="#"', `class="navbar__logo flex--container" href="${home}"`)
    .replace(/class="navbar__link( active)?" href="#(\w+)"/g, (_m, _a, id) =>
      `class="navbar__link" href="${home}${id === 'home' ? '' : `#${id}`}"`,
    );
}

// ---------------------------------------------------------------------------
// <head>
// ---------------------------------------------------------------------------

const HEAD_BASE = `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Respects the system text size: Android/Chrome applies it to the base
         size (rem) instead of zooming the whole page -->
    <meta name="text-scale" content="scale" />
    <!-- Theme: dark if the system is in dark mode; otherwise time-based (dark from
         18:00 to 6:00, local time). The toggle stores an override until the next
         switch (localStorage.theme / themeUntil).
         Applied before first paint; without JS the system scheme is used. -->`;

// Only on the English page (there is no redirect back from Spanish)
function spanishRedirect({ p, lang }) {
  if (lang !== 'en') return null;
  return `    <script>
      // Same as the home page: Spanish browser (no choice stored in
      // localStorage "lang") → Spanish version of this project
      try {
        const pref = localStorage.getItem('lang');
        const langs = navigator.languages || [navigator.language || ''];
        const wantsEs = pref ? pref === 'es' : langs.some((l) => /^es\\b/i.test(l));
        if (wantsEs) location.replace('${projectPath(p, 'es')}' + location.hash);
      } catch {}
    </script>`;
}

function headMeta({ p, lang, c, ui }) {
  const url = SITE + projectPath(p, lang);
  const urlEn = SITE + projectPath(p, 'en');
  const urlEs = SITE + projectPath(p, 'es');
  const title = `${c.title} · ${c.kind} | Alan Quintana`;
  // Google cuts at ~160 characters: the technologies sentence only if it fits
  const full = ui.descriptionWith(p);
  const description = full.length <= 160 ? full : c.tagline;
  const ogImage = `${SITE}/assets/img/project_img/og/${p.image}.jpg`;
  return `    <title>${escapeAttr(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="author" content="Alan Quintana" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="en" href="${urlEn}" />
    <link rel="alternate" hreflang="es" href="${urlEs}" />
    <link rel="alternate" hreflang="x-default" href="${urlEn}" />

    <!-- Open Graph / Twitter -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'es_MX'}" />
    <meta name="twitter:card" content="summary_large_image" />`;
}

function jsonLd({ p, lang, c, ui }) {
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

function structuredData(ctx) {
  return `    <script type="application/ld+json">
${indent(jsonLd(ctx), 6)}
    </script>`;
}

const HEAD_ASSETS = `    <link rel="stylesheet" href="/assets/css/main.css" />
    <link rel="preload" href="/assets/fonts/dm-sans/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/outfit/outfit-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/poppins/poppins-300-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/boxicons/boxicons.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon.png" />

    <script type="module">
      import { initCommon } from '/assets/js/helpers/common.js';
      import { parallaxEffect } from '/assets/js/helpers/parallax.js';
      initCommon(['analytics']);
      document.addEventListener('DOMContentLoaded', () => {
        initCommon(['language', 'theme', 'lamp', 'navMenu']);
        parallaxEffect.init();
        initCommon(['snow', 'footerYear']);
      });
    </script>
    <!-- The shared helpers hang from common.js: fetched now instead of after it -->
    <link rel="modulepreload" href="/assets/js/helpers/language-switcher.js" />
    <link rel="modulepreload" href="/assets/js/helpers/auto-dark-mode.js" />
    <link rel="modulepreload" href="/assets/js/helpers/lamp.js" />
    <link rel="modulepreload" href="/assets/js/helpers/nav-menu.js" />
    <link rel="modulepreload" href="/assets/js/helpers/footer-year.js" />
    <link rel="modulepreload" href="/assets/js/helpers/snow-effect.js" />
    <link rel="modulepreload" href="/assets/js/helpers/google-tag-manager.js" />`;

// themeHead: color-scheme meta + pre-paint theme script of the home page
// (lib/theme-head.mjs); it goes right after the comment that ends HEAD_BASE
const head = (ctx, themeHead) =>
  blocks(HEAD_BASE, themeHead, spanishRedirect(ctx), headMeta(ctx), '', structuredData(ctx), '', HEAD_ASSETS);

// ---------------------------------------------------------------------------
// <body>
// ---------------------------------------------------------------------------

const BACKGROUND = `    <!-- Background: same textures as the home page (grain + parallax layers) -->
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
    </div>`;

function backLink({ ui, home }) {
  return `      <div class="project-back grid--container">
        <a class="btn btn--ghost project-back__link" href="${home}#projects">
          <i class="bx bx-chevron-left" aria-hidden="true"></i> ${ui.back}
        </a>
      </div>`;
}

function hero({ p, c, ui }) {
  return `        <header class="project-hero grid--container">
          <p class="project-hero__kind">${escapeAttr(c.kind)} · ${p.year}</p>
          <h1 class="project-hero__title">${escapeAttr(c.title)}</h1>
          <p class="project-hero__tagline">${escapeAttr(c.tagline)}</p>
          <div class="project-hero__actions">
            <a class="btn btn--primary" href="${p.demo}" target="_blank" rel="noopener">
              <i class="bx bx-link-external" aria-hidden="true"></i> ${ui.demo}
            </a>
            <a class="btn btn--ghost" href="${p.repo}" target="_blank" rel="noopener">
              <i class="bx bxl-github" aria-hidden="true"></i> ${ui.code}
            </a>
          </div>
        </header>`;
}

function screenshots({ p, ui }) {
  const img = (kind, dark, attrs) => {
    // mobile: full phone screenshot (390×844), not the 4:5 one of the home cards
    const dir = kind === 'desktop' ? 'desktop/' : 'mobile/';
    const [w, h] = kind === 'desktop' ? [1280, 800] : [390, 844];
    const file = `${p.image}${dark ? '-dark' : ''}.webp`;
    return `<img class="${dark ? 'if-dark' : 'if-light'}" src="/assets/img/project_img/${dir}${file}" alt="${escapeAttr(ui.alt(p, kind) + (dark ? ui.dark : ''))}" width="${w}" height="${h}" ${attrs} />`;
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

function body({ p, c, ui }) {
  return `        <div class="project-body grid--container">
          <section class="project-body__block">
            <h2>${ui.overview}</h2>
${list(c.overview, 'p', 12)}
          </section>

          <section class="project-body__block">
            <h2>${ui.features}</h2>
            <ul class="project-list">
${list(c.features, 'li', 14)}
            </ul>
          </section>

          <section class="project-body__block">
            <h2>${ui.built}</h2>
            <ul class="project-list">
${list(c.highlights, 'li', 14)}
            </ul>
            <h3>${ui.stack}</h3>
            <ul class="project-stack">
${list(p.stack, 'li', 14)}
            </ul>
          </section>
        </div>`;
}

// Button with just "Previous/Next"; the project name goes below
// in small text (and the screen reader reads it as the description)
function pagerLink({ lang, ui }, q, rel) {
  const label =
    rel === 'prev'
      ? '<i class="bx bx-chevron-left" aria-hidden="true"></i> ' + ui.prev
      : ui.next + ' <i class="bx bx-chevron-right" aria-hidden="true"></i>';
  return `<div class="project-pager__item project-pager__item--${rel}">
  <a class="btn btn--ghost project-pager__link" href="${projectPath(q, lang)}" rel="${rel}" aria-describedby="pager-${rel}">${label}</a>
  <p class="project-pager__title" id="pager-${rel}">${escapeAttr(q[lang].title)}</p>
</div>`;
}

function pager(ctx, prev, next) {
  return `      <nav class="project-pager grid--container" aria-label="${ctx.ui.pager}">
${indent(pagerLink(ctx, prev, 'prev'), 8)}
${indent(pagerLink(ctx, next, 'next'), 8)}
      </nav>`;
}

function cta({ ui, home }) {
  return `      <section class="project-cta grid--container">
        <h2>${ui.ctaTitle}</h2>
        <p>${ui.ctaText}</p>
        <a class="btn btn--primary" href="${home}#contact">${ui.ctaButton}</a>
      </section>`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function projectPage({ project: p, lang, prev, next, header, footer, themeHead }) {
  const ctx = { p, lang, c: p[lang], ui: uiTexts(lang), home: homePath(lang) };
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
${head(ctx, themeHead)}
  </head>

  <body class="project-page">
${BACKGROUND}

${header}

    <main>
${backLink(ctx)}

      <article>
${hero(ctx)}

${indent(screenshots(ctx), 8)}

${body(ctx)}
      </article>

${pager(ctx, prev, next)}

${cta(ctx)}
    </main>

${footer}
  </body>
</html>
`;
}
