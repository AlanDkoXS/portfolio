// EmailJS solo hace falta para enviar el formulario de contacto: se descarga
// la primera vez que alguien interactúa con él (ver send_form.js), no al
// cargar la página. La promesa se memoiza: una sola descarga aunque se
// llame muchas veces; si falla, el siguiente intento vuelve a probar.
let emailJsPromise = null;

export function loadEmailJS() {
  if (emailJsPromise) return emailJsPromise;

  emailJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;

    script.onload = () => {
      try {
        emailjs.init('U8cUUeHN0_JTVF8xK');
        resolve();
      } catch (error) {
        console.error('Error initializing EmailJS:', error);
        reject(error);
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load EmailJS script:', error);
      script.remove();
      reject(error);
    };

    document.head.appendChild(script);
  }).catch((error) => {
    emailJsPromise = null;
    throw error;
  });

  return emailJsPromise;
}
