function handleScroll() {
  const fabButtons = document.querySelectorAll('.fab');
  const pdfContainer = document.getElementById('pdf-container');

  if (pdfContainer.scrollTop > 10) {
    fabButtons.forEach((button) => {
      button.classList.add('expanded');
    });
  } else {
    fabButtons.forEach((button) => {
      button.classList.remove('expanded');
    });
  }
}

function initFab() {
  const pdfContainer = document.getElementById('pdf-container');
  pdfContainer.addEventListener('scroll', handleScroll);
}

export default initFab;
