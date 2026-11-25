/**
 * Resolve a translation key for a language.
 * Key paths put the language right after the first segment:
 *   'homeTitle'          → translations.homeTitle[lang]
 *   'contactForm.name'   → translations.contactForm[lang].name
 *   'skillsTags.2'       → translations.skillsTags[lang][2]
 * Shared by language-switcher.js (browser) and scripts/build-i18n.mjs (Node).
 */
export function translate(translations, key, lang) {
  const [rootKey, ...rest] = key.split('.');
  let value = translations[rootKey]?.[lang];
  for (const part of rest) value = value?.[part];
  return value;
}
