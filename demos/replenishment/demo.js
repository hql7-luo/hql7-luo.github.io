/* Live replenishment demo: solve the LP in the browser and replay a week on real sales. */
'use strict';
const M = window.ReplenishmentModel;
const $ = id => document.getElementById(id);
const LANGUAGE_KEY = 'portfolio-language';   // shared with the portfolio site

const ZH = {
  back: '← 项目案例', eyebrow: '供应链 · 实时优化 DEMO', title: '在浏览器里为 50 个食品重新规划今晚的订货。',
  scope: 'Walmart 门店 CA_1 · 50 个 FOODS_3 商品 · 83 个晚上，2016 年 2 月 29 日至 5 月 21 日',
  boundary: '销量和货架价格是真实数据（M5）。成本、送货上限和库存上限是假设。每个晚上的在手库存和在途订单来自项目的 84 天 LP 回测。',
  intro: '选一个晚上，设定门店的容量上限。线性规划（HiGHS 求解器，编译成 WebAssembly）会为每个商品规划接下来六个晚上的订货。然后用真实销量回放接下来 7 天，和常见的补货规则（order-up-to）对比。',
  planNav: '今晚的计划', replayNav: '回放一周', backtestNav: '84 天结果', sourceNav: '原理',
  s1: '01 · 计划', planTitle: '今晚的计划', evening: '晚上', delivery: '送货上限（平均日需求的倍数）', storage: '库存上限（平均需求的天数）',
  presets: '情景：', presetBase: '基准设置', presetTightDelivery: '送货吃紧（0.95×）', presetTightStorage: '库存吃紧（2.5 天）', presetLoose: '送货宽松（1.30×）', presetNote: 'Demo 默认打开“库存吃紧”，这时统一规划所有商品最有用。点“基准设置”可以换回门店的默认参数。', loading: '正在加载求解器（4 MB）和数据……', chartTitle: '每个晚上计划的订货量（50 个商品合计）',
  chartNote: '只执行今晚的订单，明晚会用新的销量重新求解。订货两天后到，所以每根柱子对比的是它到货那天的预测需求。',
  tableTitle: '今晚 LP 和规则分歧最大的商品',
  tableNote: '按两种订单的差距排序。规则订到"2 天预测 + 99.9% 缓冲"（回测里它的最优目标），卡车或空间不够时把所有商品按同一比例砍。',
  item: '商品', margin: '每件毛利', onHand: '今晚在手', arriving: '明早到货', forecast2: '未来 2 天预测', lpOrder: 'LP 今晚订', ruleOrder: '规则今晚订', actual2: '未来 2 天实际销量',
  showAll: '显示全部 50 个商品', showFewer: '只显示前 12 个',
  s2: '02 · 回放', replayTitle: '用真实销量回放接下来 7 天',
  replayIntro: '两种策略都从今晚的库存出发，面对同样的真实销量和你设定的上限，每晚下单。LP 每晚重新求解。',
  runReplay: '回放 7 天', replayNote: '一周的结果波动很大，有些周规则会赢。下面的 84 天回测才是公平的比较。',
  s3: '03 · 回测', backtestTitle: '84 天回测结果', backtestIntro: '每种规则都用它总成本最低的服务水平，并且是看过测试期结果后挑的（对规则最有利）。LP 没有需要调的参数。',
  capacityTitle: '容量变化时的总成本', sourceTitle: '原理和局限',
  how1: '预测：Holt-Winters（阻尼趋势、周季节），每晚用最近 364 天重新拟合。日误差 33.8%，7 天移动平均是 39.4%。',
  how2: '计划：一个线性规划同时安排 50 个商品、7 天。成本包括：满足不了的预测需求损失的毛利、预测误差带来的期望缺货损失的毛利（分段线性的正态损失曲线）、持有成本，以及每件放不下被退回的货 $0.10。',
  how3: '上限：每天送到的件数，以及到货后在手的件数，由所有商品共用。',
  how4: '同一个模型在项目里用 Python 运行。在 6 个测试晚上，浏览器和 Python 求出的最优成本相同。',
  how5: '用记录的销量代替需求，商品缺货时会低估需求。成本和上限都是假设。',
  github: '在 GitHub 查看代码、数据和完整结果 ↗', footer: '独立作品集项目。求解器完全在你的浏览器里运行，不会向服务器发送任何数据。',
  // dynamic
  kpiLp: 'LP 今晚订的件数', kpiRule: '规则今晚订的件数', kpiLimit: '今晚的送货上限（件）', kpiSolve: '在你的浏览器里求解用时', kpiMoved: 'LP 和规则分配给不同商品的件数',
  weekly: w => `测试期内全部 ${w.weeks} 个 7 天窗口：基准设置下 LP 在 ${w.baseWins} 周更便宜，平均每周成本低 ${w.baseShare}；送货吃紧（0.95×）时在 ${w.tightWins} 周更便宜，平均低 ${w.tightShare}；库存吃紧（2.5 天）时在 ${w.storageWins} 周更便宜，平均低 ${w.storageShare}。`,
  legendLp: 'LP 订货计划', legendForecast: '到货当天的预测需求', legendLimit: '送货上限', tonight: '今晚',
  ruleName: '补货规则（99.9%）', lpName: 'Holt-Winters + LP', replaying: '正在回放……每晚求解一次 LP',
  fillRate: '填充率', lostUnits: '缺货件数', lostUsd: '损失毛利', holdingUsd: '持有成本', returnsUsd: '退货成本', totalUsd: '总成本',
  day: '日期', demand: '需求', lostRule: '规则缺货', lostLp: 'LP 缺货',
  replayCheaper: d => `这 ${d.days} 天里，LP 的总成本比规则低 ${d.diff}。`, replayDearer: d => `这 ${d.days} 天里，LP 的总成本比规则高 ${d.diff}。`,
  policy: '策略', target: '服务水平', avgStock: '平均库存（天）', none: '无', deliveryCol: '送货上限', storageCol: '库存上限', lpVsRule: 'LP 对比 HW 规则',
  base: '（基准）', days: '天', 'Moving average + rule': '移动平均 + 规则', 'Holt-Winters + rule': 'Holt-Winters + 规则', 'Holt-Winters + LP': 'Holt-Winters + LP',
  loadError: '数据或求解器加载失败，请刷新页面重试。', weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
};
const EN_DYNAMIC = {
  showAll: 'Show all 50 items', showFewer: 'Show the top 12 only',
  kpiLp: 'units the LP orders tonight', kpiRule: 'units the rule orders tonight', kpiLimit: 'delivery limit tonight (units)', kpiSolve: 'to solve, in your browser', kpiMoved: 'units the LP puts on different items than the rule',
  weekly: w => `Across all ${w.weeks} seven-day windows in the test period: at the base limits the LP was cheaper in ${w.baseWins} weeks and ${w.baseShare} cheaper on average; with tight deliveries (0.95×), in ${w.tightWins} weeks and ${w.tightShare} cheaper; with tight storage (2.5 days), in ${w.storageWins} weeks and ${w.storageShare} cheaper.`,
  legendLp: 'LP order plan', legendForecast: 'forecast demand on the arrival day', legendLimit: 'delivery limit', tonight: 'tonight',
  ruleName: 'Order-up-to rule (99.9%)', lpName: 'Holt-Winters + LP', replaying: 'Replaying… one LP solve per evening',
  fillRate: 'Fill rate', lostUnits: 'Lost units', lostUsd: 'Lost margin', holdingUsd: 'Holding', returnsUsd: 'Returns', totalUsd: 'Total cost',
  day: 'Day', demand: 'Demand', lostRule: 'Lost, rule', lostLp: 'Lost, LP',
  replayCheaper: d => `Over these ${d.days} days the LP cost ${d.diff} less than the rule.`, replayDearer: d => `Over these ${d.days} days the LP cost ${d.diff} more than the rule.`,
  policy: 'Policy', target: 'Service target', avgStock: 'Avg stock (days)', none: 'none', deliveryCol: 'Deliveries per day', storageCol: 'Storage', lpVsRule: 'LP vs HW rule',
  base: ' (base)', days: 'days', loadError: 'The data or the solver could not be loaded. Please refresh to try again.',
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const english = {};
document.querySelectorAll('[data-t]').forEach(el => { english[el.dataset.t] = el.innerHTML; });
const stored = (() => { try { return localStorage.getItem(LANGUAGE_KEY); } catch { return null; } })();
const param = new URLSearchParams(location.search).get('lang');
let lang = param === 'zh' || param === 'en' ? param : stored === 'zh' || stored === 'en' ? stored
  : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
const t = key => (lang === 'zh' ? ZH[key] : EN_DYNAMIC[key] ?? english[key]) ?? EN_DYNAMIC[key] ?? english[key] ?? key;
const familyName = f => (lang === 'zh' ? ZH[f] || f : f);

const money = v => (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = v => '$' + Math.round(v).toLocaleString('en-US');
const int = v => Math.round(v).toLocaleString('en-US');
const one = v => (v == null ? '–' : v.toFixed(1));
const pct = (v, d = 1) => (v * 100).toFixed(d) + '%';
const dayLabel = iso => {
  const d = new Date(iso + 'T12:00:00Z'), w = t('weekdays')[d.getUTCDay()];
  return lang === 'zh' ? `${iso} ${w}` : `${w} ${iso}`;
};
const shift = (iso, days) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
const short = iso => { const d = new Date(iso + 'T12:00:00Z'); return `${t('weekdays')[d.getUTCDay()]} ${iso.slice(5)}`; };

let data, highs, current = null, showAll = false;

function applyLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-t]').forEach(el => { el.innerHTML = lang === 'zh' ? (ZH[el.dataset.t] ?? english[el.dataset.t]) : english[el.dataset.t]; });
  $('language').textContent = lang === 'en' ? '中文' : 'English';
  $('language').lang = lang === 'en' ? 'zh-CN' : 'en';
  $('case-link').href = `../../projects/demand-forecast-inventory-optimization.html?lang=${lang}`;
  document.title = lang === 'zh' ? '实时 Demo · 需求预测与补货优化（LP）' : 'Live Demo · Demand Forecast + Replenishment LP';
  if (data) {
    const sel = $('evening'), value = sel.value;
    sel.innerHTML = data.evenings.map((e, i) => `<option value="${i}">${dayLabel(e.date)}</option>`).join('');
    sel.value = value;
    renderPlan(); renderBacktest();
    if (lastReplay) renderReplay(lastReplay);
    renderWeekly();
  }
}

function renderWeekly() {
  const w = Object.fromEntries(data.results.weekly.map(x => [x.setting, x]));
  const share = x => pct(-x.diff_share_of_rule, 1);
  $('weekly-note').textContent = t('weekly')({ weeks: w.base.weeks, baseWins: w.base.lp_cheaper_weeks, baseShare: share(w.base),
    tightWins: w.tight_delivery.lp_cheaper_weeks, tightShare: share(w.tight_delivery),
    storageWins: w.tight_storage.lp_cheaper_weeks, storageShare: share(w.tight_storage) });
}

function markPreset() {
  const now = `${Number($('delivery').value)},${Number($('storage').value)}`;
  document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.preset.split(',').map(Number).join(',') === now)));
}

$('language').addEventListener('click', () => {
  lang = lang === 'en' ? 'zh' : 'en';
  try { localStorage.setItem(LANGUAGE_KEY, lang); } catch { /* this page only */ }
  const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url);
  applyLanguage();
});

function limits() {
  const avg = data.meta.avg_daily_total;
  return { K: Number($('delivery').value) * avg, C: Number($('storage').value) * avg };
}

function solve() {
  const i = Number($('evening').value), ev = data.evenings[i], { K, C } = limits();
  const plan = M.planLP(highs, ev, data.items, data.meta, K, C);
  const rule = M.ruleOrders(ev, data.meta, data.meta.rule_z, K, C);
  current = { i, ev, K, C, plan, rule };
  renderPlan();
}

function renderPlan() {
  if (!current) return;
  const { ev, K, plan, rule } = current, L = data.meta.lead_time;
  const lpTonight = plan.orders.reduce((s, o) => s + o[0], 0), ruleTonight = rule.reduce((s, v) => s + v, 0);
  const moved = plan.orders.reduce((s, o, i) => s + Math.abs(o[0] - rule[i]), 0) / 2;
  const kpi = (cls, value, label) => `<div class="kpi ${cls}"><strong>${value}</strong><span>${label}</span></div>`;
  $('kpis').innerHTML = kpi('lp', int(lpTonight), t('kpiLp')) + kpi('rule', int(ruleTonight), t('kpiRule')) +
    kpi('', int(K), t('kpiLimit')) + kpi('', int(moved), t('kpiMoved')) + kpi('', `${Math.max(1, Math.round(plan.ms))} ms`, t('kpiSolve'));

  // chart: planned orders per evening vs forecast demand on the arrival day and the delivery limit
  const J = plan.orders[0].length;
  const bars = Array.from({ length: J }, (_, j) => plan.orders.reduce((s, o) => s + o[j], 0));
  const need = Array.from({ length: J }, (_, j) => ev.forecast.reduce((s, f) => s + f[j + L - 1], 0));
  const W = 760, H = 270, m = { l: 44, r: 12, t: 16, b: 40 }, top = Math.max(K, ...bars, ...need) * 1.12;
  const x = j => m.l + (j + 0.5) * (W - m.l - m.r) / J, y = v => H - m.b - v / top * (H - m.t - m.b), bw = (W - m.l - m.r) / J * 0.56;
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('chartTitle')}">`;
  for (let g = 0; g <= 4; g++) { const v = top / 1.12 * g / 4; svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke="#eceef2"/><text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">${int(v)}</text>`; }
  bars.forEach((v, j) => {
    svg += `<rect x="${x(j) - bw / 2}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" rx="4" fill="${j === 0 ? '#d9682b' : '#ecb08f'}"/>`;
    svg += `<text class="val" x="${x(j)}" y="${y(v) - 6}" text-anchor="middle">${int(v)}</text>`;
    svg += `<text x="${x(j)}" y="${H - m.b + 18}" text-anchor="middle">${short(shift(ev.date, j))}${j === 0 ? ' · ' + t('tonight') : ''}</text>`;
  });
  svg += `<polyline fill="none" stroke="#15161a" stroke-width="2" points="${need.map((v, j) => `${x(j)},${y(v)}`).join(' ')}"/>`;
  need.forEach((v, j) => { svg += `<circle cx="${x(j)}" cy="${y(v)}" r="3.5" fill="#15161a"/>`; });
  svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(K)}" y2="${y(K)}" stroke="#5b5f69" stroke-dasharray="6 5"/></svg>`;
  svg += `<div class="legend"><span><i style="background:#d9682b"></i>${t('legendLp')}</span><span><i style="background:#15161a;height:3px;vertical-align:3px"></i>${t('legendForecast')}</span><span><i style="border-top:2px dashed #5b5f69;height:0;background:none;vertical-align:3px"></i>${t('legendLimit')}</span></div>`;
  $('plan-chart').innerHTML = svg;

  // item table, largest disagreements first
  const rows = data.items.map((it, i) => ({
    it, onHand: ev.on_hand[i], arriving: ev.pipeline[i], f2: ev.forecast[i][0] + ev.forecast[i][1],
    lp: plan.orders[i][0], rule: rule[i],
    actual: ev.actual[i][0] == null || ev.actual[i][1] == null ? null : ev.actual[i][0] + ev.actual[i][1],
  })).sort((a, b) => Math.abs(b.lp - b.rule) - Math.abs(a.lp - a.rule));
  $('items').innerHTML = rows.slice(0, showAll ? rows.length : 12).map(r =>
    `<tr><td>${r.it.id}</td><td>$${r.it.lost_margin.toFixed(2)}</td><td>${one(r.onHand)}</td><td>${one(r.arriving)}</td><td>${one(r.f2)}</td>` +
    `<td class="lp">${one(r.lp)}</td><td class="rule">${one(r.rule)}</td><td>${r.actual == null ? '–' : int(r.actual)}</td></tr>`).join('');
  $('show-all').textContent = showAll ? t('showFewer') : t('showAll');
}

let lastReplay = null;
function runReplay() {
  const start = Number($('evening').value), days = Math.min(7, data.evenings.length - start), { K, C } = limits();
  $('replay-out').innerHTML = `<p class="note">${t('replaying')}</p>`;
  $('run-replay').disabled = true;
  setTimeout(() => {
    try {
      const rule = M.replay(data.evenings, start, days, data.items, data.meta, C, e => M.ruleOrders(e, data.meta, data.meta.rule_z, K, C));
      const lp = M.replay(data.evenings, start, days, data.items, data.meta, C, e => M.planLP(highs, e, data.items, data.meta, K, C).orders.map(o => o[0]));
      lastReplay = { rule, lp, days, start };
      renderReplay(lastReplay);
    } catch (err) {
      $('replay-out').innerHTML = `<p class="error">${err.message}</p>`;
    }
    $('run-replay').disabled = false;
  }, 30);
}

function renderReplay({ rule, lp, days }) {
  const a = rule.totals, b = lp.totals;
  const row = (label, f, better) => {
    const va = f(a), vb = f(b);
    return `<tr><td>${label}</td><td class="rule">${va}</td><td class="lp">${vb}</td></tr>`;
  };
  const diff = b.total_usd - a.total_usd;
  const sentence = diff <= 0 ? t('replayCheaper')({ days, diff: money(-diff) }) : t('replayDearer')({ days, diff: money(diff) });
  let html = `<p class="${diff <= 0 ? 'win' : 'loss'}">${sentence}</p><div class="table-scroll"><table><thead><tr><th></th><th>${t('ruleName')}</th><th>${t('lpName')}</th></tr></thead><tbody>` +
    row(t('fillRate'), v => pct(v.fill_rate, 2)) + row(t('lostUnits'), v => int(v.lost_units)) + row(t('lostUsd'), v => money(v.lost_usd)) +
    row(t('holdingUsd'), v => money(v.holding_usd)) + row(t('returnsUsd'), v => money(v.returns_usd)) + row(`<strong>${t('totalUsd')}</strong>`, v => `<strong>${money(v.total_usd)}</strong>`) +
    `</tbody></table></div>`;
  html += `<div class="table-scroll"><table><thead><tr><th>${t('day')}</th><th>${t('demand')}</th><th>${t('lostRule')}</th><th>${t('lostLp')}</th></tr></thead><tbody>` +
    rule.daily.map((d, k) => `<tr><td>${d.date ? dayLabel(d.date) : ''}</td><td>${int(d.demand)}</td><td class="rule">${one(d.lost)}</td><td class="lp">${one(lp.daily[k].lost)}</td></tr>`).join('') +
    `</tbody></table></div>`;
  $('replay-out').innerHTML = html;
}

function renderBacktest() {
  const r = data.results;
  $('headline').innerHTML = `<thead><tr><th>${t('policy')}</th><th>${t('target')}</th><th>${t('fillRate')}</th><th>${t('lostUsd')}</th><th>${t('holdingUsd')}</th><th>${t('returnsUsd')}</th><th>${t('totalUsd')}</th><th>${t('avgStock')}</th></tr></thead><tbody>` +
    r.headline.map(h => `<tr class="${h.family.endsWith('LP') ? 'best' : ''}"><td>${familyName(h.family)}</td><td>${h.service_level == null ? t('none') : pct(h.service_level, 1)}</td><td>${pct(h.fill_rate, 2)}</td>` +
      `<td>${money0(h.lost_margin_usd)}</td><td>${money0(h.holding_usd)}</td><td>${money0(h.return_usd)}</td><td><strong>${money0(h.total_cost_usd)}</strong></td><td>${h.days_of_supply.toFixed(2)}</td></tr>`).join('') + '</tbody>';
  const fams = ['Moving average + rule', 'Holt-Winters + rule', 'Holt-Winters + LP'];
  const keys = [...new Set(r.capacity.map(c => `${c.delivery_cap_mult}|${c.storage_cap_days}`))]
    .map(k => k.split('|').map(Number)).sort((p, q) => p[1] - q[1] || p[0] - q[0]);
  const cost = (d, s, f) => r.capacity.find(c => c.delivery_cap_mult === d && c.storage_cap_days === s && c.family === f).total_cost_usd;
  const base = [data.meta.base_delivery_mult, data.meta.base_storage_days];
  $('capacity').innerHTML = `<thead><tr><th>${t('deliveryCol')}</th><th>${t('storageCol')}</th>${fams.map(f => `<th>${familyName(f)}</th>`).join('')}<th>${t('lpVsRule')}</th></tr></thead><tbody>` +
    keys.map(([d, s]) => {
      const c = fams.map(f => cost(d, s, f)), best = Math.min(...c), isBase = d === base[0] && s === base[1];
      const change = c[2] / c[1] - 1;
      return `<tr class="${isBase ? 'best' : ''}"><td>${d.toFixed(2)}×</td><td>${s} ${t('days')}${isBase ? t('base') : ''}</td>` +
        c.map(v => `<td>${v === best ? '<strong>' + money0(v) + '</strong>' : money0(v)}</td>`).join('') +
        `<td class="${change < 0 ? 'win' : 'loss'}">${change > 0 ? '+' : ''}${(change * 100).toFixed(0)}%</td></tr>`;
    }).join('') + '</tbody>';
}

let timer;
const schedule = () => { clearTimeout(timer); timer = setTimeout(solve, 120); };
function updateOutputs() {
  $('delivery-out').textContent = Number($('delivery').value).toFixed(2) + '×';
  $('storage-out').textContent = Number($('storage').value).toFixed(2);
}

async function start() {
  applyLanguage();
  try {
    const [d, h] = await Promise.all([
      fetch('data.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      Module({ locateFile: f => 'vendor/' + f }),
    ]);
    data = d; highs = h;
  } catch (err) {
    $('kpis').innerHTML = `<p class="error">${t('loadError')}</p>`;
    return;
  }
  const meta = data.meta;
  // Open on the tight-storage preset, where planning all items together shows most clearly in a single week.
  const [startDelivery, startStorage] = document.querySelector('[data-t="presetTightStorage"]').dataset.preset.split(',');
  $('delivery').value = startDelivery; $('storage').value = startStorage;
  updateOutputs();
  applyLanguage();
  $('evening').value = '0';
  markPreset();
  for (const id of ['evening', 'delivery', 'storage', 'run-replay', 'show-all']) $(id).disabled = false;
  document.querySelectorAll('[data-preset]').forEach(b => {
    b.disabled = false;
    b.addEventListener('click', () => {
      const [d, s] = b.dataset.preset.split(',');
      $('delivery').value = d; $('storage').value = s; updateOutputs(); markPreset();
      lastReplay = null; $('replay-out').innerHTML = ''; solve();
    });
  });
  $('evening').addEventListener('change', () => { lastReplay = null; $('replay-out').innerHTML = ''; solve(); });
  for (const id of ['delivery', 'storage']) $(id).addEventListener('input', () => { updateOutputs(); markPreset(); lastReplay = null; $('replay-out').innerHTML = ''; schedule(); });
  $('show-all').addEventListener('click', () => { showAll = !showAll; renderPlan(); });
  $('run-replay').addEventListener('click', runReplay);
  solve();
  renderBacktest();
}
start();
