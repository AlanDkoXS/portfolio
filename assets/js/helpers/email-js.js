export function loadEmailJS() {
    (function () {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.type = 'text/javascript';
        document.head.appendChild(script);

        script.onload = function () {
            emailjs.init('U8cUUeHN0_JTVF8xK');
        };
    })();
}
