export function loadEmailJS() {
  // Usar 'defer' para no bloquear el renderizado y 'async' para carga asíncrona
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.defer = true; // Usa defer para no bloquear el renderizado
    script.type = 'text/javascript';

    // Añadir event listeners para manejar la carga correctamente
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

// Implementación mejorada para cargar Google Tag Manager
// Archivo: google-tag-manager.js

export function loadGoogleTagManager() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-8QH5RNPMBF';
    script.async = true; // El script puede cargarse de forma asíncrona

    script.onload = () => {
      try {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-8QH5RNPMBF', {
          page_load_time: true, // Track page load time
          anonymize_ip: true, // Anonymize IP for GDPR compliance
        });
        console.log('Google Tag Manager initialized successfully');
        resolve();
      } catch (error) {
        console.error('Error initializing Google Tag Manager:', error);
        reject(error);
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Tag Manager script:', error);
      reject(error);
    };

    document.head.appendChild(script);
  });
}

// Modificación en main.js para cargar los scripts de manera más eficiente

// Función para cargar recursos externos con baja prioridad
const loadExternalResources = async () => {
  try {
    // Usar Promise.allSettled en lugar de Promise.all para manejar fallos parciales
    // Esto permite que la página continúe funcionando incluso si uno de los scripts falla
    const results = await Promise.allSettled([loadGoogleTagManager(), loadEmailJS()]);

    // Verificar resultados para logging adecuado
    results.forEach((result, index) => {
      const scriptName = index === 0 ? 'Google Tag Manager' : 'EmailJS';
      if (result.status === 'fulfilled') {
        console.log(`${scriptName} loaded successfully`);
      } else {
        console.warn(`${scriptName} failed to load:`, result.reason);
      }
    });
  } catch (error) {
    // Este catch es principalmente para errores en la ejecución del Promise.allSettled mismo
    handleError(error, 'loadExternalResources');
  }
};

// Implementar carga diferida para scripts no críticos
const loadNonCriticalScripts = () => {
  // Usar requestIdleCallback para cargar scripts no críticos cuando el navegador esté inactivo
  // Con fallback a setTimeout para navegadores que no soporten requestIdleCallback
  const loadDuringIdleTime = () => {
    loadExternalResources();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadDuringIdleTime);
  } else {
    setTimeout(loadDuringIdleTime, 1000); // Esperar 1 segundo antes de cargar recursos no críticos
  }
};

// Modificar la función initialize en main.js
const initialize = async () => {
  try {
    // Iniciar la carga de recursos externos de forma no bloqueante
    loadNonCriticalScripts();

    // Continuar con el resto de la inicialización que no depende de scripts externos
    setupDarkMode();
    await initializeUIComponents();
    initializeVisualEffects();
    initializeFunctionalities();
    setupVisibilityHandler();
    setupCleanup();

    AppState.isLoading = false;
  } catch (error) {
    handleError(error, 'initialize');
  }
};
