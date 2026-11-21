import { setupDialog } from './dialog.js';

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
  if (container && footer) {
    const GAP = 24;
    const bottomOffset = parseFloat(getComputedStyle(container).bottom) || 0;
    const overlap = window.innerHeight - footer.getBoundingClientRect().top - bottomOffset + GAP;
    container.style.translate = overlap > 0 ? `0 ${-overlap}px` : '';
  }

  // Expandir el botón cuando se hace scroll hacia abajo
  if (scrollTop > 20) {
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
  // El PDF se dibuja después (pdf.js) y cambia al cambiar de idioma
  const pdf = document.getElementById('pdf-container');
  if (pdf) new MutationObserver(placeFab).observe(pdf, { childList: true });
  placeFab();
}

export { initFab };
