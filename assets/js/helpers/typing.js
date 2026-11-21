// "Typed" hero greeting: one letter appears at a time and the caret
// (underscore, in CSS) advances behind the last letter. When done, the text
// stays and the caret keeps blinking. With "reduce motion" it's shown
// in full right away.
import { prefersReducedMotion } from './motion.js';

const BASE_DELAY = 110; // ms per letter
const JITTER = 70; // variation so it looks like human typing

export function typeGreeting() {
  const title = document.querySelector('.home__title');
  if (!title || title.dataset.typed) return;
  title.dataset.typed = 'true';

  const text = title.textContent.trim();
  if (prefersReducedMotion() || !text) return;

  // Visible letters (a compound emoji counts as one)
  const letters = 'Segmenter' in Intl
    ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((s) => s.segment)
    : [...text];

  title.setAttribute('aria-label', text); // screen readers: full text
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
