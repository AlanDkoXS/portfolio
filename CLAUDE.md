# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site (alanquintana.pro), plain static HTML/CSS/vanilla JS. No bundler, no package manager, no tests, no linter config committed (`package.json`, `eslint.config.mjs`, `.prettierrc` are gitignored). Deployed on Netlify straight from the repo root. The only "build" is the zero-dependency i18n generator below, whose output is committed.

## i18n generator

```sh
node scripts/build-i18n.mjs   # run after editing index.html or translations.js
```

Rewrites `index.html` in place with the English texts and generates `es/index.html` (Spanish, committed, never edit by hand). Idempotent; fails listing any missing translation keys.

## Running locally

JS is loaded as native ES modules with absolute imports (e.g. `/assets/js/languages/translations.js`), so opening `index.html` via `file://` won't work. Serve the repo root over HTTP:

```sh
python -m http.server 8000   # then open http://localhost:8000
```

`_redirects` is Netlify-specific (`/resume.html` → `/resume`), so the clean `/resume` URL only works on Netlify; use `/resume.html` locally.

## Architecture

**Two pages, shared modules.**
- `index.html` loads `assets/js/main.js`, which orchestrates everything: imports every helper from `assets/js/helpers/` and initializes them in a fixed order inside `initialize()` (external scripts → dark mode → UI components → visual effects → functionalities). New features are added as a helper module and wired in there.
- `resume.html` does **not** load `main.js`; its inline `<script type="module">` imports only the helpers it needs (`resume_fab_buttons.js`, `pdf_loader.js`, `switchLanguages.js`, dark mode, date, snow, GTM). Shared helpers like `switchLanguages.js` run on both pages, so they must tolerate missing DOM elements (they early-return when selectors don't match). The resume page renders `/assets/docs/resume.pdf` with pdf.js (CDN global `pdfjsLib`) and offers downloads of `[ENG]`/`[ESP] Alan Quintana.pdf` via a global `downloadCV()` defined inline.

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

**CSS.** `assets/css/main.css` is just `@import`s of partials organized as `base/` (variables, base), `layout/` (header, footer, buttons, modal, loader, background), and `sections/` (one file per page section, including `_resume.css`). Class naming follows BEM (`block__element--modifier`). Dark mode is the state of the `[name='color-scheme']` checkbox (CSS reacts via `:has(...:checked)`); `auto-dark-mode.js` sets it from the visitor's remembered choice (`localStorage.theme`), else from local time (dark 18:00–06:00). Not from `prefers-color-scheme`. Colors are `light-dark()` tokens in `_variables.css` (dark = deep teal `#00303d` + gold, light = light teal `#d6ebf0` + dark teal text with darker gold accents); use the semantic tokens (`--primary-color`, `--accent-color`, `--surface-color`, `--border-color`, `--shadow-color`, …) instead of hex values. Always-dark areas (footer, project cards over photos) locally override `--primary-color` to gold.

**Seasonal effect.** `snow-effect.js` only activates Dec 12 – Jan 6.

## SEO files

`sitemap.xml` (with `xhtml:link` hreflang alternates for `/` and `/es/`), `robots.txt`, and the JSON-LD block in `index.html`'s `<head>` should be kept in sync with page/URL changes. The JSON-LD block is marked `data-i18n-jsonld`; the generator merges `translations.meta[lang].jsonLd` into it.

## Netlify

`_redirects` (`/resume.html` → `/resume`) and `_headers` (security headers + moderate `Cache-Control` with `stale-while-revalidate`, since asset names aren't fingerprinted; replacing an image keeps its old version cached up to a day).

`reload_page.js` forces `#home` only on a manual reload or when there's no hash, so shared links like `/es/#contact` keep working.

## Conventions

- Commit messages use gitmoji + uppercase verb, e.g. `:bug: FIXED: ...`, `:mag: MODIFIED: ...`.
- Code comments are a mix of English and Spanish; READMEs exist in both (`README.md`, `README.es.md`).
