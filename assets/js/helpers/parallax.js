// parallax.js
import { createTilt } from './tilt.js';
import { prefersReducedMotion } from './motion.js';

const ParallaxEffect = {
  config: {
    mobile: {
      // px per degree of tilt (tilt is clamped to ±20°, see tilt.js)
      sensitivity: {
        back: { x: 1.5, y: 0.5 },
        middle: { x: 0.6, y: 0.2 },
        front: { x: 0.25, y: 0.08 },
      },
      // fracción de la deriva automática por capa (antes iguales en middle/front)
      autoFactor: {
        back: 1,
        middle: 0.45,
        front: 0.2,
      },
      autoMovement: {
        speed: { x: 0.25, y: 0.05 }, // px per frame (~60fps)
        range: 10,
      },
      tilt: {}, // overrides for tilt.js defaults (maxTilt, smoothing, recenter)
    },
    desktop: {
      sensitivity: {
        back: { x: 4, y: 1 },
        middle: { x: 2.5, y: 1.5 },
        front: { x: 1.5, y: 2 },
      },
      resetDelay: 300,
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
    rafId: null,
    initialized: false,
  },

  init() {
    if (this.state.initialized) return;
    if (prefersReducedMotion()) return; // el fondo se queda quieto

    this.elements = {
      back: document.querySelector('.bgBack'),
      middle: document.querySelector('.bgMiddle'),
      front: document.querySelector('.bgFront'),
    };

    if (!this.elements.back || !this.elements.middle || !this.elements.front) {
      console.warn('Not all the necessary elements for the parallax were found.');
      return;
    }

    this.state.initialized = true;
    this.state.autoSpeedX = this.config.mobile.autoMovement.speed.x;
    this.state.autoSpeedY = this.config.mobile.autoMovement.speed.y;

    // Touch devices use tilt regardless of width (tablets, landscape phones)
    this.mobileQuery = window.matchMedia('(pointer: coarse)');
    this.state.isMobile = this.mobileQuery.matches;

    // Listeners are registered once; handlers check the current mode.
    this.tilt = createTilt(this.config.mobile.tilt);
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

  startLoop() {
    if (this.state.rafId !== null) return;

    const s = this.state;
    const tick = (now) => {
      this.stepAutoMovement();

      const { gamma, beta } = this.tilt.update(now);
      this.updateLayersMobile(gamma, beta);
      s.rafId = requestAnimationFrame(tick);
    };

    this.state.rafId = requestAnimationFrame(tick);
  },

  stopLoop() {
    if (this.state.rafId !== null) {
      cancelAnimationFrame(this.state.rafId);
      this.state.rafId = null;
    }
  },

  stepAutoMovement() {
    const { range } = this.config.mobile.autoMovement;
    const s = this.state;

    s.autoX += s.autoSpeedX;
    s.autoY += s.autoSpeedY;

    if (Math.abs(s.autoX) > range) s.autoSpeedX *= -1;
    if (Math.abs(s.autoY) > range) s.autoSpeedY *= -1;
  },

  updateLayersMobile(gamma, beta) {
    const { sensitivity, autoFactor: f } = this.config.mobile;
    const { autoX, autoY } = this.state;

    const transforms = {
      back: `translate(-50%, -50%) translate(${-gamma * sensitivity.back.x - autoX * f.back}px, ${
        -beta * sensitivity.back.y - autoY * f.back
      }px)`,
      middle: `translate(-50%, -50%) translate(${gamma * sensitivity.middle.x + autoX * f.middle}px, ${
        beta * sensitivity.middle.y + autoY * f.middle
      }px)`,
      front: `translate(-50%, -50%) translate(${-gamma * sensitivity.front.x + autoX * f.front}px, ${
        -beta * sensitivity.front.y + autoY * f.front
      }px)`,
    };

    Object.entries(transforms).forEach(([layer, transform]) => {
      this.elements[layer].style.transform = transform;
    });
  },

  onMouseMove(event) {
    if (this.state.isMobile) return;

    const deltaX = event.clientX - this.state.lastX;
    const deltaY = event.clientY - this.state.lastY;

    this.state.lastX = event.clientX;
    this.state.lastY = event.clientY;

    this.updateLayersDesktop(deltaX, deltaY);
  },

  updateLayersDesktop(deltaX, deltaY) {
    const { sensitivity } = this.config.desktop;

    const transforms = {
      back: `translate(-50%, -50%) translate(${-deltaX * sensitivity.back.x}px, ${
        -deltaY * sensitivity.back.y
      }px)`,
      middle: `translate(-50%, -50%) translate(${deltaX * sensitivity.middle.x}px, ${
        deltaY * sensitivity.middle.y
      }px)`,
      front: `translate(-50%, -50%) translate(${-deltaX * sensitivity.front.x}px, ${
        deltaY * sensitivity.front.y
      }px)`,
    };

    Object.entries(transforms).forEach(([layer, transform]) => {
      this.elements[layer].style.transform = transform;
    });
  },

  setTransition(value) {
    Object.values(this.elements).forEach((element) => {
      if (element) element.style.transition = value;
    });
  },

  resetPositions() {
    Object.values(this.elements).forEach((element) => {
      if (element) element.style.transform = 'translate(-50%, -50%)';
    });
  },
};

export default ParallaxEffect;
