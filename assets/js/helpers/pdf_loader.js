export function loadPdf() {
  const url = '/assets/docs/resume.pdf';

  pdfjsLib.getDocument(url).promise.then(function (pdf) {
    const numPages = pdf.numPages;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      pdf.getPage(pageNum).then(function (page) {
        const scale = 1.5;
        const viewport = page.getViewport({
          scale: scale,
        });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
          canvasContext: context,
          viewport: viewport,
        });

        document.getElementById('pdf-container').appendChild(canvas);
      });
    }
  });
}
