// Hanging lamp: switches the theme (on desktop it replaces the moon/sun button;
// on mobile it only appears inside the open hamburger menu).
// On = dark mode, off = light mode. Visual states:
//   hover → "over" image · pressing → "clic" (chain pulled) · on → "active"
// On release the theme is switched using the same checkbox (auto-dark-mode.js).
import { createTilt } from './tilt.js';
import { prefersReducedMotion } from './motion.js';
import { isCoarsePointer, isMobileWidth, trackScrollbarWidth } from './viewport.js';

// Gyroscope (touch devices): the lamp hangs like a pendulum, so when the
// phone is tilted it stays vertical relative to the ground and, on screen,
// rotates the opposite way. A damped spring gives it a pendulum's swing.
// The angle goes in --lamp-tilt (on <html>): it's used by the lamp image and
// the menu halo (_lamp.css, _header.css).
const TILT_FACTOR = 0.5; // lamp degrees per degree of tilt
const MAX_ANGLE = 12; // degrees
const SPRING = 0.08; // stiffness
const DAMPING = 0.86; // damping (1 = no loss)
function lampTilt(button) {
  if (!isCoarsePointer() || prefersReducedMotion()) return;
  const tilt = createTilt();
  const root = document.documentElement.style;
  let angle = 0;
  let velocity = 0;
  let last = null;
  const tick = (now) => {
    const { gamma } = tilt.update(now);
    const target = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, -gamma * TILT_FACTOR));
    velocity = (velocity + (target - angle) * SPRING) * DAMPING;
    angle += velocity;
    // Only writes if the lamp is visible and the value changed (saves style work)
    const value = Math.abs(angle) < 0.05 ? 0 : Math.round(angle * 10) / 10;
    if (value !== last && button.checkVisibility?.({ visibilityProperty: true }) !== false) {
      root.setProperty('--lamp-tilt', `${value}deg`);
      last = value;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function lamp() {
  // The scrollbar width is needed to center the lamp properly (_lamp.css)
  trackScrollbarWidth();

  const button = document.querySelector('.lamp');
  const toggle = document.querySelector('.navbar__toggle--darkmode-input');
  if (!button || !toggle || button.dataset.bound) return;
  button.dataset.bound = 'true';

  const sync = () => {
    const on = document.body.getAttribute('data-theme') === 'dark';
    button.setAttribute('aria-pressed', String(on));
  };

  // true between the click and the theme switch: the chain stays pulled until
  // the theme changes (if it were released earlier, turning off looked off → on
  // → off)
  let switching = false;
  const pull = () => button.classList.add('lamp--pulling');
  const release = () => {
    if (!switching) button.classList.remove('lamp--pulling');
  };
  const swing = () => {
    button.classList.remove('lamp--swing');
    void button.offsetWidth; // restarts the animation
    button.classList.add('lamp--swing');
  };

  // Mouse/touch: the chain looks pulled while it's held down.
  // On touch devices pointerleave arrives right as the finger lifts (before the
  // click): it only counts if the mouse leaves with the button still pressed.
  button.addEventListener('pointerdown', pull);
  button.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && event.buttons) release();
  });
  button.addEventListener('pointercancel', release);
  // Released outside the lamp (no click happened): the chain goes back. The click,
  // if any, arrives before this timeout and leaves switching as true.
  window.addEventListener('pointerup', () => setTimeout(release, 0));

  button.addEventListener('click', (event) => {
    if (switching) return; // quick double click: a single switch
    switching = true;
    // Keyboard (Enter/Space) doesn't go through pointerdown: show the pull for a moment
    const fromKeyboard = event.detail === 0;
    // With mouse/finger, focus is dropped: otherwise, pressing any key
    // afterwards (Shift, arrows to scroll) makes Chrome switch to :focus-visible
    // and the focus ring appears around the lamp. With the keyboard it's
    // kept (it's needed to see where the focus is).
    if (!fromKeyboard) button.blur();
    pull();
    setTimeout(() => {
      toggle.click();
      switching = false;
      release();
      sync();
      // When the chain is released the lamp swings (touch devices have no hover)
      swing();
    }, fromKeyboard ? 160 : 90);
  });
  // Mobile: when the menu opens the lamp drops like a bungee (CSS, 0.25s delay
  // + 1.1s); on reaching the bottom it swings just like when the chain is pulled
  const header = document.querySelector('.header');
  if (header) {
    let landTimer;
    let wasOpen = header.classList.contains('menu-open');
    new MutationObserver(() => {
      const open = header.classList.contains('menu-open');
      if (open === wasOpen) return;
      wasOpen = open;
      clearTimeout(landTimer);
      if (!open || !isMobileWidth()) return;
      // when the cord stretches at the end of the drop
      landTimer = setTimeout(swing, 250 + 1100 * 0.42);
    }).observe(header, { attributes: true, attributeFilter: ['class'] });
  }

  button.addEventListener('animationend', (event) => {
    if (event.animationName === 'lamp-swing') button.classList.remove('lamp--swing');
  });

  // The theme can also change via the system or from another tab
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  sync();

  lampTilt(button);
}
