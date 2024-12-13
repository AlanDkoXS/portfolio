const CLIENT_ID =
  'Y07428c7ae3b0e23e1f1cb579a37eb0edc32d3318af5cac4d0029f392c0282e76';

async function fetchDribbbleShots() {
  try {
    const response = await fetch(
      `https://api.dribbble.com/v2/shots?access_token=${CLIENT_ID}`
    );
    if (!response.ok) {
      throw new Error('Error en la solicitud a la API de Dribbble');
    }
    const shots = await response.json();
    console.log(shots);
  } catch (error) {
    console.error(error);
  }
}

export default fetchDribbbleShots;
