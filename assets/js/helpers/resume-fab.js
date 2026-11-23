import { setupDialog } from './dialog.js';
import { mobileWidthQuery } from './viewport.js';

// Floating download button of the resume page.
// - Desktop: fixed at the bottom right, expanded (with its label) once the
//   page is scrolled, and pushed up so it always stays above the footer with
//   a gap.
// - Mobile (width < 600px): it floats over the blank bottom-right corner of
//   the CV page. It stays fixed on screen where it first appeared while the CV
//   scrolls under it, rising only to stay above the footer; anchored by its
//   right side so it expands to the left, and it only expands once it's on
//   screen.
const GAP = 24; // px between the button and the footer (desktop)
const EXPAND_AFTER = 20; // px of scroll
const FAB_INSET = 14; // mobile: px from the CV page's edges
const FAB_SCREEN_GAP = 16; // mobile: px from the bottom of the screen / the footer's top

// Geometry the scroll handler needs, read only when it can change (the footer
// gets near, the page or the viewport changes size, the PDF is drawn): the
// scroll handler itself reads no layout, it only does arithmetic with scrollY
const geometry = {
  footerTop: Infinity, // the footer's top, in page coordinates
  bottomOffset: 0, // the container's computed `bottom` (px)
  footerNear: false, // the footer is within GAP px of the viewport (IntersectionObserver)
  // Mobile
  fabHeight: 0, // the container's height
  buttonBottom: 0, // the download button's bottom, from the container's top
  restingTop: 0, // the container's top (viewport) at its CSS position (no PDF yet)
  pageRight: 0, // space between the CV page's right edge and the viewport's
};

const mobileQuery = mobileWidthQuery();

let container = null;
let footer = null;
let downloadButton = null;
let fabButtons = [];
let page = null; // the CV page (canvas drawn by pdf-loader.js)
let fixedTop = null; // mobile: where it stays (viewport top) while the CV scrolls under it
let frame = 0;

function measure() {
  if (!container) return;
  const containerRect = container.getBoundingClientRect();
  geometry.bottomOffset = parseFloat(getComputedStyle(container).bottom) || 0;
  geometry.footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : Infinity;
  geometry.fabHeight = container.offsetHeight;
  geometry.buttonBottom = downloadButton.getBoundingClientRect().bottom - containerRect.top;
  geometry.restingTop = containerRect.top;
  geometry.pageRight = page ? document.documentElement.clientWidth - page.getBoundingClientRect().right : 0;
}

// Mobile: fixed where it first appeared; it only rises to stay above the
// footer. Returns the container's top (viewport coordinates).
function positionMobileFab(scrollTop) {
  const footerTop = geometry.footerTop - scrollTop;
  const top = Math.min(fixedTop, footerTop - geometry.fabHeight - FAB_SCREEN_GAP);
  container.style.top = `${top}px`;
  container.style.right = `${geometry.pageRight + FAB_INSET}px`;
  container.style.bottom = 'auto';
  return top;
}

// Same styles and classes as computing them from the layout on every scroll
function apply() {
  frame = 0;
  if (!container) return;
  const scrollTop = window.scrollY || 0;
  const mobile = mobileQuery.matches;

  // On mobile the button sits over the end of the CV, so it also waits until
  // it's on screen to expand
  let onScreen = true;
  if (mobile) {
    const top = page && fixedTop !== null ? positionMobileFab(scrollTop) : geometry.restingTop;
    onScreen = top + geometry.buttonBottom <= window.innerHeight;
  } else if (footer) {
    // overlap > 0: the footer's top is above the button's bottom + the gap
    const overlap = geometry.footerNear
      ? window.innerHeight - (geometry.footerTop - scrollTop) - geometry.bottomOffset + GAP
      : 0;
    container.style.translate = overlap > 0 ? `0 ${-overlap}px` : '';
  }

  // Expand the button when scrolling down
  const expanded = scrollTop > EXPAND_AFTER && onScreen;
  fabButtons.forEach((button) => button.classList.toggle('expanded', expanded));
}

// At most once per frame, whatever the number of scroll events
const onScroll = () => {
  frame ||= requestAnimationFrame(apply);
};

// Starting position, recomputed when the viewport changes size or the PDF is
// drawn. Mobile: the blank bottom-right corner of the CV page as seen at the
// top of the page, or the bottom of the screen if the CV is taller.
// Desktop: if there's free space below the PDF on the first screen, the
// button is centered vertically between the PDF's edge and the bottom edge;
// if there's no space, it goes back to its CSS position (bottom: 4rem).
// The download button opens the modal with showModal() (listener in the inline
// module of resume.html). Esc, outside click (closedby="any") and the X
// button (form method="dialog") are handled by the native <dialog>.
function placeFab() {
  if (!container) return;
  page = document.querySelector('#pdf-container canvas');
  container.style.bottom = '';
  container.style.top = '';
  container.style.right = '';
  container.style.translate = '';

  if (mobileQuery.matches) {
    if (page) {
      const height = container.offsetHeight;
      const cornerAtTop = page.getBoundingClientRect().bottom + window.scrollY - height - FAB_INSET;
      fixedTop = Math.min(cornerAtTop, window.innerHeight - height - FAB_SCREEN_GAP);
    }
  } else {
    fixedTop = null;
    if (page) {
      const pdfBottom = page.getBoundingClientRect().bottom + window.scrollY;
      const space = window.innerHeight - pdfBottom;
      const fabHeight = container.offsetHeight;
      if (space >= fabHeight + 16) container.style.bottom = `${(space - fabHeight) / 2}px`;
    }
  }
  measure();
  apply();
}

function initFab() {
  setupDialog(document.getElementById('modal'));

  container = document.querySelector('.resume-fab');
  footer = document.querySelector('.footer');
  downloadButton = document.getElementById('btn-download');
  fabButtons = [...document.querySelectorAll('.resume-fab__button')];
  // Check that the elements exist
  if (!downloadButton || fabButtons.length === 0) return;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', placeFab);
  // The PDF is drawn later (pdf.js) and changes when the language changes
  const pdf = document.getElementById('pdf-container');
  if (pdf) new MutationObserver(placeFab).observe(pdf, { childList: true });

  if (footer) {
    new IntersectionObserver(
      ([entry]) => {
        geometry.footerNear = entry.isIntersecting;
        measure();
        apply();
      },
      { rootMargin: `0px 0px ${GAP}px 0px` },
    ).observe(footer);
  }
  // Anything that moves the footer or the CV page (fonts, images, the
  // scrollbar…) changes the page size
  new ResizeObserver(() => {
    measure();
    apply();
  }).observe(document.body);
  placeFab();
}

export { initFab };
