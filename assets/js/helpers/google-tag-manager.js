export function loadGoogleTagManager() {
  return new Promise((resolve, reject) => {
    try {
      // Script to load Google Tag Manager
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-8QH5RNPMBF';
      script.async = true;

      script.onload = () => {
        // Configure Google Analytics
        if (typeof window.dataLayer === 'undefined') {
          window.dataLayer = [];

          // Send function to GA - only define it if it doesn't exist
          if (typeof window.gtag === 'undefined') {
            window.gtag = function () {
              window.dataLayer.push(arguments);
            };
          }

          // Unique initialization of GA
          window.gtag('js', new Date());

          // Configure with options to prevent cookie overwrites
          window.gtag('config', 'G-8QH5RNPMBF', {
            cookie_domain: 'auto',
            cookie_flags: 'SameSite=None;Secure',
            cookie_update: false,
            anonymize_ip: true,
            send_page_view: true,
          });
        }

        console.log('Google Tag Manager has been successfully initialized');
        resolve();
      };

      script.onerror = (error) => {
        console.error('Failed to load Google Tag Manager script:', error);
        reject(error);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to load Google Tag Manager script:', error);
      reject(error);
    }
  });
}
