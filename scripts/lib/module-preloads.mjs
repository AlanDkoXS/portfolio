// <link rel="modulepreload"> of a page must list exactly the modules its
// module scripts import up front (directly or through another module), minus
// those scripts' own imports: the browser discovers those right away, the rest
// only one level at a time. Modules imported on demand (import()) are not
// preloaded. The build fails when a page's list drifts (a renamed helper, a new
// import, one that became lazy).

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, fail } from './site.mjs';

// Static imports only: `import x from '…'`, `import { a } from '…'`, `import '…'`
const STATIC_IMPORT = /^\s*import\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

const staticImports = (source, fromUrl) =>
  [...source.matchAll(STATIC_IMPORT)]
    .map(([, spec]) => spec)
    .filter((spec) => !/^[a-z]+:/i.test(spec)) // other origins (pdf.js) are not checked
    .map((spec) => (spec.startsWith('/') ? spec : path.posix.join(path.posix.dirname(fromUrl), spec)));

/** Every module `urls` import statically, recursively (site URLs, e.g. /assets/js/main.js) */
function staticClosure(urls) {
  const seen = new Set();
  const visit = (url) => {
    if (seen.has(url)) return;
    seen.add(url);
    const file = path.join(ROOT, url);
    if (!fs.existsSync(file)) fail(`module-preloads: ${url} is imported but doesn't exist`);
    staticImports(fs.readFileSync(file, 'utf8'), url).forEach(visit);
  };
  urls.forEach(visit);
  return seen;
}

/** Fails the build unless the modulepreload links of `html` (page `name`) match its eager imports */
export function checkModulePreloads(html, name) {
  const scripts = [...html.matchAll(/<script type="module"(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)];
  // What the HTML itself names: the src of module scripts and the imports of inline ones
  const direct = scripts.flatMap(([, src, body]) => (src ? [src] : staticImports(body, '/')));
  const direct1 = new Set(direct);
  const expected = [...staticClosure(direct)].filter((url) => !direct1.has(url));
  const preloaded = [...html.matchAll(/<link rel="modulepreload" href="(\/[^"]+)"/g)].map(([, href]) => href);

  const missing = expected.filter((url) => !preloaded.includes(url));
  const extra = preloaded.filter((url) => !expected.includes(url));
  if (missing.length || extra.length) {
    fail(
      `${name}: <link rel="modulepreload"> out of date` +
        (missing.length ? `\n  missing: ${missing.join(', ')}` : '') +
        (extra.length ? `\n  not imported up front (remove): ${extra.join(', ')}` : ''),
    );
  }
}
