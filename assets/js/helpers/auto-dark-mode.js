// Tema automático: si el sistema del visitante está en modo oscuro, oscuro.
// Si no (el modo claro es el valor por defecto de los equipos y no se puede
// distinguir de una elección), va por horario con la hora local: oscuro de
// 18:00 a 6:00, claro el resto del día; cambia a la hora exacta aunque la
// página siga abierta. El botón (lámpara / luna-sol) guarda una excepción en
// localStorage.theme ('light' | 'dark') que dura solo hasta el siguiente cambio
// de horario (localStorage.themeUntil, timestamp); después vuelve el automático.
// El tema se refleja en <meta name="color-scheme">, que el CSS lee (ver
// _variables.css). El script inline del <head> aplica lo mismo antes de pintar
// (sin JS, el meta queda en "light dark" y se sigue al sistema).
const STORAGE_KEY = 'theme';
const UNTIL_KEY = 'themeUntil';
export const DARK_FROM = 18; // hora en que empieza el modo oscuro
export const DARK_UNTIL = 6; // hora en que vuelve el modo claro

const isDarkHour = (hour) => hour >= DARK_FROM || hour < DARK_UNTIL;

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const scheduledTheme = (date = new Date()) =>
  systemDark.matches || isDarkHour(date.getHours()) ? 'dark' : 'light';

// Siguiente cambio de horario (18:00 o 6:00) después de `date`
const nextBoundary = (date = new Date()) => {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  const hour = date.getHours();
  if (hour >= DARK_UNTIL && hour < DARK_FROM) {
    next.setHours(DARK_FROM);
  } else {
    if (hour >= DARK_FROM) next.setDate(next.getDate() + 1);
    next.setHours(DARK_UNTIL);
  }
  return next.getTime();
};

const readOverride = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    const until = Number(localStorage.getItem(UNTIL_KEY));
    if ((value === 'dark' || value === 'light') && Date.now() < until) return value;
    // vencida (o de la versión anterior, sin fecha): se limpia
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UNTIL_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
  return null;
};

const writeOverride = (value) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
      localStorage.setItem(UNTIL_KEY, String(nextBoundary()));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(UNTIL_KEY);
    }
  } catch {
    /* almacenamiento no disponible: el tema se aplica igual, solo no se recuerda */
  }
};

let override = null; // excepción vigente en esta página (aunque no se pueda guardar)
let overrideUntil = 0;

const renderedTheme = () => (override && Date.now() < overrideUntil ? override : scheduledTheme());

const sync = (toggle) => {
  const theme = renderedTheme();
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.content = theme;
  if (toggle) toggle.checked = theme === 'dark';
  document.body.setAttribute('data-theme', theme);
  // la lámpara (lamp.js) refleja su estado con aria-pressed
  const lamp = document.querySelector('.lamp');
  if (lamp) lamp.setAttribute('aria-pressed', String(theme === 'dark'));
};

export function setAutoDarkMode() {
  const toggle = document.querySelector('.navbar__toggle--darkmode-input');
  override = readOverride();
  overrideUntil = override ? nextBoundary() : 0;
  sync(toggle);

  if (!toggle || toggle.dataset.themeBound) return;
  toggle.dataset.themeBound = 'true';

  toggle.addEventListener('change', () => {
    // El usuario pide "lo contrario de lo que ve ahora"
    const target = renderedTheme() === 'dark' ? 'light' : 'dark';
    // Si coincide con el horario, está deshaciendo su ajuste: no se guarda nada
    override = target === scheduledTheme() ? null : target;
    overrideUntil = override ? nextBoundary() : 0;
    writeOverride(override);
    sync(toggle);
  });

  // Cambio automático a la hora exacta con la página abierta. Los timers se
  // congelan en pestañas en segundo plano o con el teléfono bloqueado, así
  // que también se revisa al volver a la pestaña.
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Date.now() >= overrideUntil) override = null;
      sync(toggle);
      schedule();
    }, nextBoundary() - Date.now() + 1000);
  };
  schedule();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() >= overrideUntil) override = null;
    sync(toggle);
    schedule();
  });

  // El sistema cambió a/desde modo oscuro
  systemDark.addEventListener('change', () => sync(toggle));

  // Cambio hecho desde otra pestaña
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== UNTIL_KEY) return;
    override = readOverride();
    overrideUntil = override ? nextBoundary() : 0;
    sync(toggle);
  });
}
