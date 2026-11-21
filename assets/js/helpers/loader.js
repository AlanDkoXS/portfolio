// Loader (only on the first load of the session; see the script in <head>).
// Code characters fall from the top, settle and turn into
// "alanquintana"; once the page finishes loading they scatter and the
// hero appears. With "reduce motion" only the name appears and fades out.
import { prefersReducedMotion } from './motion.js';
import { typeGreeting } from './typing.js';

const loaderContainer = document.querySelector('.loader');

// Never make the visitor wait longer than this, even if some resource is slow
const MAX_WAIT_MS = 3000;
// Pause with the name already formed before scattering it
const HOLD_MS = 400;
const GLYPHS = ['{', '}', '<', '>', '/', '$', '@', '#', '&', '*', ';', '?', '=', '+', 'ñ', '3', '%', '[', ']', '_'];
const NAME = [
  ['alan', 'light'],
  ['quintana', 'semibold'],
];

const random = (min, max) => min + Math.random() * (max - min);

function buildName(word) {
  // Replaces the name's two <span>s with animatable letters. Returns a
  // promise that resolves when the last letter lands.
  let resolveDone;
  const done = new Promise((resolve) => (resolveDone = resolve));
  const total = NAME.reduce((n, [part]) => n + part.length, 0);
  let landed = 0;
  word.textContent = '';
  word.setAttribute('aria-label', 'alanquintana');
  let i = 0;
  for (const [part, weight] of NAME) {
    for (const char of part) {
      const span = document.createElement('span');
      span.className = `loader__char loader__char--${weight}`;
      span.setAttribute('aria-hidden', 'true');
      span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      span.style.setProperty('--i', i++);
      span.style.setProperty('--fx', `${random(-30, 30).toFixed(1)}vw`);
      span.style.setProperty('--fr', `${random(-120, 120).toFixed(0)}deg`);
      span.style.setProperty('--sx', `${random(-45, 45).toFixed(1)}vw`);
      span.style.setProperty('--sy', `${random(-40, 40).toFixed(1)}vh`);
      span.style.setProperty('--sr', `${random(-180, 180).toFixed(0)}deg`);
      // On landing, the symbol turns into the real letter
      span.addEventListener('animationend', (e) => {
        if (e.animationName !== 'loader-char-fall') return;
        span.textContent = char;
        if (++landed === total) resolveDone();
      });
      word.append(span);
    }
  }
  return done;
}

// Poppins 200/600 (preloaded from the <head>) and the logo (external <use>
// sprite). Capped at ASSETS_WAIT_MS: on a slow network the animation starts anyway.
const ASSETS_WAIT_MS = 1200;
function assetsReady() {
  const fonts = document.fonts
    ? Promise.all([document.fonts.load('200 1em Poppins'), document.fonts.load('600 1em Poppins')])
    : Promise.resolve();
  const logo = fetch('/assets/img/logo.svg').then((r) => r.blob());
  const timeout = new Promise((r) => setTimeout(r, ASSETS_WAIT_MS));
  return Promise.race([Promise.all([fonts, logo]), timeout]).catch(() => {});
}

function loader() {
  let done = false;

  // Already seen this session: the <head> hid it
  if (document.documentElement.classList.contains('skip-loader')) {
    document.documentElement.classList.add('hero-ready');
    typeGreeting();
    return;
  }

  const word = loaderContainer?.querySelector('.loader__name');
  const animated = Boolean(word) && !prefersReducedMotion();
  // The logo and the name are shown (and the animation starts) once the
  // typeface and the logo have loaded; meanwhile, only the background is visible
  const nameReady = assetsReady().then(() => {
    loaderContainer?.classList.add('loader--ready');
    if (!animated) return; // without animation, the name is already "ready"
    loaderContainer.classList.add('loader--animated');
    return buildName(word).then(() => new Promise((r) => setTimeout(r, HOLD_MS)));
  });

  const hide = () => {
    if (done) return;
    done = true;

    if (loaderContainer) {
      // The letters scatter toward the background while the loader fades out
      loaderContainer.classList.add('loader--hidden');
    }
    try {
      sessionStorage.setItem('aq-loaded', '1');
    } catch {
      /* no storage: the loader will show on every load */
    }

    // The greeting starts typing when the loader is already leaving
    setTimeout(() => {
      document.documentElement.classList.add('hero-ready');
      typeGreeting();
    }, 350);
  };

  // It hides when the page has loaded AND the name has finished forming
  // (the MAX_WAIT_MS cap still applies)
  const hideAfterMinimum = () => {
    nameReady.then(hide);
  };

  // main.js runs this at DOMContentLoaded, but with a warm cache `load`
  // may already have fired; in that case hide right away.
  if (document.readyState === 'complete') {
    hideAfterMinimum();
  } else {
    window.addEventListener('load', hideAfterMinimum, { once: true });
    setTimeout(hide, MAX_WAIT_MS);
  }
}

export default loader;
