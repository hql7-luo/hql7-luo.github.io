// Publication checks for bilingual cases, image references and generated assets.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', ...readdirSync(join(root, 'projects')).filter(f => f.endsWith('.html')).map(f => `projects/${f}`)];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
let images = 0;
for (const file of pages) {
 const html = readFileSync(join(root, file), 'utf8');
 const block = html.match(/<script[^>]+id="translations"[^>]*>([\s\S]*?)<\/script>/);
 assert(block, `${file}: missing translations`);
 const dictionary = JSON.parse(block[1]);
 for (const language of ['en', 'zh']) {
  assert(dictionary[language], `${file}: missing ${language}`);
  for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) assert(typeof dictionary[language][key] === 'string', `${file}: missing ${language}.${key}`);
 }
 const en = Object.keys(dictionary.en).sort();
 const zh = Object.keys(dictionary.zh).sort();
 assert(JSON.stringify(en) === JSON.stringify(zh), `${file}: bilingual key mismatch`);
 for (const [, attr, value] of html.matchAll(/\b(src|href|data-src-en|data-src-zh)="([^"]+)"/g)) {
  if (/^(https?:|mailto:|data:|#)/.test(value)) continue;
  const clean = decodeURIComponent(value.split(/[?#]/)[0]);
  const target = resolve(dirname(join(root, file)), clean);
  assert(target.startsWith(root), `${file}: asset escapes site root`);
  assert(existsSync(target), `${file}: missing ${attr} ${value}`);
  if (attr === 'src') images++;
 }
 // Validate every responsive image candidate, not only the desktop fallback.
 for (const [, value] of html.matchAll(/\bsrcset="([^"]+)"/g)) {
  for (const candidate of value.split(',')) {
   const url = candidate.trim().split(/\s+/)[0];
   if (/^(https?:|data:)/.test(url)) continue;
   assert(existsSync(resolve(dirname(join(root, file)), url)), `${file}: missing srcset ${url}`);
  }
 }
}
const assets = join(root, 'assets/projects/foreign-customer-investigation');
const manifest = JSON.parse(readFileSync(join(assets, 'manifest.json')));
for (const [name, expected] of Object.entries(manifest.visual_sha256)) {
 const source = readFileSync(join(assets, name));
 assert(createHash('sha256').update(source).digest('hex') === expected, `Customer visual hash mismatch: ${name}`);
 assert(statSync(join(assets, name)).size < 100_000, `Customer SVG unexpectedly large: ${name}`);
 assert(!/<script|<foreignObject|(?:href|src)="https?:/i.test(source.toString()), `Customer SVG has active/external content: ${name}`);
}
const total = Object.values(manifest.dimensions).reduce((sum, d) => sum + d.score, 0) + manifest.risk_deduction;
assert(total === manifest.total_score && total === 97 && manifest.grade === 'A', 'Fictional Aurora fixture does not reconcile');
assert(manifest.fictional_notice.includes('FICTIONAL'), 'Missing fictional notice');
for (const folder of ['b2b-export-sales', 'foreign-trade-enterprise-rag', 'what-to-eat-today']) {
 const directory = join(root, 'assets/projects', folder);
 const hashes = JSON.parse(readFileSync(join(directory, 'visual-hashes.json')));
 for (const [name, record] of Object.entries(hashes)) {
  const content = readFileSync(join(directory, name));
  assert(createHash('sha256').update(content).digest('hex') === record.sha256, `Workflow visual hash mismatch: ${folder}/${name}`);
  assert(content.length === record.bytes && content.length < 500_000, `Unexpected workflow image size: ${folder}/${name}`);
 }
}
console.log(`Verified ${pages.length} bilingual pages, ${images} resource references, responsive images and four source-derived customer SVGs.`);
