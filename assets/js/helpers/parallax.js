// Hero background parallax: three layers that follow the mouse on desktop and
// the device tilt (plus a slow automatic drift) on touch devices.
// tilt.js is only downloaded on touch devices (when touch mode starts).
import { prefersReducedMotion } from './motion.js';
import { coarsePointerQuery } from './viewport.js';

const CENTERED = 'translate(-50%, -50%)';

// Per layer, px moved per unit of input; the sign is the direction (the layers
// move against each other). `drift` is the share of the automatic drift.
const STRENGTH = {
  // Touch: px per degree of tilt (tilt is clamped to ±20°, see tilt.js)
  mobile: {
    back: { x: -1.5, y: -0.5, drift: -1 },
    middle: { x: 0.6, y: 0.2, drift: 0.45 },
    front: { x: -0.25, y: -0.08, drift: 0.2 },
  },
  // Mouse: px per px travelled between two mousemove events (no drift)
  desktop: {
    back: { x: -4, y: -1, drift: 0 },
    middle: { x: 2.5, y: 1.5, drift: 0 },
    front: { x: -1.5, y: 2, drift: 0 },
  },
};

const parallaxEffect = {
  config: {
    mobile: {
      autoMovement: {
        speed: { x: 0.25, y: 0.05 }, // px per frame (~60fps)
        range: 10,
      },
    },
  },

  elements: {
    back: null,
    middle: null,
    front: null,
  },

  state: {
    // auto movement
    autoX: 0,
    autoY: 0,
    autoSpeedX: 0,
    autoSpeedY: 0,
    // desktop
    lastX: 0,
    lastY: 0,
    // misc
    isMobile: false,
    tilt: null, // subscription to the shared tilt (tilt.js), touch mode only
    tiltWanted: false, // touch mode is on (the subscription may still be loading)
    tiltLoading: false,
    initialized: false,
  },

  init() {
    if (this.state.initialized) return;
    if (prefersReducedMotion()) return; // the background stays still

    this.elements = {
      back: document.querySelector('.bgBack'),
      middle: document.querySelector('.bgMiddle'),
      front: document.querySelector('.bgFront'),
    };

    if (!this.elements.back || !this.elements.middle || !this.elements.front) {
      return;
    }

    this.state.initialized = true;
    this.state.autoSpeedX = this.config.mobile.autoMovement.speed.x;
    this.state.autoSpeedY = this.config.mobile.autoMovement.speed.y;

    // Touch devices use tilt regardless of width (tablets, landscape phones)
    this.mobileQuery = coarsePointerQuery();
    this.state.isMobile = this.mobileQuery.matches;

    // Listeners are registered once; handlers check the current mode.
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseleave', () => {
      if (!this.state.isMobile) this.resetPositions();
    });
    this.mobileQuery.addEventListener('change', (e) => this.setMode(e.matches));

    this.setMode(this.state.isMobile);
  },

  setMode(isMobile) {
    this.state.isMobile = isMobile;
    this.resetPositions();

    if (isMobile) {
      // JS drives every frame on mobile; a CSS transition would fight it.
      this.setTransition('none');
      this.startLoop();
    } else {
      this.stopLoop();
      this.setTransition('');
    }
  },

  // Touch mode: every frame of the shared tilt loop moves the layers (tilt +
  // automatic drift). The loop doesn't run while the page is hidden.
  startLoop() {
    const s = this.state;
    s.tiltWanted = true;
    if (s.tilt) {
      s.tilt.setActive(true);
      return;
    }
    if (s.tiltLoading) return;
    s.tiltLoading = true;
    import('./tilt.js')
      .then(({ subscribeTilt }) => {
        s.tilt = subscribeTilt(
          ({ gamma, beta }) => {
            this.stepAutoMovement();
            this.applyTransforms(STRENGTH.mobile, gamma, beta, s.autoX, s.autoY);
          },
          { active: s.tiltWanted }, // back to mouse mode while it loaded
        );
      })
      .catch((error) => console.error('Error in parallaxEffect:', error))
      .finally(() => {
        s.tiltLoading = false;
      });
  },

  stopLoop() {
    this.state.tiltWanted = false;
    this.state.tilt?.setActive(false);
  },

  stepAutoMovement() {
    const { range } = this.config.mobile.autoMovement;
    const s = this.state;

    s.autoX += s.autoSpeedX;
    s.autoY += s.autoSpeedY;

    if (Math.abs(s.autoX) > range) s.autoSpeedX *= -1;
    if (Math.abs(s.autoY) > range) s.autoSpeedY *= -1;
  },

  onMouseMove(event) {
    if (this.state.isMobile) return;

    const deltaX = event.clientX - this.state.lastX;
    const deltaY = event.clientY - this.state.lastY;

    this.state.lastX = event.clientX;
    this.state.lastY = event.clientY;

    this.applyTransforms(STRENGTH.desktop, deltaX, deltaY);
  },

  // Moves every layer: (x, y) is the input (tilt in degrees or mouse travel
  // in px) and (driftX, driftY) the automatic drift, each scaled per layer
  applyTransforms(strength, x, y, driftX = 0, driftY = 0) {
    Object.entries(strength).forEach(([layer, k]) => {
      const offsetX = x * k.x + driftX * k.drift;
      const offsetY = y * k.y + driftY * k.drift;
      this.elements[layer].style.transform = `${CENTERED} translate(${offsetX}px, ${offsetY}px)`;
    });
  },

  setTransition(value) {
    Object.values(this.elements).forEach((element) => {
      if (element) element.style.transition = value;
    });
  },

  resetPositions() {
    Object.values(this.elements).forEach((element) => {
      if (element) element.style.transform = CENTERED;
    });
  },
};

export { parallaxEffect };
