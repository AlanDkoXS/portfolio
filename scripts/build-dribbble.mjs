#!/usr/bin/env node
// Downloads the Dribbble shots and gets them ready for the "Designs" section
// of the home page. Run it by hand after uploading new shots; the token never
// reaches the browser.
//
//   DRIBBBLE_TOKEN=xxxx node scripts/build-dribbble.mjs   (DRIBBBLE_LIMIT=12 optional)
//
// - assets/img/dribbble/<id>.webp  → cover of each shot, 800×600 (2× the card)
// - scripts/data/dribbble.json     → shot data (committed)
// - then runs build-i18n.mjs, which writes the section into index.html and es/index.html
//
// The token is an access token of a Dribbble app ("public" scope):
// https://dribbble.com/account/applications

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.DRIBBBLE_TOKEN;
const limit = Number(process.env.DRIBBBLE_LIMIT) || 12;
const imgDir = path.join(root, 'assets/img/dribbble');
const dataPath = path.join(root, 'scripts/data/dribbble.json');
const SIZE = { width: 800, height: 600 };

if (!token) {
  console.error('Missing DRIBBBLE_TOKEN (access token from https://dribbble.com/account/applications)');
  process.exit(1);
}

const api = async (endpoint) => {
  const res = await fetch(`https://api.dribbble.com/v2${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Dribbble ${endpoint}: ${res.status} ${res.statusText}`);
  return res.json();
};

const [user, shots] = await Promise.all([api('/user'), api(`/user/shots?per_page=${limit}`)]);

fs.mkdirSync(imgDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dribbble-'));

const items = [];
for (const shot of shots.slice(0, limit)) {
  const src = shot.images?.hidpi || shot.images?.normal;
  if (!src) continue;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Image of shot ${shot.id}: ${res.status}`);
  const raw = path.join(tmp, String(shot.id));
  fs.writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  const file = `${shot.id}.webp`;
  // [0]: first frame if the shot is animated (GIF)
  execFileSync('magick', [
    `${raw}[0]`,
    '-resize', `${SIZE.width}x${SIZE.height}^`,
    '-gravity', 'center',
    '-extent', `${SIZE.width}x${SIZE.height}`,
    '-strip',
    '-quality', '82',
    path.join(imgDir, file),
  ]);
  items.push({
    id: shot.id,
    title: shot.title,
    url: shot.html_url,
    image: `/assets/img/dribbble/${file}`,
    ...SIZE,
    publishedAt: shot.published_at,
  });
}
fs.rmSync(tmp, { recursive: true, force: true });

// Deletes covers of shots that no longer exist
const keep = new Set(items.map((s) => `${s.id}.webp`));
for (const f of fs.readdirSync(imgDir)) if (!keep.has(f)) fs.rmSync(path.join(imgDir, f));

fs.writeFileSync(dataPath, JSON.stringify({ profile: user.html_url, shots: items }, null, 2) + '\n');
console.log(`✔ ${items.length} Dribbble shots in scripts/data/dribbble.json`);

execFileSync(process.execPath, [path.join(root, 'scripts/build-i18n.mjs')], { stdio: 'inherit' });
