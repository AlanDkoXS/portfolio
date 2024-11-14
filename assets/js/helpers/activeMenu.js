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
    
    // Lógica para ocultar el menú en móviles
    const mobileMenu = () => {
        if (window.innerWidth <= 768) {
            window.addEventListener('scroll', () => {
                navbarListDOM.classList.toggle('hidden', window.scrollY > 0);
            });
        }
    };

    mobileMenu();
    window.addEventListener('resize', mobileMenu);
}

export default activeMenu; // Llama a la función para iniciar