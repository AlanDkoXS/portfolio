function handleScroll() {
    const fabButtons = document.querySelectorAll('.fab');
    const pdfContainer = document.getElementById('pdf-container');
    const btnDownload = document.getElementById('btn-download');

    const scrollTop = pdfContainer.scrollTop;
    const scrollHeight = pdfContainer.scrollHeight;
    const clientHeight = pdfContainer.clientHeight;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage > 70) {
      btnDownload.style.backgroundColor = 'green';
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

  function initFab() {
    const pdfContainer = document.getElementById('pdf-container');
    pdfContainer.addEventListener('scroll', handleScroll);
  }

  export default initFab;
