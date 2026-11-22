// Projects carousel: the cards sit in numbered slots around the center one
// (slot 0, negative to the left). It moves with the arrow buttons, the
// keyboard (arrow keys on the controller link) and by dragging (Pointer
// Events: mouse, touch or pen).
const cardsContainer = document.querySelector('.project__card--carousel');
const cardsController = document.querySelector('.project__card--controller');

// Slots further than this from the center are hidden: scale 0, parked at the
// center and sent far back in z-index
const VISIBLE_RANGE = 2.5;
const HIDDEN_Z_INDEX = -100;
// Container width (px) from which there's room for the desktop layout
const WIDE_MIN_WIDTH = 700;

// Touch: until the finger has moved this far (px) its direction isn't known;
// then a horizontal gesture drags the carousel and a vertical one is left to
// the page scroll (touch-action: pan-y in the CSS lets the browser take it)
const AXIS_SLOP = 4;
const HORIZONTAL_BIAS = 1.2; // slight preference for horizontal (thumbs don't move in straight lines)
// Touch flick: a quick (< FLICK_MS), short swipe (> FLICK_MIN_PX, under half
// a step) still advances one card, as if dragged FLICK_ADVANCE of a step
const FLICK_MIN_PX = 20;
const FLICK_MS = 350;
const FLICK_ADVANCE = 0.6;

class CardCarousel {
  #container;
  #cards;
  #centerIndex;
  // Slot → card. A plain object on purpose: its key order (0, 1, 2… first,
  // then the negative slots as they were added) is the order the cards are
  // updated in
  #xScale = {};

  // Sizes the layout needs (px). Read once when they can change (resize,
  // start of a gesture, navigation) instead of for every card on every move,
  // where each read forced a style/layout pass after the previous card's writes
  #width = 0; // container
  #cardWidth = 0;
  #rem = 16;

  // Gesture in progress: { pointerId, touch, startX, startY, lastX, t0, mode }
  #gesture = null;
  // Drag distance in steps waiting for the next frame, and that frame
  #pendingDist = null;
  #frame = 0;
  #onMove = (e) => this.#dragMove(e);
  #onEnd = (e) => this.#dragEnd(e);

  constructor(container, controller = undefined) {
    this.#container = container;
    this.#cards = container.querySelectorAll('.project__card');
    this.#centerIndex = Math.floor((this.#cards.length - 1) / 2);
    this.#measure();

    // A new container width lays the cards out again (and back in their
    // initial slots, as on a window resize before). The first card is
    // observed only to keep its width up to date (it eases on breakpoints).
    const resizes = new ResizeObserver((entries) => {
      const width = this.#width;
      this.#measure();
      if (entries.some((entry) => entry.target === container) && this.#width !== width) this.#build();
    });
    resizes.observe(container);
    if (this.#cards[0]) resizes.observe(this.#cards[0]);

    controller?.addEventListener('keydown', (e) => this.#onKeydown(e));

    this.#build();

    this.#setupDragging();

    this.#setupNavigationButtons();
  }

  #measure() {
    this.#width = this.#container.offsetWidth;
    this.#cardWidth = this.#cards[0]?.offsetWidth ?? 0;
    this.#rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
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
    const offset = ((pos - 50) / 100) * this.#width;
    card.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${scale})`;
    if (data.scale !== undefined) card.style.opacity = data.scale === 0 ? 0 : 1;

    if (data.zIndex !== undefined) {
      card.classList.toggle('highlight', data.zIndex === 0);
      card.style.zIndex = data.zIndex;
    }
  }

  // Desktop: there's room to extend the carousel out to the arrows
  #isWide() {
    return this.#width >= WIDE_MIN_WIDTH;
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
    const W = this.#width;
    if (this.#isWide()) {
      // Desktop: the edge cards reach close to the arrows, which sit at the
      // edges of the content (1024px). The in-between ones, halfway.
      const cardW = this.#cardWidth;
      // margin + arrow + 2rem gap between the arrow and the card
      const arrowSpace = 16 + 48 + 2 * this.#rem;
      const half = Math.min(W, 1024) / 2 - arrowSpace;
      const outer = half - (cardW * this.#calcScale(2)) / 2;
      const inner = outer * 0.52;
      const off = a <= 1 ? inner * a : inner + (outer - inner) * Math.min(a - 1, 1);
      return 50 + (sign * off * 100) / W;
    }
    // Mobile: the side card peeks out fully in the free space on each side
    // (its outer edge touches the container's edge)
    const sideW = this.#cardWidth * 0.8;
    const innerPct = 50 - ((sideW / 2) * 100) / W;
    return 50 + sign * innerPct * a;
  }

  // Moves every card one slot: 'next' to the left, 'prev' to the right,
  // wrapping around the ends. Without a direction the cards stay in their
  // slots and only the layout is applied again.
  #navigate(direction) {
    this.#measure();
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
  #dragStep() {
    return this.#isWide() ? 250 : this.#width * 0.3;
  }

  // ---- Dragging (Pointer Events)
  // One gesture at a time. While it lasts its moves and its end are listened
  // to on the window, so it keeps following the pointer outside the carousel.
  // (Not with setPointerCapture: the click that ends a press would then go to
  // the carousel instead of the card's link, and the links stop working.)
  #setupDragging() {
    // Mouse: no text selection, native image drag or focus change while
    // pressing on the carousel
    this.#container.addEventListener('mousedown', (e) => e.preventDefault());
    this.#container.addEventListener('pointerdown', (e) => this.#dragStart(e));
  }

  #dragStart(e) {
    if (this.#gesture) return;
    this.#measure();
    const touch = e.pointerType === 'touch';
    this.#gesture = {
      pointerId: e.pointerId,
      touch,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      t0: performance.now(),
      // null → direction not known yet; 'x' → carousel; 'y' → page scroll.
      // The mouse and the pen always drag
      mode: touch ? null : 'x',
    };
    window.addEventListener('pointermove', this.#onMove);
    window.addEventListener('pointerup', this.#onEnd);
    window.addEventListener('pointercancel', this.#onEnd);
  }

  #dragMove(e) {
    const g = this.#gesture;
    if (!g || e.pointerId !== g.pointerId) return;
    if (!g.mode) {
      const dx = Math.abs(e.clientX - g.startX);
      const dy = Math.abs(e.clientY - g.startY);
      if (dx < AXIS_SLOP && dy < AXIS_SLOP) return;
      g.mode = dx * HORIZONTAL_BIAS > dy ? 'x' : 'y';
    }
    if (g.mode !== 'x') return;
    g.lastX = e.clientX;
    this.#moveCards(e.clientX - g.startX);
  }

  // Released (or cancelled: the browser took the gesture for the page scroll)
  #dragEnd(e) {
    const g = this.#gesture;
    if (!g || e.pointerId !== g.pointerId) return;
    window.removeEventListener('pointermove', this.#onMove);
    window.removeEventListener('pointerup', this.#onEnd);
    window.removeEventListener('pointercancel', this.#onEnd);
    this.#gesture = null;

    // Quick, short swipe (flick): advances one card even if it wasn't
    // dragged half a step
    if (g.touch && g.mode === 'x') {
      const dx = g.lastX - g.startX;
      const step = this.#dragStep();
      if (Math.abs(dx) > FLICK_MIN_PX && Math.abs(dx) < step / 2 && performance.now() - g.t0 < FLICK_MS) {
        this.#moveCards(Math.sign(dx) * step * FLICK_ADVANCE);
      }
    }
    this.#release();
  }

  // While dragging: the cards follow the pointer, `dx` px from the start of
  // the gesture. The slots are reassigned right away (the release lands on
  // them); the styles of every card are written once per frame, for the
  // latest distance.
  #moveCards(dx) {
    const xDist = dx / this.#dragStep();
    for (const card of this.#cards) this.#reassignSlot(card, xDist);
    this.#pendingDist = xDist;
    this.#frame ||= requestAnimationFrame(() => this.#paintDrag());
  }

  #paintDrag() {
    this.#frame = 0;
    const xDist = this.#pendingDist;
    // while dragging, no transition: the cards stick to the finger
    this.#container.classList.add('is-dragging');
    this.#container.classList.remove('smooth-return');
    for (const card of this.#cards) {
      const x = this.#slotWhileDragging(card, xDist);
      this.#updateCard(card, { zIndex: -Math.abs(x + Math.round(xDist)) });
      const { scale, leftPos } = this.#layoutFor(x + xDist);
      this.#updateCard(card, { scale, leftPos });
    }
  }

  // End of a gesture: every card goes to the slot it was dragged to, with a
  // transition
  #release() {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    this.#container.classList.remove('is-dragging');
    this.#container.classList.add('smooth-return');

    for (const [key, card] of Object.entries(this.#xScale)) {
      const x = Number(key);
      this.#updateCard(card, {
        x,
        zIndex: Math.abs(Math.abs(x) - this.#centerIndex),
      });
    }

    for (const card of this.#cards) {
      const x = this.#slotWhileDragging(card, 0);
      this.#updateCard(card, { zIndex: -Math.abs(x) });
      const { scale, leftPos } = this.#layoutFor(x);
      this.#updateCard(card, { scale, leftPos });
    }
  }

  // Slot the card is drawn from while dragged `xDist` steps: its own slot
  // (data-x), wrapped to the other end when the drag pushes it past the last
  // slot on one side
  #slotWhileDragging(card, xDist) {
    const x = parseInt(card.dataset.x, 10);
    const rounded = Math.round(xDist);
    if (rounded > 0 && x + rounded > this.#maxIndex) return x - 1 - this.#maxIndex - this.#centerIndex;
    if (rounded < 0 && x + rounded < -this.#centerIndex) return x + 1 + this.#centerIndex + this.#maxIndex;
    return x;
  }

  // The card's slot once the drag is released: where it's drawn now
  #reassignSlot(card, xDist) {
    const rounded = Math.round(xDist);
    if (rounded !== 0) this.#xScale[this.#slotWhileDragging(card, xDist) + rounded] = card;
  }
}

export function cardCarousel() {
  if (cardsContainer) {
    new CardCarousel(cardsContainer, cardsController);
  }
}
