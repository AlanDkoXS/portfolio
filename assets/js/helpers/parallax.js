// parallax.js
const ParallaxEffect = {
  config: {
    mobile: {
      sensitivity: {
        back: { x: 4, y: 1 },
        middle: { x: 2.5, y: 0.5 },
        front: { x: 1.5, y: 0.3 },
      },
      autoMovement: {
        speed: { x: 0.5, y: 0.1 }, // px per frame (~60fps)
        range: 10,
      },
      maxTilt: 45, // degrees, clamps gamma/beta deltas
      smoothing: 0.15, // 0..1, lerp factor per frame
      recenter: {
        idleMs: 2000, // phone still this long → drift back to center
        motionThreshold: 1.5, // degrees of change that count as "moving"
        speed: 0.03, // 0..1, how fast the baseline catches up per frame
      },
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
    // tilt: raw sensor reading, baseline ("center") and smoothed value
    rawGamma: 0,
    rawBeta: 0,
    baseGamma: null, // calibrated from the first reading, then recentered
    baseBeta: null,
    gamma: 0,
    beta: 0,
    lastMotionTime: 0,
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
    window.addEventListener('deviceorientation', (e) => this.onOrientation(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseleave', () => {
      if (!this.state.isMobile) this.resetPositions();
    });
    this.mobileQuery.addEventListener('change', (e) => this.setMode(e.matches));

    this.requestIOSPermission();
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

  // iOS 13+ only fires deviceorientation after permission granted in a user gesture.
  requestIOSPermission() {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      return;
    }

    const ask = () => {
      DeviceOrientationEvent.requestPermission()
        .catch(() => 'denied')
        .finally(() => {
          document.removeEventListener('click', ask);
          document.removeEventListener('touchend', ask);
        });
    };

    document.addEventListener('click', ask);
    document.addEventListener('touchend', ask);
  },

  onOrientation(event) {
    if (!this.state.isMobile) return;
    if (event.gamma === null || event.beta === null) return;

    const s = this.state;
    const { motionThreshold } = this.config.mobile.recenter;

    // Tilt is relative to how the user holds the phone, not absolute.
    if (s.baseBeta === null) {
      s.baseGamma = event.gamma;
      s.baseBeta = event.beta;
      s.lastMotionTime = performance.now();
    }

    if (
      Math.abs(event.gamma - s.rawGamma) > motionThreshold ||
      Math.abs(event.beta - s.rawBeta) > motionThreshold
    ) {
      s.lastMotionTime = performance.now();
    }

    s.rawGamma = event.gamma;
    s.rawBeta = event.beta;
  },

  // After the phone has been still for idleMs, slide the baseline toward the
  // current reading so the layers return to center instead of staying offset.
  stepRecenter(now) {
    const s = this.state;
    if (s.baseBeta === null) return;

    const { idleMs, speed } = this.config.mobile.recenter;
    if (now - s.lastMotionTime < idleMs) return;

    s.baseGamma += (s.rawGamma - s.baseGamma) * speed;
    s.baseBeta += (s.rawBeta - s.baseBeta) * speed;
  },

  startLoop() {
    if (this.state.rafId !== null) return;

    const tick = (now) => {
      this.stepAutoMovement();
      this.stepRecenter(now);

      const s = this.state;
      const { smoothing: k, maxTilt } = this.config.mobile;
      const clamp = (v) => Math.max(-maxTilt, Math.min(maxTilt, v));

      const targetGamma = s.baseGamma === null ? 0 : clamp(s.rawGamma - s.baseGamma);
      const targetBeta = s.baseBeta === null ? 0 : clamp(s.rawBeta - s.baseBeta);

      s.gamma += (targetGamma - s.gamma) * k;
      s.beta += (targetBeta - s.beta) * k;

      this.updateLayersMobile(s.gamma, s.beta);
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
    const { sensitivity } = this.config.mobile;
    const { autoX, autoY } = this.state;

    const transforms = {
      back: `translate(-50%, -50%) translate(${-gamma * sensitivity.back.x - autoX}px, ${
        -beta * sensitivity.back.y - autoY
      }px)`,
      middle: `translate(-50%, -50%) translate(${gamma * sensitivity.middle.x + autoX}px, ${
        beta * sensitivity.middle.y + autoY
      }px)`,
      front: `translate(-50%, -50%) translate(${-gamma * sensitivity.front.x + autoX}px, ${
        -beta * sensitivity.front.y + autoY
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
