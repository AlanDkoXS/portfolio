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

      this.target.addEventListener("touchstart", (e) => {
        handler = callback(e);
        window.addEventListener("touchmove", handler);
        window.addEventListener("touchend", clearDraggingEvent);
        document.body.addEventListener("mouseleave", clearDraggingEvent);

        function clearDraggingEvent() {
          window.removeEventListener("touchmove", handler);
          window.removeEventListener("touchend", clearDraggingEvent);
          handler(null);
        }
      });
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

      // Keep base transformation for centering
      let transformValue = "translateX(-50%)";

      // Add scale if defined
      if (data.scale !== undefined) {
        transformValue += ` scale(${data.scale})`;
        // Adjust opacity
        card.style.opacity = data.scale === 0 ? 0 : 1;
      }

      // Apply transformation
      card.style.transform = transformValue;

      if (data.leftPos !== undefined) {
        card.style.left = `${data.leftPos}%`;
      }

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

    calcScale(x) {
      // Only show cards that are close to the center
      if (Math.abs(x) > 2.5) {
        return 0; 
      }

      const formula = 1 - (1 / 5) * Math.pow(x, 2);
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

      let formula;
      if (x < 0) {
        formula = (scale * 100 - this.cardWidth) / 2;
      } else if (x > 0) {
        formula = 100 - (scale * 100 + this.cardWidth) / 2;
      } else {
        formula = 100 - (scale * 100 + this.cardWidth) / 2;
      }
      return formula;
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

    moveCards(data) {
      let xDist;

      if (data != null) {
        this.container.classList.remove("smooth-return");
        xDist = data.x / 250;
      } else {
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
