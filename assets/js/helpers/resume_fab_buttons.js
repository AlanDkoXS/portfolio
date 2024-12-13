// Función que maneja el cambio en el scroll
function handleScroll() {
    const fabButtons = document.querySelectorAll('.fab');
    const pdfContainer = document.getElementById('pdf-container');

    // Si el scroll dentro del contenedor es mayor que 100px, expandir los botones
    if (pdfContainer.scrollTop > 10) {  // Puedes ajustar 100 a cualquier valor que prefieras
        fabButtons.forEach(button => {
            button.classList.add('expanded');
        });
    } else {
        fabButtons.forEach(button => {
            button.classList.remove('expanded');
        });
    }
}

// Agregar el listener de scroll al contenedor del PDF
function initFab() {
    const pdfContainer = document.getElementById('pdf-container');
    pdfContainer.addEventListener('scroll', handleScroll);
}

// Exportar la función por defecto
export default initFab;
