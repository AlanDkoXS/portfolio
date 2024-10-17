// Asegúrate de reemplazar 'YOUR_CLIENT_ID' con tu Client ID real
const CLIENT_ID = 'Y07428c7ae3b0e23e1f1cb579a37eb0edc32d3318af5cac4d0029f392c0282e76';

// Función para obtener los tiros de Dribbble
async function fetchDribbbleShots() {
    try {
        const response = await fetch(`https://api.dribbble.com/v2/shots?access_token=${CLIENT_ID}`);
        if (!response.ok) {
            throw new Error('Error en la solicitud a la API de Dribbble');
        }
        const shots = await response.json();
        console.log(shots); // Aquí puedes trabajar con los datos
    } catch (error) {
        console.error(error);
    }
}

// Llama a la función
export default fetchDribbbleShots;
