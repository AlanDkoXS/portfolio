// Filas de íconos de tecnologías en bucle (CSS en _skills.css).
// WCAG 2.2.2: el movimiento dura más de 5 s, así que hay un botón para
// pausarlo. Solo se muestra si hay animación (sin "reducir movimiento").
import { prefersReducedMotion } from './motion.js';

// 100vw incluye la barra de scroll: se mide para que las filas lleguen
// exactamente de orilla a orilla (ver --scrollbar-w en _skills.css)
const setScrollbarWidth = () => {
  const width = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-w', `${width}px`);
};

export default function skillsMarquee() {
  setScrollbarWidth();
  window.addEventListener('resize', setScrollbarWidth);

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
    // Tooltip igual al texto visible para lectores de pantalla
    const label = toggle.querySelector(paused ? '.skills__motion-play' : '.skills__motion-pause');
    if (label) toggle.title = label.textContent.trim();
  };

  toggle.addEventListener('click', () => {
    container.classList.toggle('is-paused');
    sync();
  });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', sync);
  sync();
}
