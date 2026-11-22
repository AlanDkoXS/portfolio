// i18n render: fills an HTML page with the texts of one language from
// assets/js/languages/translations.js.
//
// Markup conventions (see language-switcher.js, which uses the same ones at runtime):
//   data-i18n="key.path"            element text is replaced by the translation
//   data-i18n-attr="attr:key;..."   attribute values are replaced by translations
// Elements with data-i18n must contain only text (no nested tags of the same name).

import translations from '../../assets/js/languages/translations.js';
import { translate } from '../../assets/js/languages/translate.js';
import { escapeAttr, escapeText } from './html.mjs';
import { fail } from './site.mjs';

const emphasize = (s) => s.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

// Keys asked for and not found; reported all together by failOnMissing()
const missing = new Set();

/** The translation of `key` in `lang`, or null (and the key is noted as missing) */
export function t(key, lang) {
  const value = translate(translations, key, lang);
  if (typeof value !== 'string') {
    missing.add(`${key} (${lang})`);
    return null;
  }
  return value;
}

/** Ends the build listing every translation key that was missing so far */
export function failOnMissing() {
  if (missing.size) fail('Missing translations:\n  ' + [...missing].join('\n  '));
}

export function render(html, lang) {
  // <html lang="..">
  let out = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);

  // Element text: <tag ... data-i18n="key" ...>text</tag>
  out = out.replace(
    /(<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (m, open, _tag, key, _text, close) => {
      const value = t(key, lang);
      // *text* → <strong>text</strong> (emphasis in translated texts)
      return value === null ? m : `${open}${emphasize(escapeText(value))}${close}`;
    },
  );

  // Attributes: <tag ... data-i18n-attr="content:meta.title;href:meta.url" ...>
  out = out.replace(/<[a-zA-Z][^>]*?\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const value = t(key, lang);
      if (value === null) continue;
      const attrRe = new RegExp(`(\\s${attr}=")[^"]*(")`);
      tag = tag.replace(attrRe, `$1${escapeAttr(value)}$2`);
    }
    return tag;
  });

  // Structured data: <script type="application/ld+json" data-i18n-jsonld>
  // gets translations.meta[lang].jsonLd merged over its fields.
  out = out.replace(
    /(<script type="application\/ld\+json" data-i18n-jsonld>)([\s\S]*?)(\n(\s*)<\/script>)/,
    (m, open, body, close, indent) => {
      const overrides = translations.meta?.[lang]?.jsonLd;
      if (!overrides) return m;
      const data = { ...JSON.parse(body), ...overrides };
      const json = JSON.stringify(data, null, 2)
        .replace(/</g, '\\u003c') // never close the <script> early
        .split('\n')
        .map((line) => `${indent}  ${line}`)
        .join('\n');
      return `${open}\n${json}${close}`;
    },
  );

  return out;
}
