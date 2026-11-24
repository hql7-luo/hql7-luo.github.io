/* Replenishment model shared by the browser demo and its Node check.
 * Mirrors src/inventory_lp.plan_orders and src/simulate.py in the GitHub project. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ReplenishmentModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const fmt = v => {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error('non-finite coefficient');
    return Math.abs(n) < 1e-14 ? '0' : String(Number(n.toPrecision(15)));
  };

  // Write a linear expression as "+ 2 x - 1 y", a few terms per line.
  function expr(terms) {
    const parts = [];
    for (const [coef, name] of terms) {
      if (coef === 0) continue;
      parts.push(`${coef < 0 ? '-' : '+'} ${fmt(Math.abs(coef))} ${name}`);
    }
    if (!parts.length) parts.push('+ 0 dummy0');
    const lines = [];
    for (let i = 0; i < parts.length; i += 8) lines.push(parts.slice(i, i + 8).join(' '));
    return lines.join('\n   ');
  }

  /**
   * The evening's LP in CPLEX LP format.
   * ev: {on_hand[I], pipeline[I], forecast[I][H], sigma[I]}; items: [{lost_margin, holding}]
   * Orders placed on evening j (0 = tonight) arrive on day j + lead.
   */
  function buildLP(ev, items, meta, deliveryCap, storageCap) {
    const L = meta.lead_time, H = meta.horizon, J = H - L + 1, I = items.length;
    const W = meta.segment_width, SL = meta.segment_slope, RC = meta.return_cost;
    const q = (i, j) => `q_${i}_${j}`, x = (i, k) => `x_${i}_${k}`, u = (i, k) => `u_${i}_${k}`;
    const r = (i, k) => `r_${i}_${k}`, b = (i, k, g) => `b_${i}_${k}_${g}`;
    const obj = [], rows = [], bounds = [];
    for (let i = 0; i < I; i++) {
      const p = items[i].lost_margin, h = items[i].holding, s = Math.max(ev.sigma[i], 1e-6);
      for (let k = 1; k <= H; k++) {
        const f = ev.forecast[i][k - 1];
        obj.push([p, u(i, k)], [h, x(i, k)], [RC, r(i, k)]);
        // stock tonight = stock last night + delivery - sent back - forecast demand + demand not met
        const t = [[1, x(i, k)], [1, r(i, k)], [-1, u(i, k)]];
        let rhs = -f;
        if (k === 1) rhs += ev.on_hand[i]; else t.push([-1, x(i, k - 1)]);
        if (k < L) rhs += ev.pipeline[i]; else t.push([-1, q(i, k - L)]);
        rows.push(`bal_${i}_${k}: ${expr(t)} = ${fmt(rhs)}`);
        bounds.push(`0 <= ${u(i, k)} <= ${fmt(f)}`);
        if (k < L) bounds.push(`0 <= ${r(i, k)} <= ${fmt(ev.pipeline[i])}`);
        else {
          rows.push(`ret_${i}_${k}: ${expr([[1, r(i, k)], [-1, q(i, k - L)]])} <= 0`);
          const seg = W.map((_, g) => [1, b(i, k, g)]);
          rows.push(`buf_${i}_${k}: ${expr([...seg, [-1, x(i, k)]])} <= 0`);
          W.forEach((w, g) => {
            obj.push([p * SL[g], b(i, k, g)]);
            bounds.push(`0 <= ${b(i, k, g)} <= ${fmt(w * s)}`);
          });
        }
      }
    }
    for (let k = 1; k <= H; k++) {
      const t = [];
      let rhs = storageCap;
      for (let i = 0; i < I; i++) {
        if (k === 1) rhs -= ev.on_hand[i]; else t.push([1, x(i, k - 1)]);
        if (k < L) rhs -= ev.pipeline[i]; else t.push([1, q(i, k - L)]);
        t.push([-1, r(i, k)]);
      }
      rows.push(`sto_${k}: ${expr(t)} <= ${fmt(rhs)}`);
    }
    for (let j = 0; j < J; j++) {
      rows.push(`dlv_${j}: ${expr(items.map((_, i) => [1, q(i, j)]))} <= ${fmt(deliveryCap)}`);
    }
    return ['Minimize', ` obj: ${expr(obj)}`, 'Subject To', ...rows.map(s => ' ' + s),
            'Bounds', ...bounds.map(s => ' ' + s), 'End'].join('\n');
  }

  function planLP(highs, ev, items, meta, deliveryCap, storageCap) {
    const L = meta.lead_time, H = meta.horizon, J = H - L + 1, I = items.length;
    const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
    const res = highs.solve(buildLP(ev, items, meta, deliveryCap, storageCap), { output_flag: false });
    const ms = (typeof performance !== 'undefined' ? performance : Date).now() - t0;
    if (res.Status !== 'Optimal') throw new Error('LP status: ' + res.Status);
    const val = name => Math.max(res.Columns[name] ? res.Columns[name].Primal : 0, 0);
    const orders = Array.from({ length: I }, (_, i) => Array.from({ length: J }, (_, j) => val(`q_${i}_${j}`)));
    const unmet = Array.from({ length: I }, (_, i) => Array.from({ length: H }, (_, k) => val(`u_${i}_${k + 1}`)));
    const stock = Array.from({ length: I }, (_, i) => Array.from({ length: H }, (_, k) => val(`x_${i}_${k + 1}`)));
    return { orders, unmet, stock, objective: res.ObjectiveValue, ms };
  }

  // Order-up-to rule: forecast over the lead time + z x error; cut all items by the same share when full.
  function ruleOrders(ev, meta, z, deliveryCap, storageCap) {
    const L = meta.lead_time;
    const pos = ev.on_hand.map((v, i) => v + ev.pipeline[i]);
    let q = ev.forecast.map((f, i) => Math.max(f.slice(0, L).reduce((a, c) => a + c, 0) + z * ev.sigma[i] - pos[i], 0));
    const sum = a => a.reduce((s, v) => s + v, 0);
    if (sum(q) > deliveryCap) { const k = deliveryCap / sum(q); q = q.map(v => v * k); }
    const atArrival = ev.forecast.map((f, i) => Math.max(pos[i] - f.slice(0, L - 1).reduce((a, c) => a + c, 0), 0));
    const room = Math.max(storageCap - sum(atArrival), 0);
    if (sum(q) > room) { const k = room / sum(q); q = q.map(v => v * k); }
    return q;
  }

  /**
   * Replay `days` days on real sales from evening `start`, with the same daily rules as
   * simulate.py: morning delivery (what does not fit goes back), sales = min(stock, demand),
   * evening order. decide(ev, onHand, pipeline) returns tonight's orders.
   */
  function replay(evenings, start, days, items, meta, storageCap, decide) {
    const I = items.length;
    let onHand = evenings[start].on_hand.slice();
    let arriving = evenings[start].pipeline.slice();
    const tot = { demand: 0, lost_units: 0, lost_usd: 0, holding_usd: 0, returned_units: 0 };
    const daily = [];
    for (let d = 0; d < days; d++) {
      const ev = evenings[start + d];
      const q = decide({ ...ev, on_hand: onHand.slice(), pipeline: arriving.slice() });
      let incoming = arriving;
      const room = Math.max(storageCap - onHand.reduce((a, c) => a + c, 0), 0);
      const inSum = incoming.reduce((a, c) => a + c, 0);
      let refused = new Array(I).fill(0);
      if (inSum > room) {
        const keep = incoming.map(v => v * room / inSum);
        refused = incoming.map((v, i) => v - keep[i]);
        incoming = keep;
      }
      onHand = onHand.map((v, i) => v + incoming[i]);
      let lostDay = 0, demandDay = 0;
      for (let i = 0; i < I; i++) {
        const demand = ev.actual[i][0];
        const sales = Math.min(onHand[i], demand);
        onHand[i] -= sales;
        const lost = demand - sales;
        lostDay += lost; demandDay += demand;
        tot.lost_usd += lost * items[i].lost_margin;
        tot.holding_usd += onHand[i] * items[i].holding;
        tot.returned_units += refused[i];
      }
      tot.demand += demandDay; tot.lost_units += lostDay;
      daily.push({ date: evenings[start + d + 1] ? evenings[start + d + 1].date : null, demand: demandDay, lost: lostDay,
                   delivered: incoming.reduce((a, c) => a + c, 0), ordered: q.reduce((a, c) => a + c, 0) });
      arriving = q;
    }
    tot.returns_usd = tot.returned_units * meta.return_cost;
    tot.total_usd = tot.lost_usd + tot.holding_usd + tot.returns_usd;
    tot.fill_rate = 1 - tot.lost_units / tot.demand;
    return { totals: tot, daily };
  }

  return { buildLP, planLP, ruleOrders, replay };
});
