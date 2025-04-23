export function loadEmailJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.defer = true;
    script.type = 'text/javascript';

    // Event listeners
    script.onload = () => {
      try {
        emailjs.init('U8cUUeHN0_JTVF8xK');
        console.log('EmailJS initialized successfully');
        resolve();
      } catch (error) {
        console.error('Error initializing EmailJS:', error);
        reject(error);
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load EmailJS script:', error);
      reject(error);
    };

    document.head.appendChild(script);
  });
}
