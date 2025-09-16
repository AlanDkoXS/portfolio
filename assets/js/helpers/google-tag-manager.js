export function loadGoogleTagManager() {
    // Insert Google Tag Manager script
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-8QH5RNPMBF";
    script.async = true;
    document.head.appendChild(script);

    // Basic Google Analytics configuration
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-8QH5RNPMBF");
}
