// On a manual reload, go back to the top (#home). Fresh visits keep their
// hash so shared links like /es/#contact land on the right section.
function resetToHome() {
  const [navigation] = performance.getEntriesByType('navigation');
  const isReload = navigation?.type === 'reload';

  if (isReload || !window.location.hash) {
    window.location.hash = '#home';
  }
}

export { resetToHome };
