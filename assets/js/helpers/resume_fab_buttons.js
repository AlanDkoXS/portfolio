function handleScroll() {
  const fabButtons = document.querySelectorAll('.fab');
  const btnDownload = document.getElementById('btn-download');

  // Validar que los elementos existen
  if (!btnDownload || fabButtons.length === 0) {
    return;
  }

  // Usar window.scrollY en lugar del scroll del contenedor
  const scrollTop = window.scrollY || 0;
  const scrollHeight = document.documentElement?.scrollHeight || document.body?.scrollHeight || 0;
  const clientHeight = window.innerHeight || 0;
  
  // Evitar división por cero
  const scrollableHeight = scrollHeight - clientHeight;
  const scrollPercentage = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

  // Cambiar color cuando se llega al 90% del scroll
  if (scrollPercentage > 90) {
    btnDownload.style.backgroundColor = '#993737';
  } else {
    btnDownload.style.backgroundColor = '';
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

document.getElementById('btn-download').addEventListener('click', () => {
  const modal = document.getElementById('modal');
  if (!modal.open) {
    openModal();
  }
});

function openModal() {
  const modal = document.getElementById('modal');
  modal.showModal();

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    },
    { once: true }
  );
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.close();
}

function downloadCV(language) {
  const fileName =
    language === 'ENG' ? '[ENG] Alan Quintana.pdf' : '[ESP] Alan Quintana.pdf';
  const link = document.createElement('a');
  link.href = `/assets/docs/${fileName}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  closeModal();
}

function initFab() {
  const modal = document.getElementById('modal');
  
  // Escuchar el scroll del window en lugar del contenedor
  window.addEventListener('scroll', handleScroll);
  
  // Cerrar modal al hacer clic fuera de él
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

export { initFab, openModal, closeModal, downloadCV };
