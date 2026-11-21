// Lámpara colgante: cambia el tema (en escritorio reemplaza al botón de luna/sol;
// en móvil solo aparece dentro del menú hamburguesa abierto).
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

  // true entre el clic y el cambio de tema: la cadena sigue jalada hasta que
  // cambia el tema (si se soltara antes, al apagar se veía apagada → encendida
  // → apagada)
  let switching = false;
  const pull = () => button.classList.add('lamp--pulling');
  const release = () => {
    if (!switching) button.classList.remove('lamp--pulling');
  };

  // Mouse/touch: la cadena se ve jalada mientras se mantiene presionado.
  // En táctiles pointerleave llega justo al levantar el dedo (antes del
  // clic): solo cuenta si el mouse sale con el botón todavía presionado.
  button.addEventListener('pointerdown', pull);
  button.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && event.buttons) release();
  });
  button.addEventListener('pointercancel', release);
  // Soltó fuera de la lámpara (no hubo clic): la cadena vuelve. El clic, si lo
  // hay, llega antes que este timeout y deja switching en true.
  window.addEventListener('pointerup', () => setTimeout(release, 0));

  button.addEventListener('click', (event) => {
    if (switching) return; // doble clic rápido: un solo cambio
    switching = true;
    // Teclado (Enter/Espacio) no pasa por pointerdown: mostrar el tirón un instante
    const fromKeyboard = event.detail === 0;
    pull();
    setTimeout(() => {
      toggle.click();
      switching = false;
      release();
      sync();
      // Al soltar la cadena la lámpara se balancea (en táctiles no hay hover)
      button.classList.remove('lamp--swing');
      void button.offsetWidth; // reinicia la animación
      button.classList.add('lamp--swing');
    }, fromKeyboard ? 160 : 90);
  });
  // Móvil: al abrir el menú la lámpara cae como bungee (CSS, 0.25s de espera
  // + 1.1s); al llegar abajo se balancea igual que cuando se jala la cadena
  const header = document.querySelector('.header');
  if (header) {
    let landTimer;
    let wasOpen = header.classList.contains('menu-open');
    new MutationObserver(() => {
      const open = header.classList.contains('menu-open');
      if (open === wasOpen) return;
      wasOpen = open;
      clearTimeout(landTimer);
      if (!open || !window.matchMedia('(max-width: 599px)').matches) return;
      landTimer = setTimeout(() => {
        button.classList.remove('lamp--swing');
        void button.offsetWidth; // reinicia la animación
        button.classList.add('lamp--swing');
      }, 250 + 1100 * 0.42); // cuando el cable se estira al final de la caída
    }).observe(header, { attributes: true, attributeFilter: ['class'] });
  }

  button.addEventListener('animationend', (event) => {
    if (event.animationName === 'lamp-swing') button.classList.remove('lamp--swing');
  });


  // El tema también puede cambiar por el sistema o desde otra pestaña
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
}
