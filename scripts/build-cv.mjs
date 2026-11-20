#!/usr/bin/env node
// Genera los CV en PDF desde scripts/cv/data.mjs (sin dependencias: usa el
// Chromium del sistema para imprimir y pdfunite de poppler para unir).
//
//   node scripts/build-cv.mjs
//
// Salida en assets/docs/: [ENG] Alan Quintana.pdf, [ESP] Alan Quintana.pdf y
// resume.pdf (EN + ES, la que muestra /resume con pdf.js).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { default: cv, contact } = await import(path.join(root, 'scripts/cv/data.mjs'));
const docs = path.join(root, 'assets/docs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
const chromium = process.env.CHROMIUM || 'chromium';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const icon = {
  web: '<svg viewBox="0 0 24 24"><path d="M3 4h18v14H3zM1 20h22v1H1z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>',
  email: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 7 9-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

function page(lang) {
  const d = cv[lang];
  const L = d.labels;
  const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<title>Alan Quintana — CV (${lang.toUpperCase()})</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=block" rel="stylesheet" />
<style>
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-family: 'Poppins', sans-serif; color: #1f1f1f; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 8.5in; height: 11in; padding: 0.55in 0.6in 0.45in; overflow: hidden; display: flex; flex-direction: column; }
  h1 { font-size: 34pt; font-weight: 700; letter-spacing: 0.01em; line-height: 1; text-transform: uppercase; }
  .role { font-size: 13pt; font-weight: 300; letter-spacing: 0.14em; margin-top: 4pt; }
  .contact { display: flex; justify-content: center; gap: 22pt; margin: 16pt 0 0; padding-bottom: 10pt; border-bottom: 1.2pt solid #1f1f1f; font-size: 8pt; }
  .contact span { display: inline-flex; align-items: center; gap: 4pt; }
  .contact svg { width: 10pt; height: 10pt; }
  .cols { display: grid; grid-template-columns: 1.55in 1fr; flex: 1; margin-top: 14pt; }
  .left { padding-right: 12pt; border-right: 1pt solid #1f1f1f; }
  .right { padding-left: 14pt; }
  h2 { font-size: 9pt; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 4pt; }
  section + section { margin-top: 12pt; }
  h3 { font-size: 8.4pt; font-weight: 600; }
  p, li { font-size: 7.6pt; line-height: 1.42; }
  .muted { color: #8a8a8a; }
  .left h3 { margin-top: 6pt; }
  .left ul { list-style: none; }
  .left li::before { content: '•'; margin-right: 6pt; }
  .right ul { padding-left: 11pt; margin-top: 2pt; }
  .right li { color: #444; }
  .item + .item { margin-top: 6pt; }
  .item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8pt; }
  .item-head h3 { font-size: 8.6pt; }
  .item-head .url { font-weight: 400; color: #8a8a8a; font-size: 7.4pt; margin-left: 4pt; }
  .date { font-size: 6.8pt; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
  .lead { font-size: 7.6pt; color: #444; }
  .exp-head { margin-bottom: 4pt; }
  .exp-head p { color: #8a8a8a; }
</style>
</head>
<body>
<div class="sheet" id="sheet">
  <header>
    <h1>Alan Quintana</h1>
    <p class="role">${esc(d.role)}</p>
    <div class="contact">
      <span>${icon.web}${contact.web}</span>
      <span>${icon.phone}${contact.phone}</span>
      <span>${icon.email}${contact.email}</span>
    </div>
  </header>
  <div class="cols">
    <aside class="left">
      <section>
        <h2>${L.education}</h2>
        <h3>${esc(d.education.title)}</h3>
        <p>${esc(d.education.school)}</p>
        <p class="muted">${d.education.years}</p>
      </section>
      <section>
        <h2>${L.stack}</h2>
        ${d.stack.map(([group, items]) => `<h3>${esc(group)}</h3>${list(items)}`).join('\n        ')}
      </section>
      <section>
        <h2>${L.languages}</h2>
        ${list(d.languages)}
      </section>
    </aside>
    <main class="right">
      <section>
        <h2>${L.profile}</h2>
        <p class="muted">${esc(d.profile)}</p>
      </section>
      <section>
        <h2>${L.experience}</h2>
        <div class="exp-head">
          <div class="item-head"><h3>${esc(d.experience.title)}</h3><span class="date">${esc(d.experience.dates)}</span></div>
          <p class="lead">${esc(d.experience.role)}</p>
          <p>${esc(d.experience.summary)}</p>
        </div>
        <ul>
          ${d.experience.items.map(([name, url, year, text]) => `<li><strong>${esc(name)}</strong> <span class="muted">(${esc(url)}, ${year})</span>: ${esc(text)}</li>`).join('\n          ')}
        </ul>
      </section>
      <section>
        <h2>${L.projects}</h2>
        ${d.projects
          .map(
            ([name, year, lead, bullets]) => `<div class="item">
          <div class="item-head"><h3>${esc(name)}</h3><span class="date">${year}</span></div>
          <p class="lead">${esc(lead)}</p>
          ${list(bullets)}
        </div>`,
          )
          .join('\n        ')}
      </section>
      <section>
        <h2>${L.expertise}</h2>
        ${list(d.expertise)}
      </section>
      <section>
        <h2>${L.tools}</h2>
        <p>${esc(d.tools)}</p>
      </section>
    </main>
  </div>
</div>
<script>
  // Señal para el build: ¿el contenido se desborda de la hoja?
  document.fonts.ready.then(() => {
    const s = document.getElementById('sheet');
    document.title = s.scrollHeight > s.clientHeight + 1 ? 'OVERFLOW ' + (s.scrollHeight - s.clientHeight) + 'px' : 'FITS';
  });
</script>
</body>
</html>
`;
}

const outputs = { en: '[ENG] Alan Quintana.pdf', es: '[ESP] Alan Quintana.pdf' };
const pdfs = [];
let failed = false;

for (const lang of ['en', 'es']) {
  const htmlFile = path.join(tmp, `cv-${lang}.html`);
  fs.writeFileSync(htmlFile, page(lang));
  const url = `file://${htmlFile}`;
  const common = ['--headless=new', '--disable-gpu', '--virtual-time-budget=8000'];

  const dom = execFileSync(chromium, [...common, '--dump-dom', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const status = dom.match(/<title>([^<]*)<\/title>/)?.[1] ?? '?';
  if (status !== 'FITS') {
    console.error(`✘ CV ${lang}: ${status} — shorten scripts/cv/data.mjs so it fits one Letter page`);
    failed = true;
    continue;
  }

  const out = path.join(docs, outputs[lang]);
  execFileSync(chromium, [...common, '--no-pdf-header-footer', `--print-to-pdf=${out}`, url], { stdio: 'ignore' });
  pdfs.push(out);
  console.log(`✔ ${path.relative(root, out)}`);
}

if (failed) process.exit(1);

execFileSync('pdfunite', [...pdfs, path.join(docs, 'resume.pdf')]);
console.log('✔ assets/docs/resume.pdf (page 1 EN, page 2 ES)');
fs.rmSync(tmp, { recursive: true, force: true });
