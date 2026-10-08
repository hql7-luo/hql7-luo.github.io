// Check the published analytical contract, uncertainty, chart integrity and protected resumes.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asset = join(root, 'assets/projects/marketing-experimentation-growth-strategy');
const manifest = JSON.parse(readFileSync(join(asset, 'manifest.json')));
const evidenceBytes = readFileSync(join(asset, 'evidence.json'));
const evidence = JSON.parse(evidenceBytes);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const near = (actual, expected, label) => assert(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-10, `${label}: ${actual} != ${expected}`);
assert(hash(evidenceBytes) === manifest.evidence_sha256, 'Aggregate evidence checksum drift');
assert(/^[a-f0-9]{40}$/.test(manifest.source_commit), 'Missing pinned source commit');
assert(readFileSync(join(asset, 'SOURCES.md'), 'utf8').includes(manifest.source_commit), 'Provenance does not link the pinned source commit');
const results = evidence.results;
assert(results.audit.records === 64000 && Object.values(results.audit.arm_counts).reduce((a, b) => a + b, 0) === 64000, 'Source arm counts do not reconcile');
assert(results.audit.rows_removed === 0 && !results.audit.identifier_available, 'Row-retention or identifier boundary drift');
assert(results.audit.source_sha256 === manifest.source_dataset_sha256, 'Dataset identity mismatch');
assert(results.split.train_n === 32000 && results.split.test_n === 32000, 'Fixed evaluation scope drift');
const contrast = (outcome, treatment, reference = 0) => evidence.campaign_contrasts.find(row => row.outcome === outcome && row.treatment === treatment && row.reference === reference);
for (const row of evidence.campaign_contrasts) {
 near(row.effect, row.mean_t - row.mean_c, 'Experimental contrast');
 assert(row.ci_low < row.effect && row.effect < row.ci_high, 'Invalid pointwise campaign interval');
 assert(row.sim_ci_low <= row.ci_low && row.sim_ci_high >= row.ci_high, 'Simultaneous interval is narrower than pointwise interval');
 assert(row.p_holm >= row.p_value && row.p_holm <= 1, 'Invalid multiplicity adjustment');
}
const men = contrast('conversion', 1);
assert(men.effect > contrast('conversion', 2).effect && men.p_holm < 0.05, 'Campaign recommendation lacks conversion support');
const menWomenSpend = contrast('spend', 1, 2);
assert(menWomenSpend.sim_ci_low < 0 && menWomenSpend.sim_ci_high > 0, 'Monetary uncertainty must remain visible');
const paired = evidence.paired_policy_contrasts.find(row => row.policy_b === 'Random Men (50%)');
assert(paired.email_fraction_a === paired.email_fraction_b && paired.spend_ci_low < 0 && paired.spend_ci_high > 0, 'Equal-capacity paired comparison no longer supports the stated uncertainty');
const { contribution_margin: margin, cost_per_email: cost, eligible_customers: n } = evidence.financial_assumptions;
for (const row of results.policies) {
 near(row.email_fraction, row.men_fraction + row.women_fraction, 'Policy action fractions');
 near(row.assumed_contribution_per_10000, n * (margin * row.incremental_spend - cost * row.email_fraction), 'Assumed contribution arithmetic');
 near(row.contribution_ci_low_per_10000, n * (margin * row.spend_ci_low - cost * row.email_fraction), 'Lower contribution interval');
 near(row.contribution_ci_high_per_10000, n * (margin * row.spend_ci_high - cost * row.email_fraction), 'Upper contribution interval');
}
assert(manifest.figures.length === 12, 'Expected six PNG/SVG chart pairs');
for (const ext of ['.png', '.svg']) assert(manifest.figures.filter(row => row.file.endsWith(ext)).length === 6, `Expected six ${ext} charts`);
for (const record of manifest.figures) {
 const bytes = readFileSync(join(asset, record.file));
 assert(hash(bytes) === record.sha256 && bytes.length === record.bytes, `Chart integrity mismatch: ${record.file}`);
 if (record.file.endsWith('.png')) {
  assert(bytes.readUInt32BE(16) === record.width && bytes.readUInt32BE(20) === record.height, `PNG dimensions mismatch: ${record.file}`);
 } else {
  assert(!/<script|<foreignObject|(?:href|src)="https?:/i.test(bytes.toString()), `SVG contains active/external content: ${record.file}`);
 }
}
assert(!readdirSync(asset).some(name => /\.(csv|sqlite|db|parquet)$/i.test(name)), 'Unexpected row-level data container in publication assets');
for (const [name, expected] of Object.entries(manifest.protected_resume_sha256)) assert(hash(readFileSync(join(root, 'assets/resume', name))) === expected, `Protected Resume changed: ${name}`);
const page = readFileSync(join(root, 'projects/marketing-experimentation-growth-strategy.html'), 'utf8');
const dict = JSON.parse(page.match(/<script[^>]+id="translations"[^>]*>([\s\S]*?)<\/script>/)[1]);
const expectedClaims = { men_conversion_pp: men.effect * 100, men_spend: contrast('spend', 1).effect, paired_spend_low: paired.spend_ci_low };
for (const [key, value] of Object.entries(expectedClaims)) {
 const match = page.match(new RegExp(`data-evidence="${key}" data-evidence-value="([^"]+)"[^>]*>([\\s\\S]*?)<\\/strong>`));
 assert(match, `Missing published evidence reference: ${key}`);
 near(Number(match[1]), value, `Published headline: ${key}`);
 if (key !== 'paired_spend_low') {
  const display = Number(match[2].split('<')[0].replace(/[^0-9.+-]/g, ''));
  near(display, Math.round(value * 1000) / 1000, `Rendered headline: ${key}`);
 }
}
assert((page.match(/<figure /g) || []).length === 6, 'Case must use exactly six chart concepts');
for (const lang of ['en', 'zh']) {
 for (const [, key] of page.matchAll(/data-i18n="([^"]+)"/g)) assert(typeof dict[lang][key] === 'string', `Missing ${lang} translation: ${key}`);
 assert(dict[lang]['meg.limit'] && dict[lang]['meg.rights'] && dict[lang]['meg.factualBoundary'] && dict[lang]['meg.methodPolicy'], `Incomplete ${lang} evidence boundary`);
}
console.log('Verified six source-derived chart pairs, campaign/paired-policy evidence, assumed financial arithmetic, bilingual case and unchanged Resume hashes.');
