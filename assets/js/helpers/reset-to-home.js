// On a manual reload, go back to the top (#home). Fresh visits keep their
// hash so shared links like /es/#contact land on the right section.
// A visit without a hash only gets #home written into the URL (replaceState):
// it's already at the top, so there's no jump to make, no history entry and no
// smooth scroll.
function resetToHome() {
  const [navigation] = performance.getEntriesByType('navigation');
  const isReload = navigation?.type === 'reload';

  if (!window.location.hash && !isReload) {
    history.replaceState(history.state, '', '#home');
  } else if (isReload) {
    window.location.hash = '#home';
  }
}

export { resetToHome };
