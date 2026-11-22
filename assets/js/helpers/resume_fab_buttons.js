import { setupDialog } from './dialog.js';

function handleScroll() {
  const fabButtons = document.querySelectorAll('.fab');
  const btnDownload = document.getElementById('btn-download');

  // Check that the elements exist
  if (!btnDownload || fabButtons.length === 0) {
    return;
  }

  // Use window.scrollY instead of the container's scroll
  const scrollTop = window.scrollY || 0;

  // Fixed at the bottom right; when the footer enters the screen, the button
  // moves up so it always stays above it with a gap
  const container = document.querySelector('.fab-container');
  const footer = document.querySelector('.footer');
  if (container && footer) {
    const GAP = 24;
    const bottomOffset = parseFloat(getComputedStyle(container).bottom) || 0;
    const overlap = window.innerHeight - footer.getBoundingClientRect().top - bottomOffset + GAP;
    container.style.translate = overlap > 0 ? `0 ${-overlap}px` : '';
  }

  // Expand the button when scrolling down
  const expanded = scrollTop > 20;
  fabButtons.forEach((button) => button.classList.toggle('expanded', expanded));
}

// The download button opens the modal with showModal() (listener in the inline
// module of resume.html). Esc, outside click (closedby="any") and the X
// button (form method="dialog") are handled by the native <dialog>.
// If there's free space below the PDF on the first screen (phone), the
// button is centered vertically between the PDF's edge and the bottom edge;
// if there's no space, it goes back to its CSS position (bottom: 4rem)
function placeFab() {
  const container = document.querySelector('.fab-container');
  const page = document.querySelector('#pdf-container canvas');
  if (!container) return;
  container.style.bottom = '';
  if (!page) return;
  const pdfBottom = page.getBoundingClientRect().bottom + window.scrollY;
  const space = window.innerHeight - pdfBottom;
  const fabHeight = container.offsetHeight;
  if (space >= fabHeight + 16) container.style.bottom = `${(space - fabHeight) / 2}px`;
  handleScroll();
}

function initFab() {
  setupDialog(document.getElementById('modal'));
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', placeFab);
  // The PDF is drawn later (pdf.js) and changes when the language changes
  const pdf = document.getElementById('pdf-container');
  if (pdf) new MutationObserver(placeFab).observe(pdf, { childList: true });
  placeFab();
}

export { initFab };
