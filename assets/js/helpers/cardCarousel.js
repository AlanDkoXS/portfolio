const cardsContainer = document.querySelector(".project__card--carousel");
const cardsController = document.querySelector(".project__card--controller");

export function cardCarousel() {
  class DraggingEvent {
    constructor(target = undefined) {
      this.target = target;
    }

    event(callback) {
      let handler;

      this.target.addEventListener("mousedown", (e) => {
        e.preventDefault();
        handler = callback(e);
        window.addEventListener("mousemove", handler);
        document.addEventListener("mouseleave", clearDraggingEvent);
        window.addEventListener("mouseup", clearDraggingEvent);

        function clearDraggingEvent() {
          window.removeEventListener("mousemove", handler);
          window.removeEventListener("mouseup", clearDraggingEvent);
          document.removeEventListener("mouseleave", clearDraggingEvent);
          handler(null);
        }
      });

      // Táctil: si el gesto es vertical se deja pasar (scroll de la página);
      // si es horizontal, mueve el carrusel. touch-action: pan-y en el CSS
      // hace que el navegador no compita por el gesto horizontal.
      this.target.addEventListener("touchstart", (e) => {
        const start = e.touches[0];
        const sx = start.clientX;
        const sy = start.clientY;
        const t0 = performance.now();
        let mode = null; // null → aún no se sabe; 'x' → carrusel; 'y' → scroll
        let lastX = sx;
        handler = callback(e);

        const onMove = (ev) => {
          const t = ev.touches[0];
          if (!mode) {
            const dx = Math.abs(t.clientX - sx);
            const dy = Math.abs(t.clientY - sy);
            if (dx < 4 && dy < 4) return;
            // ligera preferencia por el horizontal (los pulgares no van rectos)
            mode = dx * 1.2 > dy ? "x" : "y";
          }
          if (mode === "x") {
            lastX = t.clientX;
            handler(ev);
          }
        };
        const clearDraggingEvent = () => {
          // Deslizamiento rápido y corto (flick): avanza una tarjeta aunque no
          // se haya arrastrado la mitad del paso
          const dx = lastX - sx;
          const step = this.dragStep ? this.dragStep() : 250;
          if (mode === "x" && Math.abs(dx) > 20 && Math.abs(dx) < step / 2 && performance.now() - t0 < 350) {
            handler({ touches: [{ clientX: sx + Math.sign(dx) * step * 0.6, clientY: sy }] });
          }
          window.removeEventListener("touchmove", onMove);
          window.removeEventListener("touchend", clearDraggingEvent);
          window.removeEventListener("touchcancel", clearDraggingEvent);
          handler(null);
        };
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("touchend", clearDraggingEvent);
        window.addEventListener("touchcancel", clearDraggingEvent);
      }, { passive: true });
    }

    getDistance(callback) {
      function distanceInit(e1) {
        let startingX, startingY;

        if ("touches" in e1) {
          startingX = e1.touches[0].clientX;
          startingY = e1.touches[0].clientY;
        } else {
          startingX = e1.clientX;
          startingY = e1.clientY;
        }

        return function (e2) {
          if (e2 === null) {
            return callback(null);
          } else {
            if ("touches" in e2) {
              return callback({
                x: e2.touches[0].clientX - startingX,
                y: e2.touches[0].clientY - startingY,
              });
            } else {
              return callback({
                x: e2.clientX - startingX,
                y: e2.clientY - startingY,
              });
            }
          }
        };
      }

      this.event(distanceInit);
    }
  }

  class CardCarousel extends DraggingEvent {
    constructor(container, controller = undefined) {
      super(container);

      this.container = container;
      this.controllerElement = controller;
      this.cards = container.querySelectorAll(".project__card");
      this.centerIndex = Math.floor((this.cards.length - 1) / 2);
      this.cardWidth =
        (this.cards[0].offsetWidth / this.container.offsetWidth) * 100;
      this.xScale = {};

      window.addEventListener("resize", this.updateCardWidth.bind(this));

      if (this.controllerElement) {
        this.controllerElement.addEventListener(
          "keydown",
          this.controller.bind(this)
        );
      }

      this.build();

      super.getDistance(this.moveCards.bind(this));

      this.setupNavigationButtons();
    }

    setupNavigationButtons() {
      const prevButton = document.querySelector(".project__nav--prev");
      const nextButton = document.querySelector(".project__nav--next");

      if (prevButton && nextButton) {
        prevButton.addEventListener("click", () => {
          this.navigate("prev");
        });

        nextButton.addEventListener("click", () => {
          this.navigate("next");
        });
      }
    }

    updateCardWidth() {
      this.cardWidth =
        (this.cards[0].offsetWidth / this.container.offsetWidth) * 100;
      this.build();
    }

    build() {
      for (let i = 0; i < this.cards.length; i++) {
        const x = i - this.centerIndex;
        const scale = this.calcScale(x);
        const scale2 = this.calcScale2(x);
        const leftPos = this.calcPos(x, scale2);

        // Hidden cards go far back in z-index
        let zIndex;
        if (Math.abs(x) > 2.5) {
          zIndex = -100;
        } else {
          zIndex = -Math.abs(i - this.centerIndex);
        }

        this.xScale[x] = this.cards[i];

        this.updateCards(this.cards[i], {
          x: x,
          scale: scale,
          leftPos: leftPos,
          zIndex: zIndex,
        });
      }
    }

    updateCards(card, data) {
      if (!card) return;

      if (data.x !== undefined) {
        card.setAttribute("data-x", data.x);
      }

      // La posición va en transform (la mueve la GPU, sin recalcular el
      // diseño en cada cuadro); left se queda fijo en 50%
      if (data.scale !== undefined) card.dataset.scale = data.scale;
      if (data.leftPos !== undefined) card.dataset.pos = data.leftPos;
      const scale = card.dataset.scale ?? 1;
      const pos = card.dataset.pos ?? 50;
      const offset = ((pos - 50) / 100) * this.container.offsetWidth;
      card.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${scale})`;
      if (data.scale !== undefined) card.style.opacity = data.scale === 0 ? 0 : 1;

      if (data.zIndex !== undefined) {
        if (data.zIndex === 0) {
          card.classList.add("highlight");
        } else {
          card.classList.remove("highlight");
        }
        card.style.zIndex = data.zIndex;
      }
    }

    controller(e) {
      const temp = { ...this.xScale };
      const maxIndex = this.cards.length - 1 - this.centerIndex;

      if (e.keyCode === 39) {
        // Right arrow
        for (let x in this.xScale) {
          const newX =
            parseInt(x) - 1 < -this.centerIndex ? maxIndex : parseInt(x) - 1;
          temp[newX] = this.xScale[x];
        }
      }

      if (e.keyCode == 37) {
        // Left arrow
        for (let x in this.xScale) {
          const newX =
            parseInt(x) + 1 > maxIndex ? -this.centerIndex : parseInt(x) + 1;
          temp[newX] = this.xScale[x];
        }
      }

      this.xScale = temp;

      for (let x in temp) {
        const scale = this.calcScale(x);
        const scale2 = this.calcScale2(x);
        const leftPos = this.calcPos(x, scale2);

        // Use the same z-index logic as in build()
        let zIndex;
        if (Math.abs(x) > 2.5) {
          zIndex = -100; 
        } else {
          zIndex = -Math.abs(x);
        }

        this.updateCards(this.xScale[x], {
          x: x,
          scale: scale,
          leftPos: leftPos,
          zIndex: zIndex,
        });
      }
    }

    // Escritorio: hay espacio para extender el carrusel hasta las flechas
    isWide() {
      return this.container.offsetWidth >= 700;
    }

    calcScale(x) {
      // Only show cards that are close to the center
      if (Math.abs(x) > 2.5) {
        return 0; 
      }

      // Móvil: solo la central y una a cada lado; de 1 a 2 se desvanece
      if (!this.isWide()) {
        const a = Math.abs(x);
        if (a >= 2) return 0;
        if (a > 1) return 0.8 * (2 - a);
      }

      // En escritorio las laterales se encogen menos (0.88 y 0.52)
      const k = this.isWide() ? 0.12 : 1 / 5;
      const formula = 1 - k * Math.pow(x, 2);
      return formula <= 0 ? 0 : formula;
    }

    calcScale2(x) {
      let formula;
      if (x <= 0) {
        formula = 1 - (-1 / 6) * x;
      } else {
        formula = 1 - (1 / 6) * x;
      }
      return formula;
    }

    calcPos(x, scale) {
      // If the card is too far from center (not visible), position it at center
      if (Math.abs(x) > 2.5) {
        return 50; // Central position
      }

      // Posición del centro de la tarjeta (con translateX(-50%) en CSS), continua
      // respecto a x para que el arrastre se deslice sin saltos
      const a = Math.abs(x);
      const sign = Math.sign(x);
      const W = this.container.offsetWidth;
      if (this.isWide()) {
        // Escritorio: las de la orilla llegan cerca de las flechas, que están
        // en las orillas del contenido (1024px). Las intermedias, a la mitad.
        const cardW = this.cards[0].offsetWidth;
        // margen + flecha + 2rem de separación entre la flecha y la tarjeta
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const arrowSpace = 16 + 48 + 2 * rem;
        const half = Math.min(W, 1024) / 2 - arrowSpace;
        const outer = half - (cardW * this.calcScale(2)) / 2;
        const inner = outer * 0.52;
        const off = a <= 1 ? inner * a : inner + (outer - inner) * Math.min(a - 1, 1);
        return 50 + (sign * off * 100) / W;
      }
      // Móvil: la lateral asoma por completo en el espacio libre de cada lado
      // (su orilla exterior toca la orilla del contenedor)
      const sideW = this.cards[0].offsetWidth * 0.8;
      const innerPct = 50 - ((sideW / 2) * 100) / W;
      return 50 + sign * innerPct * a;
    }


    navigate(direction) {
      const temp = { ...this.xScale };
      const maxIndex = this.cards.length - 1 - this.centerIndex;

      if (direction === "next") {
        for (let x in this.xScale) {
          const newX =
            parseInt(x) - 1 < -this.centerIndex ? maxIndex : parseInt(x) - 1;
          temp[newX] = this.xScale[x];
        }
      } else if (direction === "prev") {
        for (let x in this.xScale) {
          const newX =
            parseInt(x) + 1 > maxIndex ? -this.centerIndex : parseInt(x) + 1;
          temp[newX] = this.xScale[x];
        }
      }

      this.xScale = temp;

      for (let x in temp) {
        const scale = this.calcScale(x);
        const scale2 = this.calcScale2(x);
        const leftPos = this.calcPos(x, scale2);

        // Use the same z-index logic as in build()
        let zIndex;
        if (Math.abs(x) > 2.5) {
          zIndex = -100; // Far back for hidden cards
        } else {
          zIndex = -Math.abs(x);
        }

        this.updateCards(this.xScale[x], {
          x: x,
          scale: scale,
          leftPos: leftPos,
          zIndex: zIndex,
        });
      }
    }

    // Distancia de arrastre que equivale a una tarjeta: 250px en escritorio,
    // ~30% del ancho en móvil (basta un movimiento corto del pulgar)
    dragStep() {
      return this.isWide() ? 250 : this.container.offsetWidth * 0.3;
    }

    moveCards(data) {
      let xDist;

      if (data != null) {
        // mientras se arrastra, sin transición: las tarjetas van pegadas al dedo
        this.container.classList.add("is-dragging");
        this.container.classList.remove("smooth-return");
        xDist = data.x / this.dragStep();
      } else {
        this.container.classList.remove("is-dragging");
        this.container.classList.add("smooth-return");
        xDist = 0;

        for (let x in this.xScale) {
          this.updateCards(this.xScale[x], {
            x: x,
            zIndex: Math.abs(Math.abs(x) - this.centerIndex),
          });
        }
      }

      for (let i = 0; i < this.cards.length; i++) {
        const x = this.checkOrdering(
          this.cards[i],
          parseInt(this.cards[i].dataset.x),
          xDist
        );
        const scale = this.calcScale(x + xDist);
        const scale2 = this.calcScale2(x + xDist);
        const leftPos = this.calcPos(x + xDist, scale2);

        this.updateCards(this.cards[i], {
          scale: scale,
          leftPos: leftPos,
        });
      }
    }

    checkOrdering(card, x, xDist) {
      const original = parseInt(card.dataset.x);
      const rounded = Math.round(xDist);
      const maxIndex = this.cards.length - 1 - this.centerIndex;
      let newX = x;

      if (x !== x + rounded) {
        if (x + rounded > original) {
          if (x + rounded > maxIndex) {
            newX = x + rounded - 1 - maxIndex - rounded + -this.centerIndex;
          }
        } else if (x + rounded < original) {
          if (x + rounded < -this.centerIndex) {
            newX = x + rounded + 1 + this.centerIndex - rounded + maxIndex;
          }
        }

        this.xScale[newX + rounded] = card;
      }

      const temp = -Math.abs(newX + rounded);
      this.updateCards(card, { zIndex: temp });

      return newX;
    }
  }

  // Initialize the card carousel
  if (cardsContainer) {
    new CardCarousel(cardsContainer, cardsController);
  }
}

export default cardCarousel;
