// Lámpara colgante: cambia el tema (en escritorio reemplaza al botón de luna/sol;
// en móvil cuelga en la primera pantalla y se recoge al hacer scroll).
// Encendida = modo oscuro, apagada = modo claro. Estados visuales:
//   hover → imagen "over" · presionando → "clic" (cadena jalada) · encendida → "active"
// Al soltar se cambia el tema usando el mismo checkbox (auto-dark-mode.js).
// 100vw incluye la barra de scroll; se mide para centrar bien la lámpara
const setScrollbarWidth = () => {
  const width = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-w', `${width}px`);
};

export default function lamp() {
  setScrollbarWidth();
  window.addEventListener('resize', setScrollbarWidth);

  const button = document.querySelector('.lamp');
  const toggle = document.querySelector('.navbar__toggle--darkmode-input');
  if (!button || !toggle || button.dataset.bound) return;
  button.dataset.bound = 'true';

  const sync = () => {
    const on = document.body.getAttribute('data-theme') === 'dark';
    button.setAttribute('aria-pressed', String(on));
  };

  const pull = () => button.classList.add('lamp--pulling');
  const release = () => button.classList.remove('lamp--pulling');

  // Mouse/touch: la cadena se ve jalada mientras se mantiene presionado
  button.addEventListener('pointerdown', pull);
  button.addEventListener('pointerleave', release);
  button.addEventListener('pointercancel', release);

  button.addEventListener('click', (event) => {
    // Teclado (Enter/Espacio) no pasa por pointerdown: mostrar el tirón un instante
    const fromKeyboard = event.detail === 0;
    if (fromKeyboard) pull();
    setTimeout(() => {
      toggle.click();
      release();
      sync();
      // Al soltar la cadena la lámpara se balancea (en táctiles no hay hover)
      button.classList.remove('lamp--swing');
      void button.offsetWidth; // reinicia la animación
      button.classList.add('lamp--swing');
    }, fromKeyboard ? 160 : 90);
  });
  button.addEventListener('animationend', () => button.classList.remove('lamp--swing'));

  // Móvil: se recoge al bajar y vuelve a colgar al regresar arriba
  const mobile = window.matchMedia('(max-width: 599px)');
  let ticking = false;
  const updateRetract = () => {
    ticking = false;
    button.classList.toggle('lamp--retracted', mobile.matches && window.scrollY > 40);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateRetract);
    }
  }, { passive: true });
  mobile.addEventListener('change', updateRetract);
  updateRetract();

  // El tema también puede cambiar por el sistema o desde otra pestaña
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
}
