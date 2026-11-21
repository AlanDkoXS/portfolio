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

      // Touch: if the gesture is vertical it's let through (page scroll);
      // if it's horizontal, it moves the carousel. touch-action: pan-y in the CSS
      // keeps the browser from competing for the horizontal gesture.
      this.target.addEventListener("touchstart", (e) => {
        const start = e.touches[0];
        const sx = start.clientX;
        const sy = start.clientY;
        const t0 = performance.now();
        let mode = null; // null → not known yet; 'x' → carousel; 'y' → scroll
        let lastX = sx;
        handler = callback(e);

        const onMove = (ev) => {
          const t = ev.touches[0];
          if (!mode) {
            const dx = Math.abs(t.clientX - sx);
            const dy = Math.abs(t.clientY - sy);
            if (dx < 4 && dy < 4) return;
            // slight preference for horizontal (thumbs don't move in straight lines)
            mode = dx * 1.2 > dy ? "x" : "y";
          }
          if (mode === "x") {
            lastX = t.clientX;
            handler(ev);
          }
        };
        const clearDraggingEvent = () => {
          // Quick, short swipe (flick): advances one card even if it wasn't
          // dragged half a step
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

      // The position goes in transform (moved by the GPU, without recomputing
      // layout on every frame); left stays fixed at 50%
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

    // Desktop: there's room to extend the carousel out to the arrows
    isWide() {
      return this.container.offsetWidth >= 700;
    }

    calcScale(x) {
      // Only show cards that are close to the center
      if (Math.abs(x) > 2.5) {
        return 0; 
      }

      // Mobile: only the center card and one on each side; from 1 to 2 it fades out
      if (!this.isWide()) {
        const a = Math.abs(x);
        if (a >= 2) return 0;
        if (a > 1) return 0.8 * (2 - a);
      }

      // On desktop the side cards shrink less (0.88 and 0.52)
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

      // Position of the card's center (with translateX(-50%) in CSS), continuous
      // with respect to x so the drag slides without jumps
      const a = Math.abs(x);
      const sign = Math.sign(x);
      const W = this.container.offsetWidth;
      if (this.isWide()) {
        // Desktop: the edge cards reach close to the arrows, which sit at the
        // edges of the content (1024px). The in-between ones, halfway.
        const cardW = this.cards[0].offsetWidth;
        // margin + arrow + 2rem gap between the arrow and the card
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const arrowSpace = 16 + 48 + 2 * rem;
        const half = Math.min(W, 1024) / 2 - arrowSpace;
        const outer = half - (cardW * this.calcScale(2)) / 2;
        const inner = outer * 0.52;
        const off = a <= 1 ? inner * a : inner + (outer - inner) * Math.min(a - 1, 1);
        return 50 + (sign * off * 100) / W;
      }
      // Mobile: the side card peeks out fully in the free space on each side
      // (its outer edge touches the container's edge)
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

    // Drag distance equivalent to one card: 250px on desktop,
    // ~30% of the width on mobile (a short thumb movement is enough)
    dragStep() {
      return this.isWide() ? 250 : this.container.offsetWidth * 0.3;
    }

    moveCards(data) {
      let xDist;

      if (data != null) {
        // while dragging, no transition: the cards stick to the finger
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
