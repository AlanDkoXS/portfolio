// Contact form result modal (index.html)
import { setupDialog } from './dialog.js';

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  setupDialog(modal);

  const btnClose = document.getElementById('btn_close-modal');
  if (btnClose && !btnClose.dataset.bound) {
    btnClose.dataset.bound = 'true';
    btnClose.addEventListener('click', () => modal.close());
  }
}

export { closeModal };
