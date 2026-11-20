/**
 * Menú móvil: el botón hamburguesa abre el panel debajo de la barra y se
 * convierte en una X. Se cierra al elegir una opción, con Escape, al tocar
 * fuera o al pasar a escritorio. Sin JS, el enlace #nav lo abre con :target.
 * Tolera páginas sin menú (early return).
 */
export default function navMenu() {
  const header = document.querySelector('.header');
  const burger = header?.querySelector('.navbar__burger');
  const menu = document.getElementById('nav');
  if (!burger || !menu) return;

  const isOpen = () => header.classList.contains('menu-open');
  const setOpen = (open) => {
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(!isOpen());
  });

  // Elegir una opción (sección, idioma) cierra el panel
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      burger.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  window.matchMedia('(min-width: 600px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
