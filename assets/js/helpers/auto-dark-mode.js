// Tema: por defecto sigue al sistema (prefers-color-scheme). El botón guarda
// una excepción en localStorage.theme ('light' | 'dark') y la refleja en
// <meta name="color-scheme">, que el CSS lee (ver _variables.css).
// El script inline del <head> aplica la excepción antes de pintar; aquí solo
// se mantiene sincronizado el botón y se maneja el cambio.
const STORAGE_KEY = 'theme';
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const readStoredTheme = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
};

const writeStoredTheme = (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* almacenamiento no disponible: el tema se aplica igual, solo no se recuerda */
  }
};

const systemTheme = () => (systemDark.matches ? 'dark' : 'light');

let override = null; // excepción vigente en esta página (aunque no se pueda guardar)

const renderedTheme = () => override ?? systemTheme();

const sync = (toggle) => {
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.content = override ?? 'light dark';
  const theme = renderedTheme();
  if (toggle) toggle.checked = theme === 'dark';
  document.body.setAttribute('data-theme', theme);
};

export function setAutoDarkMode() {
  const toggle = document.querySelector('.navbar__toggle--darkmode-input');
  override = readStoredTheme();
  sync(toggle);

  if (!toggle || toggle.dataset.themeBound) return;
  toggle.dataset.themeBound = 'true';

  toggle.addEventListener('change', () => {
    // El usuario pide "lo contrario de lo que ve ahora"
    const target = renderedTheme() === 'dark' ? 'light' : 'dark';
    // Si coincide con el sistema, está deshaciendo su ajuste: no se guarda nada
    // (guardarlo fijaría el tema contra futuros cambios del sistema)
    override = target === systemTheme() ? null : target;
    writeStoredTheme(override);
    sync(toggle);
  });

  // El sistema cambió (p. ej. modo oscuro automático al anochecer)
  systemDark.addEventListener('change', () => sync(toggle));

  // Cambio hecho desde otra pestaña
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    override = readStoredTheme();
    sync(toggle);
  });
}
