// Google Tag Manager (alanquintana.pro container). GA4 (G-8QH5RNPMBF) and
// any other tag are configured in GTM, not here.
// It's loaded deferred (idle or first interaction) so it doesn't compete with
// the LCP/INP, never locally nor during the speculation rules prerender
// (it would count visits that never happened), and only once per page.
const GTM_ID = 'GTM-MRJGJ8NP';

const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

let started = false;

function injectTag() {
  if (started) return;
  started = true;

  window.dataLayer ??= [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

function scheduleLoad() {
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
  let idleId;

  const load = () => {
    events.forEach((type) => removeEventListener(type, load));
    if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
    injectTag();
  };

  events.forEach((type) => addEventListener(type, load, { once: true, passive: true }));

  if ('requestIdleCallback' in window) {
    idleId = requestIdleCallback(load, { timeout: 4000 });
  } else {
    setTimeout(load, 2500);
  }
}

export function loadGoogleTagManager() {
  if (isLocalhost || started) return;

  // Prerendered page: wait until the user actually activates it
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', scheduleLoad, { once: true });
    return;
  }

  scheduleLoad();
}
