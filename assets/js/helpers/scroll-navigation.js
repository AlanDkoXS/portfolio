function scrollNavigation() {
    // Detectar clics en los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Prevenir el comportamiento por defecto

            const targetId = this.getAttribute('href').substring(1); // Obtener la ID del destino
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Realizar el desplazamiento suave
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });

                // Cambiar el estado del historial sin recargar la página
                history.pushState({ section: targetId }, '', `#${targetId}`);
            }
        });
    });

    // Detectar cuando el usuario navega hacia atrás o hacia adelante en el historial
    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.section) {
            const targetElement = document.getElementById(e.state.section);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });

    // Verificar si hay un hash en la URL al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
}

// Exportar al final
export default scrollNavigation;
