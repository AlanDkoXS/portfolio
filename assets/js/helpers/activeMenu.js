const navbarListDOM = document.querySelector('.navbar__list');
const navbarLinksDOM = document.querySelectorAll('.navbar__link');
const sectionsDOM = document.querySelectorAll('section');

function activeMenu() {
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 100;

    sectionsDOM.forEach((section, index) => {
      if (
        scrollPosition >= section.offsetTop &&
        scrollPosition < section.offsetTop + section.offsetHeight
      ) {
        const activeLink = navbarListDOM.querySelector('.navbar__link.active');

        if (activeLink) {
          activeLink.classList.remove('active');
        }

        navbarLinksDOM[index].classList.add('active');
      }
    });
  });

  const mobileMenu = () => {
    if (window.innerWidth <= 768) {
      window.addEventListener('scroll', () => {
        navbarListDOM.classList.toggle('hidden', window.scrollY > 0);
      });

      // Detectar clics fuera del menú para ocultarlo
      const handleOutsideClick = (event) => {
        if (!navbarListDOM.contains(event.target) && !event.target.closest('.navbar__link')) {
          navbarListDOM.classList.add('hidden');
        }
      };

      // Detectar toques fuera del menú
      const handleTouchOutside = (event) => {
        if (!navbarListDOM.contains(event.target) && !event.target.closest('.navbar__link')) {
          navbarListDOM.classList.add('hidden');
        }
      };

      // Agregar los listeners de clic y toque
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleTouchOutside);

      // Limpiar los eventos cuando se cambia el tamaño de la ventana o se cierra el menú
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          document.removeEventListener('mousedown', handleOutsideClick);
          document.removeEventListener('touchstart', handleTouchOutside);
        }
      });
    }
  };

  mobileMenu();
  window.addEventListener('resize', mobileMenu);
}

export default activeMenu;
