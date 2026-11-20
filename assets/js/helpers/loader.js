// Loader (solo en la primera carga de la sesión; ver script en <head>).
// Caracteres de código caen desde arriba, se acomodan y se convierten en
// "alanquintana"; al terminar de cargar la página se dispersan y aparece el
// hero. Con "reducir movimiento" solo aparece el nombre y se desvanece.
import { prefersReducedMotion } from './motion.js';
import { typeGreeting } from './typing.js';

const loaderContainer = document.querySelector('.loader');
const spriteImage = document.querySelector('.home__image');

// Nunca hacer esperar más que esto, aunque algún recurso tarde
const MAX_WAIT_MS = 3000;
// Pausa con el nombre ya formado antes de dispersarlo
const HOLD_MS = 400;
const GLYPHS = ['{', '}', '<', '>', '/', '$', '@', '#', '&', '*', ';', '?', '=', '+', 'ñ', '3', '%', '[', ']', '_'];
const NAME = [
  ['alan', 'light'],
  ['quintana', 'semibold'],
];

const random = (min, max) => min + Math.random() * (max - min);

function buildName(word) {
  // Reemplaza los dos <span> del nombre por letras animables. Devuelve una
  // promesa que se cumple cuando aterriza la última letra.
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
      // Al aterrizar, el símbolo se convierte en la letra real
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

function loader() {
  let done = false;

  // Ya se vio en esta sesión: el <head> lo ocultó; solo arrancar el sprite
  if (document.documentElement.classList.contains('skip-loader')) {
    spriteImage?.classList.add('animate');
    document.documentElement.classList.add('hero-ready');
    typeGreeting();
    return;
  }

  const word = loaderContainer?.querySelector('.loader__name');
  const animated = Boolean(word) && !prefersReducedMotion();
  // Sin animación, el nombre ya está "listo"
  let nameReady = Promise.resolve();
  if (animated) {
    nameReady = buildName(word).then(() => new Promise((r) => setTimeout(r, HOLD_MS)));
    loaderContainer.classList.add('loader--animated');
  }

  const hide = () => {
    if (done) return;
    done = true;

    if (loaderContainer) {
      // Las letras se dispersan hacia el fondo mientras el loader se desvanece
      loaderContainer.classList.add('loader--hidden');
    }
    try {
      sessionStorage.setItem('aq-loaded', '1');
    } catch {
      /* sin almacenamiento: el loader saldrá en cada carga */
    }

    // El saludo empieza a escribirse cuando el loader ya se está yendo
    setTimeout(() => {
      document.documentElement.classList.add('hero-ready');
      typeGreeting();
    }, 350);

    setTimeout(() => {
      spriteImage?.classList.add('animate');
    }, 500);
  };

  // Se oculta cuando la página cargó Y el nombre terminó de formarse
  // (el tope de MAX_WAIT_MS sigue aplicando)
  const hideAfterMinimum = () => {
    nameReady.then(hide);
  };

  // main.js awaits external scripts before calling this, so `load`
  // may already have fired; in that case hide right away.
  if (document.readyState === 'complete') {
    hideAfterMinimum();
  } else {
    window.addEventListener('load', hideAfterMinimum, { once: true });
    setTimeout(hide, MAX_WAIT_MS);
  }
}

export default loader;
