// Google Tag Manager (contenedor alanquintana.pro). GA4 (G-8QH5RNPMBF) y
// cualquier otra etiqueta se configuran en GTM, no aquí.
// Se carga diferido (inactividad o primera interacción) para no competir con
// el LCP/INP, nunca en local ni durante el prerender de speculation rules
// (contaría visitas que no ocurrieron), y una sola vez por página.
const GTM_ID = "GTM-MRJGJ8NP";

const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

let started = false;

function injectTag() {
    if (started) return;
    started = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    script.async = true;
    document.head.appendChild(script);
}

function scheduleLoad() {
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    let idleId;

    const load = () => {
        events.forEach((type) => removeEventListener(type, load));
        if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
        injectTag();
    };

    events.forEach((type) => addEventListener(type, load, { once: true, passive: true }));

    if ("requestIdleCallback" in window) {
        idleId = requestIdleCallback(load, { timeout: 4000 });
    } else {
        setTimeout(load, 2500);
    }
}

export function loadGoogleTagManager() {
    if (isLocalhost || started) return;

    // Página prerenderizada: esperar a que el usuario la active de verdad
    if (document.prerendering) {
        document.addEventListener("prerenderingchange", scheduleLoad, { once: true });
        return;
    }

    scheduleLoad();
}
