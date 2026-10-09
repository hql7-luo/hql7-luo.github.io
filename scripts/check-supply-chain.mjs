// Check the published analytics payload, bilingual case markup and referenced image integrity.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const payload=JSON.parse(read('demos/supply-chain/data.json'));
const manifest=JSON.parse(read('demos/supply-chain/manifest.json'));
assert.equal(payload.scope,'demo');
assert.equal(payload.series_count,200);
assert.equal(payload.rows,19400);
assert.equal(payload.items.length,200);
assert.equal(payload.dates.length,97);
assert.equal(payload.dates[0],'2024-03-28');
assert.equal(payload.dates.at(-1),'2024-07-02');
assert.equal(new Set(payload.dates).size,97);
for(let i=1;i<payload.dates.length;i++)assert.equal(Date.parse(payload.dates[i])-Date.parse(payload.dates[i-1]),86400000);
assert.equal(new Set(payload.items.map(item=>item.series_id)).size,200);
assert.equal(createHash('sha256').update(readFileSync(resolve(root,'demos/supply-chain/data.json'))).digest('hex'),manifest.data_sha256);
let days=0,hours=0,error=0,actual=0,observations=0;
for(const row of payload.items){
  assert.equal(row.history.length,97);
  assert.equal(row.forecasts.filter(value=>value[3]==='holdout').length,7);
  assert.equal(row.forecasts.filter(value=>value[3]==='future').length,7);
  assert.deepEqual(row.forecasts.filter(value=>value[3]==='holdout').map(value=>value[0]),payload.dates.slice(-7));
  assert.deepEqual(row.forecasts.filter(value=>value[3]==='future').map(value=>value[0]),Array.from({length:7},(_,i)=>`2024-07-${String(i+3).padStart(2,'0')}`));
  for(const [date,value,,split] of row.forecasts)if(split==='holdout')assert.equal(value,row.history[payload.dates.indexOf(date)][0]);
  for(const [sales,exposure] of row.history){assert(Number.isFinite(sales)&&sales>=0);assert(Number.isInteger(exposure)&&exposure>=0&&exposure<=16);days+=exposure>0?1:0;hours+=exposure;observations++;}
  for(const [,value,prediction,split] of row.forecasts){assert(Number.isFinite(prediction)&&prediction>=0);if(split==='holdout'){assert(Number.isFinite(value)&&value>=0);actual+=Math.abs(value);error+=Math.abs(value-prediction);}else assert.equal(value,null);}
}
assert.equal(observations,payload.rows);
assert(Math.abs(days/observations-payload.kpis.stockout_day_rate)<1e-12);
assert(Math.abs(hours/(16*observations)-payload.kpis.stockout_hour_rate)<1e-12);
assert(Math.abs(error/actual-payload.kpis.wape)<1e-12);
assert(Math.abs(payload.items.reduce((sum,item)=>sum+item.recent_sales_share,0)-1)<1e-12);
const file='projects/supply-chain-decision-intelligence.html', html=read(file);
const translations=JSON.parse(html.match(/<script type="application\/json" id="translations">([\s\S]*?)<\/script>/)[1]);
for(const match of html.matchAll(/data-i18n="([^"]+)"/g))for(const lang of ['en','zh'])assert(translations[lang][match[1]],`Missing ${lang}: ${match[1]}`);
const images=[...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)];
assert.equal(images.length,7);
assert.equal([...html.matchAll(/data-scdi-chart(?:\s|>)/g)].length,5);
assert.equal([...html.matchAll(/data-scdi-overview(?:\s|>)/g)].length,1);
for(const [tag,src] of images){assert(/\balt="[^"]+"/.test(tag));assert(existsSync(resolve(root,dirname(file),src)),`Missing ${src}`);}
for(const match of html.matchAll(/href="([^"#?]+\.png)"/g))assert(existsSync(resolve(root,dirname(file),match[1])));
const hashes=JSON.parse(read('assets/projects/supply-chain-decision-intelligence/chart-hashes.json'));
for(const [name,hash] of Object.entries(hashes.sha256)){if(typeof hash!=='string')continue;assert.equal(createHash('sha256').update(readFileSync(resolve(root,'assets/projects/supply-chain-decision-intelligence',name))).digest('hex'),hash);}
const overview=JSON.parse(read('assets/projects/supply-chain-decision-intelligence/management-action-overview.json'));
const sourceBytes=readFileSync(resolve(root,'assets/projects/supply-chain-decision-intelligence/full-data-findings.json'));
const full=JSON.parse(sourceBytes);
assert.equal(createHash('sha256').update(sourceBytes).digest('hex'),overview.source_file_sha256);
for(const [key,value] of Object.entries(overview.full_scope))assert.equal(value,full.data[key]);
assert.equal(overview.risk_window.high_priority_series,full.risk_window.high_priority_series);
assert.equal(overview.forecast.fixed_ses_holdout_wape,full.forecast.holdout_metrics.baselines['ses_alpha0.3'].wape);
assert.equal(overview.forecast.selected_models_holdout_wape,full.forecast.holdout_metrics.all_days.wape);
assert(overview.forecast.fixed_ses_holdout_wape<overview.forecast.selected_models_holdout_wape);
const svg=read('assets/projects/supply-chain-decision-intelligence/management-action-overview.svg');
assert(!/<script|<foreignObject|(?:href|src)="https?:/i.test(svg));
console.log('Verified: 200 real series, 19,400 observations, scoped KPIs, forecast splits, bilingual case and image integrity.');
