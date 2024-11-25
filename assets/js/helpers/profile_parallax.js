function profileParallax() {
    // Selecciona los elementos necesarios
    const container = document.querySelector('.home__image');
    const background = document.querySelector('.home__image--background');
    const sprite = document.querySelector('.home__image--sprite');

    // Función para mover las capas basado en los valores de movimiento
    function moveLayers(moveX, moveY) {
      // Movimiento del fondo (con un multiplicador para mayor o menor efecto)
      background.style.transform = `translate(${moveX * 0.3}px, ${moveY * -0.3}px)`;
      // Movimiento del sprite (más sutil para que no se desplace tanto como el fondo)
      sprite.style.transform = `translate(${moveX * 0.1}px, ${moveY * -0.1}px)`;
    }

    // Evento para el movimiento del ratón (para prueba en escritorio)
    container.addEventListener('mousemove', (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left; // Posición X dentro del contenedor
      const y = event.clientY - rect.top; // Posición Y dentro del contenedor
      const moveX = (x / rect.width) * 100 - 50; // Mover entre -50 y 50
      const moveY = (y / rect.height) * 100 - 50; // Mover entre -50 y 50
      moveLayers(moveX, moveY);
    });

    // Evento para la inclinación del dispositivo (solo se ejecuta en dispositivos móviles)
    window.addEventListener('deviceorientation', (event) => {
      // Verificar que el dispositivo está soportando este evento
      if (event.gamma === null || event.beta === null) {
        console.log('Este dispositivo no soporta inclinación');
        return;
      }

      // Ajustar los valores de beta y gamma
      const moveX = event.gamma * 1; // Ajuste para mayor movimiento horizontal
      const moveY = -event.beta * 1; // Ajuste para mayor movimiento vertical

      // Llama a la función de movimiento
      moveLayers(moveX, moveY);
    });

    // Regresar a la posición original al salir del contenedor
    container.addEventListener('mouseleave', () => {
      background.style.transform = 'translate(0, 0)';
      sprite.style.transform = 'translate(0, 0)';
    });
  }

  export default profileParallax;
