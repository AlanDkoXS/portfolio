// Facts about the site and small utilities shared by every build script:
// where the repo is, the public domain, the languages and their URLs.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Repo root (this file lives in scripts/lib/) */
export const ROOT = path.resolve(import.meta.dirname, '../..');

export const SITE = 'https://alanquintana.pro';

/** Languages of the site; the first one is the default (x-default) */
export const LANGS = ['en', 'es'];

/** Directory (relative to the root, no slashes around) of the project pages per language */
export const PROJECT_DIRS = { en: 'projects', es: 'es/proyectos' };

export const homePath = (lang) => (lang === 'en' ? '/' : '/es/');

export const projectPath = (project, lang) => `/${PROJECT_DIRS[lang]}/${project.slug}/`;

/** File name of the CV PDF per language, inside assets/docs/ (resume.html repeats them) */
export const CV_FILES = { en: '[ENG] Alan Quintana.pdf', es: '[ESP] Alan Quintana.pdf' };

/** Prints the message to stderr and ends the build with exit code 1 */
export function fail(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Runs fn(dir) with a fresh temporary directory and removes it afterwards,
 * also when fn throws. fn may be sync or async (then a promise is returned).
 */
export function withTmpDir(prefix, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  let result;
  try {
    result = fn(dir);
  } catch (error) {
    cleanup();
    throw error;
  }
  if (typeof result?.then === 'function') return result.finally(cleanup);
  cleanup();
  return result;
}
