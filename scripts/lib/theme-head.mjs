// Pre-paint theme block of <head> (color-scheme meta and the inline script with
// the 18/6 hours): the lines between <!-- theme:start --> and <!-- theme:end -->.
// index.html is the single source; build-i18n.mjs copies the block to
// resume.html and to the project pages. The comment above the block is not part
// of it: each page keeps its own.

import { fail } from './site.mjs';

// 1: start marker line, 2: the block, 3: end marker line
const BLOCK_RE = /^( {4}<!-- theme:start[^\n]*-->\n)([\s\S]*?)(\n {4}<!-- theme:end -->)$/m;

const failMissing = (file) => fail(`Could not find the <!-- theme:start/end --> block in ${file}`);

/** The lines between the theme markers of `html` (`file` is only for the error message) */
export function extractThemeHead(html, file) {
  const match = html.match(BLOCK_RE);
  if (!match) failMissing(file);
  return match[2];
}

/** `html` with the lines between its theme markers replaced by `block` */
export function injectThemeHead(html, block, file) {
  if (!BLOCK_RE.test(html)) failMissing(file);
  return html.replace(BLOCK_RE, (_m, start, _old, end) => `${start}${block}${end}`);
}

/** `html` without the two marker lines (for generated copies, where the block must not be edited) */
export function stripThemeMarkers(html) {
  return html.replace(BLOCK_RE, (_m, _start, block) => block);
}
