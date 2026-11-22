// Projects carousel: the cards sit in numbered slots around the center one
// (slot 0, negative to the left). It moves with the arrow buttons, the
// keyboard (arrow keys on the controller link) and by dragging (mouse or touch).
const cardsContainer = document.querySelector('.project__card--carousel');
const cardsController = document.querySelector('.project__card--controller');

// Slots further than this from the center are hidden: scale 0, parked at the
// center and sent far back in z-index
const VISIBLE_RANGE = 2.5;
const HIDDEN_Z_INDEX = -100;
// Container width (px) from which there's room for the desktop layout
const WIDE_MIN_WIDTH = 700;

class DraggingEvent {
  #target;

  constructor(target = undefined) {
    this.#target = target;
  }

  #event(callback) {
    let handler;

    this.#target.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handler = callback(e);
      window.addEventListener('mousemove', handler);
      document.addEventListener('mouseleave', clearDraggingEvent);
      window.addEventListener('mouseup', clearDraggingEvent);

      function clearDraggingEvent() {
        window.removeEventListener('mousemove', handler);
        window.removeEventListener('mouseup', clearDraggingEvent);
        document.removeEventListener('mouseleave', clearDraggingEvent);
        handler(null);
      }
    });

    // Touch: if the gesture is vertical it's let through (page scroll);
    // if it's horizontal, it moves the carousel. touch-action: pan-y in the CSS
    // keeps the browser from competing for the horizontal gesture.
    this.#target.addEventListener(
      'touchstart',
      (e) => {
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
            mode = dx * 1.2 > dy ? 'x' : 'y';
          }
          if (mode === 'x') {
            lastX = t.clientX;
            handler(ev);
          }
        };
        const clearDraggingEvent = () => {
          // Quick, short swipe (flick): advances one card even if it wasn't
          // dragged half a step
          const dx = lastX - sx;
          const step = this.dragStep ? this.dragStep() : 250;
          if (mode === 'x' && Math.abs(dx) > 20 && Math.abs(dx) < step / 2 && performance.now() - t0 < 350) {
            handler({ touches: [{ clientX: sx + Math.sign(dx) * step * 0.6, clientY: sy }] });
          }
          window.removeEventListener('touchmove', onMove);
          window.removeEventListener('touchend', clearDraggingEvent);
          window.removeEventListener('touchcancel', clearDraggingEvent);
          handler(null);
        };
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', clearDraggingEvent);
        window.addEventListener('touchcancel', clearDraggingEvent);
      },
      { passive: true },
    );
  }

  // Calls back with the distance { x, y } dragged since the gesture started
  // on every move, and with null when it ends
  getDistance(callback) {
    const point = (e) => ('touches' in e ? e.touches[0] : e);

    function distanceInit(e1) {
      const { clientX: startingX, clientY: startingY } = point(e1);

      return function (e2) {
        if (e2 === null) return callback(null);
        const { clientX, clientY } = point(e2);
        return callback({ x: clientX - startingX, y: clientY - startingY });
      };
    }

    this.#event(distanceInit);
  }
}

class CardCarousel extends DraggingEvent {
  #container;
  #cards;
  #centerIndex;
  // Slot → card. A plain object on purpose: its key order (0, 1, 2… first,
  // then the negative slots as they were added) is the order the cards are
  // updated in
  #xScale = {};

  constructor(container, controller = undefined) {
    super(container);

    this.#container = container;
    this.#cards = container.querySelectorAll('.project__card');
    this.#centerIndex = Math.floor((this.#cards.length - 1) / 2);

    window.addEventListener('resize', () => this.#build());

    controller?.addEventListener('keydown', (e) => this.#onKeydown(e));

    this.#build();

    this.getDistance((data) => this.#moveCards(data));

    this.#setupNavigationButtons();
  }

  // Last slot to the right (the first one to the left is -centerIndex)
  get #maxIndex() {
    return this.#cards.length - 1 - this.#centerIndex;
  }

  #setupNavigationButtons() {
    const prevButton = document.querySelector('.project__nav--prev');
    const nextButton = document.querySelector('.project__nav--next');

    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => this.#navigate('prev'));
      nextButton.addEventListener('click', () => this.#navigate('next'));
    }
  }

  // Any other key re-applies the current layout (navigate without direction)
  #onKeydown(e) {
    const direction = e.key === 'ArrowRight' ? 'next' : e.key === 'ArrowLeft' ? 'prev' : undefined;
    this.#navigate(direction);
  }

  #build() {
    for (let i = 0; i < this.#cards.length; i++) {
      const x = i - this.#centerIndex;
      const layout = this.#layoutFor(x);

      this.#xScale[x] = this.#cards[i];

      this.#updateCard(this.#cards[i], { x, ...layout });
    }
  }

  // Scale, position (% of the container) and z-index of slot x; x is
  // fractional while dragging
  #layoutFor(x) {
    const scale = this.#calcScale(x);
    const leftPos = this.#calcPos(x);
    const zIndex = Math.abs(x) > VISIBLE_RANGE ? HIDDEN_Z_INDEX : -Math.abs(x);
    return { scale, leftPos, zIndex };
  }

  #updateCard(card, data) {
    if (!card) return;

    if (data.x !== undefined) {
      card.setAttribute('data-x', data.x);
    }

    // The position goes in transform (moved by the GPU, without recomputing
    // layout on every frame); left stays fixed at 50%
    if (data.scale !== undefined) card.dataset.scale = data.scale;
    if (data.leftPos !== undefined) card.dataset.pos = data.leftPos;
    const scale = card.dataset.scale ?? 1;
    const pos = card.dataset.pos ?? 50;
    const offset = ((pos - 50) / 100) * this.#container.offsetWidth;
    card.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${scale})`;
    if (data.scale !== undefined) card.style.opacity = data.scale === 0 ? 0 : 1;

    if (data.zIndex !== undefined) {
      card.classList.toggle('highlight', data.zIndex === 0);
      card.style.zIndex = data.zIndex;
    }
  }

  // Desktop: there's room to extend the carousel out to the arrows
  #isWide() {
    return this.#container.offsetWidth >= WIDE_MIN_WIDTH;
  }

  #calcScale(x) {
    // Only show cards that are close to the center
    if (Math.abs(x) > VISIBLE_RANGE) {
      return 0;
    }

    // Mobile: only the center card and one on each side; from 1 to 2 it fades out
    if (!this.#isWide()) {
      const a = Math.abs(x);
      if (a >= 2) return 0;
      if (a > 1) return 0.8 * (2 - a);
    }

    // On desktop the side cards shrink less (0.88 and 0.52)
    const k = this.#isWide() ? 0.12 : 1 / 5;
    const formula = 1 - k * x ** 2;
    return formula <= 0 ? 0 : formula;
  }

  #calcPos(x) {
    // If the card is too far from center (not visible), position it at center
    if (Math.abs(x) > VISIBLE_RANGE) {
      return 50; // Central position
    }

    // Position of the card's center (with translateX(-50%) in CSS), continuous
    // with respect to x so the drag slides without jumps
    const a = Math.abs(x);
    const sign = Math.sign(x);
    const W = this.#container.offsetWidth;
    if (this.#isWide()) {
      // Desktop: the edge cards reach close to the arrows, which sit at the
      // edges of the content (1024px). The in-between ones, halfway.
      const cardW = this.#cards[0].offsetWidth;
      // margin + arrow + 2rem gap between the arrow and the card
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const arrowSpace = 16 + 48 + 2 * rem;
      const half = Math.min(W, 1024) / 2 - arrowSpace;
      const outer = half - (cardW * this.#calcScale(2)) / 2;
      const inner = outer * 0.52;
      const off = a <= 1 ? inner * a : inner + (outer - inner) * Math.min(a - 1, 1);
      return 50 + (sign * off * 100) / W;
    }
    // Mobile: the side card peeks out fully in the free space on each side
    // (its outer edge touches the container's edge)
    const sideW = this.#cards[0].offsetWidth * 0.8;
    const innerPct = 50 - ((sideW / 2) * 100) / W;
    return 50 + sign * innerPct * a;
  }

  // Moves every card one slot: 'next' to the left, 'prev' to the right,
  // wrapping around the ends. Without a direction the cards stay in their
  // slots and only the layout is applied again.
  #navigate(direction) {
    const slots = { ...this.#xScale };
    const maxIndex = this.#maxIndex;

    for (const [key, card] of Object.entries(this.#xScale)) {
      const x = parseInt(key, 10);
      if (direction === 'next') {
        slots[x - 1 < -this.#centerIndex ? maxIndex : x - 1] = card;
      } else if (direction === 'prev') {
        slots[x + 1 > maxIndex ? -this.#centerIndex : x + 1] = card;
      }
    }

    this.#xScale = slots;

    for (const [key, card] of Object.entries(slots)) {
      const x = Number(key);
      this.#updateCard(card, { x, ...this.#layoutFor(x) });
    }
  }

  // Drag distance equivalent to one card: 250px on desktop,
  // ~30% of the width on mobile (a short thumb movement is enough).
  // Public: DraggingEvent reads it to size the flick.
  dragStep() {
    return this.#isWide() ? 250 : this.#container.offsetWidth * 0.3;
  }

  #moveCards(data) {
    let xDist;

    if (data != null) {
      // while dragging, no transition: the cards stick to the finger
      this.#container.classList.add('is-dragging');
      this.#container.classList.remove('smooth-return');
      xDist = data.x / this.dragStep();
    } else {
      this.#container.classList.remove('is-dragging');
      this.#container.classList.add('smooth-return');
      xDist = 0;

      for (const [key, card] of Object.entries(this.#xScale)) {
        const x = Number(key);
        this.#updateCard(card, {
          x,
          zIndex: Math.abs(Math.abs(x) - this.#centerIndex),
        });
      }
    }

    for (let i = 0; i < this.#cards.length; i++) {
      const x = this.#checkOrdering(this.#cards[i], parseInt(this.#cards[i].dataset.x, 10), xDist);
      const { scale, leftPos } = this.#layoutFor(x + xDist);

      this.#updateCard(this.#cards[i], { scale, leftPos });
    }
  }

  #checkOrdering(card, x, xDist) {
    const original = parseInt(card.dataset.x, 10);
    const rounded = Math.round(xDist);
    const maxIndex = this.#maxIndex;
    let newX = x;

    if (x !== x + rounded) {
      if (x + rounded > original) {
        if (x + rounded > maxIndex) {
          newX = x + rounded - 1 - maxIndex - rounded + -this.#centerIndex;
        }
      } else if (x + rounded < original) {
        if (x + rounded < -this.#centerIndex) {
          newX = x + rounded + 1 + this.#centerIndex - rounded + maxIndex;
        }
      }

      this.#xScale[newX + rounded] = card;
    }

    this.#updateCard(card, { zIndex: -Math.abs(newX + rounded) });

    return newX;
  }
}

export function cardCarousel() {
  if (cardsContainer) {
    new CardCarousel(cardsContainer, cardsController);
  }
}
