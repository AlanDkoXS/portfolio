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
function initFab() {
  setupDialog(document.getElementById('modal'));
  window.addEventListener('scroll', handleScroll, { passive: true });
}

export { initFab };
