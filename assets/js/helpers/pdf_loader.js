// Renders into #pdf-container only the active language's page of
// /assets/docs/resume.pdf (page 1 = English, page 2 = Spanish) and swaps it
// when switchLanguages.js dispatches `languageChange`.
// It's drawn at the screen's pixel density so it looks sharp on mobile/retina.
// pdf.js is imported as a module when used (it used to be a sync <script> in the
// <head> that blocked parsing); resume.html fetches it early with modulepreload.
// pdf.js wraps the cross-origin worker in a blob, so it works from the CDN.
const PDFJS_VERSION = '4.10.38';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
const PDF_URL = '/assets/docs/resume.pdf';
const PAGE_BY_LANG = { en: 1, es: 2 };

export async function loadPdf() {
  const container = document.getElementById('pdf-container');
  if (!container) return;

  let pdfjsLib;
  try {
    pdfjsLib = await import(`${PDFJS_BASE}/pdf.min.mjs`);
  } catch (error) {
    // Without the CDN the CV is still available through the download buttons
    console.error('Could not load pdf.js:', error);
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument(PDF_URL).promise;
  let renderId = 0;

  const render = async (lang) => {
    const id = ++renderId; // if the language changes mid-render, the last one wins
    const pageNum = Math.min(PAGE_BY_LANG[lang] ?? 1, pdf.numPages);
    const page = await pdf.getPage(pageNum);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const viewport = page.getViewport({ scale: 1.5 * dpr });

    const canvas = document.createElement('canvas');
    canvas.className = 'resume__page';
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // Visual (CSS) size = 1.5x; the bitmap is multiplied by dpr
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', lang === 'es' ? 'Currículum de Alan Quintana' : 'Alan Quintana resume');

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    if (id !== renderId) return;
    container.replaceChildren(canvas);
  };

  window.addEventListener('languageChange', (event) => render(event.detail?.language));

  // switchLanguages() already set <html lang> while the PDF was downloading
  await render(document.documentElement.lang === 'es' ? 'es' : 'en');
}
