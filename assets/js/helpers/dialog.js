// Configura un <dialog> modal: se abre con showModal() (foco atrapado, Esc y
// fondo inerte nativos) y se cierra al tocar fuera gracias a closedby="any".
// Safari aún no soporta closedby: ahí se replica el cierre por clic fuera.
export function setupDialog(dialog) {
  if (!dialog || dialog.dataset.dialogReady) return;
  dialog.dataset.dialogReady = 'true';

  if ('closedBy' in HTMLDialogElement.prototype) return;

  dialog.addEventListener('click', (event) => {
    // Un clic en el backdrop llega con el propio <dialog> como target
    if (event.target !== dialog) return;

    // Distinguir el backdrop del padding/fondo del propio diálogo
    const rect = dialog.getBoundingClientRect();
    const insideDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!insideDialog) dialog.close();
  });
}
