// parallax.js

const bgBack = document.querySelector(".bgBack");
const bgMiddle = document.querySelector(".bgMiddle");
const bgFront = document.querySelector(".bgFront");

function parallax() {
    let lastX = 0; // Posición X anterior
    let lastY = 0; // Posición Y anterior
    let targetX = 0; // Posición objetivo X
    let targetY = 0; // Posición objetivo Y
    const smoothing = 0.1; // Coeficiente de suavizado

    // Variables para el movimiento automático
    let autoMovementX = 0; // Posición automática X
    let autoMovementY = 0; // Posición automática Y
    const autoSpeed = 0.1; // Incremento de velocidad del movimiento automático
    const autoLimitX = 20; // Límite de movimiento en X
    const autoLimitY = 10; // Límite de movimiento en Y
    let autoDirectionX = 1; // Dirección del movimiento automático en X
    let autoDirectionY = 1; // Dirección del movimiento automático en Y

    // Temporizador para el restablecimiento
    let resetTimer;
    let isMoving = true; // Bandera para controlar el movimiento

    // Función para actualizar la posición de las capas
    const updateLayers = (deltaX, deltaY) => {
        const bgBackSensitivity = 4; // Sensibilidad para el bgBack
        const bgMiddleSensitivity = 2.5; // Sensibilidad para el bgMiddle
        const bgFrontSensitivity = 1.5; // Sensibilidad para el bgFront

        // Movimiento inverso en bgBack y bgFront, movimiento normal en bgMiddle
        bgBack.style.transform = `translate(-50%, -50%) translate(${
            -deltaX * bgBackSensitivity
        }px, ${
            -deltaY * bgBackSensitivity
        }px)`; // Agregado movimiento Y para bgBack
        bgMiddle.style.transform = `translate(-50%, -50%) translate(${
            deltaX * bgMiddleSensitivity
        }px, ${
            deltaY * bgMiddleSensitivity
        }px)`; // Agregado movimiento Y para bgMiddle
        bgFront.style.transform = `translate(-50%, -50%) translate(${
            -deltaX * bgFrontSensitivity
        }px, ${
            -deltaY * bgFrontSensitivity
        }px)`; // Agregado movimiento Y para bgFront
    };

    // Función para manejar el movimiento del mouse
    const handleMouseMove = (e) => {
        targetX = (window.innerWidth / 2 - e.pageX) / 50; // Cambia la sensibilidad aquí
        targetY = (window.innerHeight / 2 - e.pageY) / 100; // Cambia la sensibilidad aquí

        // Reiniciar el temporizador y la bandera al mover el mouse
        clearTimeout(resetTimer);
        isMoving = true; // Activar el movimiento
        resetTimer = setTimeout(() => {
            isMoving = false; // Desactivar el movimiento después de 2 segundos
            resetPositions(); // Restablecer posiciones
        }, 2000); // 2 segundos de inactividad
    };

    // Función para manejar el movimiento del dispositivo móvil
    const handleDeviceOrientation = (event) => {
        const gamma = event.gamma; // Movimiento lateral
        const beta = event.beta; // Movimiento hacia adelante y hacia atrás

        // Aumentar la sensibilidad de los ejes para un movimiento más pronunciado
        targetX = (gamma / 90) * 4; // Aumentar el efecto multiplicando por 2
        targetY = (beta / 90) * 1; // Aumentar el efecto multiplicando por 2

        // Reiniciar el temporizador y la bandera al mover el dispositivo
        clearTimeout(resetTimer);
        isMoving = true; // Activar el movimiento
        resetTimer = setTimeout(() => {
            isMoving = false; // Desactivar el movimiento después de 2 segundos
            resetPositions(); // Restablecer posiciones
        }, 2000); // 2 segundos de inactividad
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    // Función para actualizar el movimiento suavizado
    const smoothMove = () => {
        if (isMoving) {
            // Calcular el cambio suavizado en X e Y
            lastX += (targetX - lastX) * smoothing; 
            lastY += (targetY - lastY) * smoothing; 

            // Añadir movimiento automático en bucle
            if (Math.abs(autoMovementX) >= autoLimitX) {
                autoDirectionX *= -1; // Cambiar dirección en X al alcanzar el límite
            }
            if (Math.abs(autoMovementY) >= autoLimitY) {
                autoDirectionY *= -1; // Cambiar dirección en Y al alcanzar el límite
            }

            autoMovementX += autoDirectionX * autoSpeed; // Cambiar la posición automática X
            autoMovementY += autoDirectionY * autoSpeed; // Cambiar la posición automática Y
            
            // Incorporar el movimiento automático en el suavizado
            lastX += autoMovementX * 0.1; // Menor efecto de movimiento automático en X
            lastY += autoMovementY * 0.1; // Menor efecto de movimiento automático en Y

            // Llamar a la función de actualización de capas
            updateLayers(lastX, lastY);
        }

        requestAnimationFrame(smoothMove); // Llamar a smoothMove en el siguiente frame
    };

    // Iniciar el suavizado del movimiento
    smoothMove();

    // Evento para restablecer posiciones al salir del área
    document.addEventListener('mouseleave', () => {
        resetPositions();
    });

    // Función para volver a la posición original
    const resetPositions = () => {
        bgBack.style.transition = "transform 0.5s ease"; // Transición suave
        bgMiddle.style.transition = "transform 0.5s ease"; // Transición suave
        bgFront.style.transition = "transform 0.5s ease"; // Transición suave

        bgBack.style.transform = `translate(-50%, -50%)`;
        bgMiddle.style.transform = `translate(-50%, -50%)`;
        bgFront.style.transform = `translate(-50%, -50%)`;

        // Restablecer las posiciones del movimiento automático
        autoMovementX = 0;
        autoMovementY = 0;
    };
}

export default parallax;
