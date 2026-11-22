import { setupDialog } from './dialog.js';

// Floating download button of the resume page: fixed at the bottom right,
// expanded (with its label) once the page is scrolled, and pushed up so it
// always stays above the footer with a gap.
const GAP = 24; // px between the button and the footer
const EXPAND_AFTER = 20; // px of scroll

// Geometry the scroll handler needs, read only when it can change (the footer
// gets near, the page or the viewport changes size, the PDF is drawn): the
// scroll handler itself reads no layout, it only does arithmetic with scrollY
const geometry = {
  footerTop: 0, // the footer's top, in page coordinates
  bottomOffset: 0, // the container's computed `bottom` (px)
  footerNear: false, // the footer is within GAP px of the viewport (IntersectionObserver)
};

let container = null;
let footer = null;
let fabButtons = [];
let frame = 0;

function measure() {
  if (!container || !footer) return;
  geometry.bottomOffset = parseFloat(getComputedStyle(container).bottom) || 0;
  geometry.footerTop = footer.getBoundingClientRect().top + window.scrollY;
}

// Same classes and translate as computing them from the layout on every scroll
function apply() {
  frame = 0;
  const scrollTop = window.scrollY || 0;

  if (container && footer) {
    // overlap > 0: the footer's top is above the button's bottom + the gap
    const overlap = geometry.footerNear
      ? window.innerHeight - (geometry.footerTop - scrollTop) - geometry.bottomOffset + GAP
      : 0;
    container.style.translate = overlap > 0 ? `0 ${-overlap}px` : '';
  }

  // Expand the button when scrolling down
  const expanded = scrollTop > EXPAND_AFTER;
  fabButtons.forEach((button) => button.classList.toggle('expanded', expanded));
}

// At most once per frame, whatever the number of scroll events
const onScroll = () => {
  frame ||= requestAnimationFrame(apply);
};

// The download button opens the modal with showModal() (listener in the inline
// module of resume.html). Esc, outside click (closedby="any") and the X
// button (form method="dialog") are handled by the native <dialog>.
// If there's free space below the PDF on the first screen (phone), the
// button is centered vertically between the PDF's edge and the bottom edge;
// if there's no space, it goes back to its CSS position (bottom: 4rem)
function placeFab() {
  const page = document.querySelector('#pdf-container canvas');
  if (!container) return;
  container.style.bottom = '';
  if (page) {
    const pdfBottom = page.getBoundingClientRect().bottom + window.scrollY;
    const space = window.innerHeight - pdfBottom;
    const fabHeight = container.offsetHeight;
    if (space >= fabHeight + 16) container.style.bottom = `${(space - fabHeight) / 2}px`;
  }
  measure();
  apply();
}

function initFab() {
  setupDialog(document.getElementById('modal'));

  container = document.querySelector('.fab-container');
  footer = document.querySelector('.footer');
  fabButtons = [...document.querySelectorAll('.fab')];
  // Check that the elements exist
  if (!document.getElementById('btn-download') || fabButtons.length === 0) return;

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
    // Anything that moves the footer (fonts, images…) changes the page height
    new ResizeObserver(() => {
      measure();
      apply();
    }).observe(document.body);
  }
  placeFab();
}

export { initFab };
