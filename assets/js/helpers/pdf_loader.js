// Renderiza en #pdf-container solo la página del idioma activo de
// /assets/docs/resume.pdf (página 1 = inglés, página 2 = español) y la cambia
// cuando switchLanguages.js dispara `languageChange`.
// Se dibuja a la densidad de la pantalla para que se vea nítida en móvil/retina.
const PDF_URL = '/assets/docs/resume.pdf';
const PAGE_BY_LANG = { en: 1, es: 2 };

export async function loadPdf() {
  const container = document.getElementById('pdf-container');
  if (!container || typeof pdfjsLib === 'undefined') return;

  const pdf = await pdfjsLib.getDocument(PDF_URL).promise;
  let renderId = 0;

  const render = async (lang) => {
    const id = ++renderId; // si cambian el idioma a mitad de render, gana el último
    const pageNum = Math.min(PAGE_BY_LANG[lang] ?? 1, pdf.numPages);
    const page = await pdf.getPage(pageNum);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const viewport = page.getViewport({ scale: 1.5 * dpr });

    const canvas = document.createElement('canvas');
    canvas.className = 'resume__page';
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // Tamaño visual (CSS) = 1.5x; el bitmap va multiplicado por dpr
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', lang === 'es' ? 'Currículum de Alan Quintana' : 'Alan Quintana resume');

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    if (id !== renderId) return;
    container.replaceChildren(canvas);
  };

  window.addEventListener('languageChange', (event) => render(event.detail?.language));

  // switchLanguages() ya fijó <html lang> mientras se descargaba el PDF
  await render(document.documentElement.lang === 'es' ? 'es' : 'en');
}
