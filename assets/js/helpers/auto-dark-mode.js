export function setAutoDarkMode() {
  const darkModeToggle = document.querySelector('.navbar__toggle--darkmode-input');
  const hour = new Date().getHours();

  if (hour >= 18 || hour < 6) {
    darkModeToggle.checked = true;
    document.body.setAttribute('data-theme', 'dark');
  } else {
    darkModeToggle.checked = false;
    document.body.setAttribute('data-theme', 'light');
  }
}
