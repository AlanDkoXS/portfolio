# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site (alanquintana.pro), plain static HTML/CSS/vanilla JS. No build step, no bundler, no package manager, no tests, no linter config committed (`package.json`, `eslint.config.mjs`, `.prettierrc` are gitignored). Deployed on Netlify straight from the repo root.

## Running locally

JS is loaded as native ES modules with absolute imports (e.g. `/assets/js/languages/translations.js`), so opening `index.html` via `file://` won't work. Serve the repo root over HTTP:

```sh
python -m http.server 8000   # then open http://localhost:8000
```

`_redirects` is Netlify-specific (`/resume.html` → `/resume`), so the clean `/resume` URL only works on Netlify; use `/resume.html` locally.

## Architecture

**Two pages, shared modules.**
- `index.html` loads `assets/js/main.js`, which orchestrates everything: imports every helper from `assets/js/helpers/` and initializes them in a fixed order inside `initialize()` (external scripts → dark mode → UI components → visual effects → functionalities). New features are added as a helper module and wired in there.
- `resume.html` *also* loads `main.js`, plus its own inline `<script type="module">` that imports `resume_fab_buttons.js`, `pdf_loader.js`, `switchLanguages.js`, etc. Helpers must therefore tolerate missing DOM elements (they early-return when selectors don't match). The resume page renders `/assets/docs/resume.pdf` with pdf.js (CDN global `pdfjsLib`) and offers downloads of `[ENG]`/`[ESP] Alan Quintana.pdf` via a global `downloadCV()` defined inline.

**i18n (EN/ES).** Text in the HTML is the English default; `assets/js/helpers/switchLanguages.js` overwrites it at runtime using keys from `assets/js/languages/translations.js` (`{ key: { en, es } }`, with some nested objects like `resumePage`, `contactForm`, `validation`). Language is auto-detected from `navigator.languages` and toggled via `#language-toggle`. The mapping from DOM selector → translation key is hard-coded in `applyLanguageChanges()`; projects use indexed keys (`projectTitle1`, `projectDescription1`, …) matched to `.project__title` order. When adding or changing visible text, update both the HTML and `translations.js`, and add the selector mapping in `switchLanguages.js`. A `languageChange` CustomEvent is dispatched so other modules (e.g. form validation in `send_form.js`) can react.

**Responsive home text.** On widths ≥600px the home description is merged with the about description. This logic exists in two places (`handleResponsiveContent` in both `main.js` and `switchLanguages.js`); the `switchLanguages.js` version is the language-aware one.

**External services** are loaded dynamically by helpers rather than via `<script>` tags: EmailJS (`email-js.js`, used by the contact form in `send_form.js`) and Google Tag Manager/Analytics (`google-tag-manager.js`). `fectchDribbbleShots.js` exists but isn't wired into `main.js`.

**CSS.** `assets/css/main.css` is just `@import`s of partials organized as `base/` (variables, base), `layout/` (header, footer, buttons, modal, loader, background), and `sections/` (one file per page section, including `_resume.css`). Class naming follows BEM (`block__element--modifier`). Dark mode is driven by `auto-dark-mode.js` following `prefers-color-scheme`.

**Seasonal effect.** `snow-effect.js` only activates Dec 12 – Jan 6.

## SEO files

`sitemap.xml`, `robots.txt`, and the JSON-LD block in `index.html`'s `<head>` should be kept in sync with page/URL changes.

## Conventions

- Commit messages use gitmoji + uppercase verb, e.g. `:bug: FIXED: ...`, `:mag: MODIFIED: ...`.
- Code comments are a mix of English and Spanish; READMEs exist in both (`README.md`, `README.es.md`).
