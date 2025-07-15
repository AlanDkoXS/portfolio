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
        speed: { x: 0.5, y: 0.1 },
        range: 10,
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
    autoMovementX: 0,
    autoMovementY: 0,
    lastX: 0,
    lastY: 0,
    lastMoveTime: 0,
    isMobile: false,
  },

  init() {
    this.elements = {
      back: document.querySelector('.bgBack'),
      middle: document.querySelector('.bgMiddle'),
      front: document.querySelector('.bgFront'),
    };

    if (!this.elements.back || !this.elements.middle || !this.elements.front) {
      console.warn('Not all the necessary elements for the parallax were found.');
      return;
    }

    this.state.isMobile = window.matchMedia('(max-width: 600px)').matches;
    this.setupEventListeners();
  },

  setupEventListeners() {
    if (this.state.isMobile) {
      this.setupMobileEvents();
    } else {
      this.setupDesktopEvents();
    }

    // Manejar cambios de tamaño de pantalla
    window.addEventListener('resize', () => {
      const wasMobile = this.state.isMobile;
      this.state.isMobile = window.matchMedia('(max-width: 600px)').matches;

      if (wasMobile !== this.state.isMobile) {
        this.resetPositions();
        this.setupEventListeners();
      }
    });
  },

  setupMobileEvents() {
    window.addEventListener('deviceorientation', (event) => {
      if (event.gamma === null || event.beta === null) return;
      this.updateLayersMobile(event.gamma, event.beta);
    });

    this.startAutoMovement();
  },

  setupDesktopEvents() {
    document.addEventListener('mousemove', (event) => {
      const deltaX = event.clientX - this.state.lastX;
      const deltaY = event.clientY - this.state.lastY;

      this.state.lastX = event.clientX;
      this.state.lastY = event.clientY;
      this.state.lastMoveTime = Date.now();

      this.updateLayersDesktop(deltaX, deltaY);
    });

    document.addEventListener('mouseleave', () => this.resetPositions());
  },

  updateLayersMobile(gamma, beta) {
    const { sensitivity } = this.config.mobile;
    const { autoMovementX, autoMovementY } = this.state;

    const transforms = {
      back: `translate(-50%, -50%) translate(${-gamma * sensitivity.back.x - autoMovementX}px, ${
        -beta * sensitivity.back.y - autoMovementY
      }px)`,
      middle: `translate(-50%, -50%) translate(${gamma * sensitivity.middle.x + autoMovementX}px, ${
        beta * sensitivity.middle.y + autoMovementY
      }px)`,
      front: `translate(-50%, -50%) translate(${-gamma * sensitivity.front.x + autoMovementX}px, ${
        -beta * sensitivity.front.y + autoMovementY
      }px)`,
    };

    Object.entries(transforms).forEach(([layer, transform]) => {
      this.elements[layer].style.transform = transform;
    });
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

  startAutoMovement() {
    if (!this.state.isMobile) return;

    const { speed, range } = this.config.mobile.autoMovement;

    setInterval(() => {
      this.state.autoMovementX += speed.x;
      this.state.autoMovementY += speed.y;

      if (Math.abs(this.state.autoMovementX) > range) {
        this.config.mobile.autoMovement.speed.x *= -1;
      }
      if (Math.abs(this.state.autoMovementY) > range) {
        this.config.mobile.autoMovement.speed.y *= -1;
      }

      this.updateLayersMobile(0, 0);
    }, 30);
  },

  resetPositions() {
    Object.values(this.elements).forEach((element) => {
      if (element) {
        element.style.transition = 'transform 0.5s ease';
        element.style.transform = 'translate(-50%, -50%)';
      }
    });
  },
};

export default ParallaxEffect;
