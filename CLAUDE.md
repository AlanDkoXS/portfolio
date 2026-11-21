# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site (alanquintana.pro), plain static HTML/CSS/vanilla JS. No bundler, no package manager, no tests, no linter config committed (`package.json`, `eslint.config.mjs`, `.prettierrc` are gitignored). Deployed on Netlify straight from the repo root. The only "build" is the zero-dependency i18n generator below, whose output is committed.

## i18n generator

```sh
node scripts/build-i18n.mjs   # run after editing index.html, translations.js or any CSS partial
```

Rewrites `index.html` in place with the English texts and generates `es/index.html` (Spanish, committed, never edit by hand). Idempotent; fails listing any missing translation keys. It also bundles the CSS: `assets/css/main.src.css` (the list of `@import`s) → `assets/css/main.css` (one generated file, committed, never edit by hand), so pages load a single stylesheet instead of a request chain.

It also generates the **project case-study pages** from `scripts/data/projects.mjs` (content in EN/ES, facts taken from each repo) with the template in `scripts/lib/project-page.mjs`: `projects/<slug>/index.html` (en) and `es/proyectos/<slug>/index.html` (es), committed, never edit by hand. They reuse the home header/footer (section links rewritten to `/#…` or `/es/#…`), carry canonical/hreflang/OG/JSON-LD (SoftwareApplication + BreadcrumbList), and the generator rewrites the `<!-- projects:start/end -->` block of `sitemap.xml`. To add a project: add its entry to `projects.mjs` (same order as the home cards), its screenshots (`project_img/<image>.webp` 560×700 home card, `mobile/<image>.webp` 390×844 phone screenshot for the case page, `desktop/<image>.webp` 1280×800, `og/<image>.jpg` 1200×630, plus `-dark` variants if it has its own dark mode), a card in `index.html` and its `projectCase` hrefs in `translations.js`.

`build-i18n.mjs` only orchestrates; each step is a module in `scripts/lib/`: `render.mjs` (i18n render + missing-key check), `css-bundle.mjs`, `skills-sprite.mjs`, `designs-section.mjs`, `theme-head.mjs`, `project-page.mjs`, `sitemap.mjs` (pure function) and `llms.mjs`. Every build script shares `site.mjs` (`ROOT`, `SITE`, `LANGS`, `homePath`/`projectPath`, `CV_FILES`, `fail`, `withTmpDir`) and `html.mjs` (`escapeText`/`escapeAttr`, always imported under those names): use them instead of resolving the repo root, hardcoding the domain, the language list or the CV file names, or writing another escaper. Texts the project pages share with the home page (nav and demo/code labels) are read from `translations.js`, not repeated in the template.

## Icons (Boxicons subset)

```sh
node scripts/build-icons.mjs  # run after using a bx-* icon that wasn't used before
```

Scans `index.html`, `resume.html`, `scripts/lib`, `scripts/data` and `assets/js` for `bx-*`/`bxs-*`/`bxl-*` classes and, from the full Boxicons in `scripts/vendor/boxicons/`, writes `assets/css/vendor/boxicons.min.css` (only those classes) and a subset `assets/fonts/boxicons/boxicons.woff2` (~3 KB instead of 116 KB) with `pyftsubset` via `uvx` (fonttools). Then run `build-i18n.mjs` so the CSS reaches `main.css`. Don't build icon class names dynamically (`'bx-' + name`): the scan wouldn't find them.

## Dribbble shots (Designs section)

```sh
DRIBBBLE_TOKEN=xxxx node scripts/build-dribbble.mjs   # DRIBBBLE_LIMIT=12 optional
```

Fetches the user's shots from the Dribbble API v2 (access token of a Dribbble app, never committed nor sent to the browser), converts each cover to `assets/img/dribbble/<id>.webp` (800×600, first frame if animated, ImageMagick `magick`), writes `scripts/data/dribbble.json` (committed) and runs `build-i18n.mjs`, which renders the `#designs` section into the `<!-- dribbble:start/end -->` block of `index.html` (template in `scripts/lib/designs-section.mjs`, styles in `sections/_designs.css`: centered grid on desktop, horizontal scroll-snap row on mobile). Without shots the block stays empty and the section isn't shown.

## CV (PDF) generator

```sh
node scripts/build-cv.mjs   # run after editing scripts/cv/data.mjs
```

Builds `assets/docs/[ENG] Alan Quintana.pdf`, `[ESP] Alan Quintana.pdf` and `resume.pdf` (EN page 1 + ES page 2, shown by `/resume`) from `scripts/cv/data.mjs`, printing an HTML template (`scripts/lib/cv-page.mjs`) with the system Chromium and joining with `pdfunite` (poppler). Each CV must fit one Letter page; the script fails if one overflows. The email is per language (`hello@` EN, `hola@` ES; same inbox). Experience lists the Aniwa (beaniwa.com) client sites.

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
- Home page = **URL mode**: `/` (en) and `/es/` (es) are separate static pages with `canonical`/`hreflang` links. `switchLanguages.js` takes the language from `<html lang>`; the `#language-toggle` stores the choice in `localStorage.lang` and navigates to the other URL (keeping the hash). An inline script in `<head>` sends Spanish-browser visitors from `/` to `/es/` (and from the English project pages to `/es/proyectos/<slug>/`, same script in `project-page.mjs`) unless `localStorage.lang` says otherwise. There is no reverse redirect from `/es/` (shared Spanish links stay Spanish and crawlers, which browse in English, can still index `/es/`).
- Resume page = **in-place mode** (no hreflang alternates): language from the `?lang=` the home's CV links carry (`resumeHref` in translations, so the CV follows the page it was opened from; it's stored and stripped from the URL), else `localStorage.lang`, else the browser; texts swapped in the DOM.
- To add text: add the key to `translations.js`, put `data-i18n` on the element in `index.html` (or `resume.html`), run the generator.
- A `languageChange` CustomEvent is dispatched so other modules (e.g. form validation in `send_form.js`) can react.
- All asset URLs in `index.html` must be absolute (`/assets/...`) because the same markup is served from `/es/`.

**Responsive home text.** On widths ≥600px the home description is merged with the about description (and the About section is hidden via CSS). This lives in `handleResponsiveContent` in `switchLanguages.js` so it uses the active language.

**Hero parallax.** `parallax.js` (background SVG layers `.bgBack/.bgMiddle/.bgFront`) and `profile_parallax.js` (profile picture layers) follow the mouse on desktop and device tilt on touch devices (`(pointer: coarse)`). Both get tilt from `tilt.js`, which handles the iOS `DeviceOrientationEvent.requestPermission()` gesture, makes tilt relative to how the phone is held, clamps/smooths it, and recenters after 2s without motion. Mobile layers are driven from a `requestAnimationFrame` loop, so CSS transitions on those elements are disabled while in tilt mode.

**Profile sprite.** `.home__image--sprite` animates `profile_sprite.webp` (20 frames of 300×300 in a 6000×300 strip) using `background-size: 2000% 100%` and percentage `background-position` with `steps(20, jump-none)`, so frames stay aligned at any rendered size. Keep that if the sprite changes (adjust 2000% / steps to the new frame count).

**External services** are loaded dynamically by helpers rather than via `<script>` tags, and never on the critical path (nothing awaits them): EmailJS (`email-js.js`, memoized; `send_form.js` loads it on the first `focusin`/`pointerdown` in the form and awaits it before sending; it silently drops submissions that fill the hidden `#website` honeypot field) and Google Tag Manager (`google-tag-manager.js`, container `GTM-MRJGJ8NP`; GA4 is configured inside GTM): injected after idle or the first interaction, never on localhost and only once a prerendered page is activated.

**CSS.** `assets/css/main.src.css` is just `@import`s of partials (bundled into `main.css` by the generator; URLs inside partials must be absolute) organized as `base/` (variables, base), `layout/` (header, footer, buttons, modal, loader, background), and `sections/` (one file per page section, including `_resume.css`). Class naming follows BEM (`block__element--modifier`). Theme (`helpers/auto-dark-mode.js`): dark if the system is in dark mode; otherwise time-based (visitor's local time; light is every device's default, so it can't be told apart from a choice): dark from 18:00 to 6:00, light otherwise, switching at the exact hour even with the page open (timer + re-check on `visibilitychange`). The toggle/lamp stores an override in `localStorage.theme` + `themeUntil` that lasts only until the next switch (toggling back to the scheduled theme removes it). The theme is written to `<meta name="color-scheme">`; an inline `<head>` script applies it before first paint (no flash). That script lives in the `<!-- theme:start/end -->` block of `index.html` (single source, together with the color-scheme meta; the comment above the block and the text-scale meta are not part of it, each page keeps its own): edit it only there and run `build-i18n.mjs`, which copies the block into the same markers of `resume.html` and, without markers, into `es/index.html` and the project pages (it fails before writing anything if a marker is missing in `index.html` or `resume.html`); keep its 18/6 hours in sync with `auto-dark-mode.js`; without JS the meta stays `light dark` and the system scheme is used. CSS maps that meta to `color-scheme` and to a `--color-scheme` custom property in `_variables.css`. Colors are `light-dark()` tokens: both schemes are teal (light = `#00303d`, dark = deeper `#001a23`); the main color (`--gold-main`) is gold `#f3ce3a` in light and near-white gray `#e4e6e7` in dark, and textures follow (button/tag grain and inset shadow are dark gold in light, gray in dark; non-color values such as grain images, masks and the skills icon filter `--icon-grain` are switched per scheme in the `:root` color-scheme block of `_variables.css`, since `light-dark()` only takes colors). In dark mode the button texture sits bottom-left (the lamp light comes from the top right); use the semantic tokens (`--primary-color`, `--accent-color`, `--accent-ink`, `--surface-color`, `--border-color`, `--shadow-color`, …) instead of hex values. Non-color light/dark branches use `@container style(--color-scheme: …)` as non-critical overrides. Buttons: `.btn--primary` (solid gold) for main actions, `.btn--ghost` (outline) only for secondary ones like the contact form submit. Footer and project cards use the same tokens as the page (no fixed gold).

**Seasonal effect.** `snow-effect.js` only activates Dec 12 – Jan 6.

**Motion & robustness.** Decorative motion (parallax, tilt, snow, sprite, greeting typing, smooth scroll, card flip, hover drift) only runs when the user has no reduced-motion preference: JS effects check `prefersReducedMotion()` from `helpers/motion.js`; CSS opts in with `@media (prefers-reduced-motion: no-preference)`. Content must be visible without JS: section entry and the header reveal are scroll-driven CSS animations behind `@supports`. Section entry (`layout/_section.css`) fades in an explicit list of small blocks (titles, paragraphs, accordions, cards, form…) over a fixed `animation-range: entry 0% entry 240px`, so it's visible while scrolling regardless of block height; add new blocks to that list instead of animating whole sections; `observer.js` only lazy-loads project images. Page-to-page navigations use a cross-document `@view-transition`.

**Project covers.** `assets/img/project_img/*.webp` are 560×700 (4:5, 2× the card) mobile screenshots of each live project, set in `_projects.css` by `nth-of-type` (card order matters). Projects with their own dark mode (CRUD, Traktl) also have `*-dark.webp`, swapped via `@container style(--color-scheme: dark)`. Don't set covers inline from JS, or the dark override stops working. They're lazy without JS-set URLs: every cover rule is prefixed with `:is(html:not(.js), .projects.is-near)` and `observer.js` adds `.is-near` to `#projects` when it gets within 400px of the viewport (keep the same prefix on new cover rules, including the dark ones, so specificity stays equal).

**Skills section.** `#skills` starts with Development Tools as an infinite left-to-right row (`.skills__group--marquee`): its `.skills__group-header` puts the title centered and the `.skills__motion-toggle` pause button on the right (WCAG 2.2.2, `helpers/skills_marquee.js`, hidden with reduced motion). `.skills__track` holds 4 copies of the `<ul class="skills__list">` (only the first is accessible, the rest `aria-hidden`) and animates `translate: -50% → 0` over `--marquee-duration`; when adding a dev tool, add it to all 4 copies. Design, Frontend and Backend are native `<details class="skills__accordion">` (work without JS): the `<summary>` reuses `.btn .btn--ghost`, the panel `.skills__grid` is a static icon grid in a box with the same outline + hard shadow; Soft Skills are a brick wall (6-column grid, bricks span 2, second course offset by half a brick with decorative half bricks from the container's `::before`/`::after`); height animates via `::details-content` + `interpolate-size` where supported. Icons are SVG `<symbol>`s, one source file per tech in `assets/img/skills/`, merged by `build-i18n.mjs` into the generated sprite `assets/img/skills.svg` (one request; the markup uses `<use href="/assets/img/skills.svg?v=<hash>#iconX">`, the generator rewrites the `?v=` content hash (so a cached old sprite never hides new icons) and fails on unknown ids; optimize new icon files first with `npx svgo --config scripts/svgo.config.mjs <file>`, which keeps ids and hidden elements) (newer ones from Simple Icons, CC0) and get a grainy inner shadow from every edge inward via `filter: url(#grain-inset)` (inline SVG filter at the top of `<body>` in `index.html`).

**Fonts.** Text follows the system text size (all sizes in rem; `<meta name="text-scale" content="scale">` for Android/Chrome, `font: -apple-system-body` on `html` for iOS Dynamic Type; never set a px root font-size). On mobile the hero is one screen tall: text takes what it needs and the portrait row (`minmax(7rem, 1fr)`) shrinks to the leftover space; About is centered under the navbar with a portrait capped by `svh`. Icons and button paddings use px caps so they don't grow with text. Text uses DM Sans (`--primary-font`, variable 100–1000 with opsz axis), headings (`h1`–`h6`, `.project-pager__title`) use Outfit (`--title-font`, variable 100–900), and the logo name and loader are **always Poppins** (`--brand-font`, weights 200/300/500/600, latin only). Always self-hosted (downloaded woff2, never Google Fonts / unpkg): woff2 in `assets/fonts/{dm-sans,outfit,poppins}/` declared in `base/_fonts.css`, and Boxicons (subset, see Icons above) in `assets/fonts/boxicons/` with its CSS in `assets/css/vendor/boxicons.min.css`, bundled at the end of `main.css`. Pages preload the most used files.

**Hero images.** The LCP is the portrait background `profile_bg.svg` (a CSS background, so `index.html` preloads it with `fetchpriority="high"`). Its noise texture is embedded as a small WebP (500 px, 4 tones) because an SVG used as a CSS image can't load external files. The page grain (`.bgGrain`) is a seamless 256×256 tile of independent random dots (`bgGrain-tile.webp`, same density as the original grain; an SVG noise was too fine to see on phones), fixed from the top of the viewport (so no grainless band shows while the navbar is hidden), fading out from just below the navbar; its long top-to-bottom fade lives in the `--grain-fade` mask.

**Icon font.** Boxicons opts out in `_base.css`, otherwise every icon renders ~55% of its size.

**Hanging lamp** (`helpers/lamp.js`, `layout/_lamp.css`): theme switch that hangs below the navbar (desktop: centered in the right margin, replaces the moon/sun toggle; mobile: only shown inside the open hamburger menu, which has no moon/sun; it drops in with a bounce once the panel has opened, left of the close X). Lit = dark mode. States: hover (`lamp__over`), pressing (`lamp--pulling`, chain pulled), on (`lamp__on`); images in `assets/img/lamp_button/`. A mouse/touch click blurs it (no focus ring after pressing a key). On touch devices it swings like a pendulum with the gyroscope (`tilt.js` + spring in `lamp.js`, angle in `--lamp-tilt` on `<html>`). In dark mode the open mobile menu gets a halo of the lamp's light color (`.navbar__menu::before` in `_header.css`): it appears with the lamp, follows its bungee/swing and rotates with `--lamp-tilt`.

**Mobile menu** (`helpers/nav_menu.js`, wired on home, resume and project pages): `.navbar__burger` toggles `.menu-open` on `.header` (with `aria-expanded`); the `#nav` panel drops just below the bar with the same subtle links as desktop and the burger morphs into an X. Closes on link click, Escape, outside click or when crossing to desktop. Without JS, `#nav:target` still opens it.

**Loader & greeting.** The loader (letters falling into the name) shows only on the first load of the session (`sessionStorage['aq-loaded']`, `.skip-loader` set in `<head>`) and never while prerendering. When it leaves, `html.hero-ready` is set and `helpers/typing.js` types the greeting letter by letter with a blinking underscore caret. The other language is prerendered with speculation rules so switching is near instant: `switchLanguages.js` inserts the rule on the first `pointerenter`/`focusin`/`touchstart` on the language toggle (intent), not on every visit.

**Hero copy (desktop).** `homeDescription` (intro; `*text*` in a translation renders as `<strong>`, in the generator and in `switchLanguages.js`) + `heroLines` (7 phrases of exactly 7 words, plain language for non-technical readers), rendered as one paragraph by `handleResponsiveContent`. Keep the 7×7 rule when editing.

**Section focus.** Sections carry `tabindex="-1"` so hash jumps move focus; `section[tabindex='-1']:focus { outline: none }` in `_base.css` hides the focus ring (Chrome Android drew white lines around the hero after `/es/#home`).

**Dialogs.** Native `<dialog>` opened with `showModal()`, `closedby="any"` for light dismiss (Safari fallback in `helpers/dialog.js`), named via `aria-labelledby`. The dialog box is the card; the dim/blur lives in `::backdrop`.

## SEO files

`sitemap.xml` (with `xhtml:link` hreflang alternates for `/`, `/es/` and the generated project pages), `robots.txt`, and the JSON-LD block in `index.html`'s `<head>` should be kept in sync with page/URL changes. `llms.txt` and `llms-full.txt` (profile for AI search engines and agents, EN + ES, with FAQ) are generated by `build-i18n.mjs` from `scripts/data/profile.mjs`, `projects.mjs` and `scripts/cv/data.mjs`; never edit them by hand. `robots.txt` explicitly allows AI crawlers and points to them. The JSON-LD block is marked `data-i18n-jsonld`; the generator merges `translations.meta[lang].jsonLd` into it.

## Netlify

`_redirects` (`/resume.html` → `/resume`) and `_headers` (security headers + moderate `Cache-Control` with `stale-while-revalidate`, since asset names aren't fingerprinted; replacing an image keeps its old version cached up to a day).

`reload_page.js` forces `#home` only on a manual reload or when there's no hash, so shared links like `/es/#contact` keep working.

## Conventions

- Commit messages use gitmoji + uppercase verb, e.g. `:bug: FIXED: ...`, `:mag: MODIFIED: ...`.
- All code is in English, comments included (JS, CSS, HTML, build scripts and the comments templates write into generated HTML). Only site content is Spanish (`translations.js` values, `scripts/data/`, `/es/` pages). READMEs exist in both languages (`README.md`, `README.es.md`).
