// Keep published routes, search discovery and local link targets in agreement.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://hql7-luo.github.io';
// These paths are separate repositories' Pages deployments, checked as external links.
const projectSites = new Set(['china-brands-going-global', 'llm-selection-roi',
  'rideshare-platform-economics', 'tariff-sourcing-decision', 'what-to-eat-today']);
const pages = ['index.html', ...readdirSync(resolve(root, 'projects'))
  .filter(file => file.endsWith('.html')).map(file => `projects/${file}`), 'demos/supply-chain/index.html'];
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const read = file => readFileSync(resolve(root, file), 'utf8');
const route = file => '/' + file.replace(/index\.html$/, '');
let links = 0;

for (const file of pages) {
  const html = read(file);
  const expected = origin + route(file);
  assert(html.includes(`rel="canonical" href="${expected}"`), `${file}: canonical does not match its route`);
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const url = new URL(href.replaceAll('&amp;', '&'), expected);
    if (url.origin !== origin) continue;
    if (/^https?:/.test(href) && projectSites.has(url.pathname.split('/')[1])) continue;
    let target = resolve(root, '.' + decodeURIComponent(url.pathname));
    assert(!relative(root, target).split(sep).includes('..'), `${file}: link escapes the site root`);
    assert(existsSync(target), `${file}: missing link target ${href}`);
    if (statSync(target).isDirectory()) target = resolve(target, 'index.html');
    assert(existsSync(target), `${file}: missing directory index for ${href}`);
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      const ids = [...readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert(ids.includes(id), `${file}: missing fragment ${href}`);
    }
    links++;
  }
}

const locations = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(new Set(locations).size === locations.length, 'Sitemap contains duplicate routes');
const expected = pages.map(file => origin + route(file)).sort();
assert(JSON.stringify([...locations].sort()) === JSON.stringify(expected), 'Sitemap must contain every published page exactly once');
assert(read('robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt must advertise the sitemap');
console.log(`Verified ${pages.length} canonical routes, ${links} internal links and complete sitemap coverage.`);
