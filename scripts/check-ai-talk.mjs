// Verify that the browser snapshot and copied report retain the published evidence.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const snapshot = JSON.parse(read('assets/projects/ai-hype-vs-performance/explorer.json'));
const rows = snapshot.rows;
assert(rows.length === 3910, 'Expected 3,910 saved filings');
assert(new Set(rows.map(row => row.ticker)).size === 498, 'Expected 498 issuers');
assert(rows.filter(row => row.next_revenue_growth !== null).length === 3304, 'Revenue coverage changed');
assert(rows.filter(row => row.excess_return_12m !== null).length === 3410, 'Return coverage changed');
for (const row of rows) {
  assert(Number.isFinite(row.ai_intensity) && row.ai_intensity >= 0, 'Invalid intensity');
  for (const key of ['next_revenue_growth', 'excess_return_12m']) {
    assert(row[key] === null || Number.isFinite(row[key]), `Invalid ${key}`);
  }
  assert(row.url.startsWith('https://www.sec.gov/Archives/edgar/data/'), 'Expected original SEC source');
  assert(row.filing_date <= snapshot.as_of, 'Observation is after the cutoff');
}
const before = rows.filter(row => row.filing_date < '2022-11-30');
const after = rows.filter(row => row.filing_date >= '2022-11-30');
const mean = group => group.reduce((sum, row) => sum + row.ai_intensity, 0) / group.length;
assert(before.length === 1970 && after.length === 1940, 'Release-date split changed');
assert(mean(before).toFixed(2) === '0.36' && mean(after).toFixed(2) === '2.69', 'Trend does not match the case study');

// Keep report tables and graphics byte-for-byte identical to the verified R project.
const manifest = JSON.parse(read('assets/projects/ai-hype-vs-performance/source-manifest.json'));
for (const [name, expected] of Object.entries(manifest.sha256)) {
  const actual = createHash('sha256').update(readFileSync(resolve(root, name))).digest('hex');
  assert(actual === expected, `Source artifact changed: ${name}`);
}
console.log(`Verified ${rows.length} real filings, 498 issuers, separate outcome coverage, release-date means and ${Object.keys(manifest.sha256).length} source artifacts.`);
