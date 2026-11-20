// Tema: respeta la elección manual guardada en localStorage.theme;
// si no hay, usa la hora local (oscuro 18:00–06:00).
const STORAGE_KEY = 'theme';

const readStoredTheme = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
};

const themeFromHour = () => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
};

const applyTheme = (toggle, theme) => {
  toggle.checked = theme === 'dark';
  document.body.setAttribute('data-theme', theme);
};

export function setAutoDarkMode() {
  const darkModeToggle = document.querySelector('.navbar__toggle--darkmode-input');
  if (!darkModeToggle) return;

  applyTheme(darkModeToggle, readStoredTheme() ?? themeFromHour());

  if (darkModeToggle.dataset.themeBound) return;
  darkModeToggle.dataset.themeBound = 'true';
  darkModeToggle.addEventListener('change', () => {
    const theme = darkModeToggle.checked ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* almacenamiento no disponible: solo dura la sesión */
    }
  });
}
