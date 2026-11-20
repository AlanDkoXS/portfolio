# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site (alanquintana.pro), plain static HTML/CSS/vanilla JS. No bundler, no package manager, no tests, no linter config committed (`package.json`, `eslint.config.mjs`, `.prettierrc` are gitignored). Deployed on Netlify straight from the repo root. The only "build" is the zero-dependency i18n generator below, whose output is committed.

## i18n generator

```sh
node scripts/build-i18n.mjs   # run after editing index.html or translations.js
```

Rewrites `index.html` in place with the English texts and generates `es/index.html` (Spanish, committed, never edit by hand). Idempotent; fails listing any missing translation keys.

It also generates the **project case-study pages** from `scripts/data/projects.mjs` (content in EN/ES, facts taken from each repo) with the template in `scripts/lib/project-page.mjs`: `projects/<slug>/index.html` (en) and `es/proyectos/<slug>/index.html` (es), committed, never edit by hand. They reuse the home header/footer (section links rewritten to `/#…` or `/es/#…`), carry canonical/hreflang/OG/JSON-LD (SoftwareApplication + BreadcrumbList), and the generator rewrites the `<!-- projects:start/end -->` block of `sitemap.xml`. To add a project: add its entry to `projects.mjs` (same order as the home cards), its screenshots (`project_img/<image>.webp` 560×700 home card, `mobile/<image>.webp` 390×844 phone screenshot for the case page, `desktop/<image>.webp` 1280×800, `og/<image>.jpg` 1200×630, plus `-dark` variants if it has its own dark mode), a card in `index.html` and its `projectCase` hrefs in `translations.js`.

## CV (PDF) generator

```sh
node scripts/build-cv.mjs   # run after editing scripts/cv/data.mjs
```

Builds `assets/docs/[ENG] Alan Quintana.pdf`, `[ESP] Alan Quintana.pdf` and `resume.pdf` (EN page 1 + ES page 2, shown by `/resume`) from `scripts/cv/data.mjs`, printing an HTML template with the system Chromium and joining with `pdfunite` (poppler). Each CV must fit one Letter page; the script fails if one overflows. The email is per language (`hello@` EN, `hola@` ES; same inbox). Experience lists the Aniwa (beaniwa.com) client sites.

## Running locally

JS is loaded as native ES modules with absolute imports (e.g. `/assets/js/languages/translations.js`), so opening `index.html` via `file://` won't work. Serve the repo root over HTTP:

```sh
python -m http.server 8000   # then open http://localhost:8000
```

`_redirects` is Netlify-specific (`/resume.html` → `/resume`), so the clean `/resume` URL only works on Netlify; use `/resume.html` locally.

## Architecture

**Two pages, shared modules.**
- `index.html` loads `assets/js/main.js`, which orchestrates everything: imports every helper from `assets/js/helpers/` and initializes them in a fixed order inside `initialize()` (external scripts → dark mode → UI components → visual effects → functionalities). New features are added as a helper module and wired in there.
- `resume.html` does **not** load `main.js`; its inline `<script type="module">` imports only the helpers it needs (`resume_fab_buttons.js`, `pdf_loader.js`, `switchLanguages.js`, dark mode, date, snow, GTM). Shared helpers like `switchLanguages.js` run on both pages, so they must tolerate missing DOM elements (they early-return when selectors don't match). The resume page renders only the active language's page of `/assets/docs/resume.pdf` (page 1 = EN, page 2 = ES, swapped on `languageChange`) with pdf.js (CDN global `pdfjsLib`) and offers downloads of `[ENG]`/`[ESP] Alan Quintana.pdf` via a global `downloadCV()` defined inline.

**i18n (EN/ES).** `assets/js/languages/translations.js` is the single source of text (`{ key: { en, es } }`; nested ones like `contactForm`, `resumePage`, `meta` hold an object per language). Markup marks translatable content with `data-i18n="key.path"` (element text) and `data-i18n-attr="attr:key;attr2:key2"` (attributes, e.g. meta tags, canonical, hrefs). Key paths put the language after the first segment (`contactForm.name` → `contactForm[lang].name`, `skillsTags.2` → `skillsTags[lang][2]`), resolved by `assets/js/languages/translate.js`, shared by the generator and the browser. Elements with `data-i18n` must contain only text — their content is replaced wholesale.
- Home page = **URL mode**: `/` (en) and `/es/` (es) are separate static pages with `canonical`/`hreflang` links. `switchLanguages.js` takes the language from `<html lang>`; the `#language-toggle` stores the choice in `localStorage.lang` and navigates to the other URL (keeping the hash). An inline script in `<head>` sends first-time Spanish-browser visitors from `/` to `/es/` unless `localStorage.lang` says otherwise.
- Resume page = **in-place mode** (no hreflang alternates): language from `localStorage.lang` or the browser, texts swapped in the DOM.
- To add text: add the key to `translations.js`, put `data-i18n` on the element in `index.html` (or `resume.html`), run the generator.
- A `languageChange` CustomEvent is dispatched so other modules (e.g. form validation in `send_form.js`) can react.
- All asset URLs in `index.html` must be absolute (`/assets/...`) because the same markup is served from `/es/`.

**Responsive home text.** On widths ≥600px the home description is merged with the about description (and the About section is hidden via CSS). This lives in `handleResponsiveContent` in `switchLanguages.js` so it uses the active language.

**Hero parallax.** `parallax.js` (background SVG layers `.bgBack/.bgMiddle/.bgFront`) and `profile_parallax.js` (profile picture layers) follow the mouse on desktop and device tilt on touch devices (`(pointer: coarse)`). Both get tilt from `tilt.js`, which handles the iOS `DeviceOrientationEvent.requestPermission()` gesture, makes tilt relative to how the phone is held, clamps/smooths it, and recenters after 2s without motion. Mobile layers are driven from a `requestAnimationFrame` loop, so CSS transitions on those elements are disabled while in tilt mode.

**Profile sprite.** `.home__image--sprite` animates `profile_sprite.webp` (20 frames of 300×300 in a 6000×300 strip) using `background-size: 2000% 100%` and percentage `background-position` with `steps(20, jump-none)`, so frames stay aligned at any rendered size. Keep that if the sprite changes (adjust 2000% / steps to the new frame count).

**External services** are loaded dynamically by helpers rather than via `<script>` tags: EmailJS (`email-js.js`, used by the contact form in `send_form.js`, which silently drops submissions that fill the hidden `#website` honeypot field) and Google Tag Manager/Analytics (`google-tag-manager.js`). `fectchDribbbleShots.js` exists but isn't wired into `main.js`.

**CSS.** `assets/css/main.css` is just `@import`s of partials organized as `base/` (variables, base), `layout/` (header, footer, buttons, modal, loader, background), and `sections/` (one file per page section, including `_resume.css`). Class naming follows BEM (`block__element--modifier`). Theme follows the system (`prefers-color-scheme`) by default. The toggle stores an override in `localStorage.theme` only when it differs from the system (toggling back to the system scheme removes it) and writes it to `<meta name="color-scheme">`; an inline `<head>` script applies it before first paint (no flash). CSS maps that meta to `color-scheme` and to a `--color-scheme` custom property in `_variables.css`. Colors are `light-dark()` tokens: both schemes are teal with gold `#f3ce3a` text (light = `#00303d`, dark = deeper `#001a23`); only backgrounds, surfaces and inputs differ; use the semantic tokens (`--primary-color`, `--accent-color`, `--accent-ink`, `--surface-color`, `--border-color`, `--shadow-color`, …) instead of hex values. Non-color light/dark branches use `@container style(--color-scheme: …)` as non-critical overrides. Buttons: `.btn--primary` (solid gold) for main actions, `.btn--ghost` (outline) only for secondary ones like the contact form submit. Always-dark areas (footer, project cards over photos) locally override `--primary-color` to gold.

**Seasonal effect.** `snow-effect.js` only activates Dec 12 – Jan 6.

**Motion & robustness.** Decorative motion (parallax, tilt, snow, sprite, greeting typing, smooth scroll, card flip, hover drift) only runs when the user has no reduced-motion preference: JS effects check `prefersReducedMotion()` from `helpers/motion.js`; CSS opts in with `@media (prefers-reduced-motion: no-preference)`. Content must be visible without JS: section entry and the header reveal are scroll-driven CSS animations behind `@supports`; `observer.js` only lazy-loads project images. Page-to-page navigations use a cross-document `@view-transition`.

**Project covers.** `assets/img/project_img/*.webp` are 560×700 (4:5, 2× the card) mobile screenshots of each live project, set in `_projects.css` by `nth-of-type` (card order matters). Projects with their own dark mode (CRUD, Traktl) also have `*-dark.webp`, swapped via `@container style(--color-scheme: dark)`. Don't set covers inline from JS, or the dark override stops working.

**Skills marquee.** Each stack in `#skills` is a `.skills__group` with an infinite left-to-right row: `.skills__track` holds 4 copies of the `<ul class="skills__list">` (only the first is accessible, the rest `aria-hidden`) and animates `translate: -50% → 0` over `--marquee-duration` (set inline per row; `.skills__marquee--reverse` flips direction: Frontend and Development run reversed, Backend and Development slower). It pauses on hover/focus and with the `.skills__motion-toggle` button (WCAG 2.2.2, `helpers/skills_marquee.js`); with reduced motion it's a static wrapped list. When adding a tech, add it to all 4 copies. Icons are SVG `<symbol>` sprites in `assets/img/skills/` (newer ones from Simple Icons, CC0) and get a grainy inner shadow from every edge inward via `filter: url(#grain-inset)` (inline SVG filter at the top of `<body>` in `index.html`).

**Fonts are self-hosted** (no Google Fonts / unpkg): Poppins woff2 (latin + latin-ext, weights 200–700) in `assets/fonts/poppins/` declared in `base/_fonts.css`, and Boxicons in `assets/fonts/boxicons/` with its CSS in `assets/css/vendor/boxicons.min.css`. Pages preload the most used files.

**Icon font.** `body` uses `font-size-adjust: from-font` (stable Poppins fallback); Boxicons opts out in `_base.css`, otherwise every icon renders ~55% of its size.

**Hanging lamp** (`helpers/lamp.js`, `layout/_lamp.css`): theme switch that hangs below the navbar (desktop: centered in the right margin, replaces the moon/sun toggle; mobile: small, retracts on scroll, moon/sun stays in the menu). Lit = dark mode. States: hover (`lamp__over`), pressing (`lamp--pulling`, chain pulled), on (`lamp__on`); images in `assets/img/lamp_button/`.

**Loader & greeting.** The loader (letters falling into the name) shows only on the first load of the session (`sessionStorage['aq-loaded']`, `.skip-loader` set in `<head>`) and never while prerendering. When it leaves, `html.hero-ready` is set and `helpers/typing.js` types the greeting letter by letter with a blinking underscore caret. The other language is prerendered with speculation rules so switching is near instant.

**Hero copy (desktop).** `homeDescription` (intro) + `heroLines` (7 phrases of exactly 7 words, plain language for non-technical readers), rendered as one paragraph by `handleResponsiveContent`. Keep the 7×7 rule when editing.

**Dialogs.** Native `<dialog>` opened with `showModal()`, `closedby="any"` for light dismiss (Safari fallback in `helpers/dialog.js`), named via `aria-labelledby`. The dialog box is the card; the dim/blur lives in `::backdrop`.

## SEO files

`sitemap.xml` (with `xhtml:link` hreflang alternates for `/`, `/es/` and the generated project pages), `robots.txt`, and the JSON-LD block in `index.html`'s `<head>` should be kept in sync with page/URL changes. `llms.txt` and `llms-full.txt` (profile for AI search engines and agents, EN + ES, with FAQ) are generated by `build-i18n.mjs` from `scripts/data/profile.mjs`, `projects.mjs` and `scripts/cv/data.mjs`; never edit them by hand. `robots.txt` explicitly allows AI crawlers and points to them. The JSON-LD block is marked `data-i18n-jsonld`; the generator merges `translations.meta[lang].jsonLd` into it.

## Netlify

`_redirects` (`/resume.html` → `/resume`) and `_headers` (security headers + moderate `Cache-Control` with `stale-while-revalidate`, since asset names aren't fingerprinted; replacing an image keeps its old version cached up to a day).

`reload_page.js` forces `#home` only on a manual reload or when there's no hash, so shared links like `/es/#contact` keep working.

## Conventions

- Commit messages use gitmoji + uppercase verb, e.g. `:bug: FIXED: ...`, `:mag: MODIFIED: ...`.
- Code comments are a mix of English and Spanish; READMEs exist in both (`README.md`, `README.es.md`).
