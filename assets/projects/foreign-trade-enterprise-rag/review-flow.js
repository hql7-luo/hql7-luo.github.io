/* Review flow on the knowledge-assistant case.
   Visitors stage the fictional MOQ update, approve or reject it, and see the approved value,
   pending proposal, history, search index and answer change. The approval path uses crops of
   the recorded run; the recording has no rejection, so that path reuses the step 1 screen and says so.
   Also switches the demo video's scene captions to the page language. */
(() => {
  'use strict';
  const core = window.PortfolioCore;
  const root = document.getElementById('review-flow');
  if (!root || !core) return;

  const SHOT = '../assets/projects/foreign-trade-enterprise-rag/governance-stage-0';
  const SIZES = { 1: [960, 283], 2: [960, 634], 3: [960, 500], 4: [960, 670] };
  // Each phase: step shown in the rail, the record fields, the answer, and what can happen next.
  const PHASES = {
    start: { step: 1, approved: 'units144', pending: 'none', history: 'none', index: 'idxCurrent', answer: 'ans144', cite: 'cite144', msg: 'm1', shot: 1, cap: 'c1', actions: [['bStage', 'pending', 'ink']] },
    pending: { step: 2, approved: 'units144', pending: 'pending180', history: 'none', index: 'idxCurrent', answer: 'ans144', cite: 'cite144', msg: 'm2', shot: 2, cap: 'c2', actions: [['bApprove', 'approved', 'ink'], ['bReject', 'rejected', 'ghost']] },
    approved: { step: 3, approved: 'units180', pending: 'none', history: 'hist144', index: 'idxStale', answer: 'notAsked', cite: null, msg: 'm3a', shot: 3, cap: 'c3', actions: [['bReindex', 'answer180', 'ink']] },
    answer180: { step: 4, approved: 'units180', pending: 'none', history: 'hist144', index: 'idxUpdated', answer: 'ans180', cite: 'cite180', msg: 'm4a', shot: 4, cap: 'c4', actions: [['bRestart', 'start', 'ghost']] },
    rejected: { step: 3, approved: 'units144', pending: 'rejectedNote', history: 'none', index: 'idxCurrent', answer: 'notAsked', cite: null, msg: 'm3b', shot: 1, cap: 'cRejected', actions: [['bAskAgain', 'answer144', 'ink']] },
    answer144: { step: 4, approved: 'units144', pending: 'rejectedNote', history: 'none', index: 'idxCurrent', answer: 'ans144', cite: 'cite144', msg: 'm4b', shot: 1, cap: 'cRejected', actions: [['bTryApprove', 'pending', 'ink'], ['bRestart', 'start', 'ghost']] },
  };
  const FIELDS = ['approved', 'pending', 'history', 'index', 'answer'];
  const t = key => core.t('rag.rf.' + key);
  const el = id => document.getElementById('rf-' + id);
  let phase = 'start';
  let shown = null;   // field values on screen, to mark what just changed

  function render(moveFocus) {
    const p = PHASES[phase];
    root.querySelectorAll('[data-rf-step]').forEach(li => {
      const n = Number(li.dataset.rfStep);
      li.classList.toggle('is-done', n < p.step);
      if (n === p.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    for (const f of FIELDS) {
      const node = el(f);
      node.textContent = t(p[f]);
      const changed = shown && shown[f] !== p[f];
      node.classList.remove('is-changed');
      if (changed && moveFocus) { void node.offsetWidth; node.classList.add('is-changed'); }
    }
    shown = Object.fromEntries(FIELDS.map(f => [f, p[f]]));
    const cite = el('cite');
    cite.hidden = !p.cite;
    cite.textContent = p.cite ? t(p.cite) : '';
    el('msg').textContent = t(p.msg);
    const img = el('img');
    const [w, h] = SIZES[p.shot];
    img.src = `${SHOT}${p.shot}.png`;
    img.srcset = `${SHOT}${p.shot}-480.png 480w, ${SHOT}${p.shot}.png 960w`;
    img.width = w; img.height = h;
    img.alt = t(p.cap);
    el('cap').textContent = t(p.cap);
    const box = el('actions');
    box.replaceChildren(...p.actions.map(([label, next, style]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `btn btn-sm btn-${style}`;
      b.textContent = t(label);
      b.addEventListener('click', () => { phase = next; render(true); });
      return b;
    }));
    if (moveFocus) box.querySelector('button').focus({ preventScroll: true });
  }

  // Scene captions for the silent recording follow the page language.
  const video = document.querySelector('#demo video');
  function syncCaptions() {
    if (!video) return;
    const lang = core.lang === 'zh' ? 'zh' : 'en';
    for (const track of video.textTracks) track.mode = track.language === lang ? 'showing' : 'disabled';
  }

  core.on('language', () => { render(false); syncCaptions(); });
  render(false);
  syncCaptions();
})();
