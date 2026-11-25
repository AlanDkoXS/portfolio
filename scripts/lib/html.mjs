// HTML escaping shared by the build scripts and templates.

/** Text nodes: escapes & < > */
export const escapeText = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Double-quoted attribute values: escapes & < > " */
export const escapeAttr = (s) => escapeText(s).replace(/"/g, '&quot;');
