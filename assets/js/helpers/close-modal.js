const modal = document.getElementById('modal');
const btnClose = document.getElementById('btn_close-modal');

function closeModal() {
  if (!modal) {
    console.warn('Modal element not found');
    return;
  }
  
  if (modal.hasAttribute('data-listeners-added')) return;

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.close();
    });
  }

  modal.addEventListener('click', (event) => {
    if (!event.target.closest('.modal-content')) {
      modal.close();
    }
  });

  modal.setAttribute('data-listeners-added', 'true');
}

export { closeModal };
