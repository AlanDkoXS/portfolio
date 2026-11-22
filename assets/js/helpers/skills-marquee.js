// Looping rows of technology icons (CSS in _skills.css).
// WCAG 2.2.2: the motion lasts more than 5 s, so there's a button to
// pause it. Only shown if there's animation (no "reduce motion").
import { prefersReducedMotion, reducedMotionQuery } from './motion.js';
import { trackScrollbarWidth } from './viewport.js';

export function skillsMarquee() {
  // The rows reach exactly from edge to edge (see --scrollbar-w in _skills.css)
  trackScrollbarWidth();

  const container = document.querySelector('.skills__icons');
  const toggle = container?.querySelector('.skills__motion-toggle');
  if (!container || !toggle || toggle.dataset.bound) return;
  toggle.dataset.bound = 'true';

  const icon = toggle.querySelector('i');
  const sync = () => {
    toggle.hidden = prefersReducedMotion();
    const paused = container.classList.contains('is-paused');
    icon?.classList.toggle('bx-pause', !paused);
    icon?.classList.toggle('bx-play', paused);
    // Tooltip matches the visible text for screen readers
    const label = toggle.querySelector(paused ? '.skills__motion-play' : '.skills__motion-pause');
    if (label) toggle.title = label.textContent.trim();
  };

  toggle.addEventListener('click', () => {
    container.classList.toggle('is-paused');
    sync();
  });
  reducedMotionQuery().addEventListener('change', sync);
  sync();
}
