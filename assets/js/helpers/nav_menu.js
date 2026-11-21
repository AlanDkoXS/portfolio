/**
 * Mobile menu: the hamburger button opens the panel below the bar and
 * turns into an X. It closes when picking an option, with Escape, on an
 * outside tap or when crossing to desktop. Without JS, the #nav link opens
 * it with :target. Tolerates pages without a menu (early return).
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

  // Picking an option (section, language) closes the panel
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
    // The lamp lives outside the header but is part of the menu on mobile
    if (isOpen() && !header.contains(e.target) && !e.target.closest('.lamp')) setOpen(false);
  });

  window.matchMedia('(min-width: 600px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
