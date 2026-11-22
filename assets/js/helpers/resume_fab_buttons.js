import { setupDialog } from './dialog.js';

// Mobile (max-width: 599px): the button floats over the CV's bottom-right corner
const isMobile = () => window.matchMedia('(max-width: 599px)').matches;

function handleScroll() {
  const fabButtons = document.querySelectorAll('.fab');
  const btnDownload = document.getElementById('btn-download');

  // Validar que los elementos existen
  if (!btnDownload || fabButtons.length === 0) {
    return;
  }

  // Usar window.scrollY en lugar del scroll del contenedor
  const scrollTop = window.scrollY || 0;

  // Fijo abajo a la derecha; cuando el footer entra en pantalla, el botón sube
  // para quedar siempre por encima de él con un espacio
  const container = document.querySelector('.fab-container');
  const footer = document.querySelector('.footer');
  // Mobile: fixed on screen while the CV scrolls under it (it only rises to
  // stay above the footer)
  if (container && isMobile()) positionMobileFab(container);
  if (container && footer && !isMobile()) {
    const GAP = 24;
    const bottomOffset = parseFloat(getComputedStyle(container).bottom) || 0;
    const overlap = window.innerHeight - footer.getBoundingClientRect().top - bottomOffset + GAP;
    container.style.translate = overlap > 0 ? `0 ${-overlap}px` : '';
  }

  // Expand when scrolling down. On mobile the button sits over the end of the
  // CV, so it also waits until the button is on screen to expand
  const onScreen = btnDownload.getBoundingClientRect().bottom <= window.innerHeight;
  if (scrollTop > 20 && (!isMobile() || onScreen)) {
    fabButtons.forEach((button) => {
      button.classList.add('expanded');
    });
  } else {
    fabButtons.forEach((button) => {
      button.classList.remove('expanded');
    });
  }
}

// El botón de descarga abre el modal con window.openModal() (inline en
// resume.html → showModal()). Esc, clic fuera (closedby="any") y el botón X
// (form method="dialog") los maneja el <dialog> nativo.
// Si debajo del PDF queda espacio libre en la primera pantalla (celular), el
// botón se centra verticalmente entre la orilla del PDF y el borde inferior;
// si no hay espacio, vuelve a su posición del CSS (bottom: 4rem)
// Mobile FAB position (viewport coordinates, the container is fixed)
const FAB_INSET = 14; // from the CV page's edges
const FAB_SCREEN_GAP = 16; // from the bottom of the screen
let fixedTop = null; // where it stays while the CV scrolls under it

function positionMobileFab(container) {
  const page = document.querySelector('#pdf-container canvas');
  if (!page || fixedTop === null) return;
  const rect = page.getBoundingClientRect();
  const height = container.offsetHeight;
  // Fixed where it first appeared; it only rises to stay above the footer
  const footer = document.querySelector('.footer');
  const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
  const top = Math.min(fixedTop, footerTop - height - FAB_SCREEN_GAP);
  container.style.top = `${top}px`;
  container.style.right = `${document.documentElement.clientWidth - rect.right + FAB_INSET}px`;
  container.style.bottom = 'auto';
}

function placeFab() {
  const container = document.querySelector('.fab-container');
  const page = document.querySelector('#pdf-container canvas');
  if (!container) return;
  container.style.bottom = '';
  container.style.top = '';
  container.style.right = '';
  container.style.translate = '';
  if (isMobile()) {
    // Starting spot: the blank bottom-right corner of the CV page as seen at
    // the top of the page, or the bottom of the screen if the CV is taller.
    // Anchored by its right side so it expands to the left.
    if (!page) return;
    const height = container.offsetHeight;
    const cornerAtTop = page.getBoundingClientRect().bottom + window.scrollY - height - FAB_INSET;
    fixedTop = Math.min(cornerAtTop, window.innerHeight - height - FAB_SCREEN_GAP);
    handleScroll();
    return;
  }
  fixedTop = null;
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
  // El PDF se dibuja después (pdf.js) y cambia al cambiar de idioma
  const pdf = document.getElementById('pdf-container');
  if (pdf) new MutationObserver(placeFab).observe(pdf, { childList: true });
  placeFab();
}

export { initFab };
