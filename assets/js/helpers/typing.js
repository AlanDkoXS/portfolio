// Saludo del hero "tecleado": aparece una letra a la vez y el cursor (guion
// bajo, en CSS) avanza detrás de la última letra. Al terminar el texto se
// queda y el cursor sigue parpadeando. Con "reducir movimiento" se muestra
// completo de inmediato.
import { prefersReducedMotion } from './motion.js';

const BASE_DELAY = 110; // ms por letra
const JITTER = 70; // variación para que parezca tecleo humano

export function typeGreeting() {
  const title = document.querySelector('.home__title');
  if (!title || title.dataset.typed) return;
  title.dataset.typed = 'true';

  const text = title.textContent.trim();
  if (prefersReducedMotion() || !text) return;

  // Letras visibles (un emoji compuesto cuenta como una sola)
  const letters = 'Segmenter' in Intl
    ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((s) => s.segment)
    : [...text];

  title.setAttribute('aria-label', text); // lectores de pantalla: texto completo
  title.classList.add('is-typing');
  let i = 0;
  title.textContent = '';

  const step = () => {
    i += 1;
    title.textContent = letters.slice(0, i).join('');
    if (i < letters.length) {
      setTimeout(step, BASE_DELAY + Math.random() * JITTER);
    } else {
      title.classList.remove('is-typing');
    }
  };
  setTimeout(step, 250);
}
