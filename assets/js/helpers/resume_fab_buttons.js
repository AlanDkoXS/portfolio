function handleScroll() {
  const fabButtons = document.querySelectorAll('.fab');
  const pdfContainer = document.getElementById('pdf-container');
  const btnDownload = document.getElementById('btn-download');
  const modal = document.getElementById('modal');

  const scrollTop = pdfContainer.scrollTop;
  const scrollHeight = pdfContainer.scrollHeight;
  const clientHeight = pdfContainer.clientHeight;
  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

  if (scrollPercentage > 90) {
    btnDownload.style.backgroundColor = '#993737';
  } else {
    btnDownload.style.backgroundColor = '';
  }

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

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

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
  const pdfContainer = document.getElementById('pdf-container');
  pdfContainer.addEventListener('scroll', handleScroll);
}

export { initFab, openModal, closeModal, downloadCV };
