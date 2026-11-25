// "Typed" hero greeting: one letter appears at a time and the caret
// (underscore, in CSS) advances behind the last letter. When done, the text
// stays and the caret keeps blinking. With "reduce motion" it's shown
// in full right away.
import { prefersReducedMotion } from './motion.js';

const BASE_DELAY = 110; // ms per letter
const JITTER = 70; // variation so it looks like human typing

// Visible letters (a compound emoji counts as one)
const splitLetters = (text) =>
  'Segmenter' in Intl
    ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((s) => s.segment)
    : [...text];

export function typeGreeting() {
  const title = document.querySelector('.home__title');
  if (!title || title.dataset.typed) return;
  title.dataset.typed = 'true';

  let text = title.textContent.trim();
  if (prefersReducedMotion() || !text) return;

  let letters = splitLetters(text);
  let typing = true;

  title.setAttribute('aria-label', text); // screen readers: full text
  title.classList.add('is-typing');
  let i = 0;
  title.textContent = '';

  // In-place language switch (home): the switcher has just written the full
  // greeting in the new language. Follow it: the label always, and while
  // typing, keep typing the new text from the same position.
  window.addEventListener('languageChange', () => {
    text = title.textContent.trim();
    letters = splitLetters(text);
    title.setAttribute('aria-label', text);
    if (typing) title.textContent = letters.slice(0, i).join('');
  });

  const step = () => {
    i = Math.min(i + 1, letters.length);
    title.textContent = letters.slice(0, i).join('');
    if (i < letters.length) {
      setTimeout(step, BASE_DELAY + Math.random() * JITTER);
    } else {
      typing = false;
      title.classList.remove('is-typing');
    }
  };
  setTimeout(step, 250);
}
