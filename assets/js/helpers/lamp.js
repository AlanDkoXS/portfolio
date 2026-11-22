// Hanging lamp: switches the theme (on desktop it replaces the moon/sun button;
// on mobile it only appears inside the open hamburger menu).
// On = dark mode, off = light mode. Visual states:
//   hover → "over" image · pressing → "clic" (chain pulled) · on → "active"
// On release the theme is switched using the same checkbox (auto-dark-mode.js).
import { prefersReducedMotion } from './motion.js';
import { desktopWidthQuery, isCoarsePointer, isMobileWidth, trackScrollbarWidth } from './viewport.js';

// Gyroscope (touch devices): the lamp hangs like a pendulum, so when the
// phone is tilted it stays vertical relative to the ground and, on screen,
// rotates the opposite way. A damped spring gives it a pendulum's swing.
// The angle goes in --lamp-tilt (on <html>): it's used by the lamp image and
// the menu halo (_lamp.css, _header.css).
const TILT_FACTOR = 0.5; // lamp degrees per degree of tilt
const MAX_ANGLE = 12; // degrees
const SPRING = 0.08; // stiffness
const DAMPING = 0.86; // damping (1 = no loss)

/**
 * Subscribes the lamp to the shared tilt (tilt.js, only downloaded on touch
 * devices). It's only drawn while the lamp is visible: always from 600px,
 * below that only inside the open menu. Hidden, it keeps swinging with the
 * frames the loop runs for other effects (or replays when it starts again),
 * but doesn't keep it running.
 * Returns the function that re-checks the visibility (lamp() calls it when the
 * menu opens or closes), or null without tilt.
 */
async function lampTilt(header) {
  if (!isCoarsePointer() || prefersReducedMotion()) return null;
  const { subscribeTilt } = await import('./tilt.js');
  const root = document.documentElement.style;
  let angle = 0;
  let velocity = 0;
  let last = null;
  const tilt = subscribeTilt(
    ({ gamma }, _now, visible) => {
      const target = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, -gamma * TILT_FACTOR));
      velocity = (velocity + (target - angle) * SPRING) * DAMPING;
      angle += velocity;
      // Only writes if the lamp is visible and the value changed (saves style work)
      const value = Math.abs(angle) < 0.05 ? 0 : Math.round(angle * 10) / 10;
      if (visible && value !== last) {
        root.setProperty('--lamp-tilt', `${value}deg`);
        last = value;
      }
    },
    { active: false, follow: true },
  );

  const wide = desktopWidthQuery();
  const sync = () => tilt.setActive(wide.matches || Boolean(header?.classList.contains('menu-open')));
  wide.addEventListener('change', sync);
  sync();
  return sync;
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
  // Restarts the swing (lamp-swing, _lamp.css) from its first frame. Already
  // swinging: the class is toggled as before and the running animation is
  // rewound with the Web Animations API (getAnimations only updates styles;
  // the old offsetWidth read forced a whole layout to restart it).
  const swing = () => {
    const wasSwinging = button.classList.contains('lamp--swing');
    button.classList.remove('lamp--swing');
    button.classList.add('lamp--swing');
    if (!wasSwinging) return;
    for (const animation of button.getAnimations({ subtree: true })) {
      if (animation.animationName === 'lamp-swing') animation.currentTime = 0;
    }
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
  // The same observer tells the lamp's gyroscope when it's shown or hidden.
  const header = document.querySelector('.header');
  let tiltVisibility = null;
  if (header) {
    let landTimer;
    let wasOpen = header.classList.contains('menu-open');
    new MutationObserver(() => {
      tiltVisibility?.();
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

  lampTilt(header)
    .then((sync) => (tiltVisibility = sync))
    .catch((error) => console.error('Error in lampTilt:', error));
}
