// Check the replenishment demo: file hashes, data shape, and the browser LP against Python.
// The demo is copied unchanged from hql7-luo/demand-forecast-inventory-optimization (web_demo/).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';

const dir = resolve(import.meta.dirname, '..', 'demos/replenishment');
const require = createRequire(import.meta.url);
const read = f => readFileSync(join(dir, f));
const sha = f => createHash('sha256').update(read(f)).digest('hex');
const manifest = JSON.parse(read('manifest.json'));
assert.equal(sha('data.json'), manifest.data_sha256, 'data.json hash');
for (const [f, h] of Object.entries(manifest.files_sha256)) assert.equal(sha(f), h, `${f} hash`);

const { meta, items, evenings } = JSON.parse(read('data.json'));
assert.equal(items.length, 50);
assert.equal(evenings.length, manifest.evenings);
for (const ev of evenings) {
  for (const key of ['on_hand', 'pipeline', 'sigma']) assert.equal(ev[key].length, items.length);
  assert(ev.forecast.every(row => row.length === meta.horizon && row.every(v => v >= 0)));
}

const model = require(join(dir, 'model.js'));
const highs = await require(join(dir, 'vendor/highs.js'))({ locateFile: f => join(dir, 'vendor', f) });
const close = (a, b, rel, what) => assert(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${what}: ${a} vs ${b}`);
const avg = meta.avg_daily_total, K = meta.base_delivery_mult * avg, C = meta.base_storage_days * avg;
let matching = 0;
for (const c of manifest.checks) {
  const ev = evenings[c.evening];
  close(model.planLP(highs, ev, items, meta, K, C).objective, c.lp_objective, 1e-7, `${c.date} LP objective`);
  close(model.planLP(highs, ev, items, meta, 0.95 * avg, 2.5 * avg).objective, c.lp_objective_tight, 1e-7, `${c.date} tight LP objective`);
  model.ruleOrders(ev, meta, meta.rule_z, K, C).forEach((v, i) => assert(Math.abs(v - c.rule_tonight[i]) <= 1e-3 + 1e-9, `${c.date} rule order ${i}`));
  const rr = model.replay(evenings, c.evening, 7, items, meta, C, e => model.ruleOrders(e, meta, meta.rule_z, K, C)).totals;
  close(rr.total_usd, c.rule_replay.total_usd, 1e-9, `${c.date} rule replay`);
  // The LP can have several optimal plans; most replays must still follow the Python path.
  const lr = model.replay(evenings, c.evening, 7, items, meta, C, e => model.planLP(highs, e, items, meta, K, C).orders.map(o => o[0])).totals;
  if (Math.abs(lr.total_usd - c.lp_replay.total_usd) <= 0.01 * c.lp_replay.total_usd) matching++;
}
assert(matching * 2 > manifest.checks.length, `only ${matching} LP replays match Python`);
console.log(`Verified the replenishment demo: ${evenings.length} evenings, file hashes, ${manifest.checks.length} LP optima equal to Python, exact rule replays, ${matching}/${manifest.checks.length} LP replays on the Python path.`);
