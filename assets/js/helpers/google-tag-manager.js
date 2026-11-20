// Google Analytics (gtag) sin competir con la carga de la página.
// dataLayer se prepara enseguida (los eventos quedan en cola) y el script se
// inyecta después de `load`, cuando el navegador está libre. Antes se
// inyectaba al arrancar y retrasaba `load`, que es cuando se va el loader.
const GA_ID = "G-8QH5RNPMBF";
let started = false;

const whenIdle = (fn) =>
  "requestIdleCallback" in window
    ? requestIdleCallback(fn, { timeout: 3000 })
    : setTimeout(fn, 1);

const afterLoad = (fn) =>
  document.readyState === "complete"
    ? fn()
    : window.addEventListener("load", fn, { once: true });

// Una página prerenderizada (cambio de idioma) no cuenta hasta que se muestra
const whenActive = (fn) =>
  document.prerendering
    ? document.addEventListener("prerenderingchange", fn, { once: true })
    : fn();

function inject() {
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

export function loadGoogleTagManager() {
  if (started) return;
  started = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  whenActive(() => {
    gtag("js", new Date());
    gtag("config", GA_ID);
    afterLoad(() => whenIdle(inject));
  });
}
