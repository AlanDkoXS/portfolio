#!/usr/bin/env node
// Generates the CV PDFs from scripts/cv/data.mjs (no dependencies: uses the
// system Chromium to print and poppler's pdfunite to join).
//
//   node scripts/build-cv.mjs
//
// Output in assets/docs/: [ENG] Alan Quintana.pdf, [ESP] Alan Quintana.pdf and
// resume.pdf (EN + ES, the one /resume shows with pdf.js).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import cv, { contact } from './cv/data.mjs';
import { cvPage } from './lib/cv-page.mjs';
import { CV_FILES, LANGS, ROOT, withTmpDir } from './lib/site.mjs';

const docs = path.join(ROOT, 'assets/docs');
const chromium = process.env.CHROMIUM || 'chromium';
const common = ['--headless=new', '--disable-gpu', '--virtual-time-budget=8000'];

// Prints each language to its PDF (the HTML goes in a temporary directory);
// null if a CV doesn't fit its page
const pdfs = withTmpDir('cv-', (tmp) => {
  const pdfs = [];
  let failed = false;

  for (const lang of LANGS) {
    const htmlFile = path.join(tmp, `cv-${lang}.html`);
    fs.writeFileSync(htmlFile, cvPage({ lang, data: cv[lang], contact }));
    const url = `file://${htmlFile}`;

    const dom = execFileSync(chromium, [...common, '--dump-dom', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const status = dom.match(/<title>([^<]*)<\/title>/)?.[1] ?? '?';
    if (status !== 'FITS') {
      console.error(`✘ CV ${lang}: ${status} — shorten scripts/cv/data.mjs so it fits one Letter page`);
      failed = true;
      continue;
    }

    const out = path.join(docs, CV_FILES[lang]);
    execFileSync(chromium, [...common, '--no-pdf-header-footer', `--print-to-pdf=${out}`, url], { stdio: 'ignore' });
    pdfs.push(out);
    console.log(`✔ ${path.relative(ROOT, out)}`);
  }

  return failed ? null : pdfs;
});

if (!pdfs) process.exit(1);

execFileSync('pdfunite', [...pdfs, path.join(docs, 'resume.pdf')]);
console.log('✔ assets/docs/resume.pdf (page 1 EN, page 2 ES)');
