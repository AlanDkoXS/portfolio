// EmailJS is only needed to send the contact form: it's downloaded
// the first time someone interacts with it (see send_form.js), not on
// page load. The promise is memoized: a single download even if it's
// called many times; if it fails, the next attempt tries again.
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
