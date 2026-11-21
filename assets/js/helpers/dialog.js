// Sets up a modal <dialog>: it opens with showModal() (native focus trap, Esc
// and inert background) and closes on an outside tap thanks to closedby="any".
// Safari doesn't support closedby yet: there, closing on outside click is replicated.
export function setupDialog(dialog) {
  if (!dialog || dialog.dataset.dialogReady) return;
  dialog.dataset.dialogReady = 'true';

  if ('closedBy' in HTMLDialogElement.prototype) return;

  dialog.addEventListener('click', (event) => {
    // A click on the backdrop arrives with the <dialog> itself as target
    if (event.target !== dialog) return;

    // Tell the backdrop apart from the dialog's own padding/background
    const rect = dialog.getBoundingClientRect();
    const insideDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!insideDialog) dialog.close();
  });
}
