/* Haoqi Luo portfolio: shared behaviour for every page.
   1. Core (all pages): language, motion preference, mobile menu, header state,
      reading progress, scroll reveal, copy email, Resume links.
   2. Homepage: decision board tabs, project filters, "Other builds" shelf,
      nav indicator and experience timeline.
   3. Project pages: image viewer and the "On this page" menu.
   No libraries. Each page keeps its English text in the HTML and both
   languages in its own <script id="translations"> dictionary. */

/* ===================== 1. Core ===================== */
(() => {
  'use strict';
  const root = document.documentElement;
  const siteRoot = document.body.dataset.root || '';   // "" on the homepage, "../" inside /projects/
  const listeners = [];
  const dict = JSON.parse(document.getElementById('translations').textContent);

  // Storage can be blocked (private mode), so every access is guarded.
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* keep for this page only */ } };
  const strip = html => { const t = document.createElement('template'); t.innerHTML = html; return t.content.textContent; };
  const valid = v => v === 'en' || v === 'zh';
  const LANGUAGE_KEY = 'portfolio-language';
  const MOTION_KEY = 'portfolio-reduced-motion';

  /* ---------- Motion preference ---------- */
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduced = read(MOTION_KEY) === 'true';
  const reduced = () => systemMotion.matches || manualReduced;

  function applyMotion() {
    root.dataset.motion = reduced() ? 'reduced' : 'full';
    document.querySelectorAll('.motion-toggle').forEach(button => {
      const key = systemMotion.matches ? 'motion.system' : manualReduced ? 'motion.resume' : 'motion.pause';
      button.textContent = dict[lang][key];
      button.setAttribute('aria-pressed', String(reduced()));
      button.disabled = systemMotion.matches;
    });
    if (reduced()) document.querySelectorAll('.is-pending').forEach(el => el.classList.replace('is-pending', 'is-in'));
    emit('motion');
  }

  /* ---------- Language ----------
     A link with ?lang= opens in that language. When the visitor comes back with
     the Back or Forward button, their latest choice wins instead, so switching
     language on a project page and going back keeps that language. */
  const urlLang = new URLSearchParams(location.search).get('lang');
  const storedLang = read(LANGUAGE_KEY);
  const navigation = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  const cameBack = navigation && navigation.type === 'back_forward';
  let lang = cameBack && valid(storedLang) ? storedLang
    : valid(urlLang) ? urlLang
    : valid(storedLang) ? storedLang
    : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';

  // Internal page links carry the language, keeping any #section.
  function withLang(href, next) {
    const url = new URL(href, location.href);
    url.searchParams.set('lang', next);
    return url.href;
  }

  function applyLanguage(next, announce) {
    lang = next;
    save(LANGUAGE_KEY, next);
    const copy = dict[next];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = copy[el.dataset.i18n];
      if (value === undefined) return;
      if (el.dataset.i18nAttr) el.setAttribute(el.dataset.i18nAttr, strip(value));
      else if (el.tagName === 'TITLE') el.textContent = strip(value);
      else el.innerHTML = value;
    });
    document.querySelectorAll('img[data-src-en]').forEach(img => { img.src = img.dataset[next === 'zh' ? 'srcZh' : 'srcEn']; });
    document.querySelectorAll('[data-bg-en][data-bg-ready]').forEach(paintBackground);
    document.querySelectorAll('a[data-case]').forEach(a => { a.href = withLang(`${siteRoot}projects/${a.dataset.case}.html`, next); });
    document.querySelectorAll('a[data-page]:not([data-case])').forEach(a => { a.href = withLang(a.getAttribute('href'), next); });
    // Resume buttons download the PDF in the page language.
    document.querySelectorAll('[data-resume-link]').forEach(link => {
      const href = link.dataset[next === 'zh' ? 'resumeZh' : 'resumeEn'];
      link.setAttribute('href', href);
      link.setAttribute('download', href.split('/').pop());
    });
    document.querySelectorAll('button[data-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === next)));
    root.lang = next === 'zh' ? 'zh-CN' : 'en';
    root.dataset.language = next;
    // Keep the address bar in step, so a copied link opens in the language on screen.
    if (announce || new URL(location.href).searchParams.has('lang')) {
      try { history.replaceState(history.state, '', withLang(location.href, next)); } catch { /* ignore */ }
    }
    const status = document.getElementById('language-status');
    if (announce && status) status.textContent = copy['lang.changed'];
    syncMenuLabel();
    applyMotion();
    emit('language');
  }

  // Thumbnails drawn as backgrounds (next-project card) load only when they come near the screen.
  function paintBackground(el) {
    el.style.backgroundImage = `url("${el.dataset[lang === 'zh' ? 'bgZh' : 'bgEn']}")`;
  }
  function setupBackgrounds() {
    const items = [...document.querySelectorAll('[data-bg-en]')];
    const show = el => { el.dataset.bgReady = 'true'; paintBackground(el); };
    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
    }), { rootMargin: '600px 0px' });
    items.forEach(el => io.observe(el));
  }

  document.querySelectorAll('button[data-language]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.language === lang) return;
    applyLanguage(button.dataset.language, true);
    setMenu(false);
  }));

  // A page restored by the Back button keeps its old state; bring its language up to date.
  addEventListener('pageshow', event => {
    const latest = read(LANGUAGE_KEY);
    if (event.persisted && valid(latest) && latest !== lang) applyLanguage(latest, false);
  });

  /* ---------- Mobile menu ---------- */
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navigation');
  function syncMenuLabel() {
    if (!menu) return;
    const open = menu.getAttribute('aria-expanded') === 'true';
    const label = menu.querySelector('.menu-label');
    if (label) label.textContent = dict[lang][open ? 'nav.close' : 'nav.menu'];
  }
  function setMenu(open) {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    syncMenuLabel();
    if (open) nav.querySelector('a')?.focus();
  }
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- In-page links: smooth scroll that respects motion settings ---------- */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    if (id) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    try { history.replaceState(history.state, '', id ? '#' + id : location.pathname + location.search); } catch { /* ignore */ }
  });

  /* ---------- Header state, progress bar, active section ---------- */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  const sections = [...document.querySelectorAll('main [data-section]')];
  const navLinks = [...document.querySelectorAll('#navigation a[href^="#"]')];
  let frame = 0;

  function onScroll() {
    frame = 0;
    const y = scrollY;
    const range = root.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1, y / range) : 0})`;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (navLinks.length) {
      const line = innerHeight * 0.4;
      const current = sections.find(s => { const r = s.getBoundingClientRect(); return r.top <= line && r.bottom > line; });
      navLinks.forEach(a => {
        const on = current && a.getAttribute('href') === '#' + current.id;
        a.classList.toggle('is-active', Boolean(on));
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
    emit('scroll');
  }
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(onScroll); }, { passive: true });
  addEventListener('resize', () => { if (!frame) frame = requestAnimationFrame(onScroll); }, { passive: true });

  /* ---------- Scroll reveal ----------
     Content is visible by default. Only elements that start below the first
     screen are briefly held back, and only when motion is allowed. */
  function setupReveal() {
    const items = [...document.querySelectorAll('[data-reveal]')];
    items.forEach(el => { if (el.dataset.delay) el.style.setProperty('--reveal-delay', el.dataset.delay + 'ms'); });
    if (reduced() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.replace('is-pending', 'is-in');
      // After the entrance, drop the stagger delay so hover effects respond immediately.
      setTimeout(() => el.classList.add('is-settled'), (parseInt(el.dataset.delay, 10) || 0) + 950);
      io.unobserve(el);
    }), { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    items.forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight * 0.92) { el.classList.add('is-pending'); io.observe(el); }
    });
    // Safety nets: never leave content hidden.
    const showAll = () => document.querySelectorAll('.is-pending').forEach(el => el.classList.replace('is-pending', 'is-in'));
    addEventListener('beforeprint', showAll);
    addEventListener('hashchange', showAll);
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const text = button.dataset.copy;
    const label = button.querySelector('.copy-label') || button;
    try {
      await navigator.clipboard.writeText(text);
      label.textContent = dict[lang]['d.copied'];
    } catch {
      const target = document.querySelector(button.dataset.copyTarget || '.email-text');
      if (target) { const r = document.createRange(); r.selectNodeContents(target); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      label.textContent = dict[lang]['d.copyFallback'];
    }
    setTimeout(() => { label.textContent = dict[lang]['d.copyEmail']; }, 2200);
  }));

  /* ---------- Motion toggle ---------- */
  document.querySelectorAll('.motion-toggle').forEach(button => button.addEventListener('click', () => {
    manualReduced = !manualReduced;
    save(MOTION_KEY, String(manualReduced));
    applyMotion();
  }));
  systemMotion.addEventListener('change', applyMotion);

  /* ---------- Small event bus for the page sections below ---------- */
  function emit(type) { listeners.forEach(([t, cb]) => { if (t === type) cb(); }); }
  window.PortfolioCore = {
    get lang() { return lang; },
    t: key => dict[lang][key] ?? key,
    reduced,
    on(type, cb) { listeners.push([type, cb]); }
  };

  applyLanguage(lang, false);
  setupBackgrounds();
  setupReveal();
  onScroll();
  requestAnimationFrame(() => root.classList.add('is-ready'));
})();

/* ===================== 2. Homepage ===================== */
(() => {
  'use strict';
  if (!document.querySelector('.board')) return;   // only the homepage has the decision board
  const core = window.PortfolioCore;

  /* ---------- Decision board (ARIA tabs) ---------- */
  const tabs = [...document.querySelectorAll('.board-tabs [role="tab"]')];
  const tabList = document.querySelector('.board-tabs');
  function play(panel) {
    panel.classList.remove('is-playing');
    void panel.offsetWidth; // restart the CSS animations
    panel.classList.add('is-playing');
  }
  function selectTab(index, focus) {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) play(panel);
    });
    tabList.style.setProperty('--tab', index);
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', e => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      selectTab((map[e.key] + tabs.length) % tabs.length, true);
    });
  });
  selectTab(0);

  /* ---------- Filters ---------- */
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('#work [data-tags]')];
  const groups = [...document.querySelectorAll('[data-group]')];
  const status = document.getElementById('filter-status');
  const matches = (card, f) => f === 'all' || card.dataset.tags.split(' ').includes(f);
  document.querySelectorAll('[data-count]').forEach(el => {
    el.textContent = cards.filter(c => matches(c, el.dataset.count)).length;
  });
  let current = 'all';
  function announce() {
    const n = cards.filter(c => !c.hidden).length;
    status.textContent = `${core.t('d.showing')} ${n} ${core.t('d.projectsWord')}`;
  }
  function applyFilter(f) {
    current = f;
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    cards.forEach(card => {
      const show = matches(card, f);
      const wasHidden = card.hidden;
      card.hidden = !show;
      card.classList.remove('just-shown');
      if (show) {
        card.classList.remove('is-pending');
        card.classList.add('is-in');
        if (wasHidden || f !== 'all') { void card.offsetWidth; card.classList.add('just-shown'); }
      }
    });
    groups.forEach(g => { g.hidden = !g.querySelector('[data-tags]:not([hidden])'); });
    resetShelf();
    announce();
  }
  filterButtons.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  core.on('language', () => { if (current !== 'all') announce(); });

  /* ---------- Other builds shelf ----------
     Moves only when the reader acts: mouse drag, arrow buttons, arrow keys,
     or a trackpad's sideways swipe. The ordinary mouse wheel always scrolls
     the page up and down (vertical wheel events are never touched).

     How the drag works:
     - `pos` is where the row "wants" to be. Inside the row it is simply
       scrollLeft. Past either end it keeps going, and the extra distance is
       shown as a small, resisting pull of the cards (like an iPhone list).
     - When the mouse is released, a spring carries the row on with the
       release speed and settles on the nearest card; if it was pulled past
       an end, the same spring brings it back. No empty gap is left behind.
     - Touch screens keep their own native swipe and bounce. */
  const shelf = document.querySelector('.shelf');
  const prevBtn = document.querySelector('[data-shelf-prev]');
  const nextBtn = document.querySelector('[data-shelf-next]');
  const bar = document.querySelector('.shelf-progress');
  const thumb = bar.querySelector('span');

  const PULL_MAX = 120;         // the furthest the cards can be pulled past an end (px)
  const PULL_RESIST = 0.55;     // lower = stiffer pull (0.55 is the iOS feel)
  const STIFFNESS = 210;        // spring strength; with critical damping it settles in about 0.4 s
  const DAMPING = 2 * Math.sqrt(STIFFNESS);
  const isSafari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

  let pos = 0;                  // wanted position (may be past either end)
  let anim = 0;                 // requestAnimationFrame id of the running spring
  let drag = null;              // state of a mouse drag
  let justDragged = false;      // swallow the click that ends a drag
  let wheelPull = 0;            // sideways trackpad push past an end
  let wheelTimer = 0;

  const maxScroll = () => Math.max(0, shelf.scrollWidth - shelf.clientWidth);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Resisting pull: grows quickly at first, then less and less, never past PULL_MAX.
  function rubber(over) {
    const sign = Math.sign(over);
    const x = Math.abs(over);
    return sign * (1 - 1 / ((x * PULL_RESIST) / PULL_MAX + 1)) * PULL_MAX;
  }

  // Show `pos`: scroll inside the row, and pull the cards for anything past an end.
  function render() {
    const max = maxScroll();
    const inside = clamp(pos, 0, max);
    if (Math.abs(shelf.scrollLeft - inside) > 0.5) shelf.scrollLeft = inside;
    const pull = core.reduced() ? 0 : rubber(pos - inside) + rubber(wheelPull);
    shelf.style.setProperty('--shelf-pull', `${(-pull).toFixed(2)}px`);
  }

  // Card start positions (snap points), from the layout without any pull.
  function snapPoints() {
    const cards = [...shelf.querySelectorAll('.card:not([hidden])')];
    if (!cards.length) return [0];
    const first = cards[0].offsetLeft;
    const max = maxScroll();
    const points = cards.map(card => Math.min(card.offsetLeft - first, max));
    points.push(max);
    return [...new Set(points.map(p => Math.round(p)))].sort((a, b) => a - b);
  }
  const nearest = (points, value) => points.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), points[0]);

  function stopAnimation() {
    cancelAnimationFrame(anim);
    anim = 0;
    shelf.classList.remove('is-animating');
  }

  // Critically damped spring from the current position (and speed) to `target`.
  function springTo(target, velocity = 0) {
    stopAnimation();
    if (core.reduced()) { pos = target; render(); return; }
    shelf.classList.add('is-animating');   // scroll-snap is paused while the spring runs
    let v = velocity;                        // px per second
    let last = performance.now();
    const step = now => {
      let dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // small fixed sub-steps keep the spring stable on slow frames
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        const force = -STIFFNESS * (pos - target) - DAMPING * v;
        v += force * h;
        pos += v * h;
        dt -= h;
      }
      if (Math.abs(pos - target) < 0.4 && Math.abs(v) < 8) {
        pos = target;
        render();
        stopAnimation();
        return;
      }
      render();
      anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  // Release: carry on with the release speed, then rest on the nearest card.
  // `from` is where the drag started; a deliberate drag of a quarter card or more
  // always moves on to the next card in that direction instead of snapping back.
  function settle(velocity = 0, from) {
    const max = maxScroll();
    const points = snapPoints();
    const projected = clamp(pos + velocity * 0.32, 0, max);   // where the glide would end (iOS-like 0.32 s)
    let target = nearest(points, projected);
    if (from !== undefined && points.length > 1) {
      const start = nearest(points, clamp(from, 0, max));
      const moved = projected - start;
      const oneCard = points[1] - points[0];
      if (target === start && Math.abs(moved) > oneCard * 0.25) {
        const i = points.indexOf(start) + Math.sign(moved);
        if (i >= 0 && i < points.length) target = points[i];
      }
    }
    springTo(target, velocity);
  }

  function updateShelf() {
    const max = maxScroll();
    const x = shelf.scrollLeft;
    prevBtn.disabled = x <= 2;
    nextBtn.disabled = x >= max - 2;
    shelf.classList.toggle('can-left', x > 2);
    shelf.classList.toggle('can-right', x < max - 2);
    bar.hidden = max <= 2;
    const ratio = shelf.clientWidth / shelf.scrollWidth;
    thumb.style.width = (ratio * 100) + '%';
    thumb.style.transform = `translateX(${max > 0 ? (x / max) * (1 / ratio - 1) * 100 : 0}%)`;
  }

  function resetShelf() {
    stopAnimation();
    pos = 0;
    wheelPull = 0;
    render();
    requestAnimationFrame(updateShelf);
  }

  // Move by whole cards (arrow buttons and keys). At an end, give a small bounce.
  function moveByCards(dir) {
    const points = snapPoints();
    const current = nearest(points, shelf.scrollLeft);
    const index = points.indexOf(current) + dir;
    if (index < 0 || index >= points.length) {
      if (!core.reduced()) { pos = shelf.scrollLeft; springTo(pos, dir * 900); }   // edge bounce
      return;
    }
    pos = shelf.scrollLeft;
    springTo(points[index]);
  }
  prevBtn.addEventListener('click', () => moveByCards(-1));
  nextBtn.addEventListener('click', () => moveByCards(1));

  // Native scrolling (trackpad, touch, focus) keeps `pos` in step when no spring or drag is running.
  shelf.addEventListener('scroll', () => {
    if (!anim && !drag) pos = shelf.scrollLeft;
    requestAnimationFrame(updateShelf);
  }, { passive: true });
  addEventListener('resize', () => { if (!anim && !drag) { pos = clamp(pos, 0, maxScroll()); render(); } updateShelf(); }, { passive: true });
  core.on('language', () => requestAnimationFrame(updateShelf));

  // Keyboard: with the row or one of its cards focused, Left / Right move one card.
  shelf.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const shelfCards = [...shelf.querySelectorAll('.card:not([hidden])')];
    const i = shelfCards.indexOf(document.activeElement);
    if (i !== -1 && shelfCards[i + dir]) shelfCards[i + dir].focus({ preventScroll: true });
    moveByCards(dir);
  });

  /* Mouse drag. Touch and pen keep the browser's own swipe and bounce. */
  shelf.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    stopAnimation();
    pos = shelf.scrollLeft + (pos - clamp(pos, 0, maxScroll()));   // keep any pull still showing
    justDragged = false;
    drag = { id: e.pointerId, startX: e.clientX, startPos: pos, moved: false, samples: [[e.timeStamp, e.clientX]], frame: 0 };
  });

  shelf.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;                     // a small wobble is still a click
      drag.moved = true;
      shelf.classList.add('is-dragging');
      try { shelf.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    pos = drag.startPos - dx;
    drag.samples.push([e.timeStamp, e.clientX]);
    if (drag.samples.length > 8) drag.samples.shift();
    if (!drag.frame) drag.frame = requestAnimationFrame(() => { if (drag) { drag.frame = 0; render(); } });
  });

  // Speed of the last ~90 ms of movement, in px per second (content moves opposite to the mouse).
  function releaseSpeed(samples, now) {
    const recent = samples.filter(([t]) => now - t < 90);
    if (recent.length < 2) return 0;
    const [t0, x0] = recent[0];
    const [t1, x1] = recent[recent.length - 1];
    if (t1 - t0 < 8) return 0;
    return -((x1 - x0) / (t1 - t0)) * 1000;
  }

  // End a drag. `keepSpeed` is false when the drag was interrupted (cancel, window blur).
  function endDrag(e, keepSpeed) {
    if (!drag) return;
    const { moved, startPos } = drag;
    const speed = keepSpeed && moved ? releaseSpeed(drag.samples, e ? e.timeStamp : performance.now()) : 0;
    cancelAnimationFrame(drag.frame);
    try { if (shelf.hasPointerCapture(drag.id)) shelf.releasePointerCapture(drag.id); } catch { /* ignore */ }
    drag = null;
    shelf.classList.remove('is-dragging');
    if (!moved) return;
    justDragged = true;
    // A normal release: the click that ends the drag fires before this timer runs.
    // An interrupted drag (cancel, window blur): the mouse button may still be down,
    // so the click that eventually follows is swallowed too (reset on the next press).
    if (keepSpeed) setTimeout(() => { justDragged = false; }, 0);
    else setTimeout(() => { justDragged = false; }, 1500);
    settle(clamp(speed, -6000, 6000), startPos);
  }
  shelf.addEventListener('pointerup', e => { if (drag && e.pointerId === drag.id) endDrag(e, true); });
  shelf.addEventListener('pointercancel', e => { if (drag && e.pointerId === drag.id) endDrag(e, false); });
  shelf.addEventListener('lostpointercapture', e => { if (drag && drag.moved && e.pointerId === drag.id) endDrag(e, false); });
  addEventListener('blur', () => endDrag(null, false));
  document.addEventListener('visibilitychange', () => { if (document.hidden) endDrag(null, false); });

  // A drag should not count as a click on a project (keyboard clicks have detail 0 and always pass).
  shelf.addEventListener('click', e => {
    if (justDragged && e.detail !== 0) { e.preventDefault(); e.stopPropagation(); justDragged = false; }
  }, true);
  shelf.addEventListener('dragstart', e => e.preventDefault());
  shelf.addEventListener('touchstart', () => { if (anim) { stopAnimation(); pos = shelf.scrollLeft; } }, { passive: true });

  /* Trackpad: sideways swipes scroll natively. Pushing past an end gives the same
     small pull, which springs back when the swipe stops. Only sideways (deltaX)
     motion is read, the event is never cancelled, and vertical wheel scrolling is untouched.
     Safari already bounces natively, so it is left alone there. */
  shelf.addEventListener('wheel', e => {
    if (drag || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;          // vertical wheel: leave it to the page
    const max = maxScroll();
    const elastic = !isSafari && !core.reduced();
    if (anim) {                                                            // the reader took over from the spring
      stopAnimation();
      const inside = clamp(pos, 0, max);
      if (elastic) wheelPull += pos - inside;                              // keep any pull that is showing
      pos = inside;
      render();
    }
    if (!elastic) return;
    const scheduleRelease = () => { clearTimeout(wheelTimer); wheelTimer = setTimeout(releaseWheelPull, 120); };
    if (wheelPull && Math.sign(e.deltaX) !== Math.sign(wheelPull)) {       // swiping back: undo the pull first
      const next = wheelPull + e.deltaX;
      wheelPull = Math.sign(next) === Math.sign(wheelPull) ? next : 0;
      render();
      scheduleRelease();
      return;
    }
    const atStart = shelf.scrollLeft <= 0.5 && e.deltaX < 0;
    const atEnd = shelf.scrollLeft >= max - 0.5 && e.deltaX > 0;
    if (!atStart && !atEnd) return;
    wheelPull = clamp(wheelPull + e.deltaX, -PULL_MAX * 4, PULL_MAX * 4);
    render();
    scheduleRelease();
  }, { passive: true });

  function releaseWheelPull() {
    // Hand the trackpad pull over to the spring: it becomes part of `pos` and settles back.
    pos = clamp(shelf.scrollLeft, 0, maxScroll()) + wheelPull;
    wheelPull = 0;
    springTo(clamp(pos, 0, maxScroll()));
  }

  updateShelf();

  /* ---------- Sliding nav indicator ---------- */
  const nav = document.getElementById('navigation');
  const indicator = nav.querySelector('.nav-indicator');
  function moveIndicator() {
    if (!indicator) return;
    const active = nav.querySelector('a.is-active');
    if (!active || getComputedStyle(indicator).display === 'none') { indicator.style.opacity = '0'; return; }
    indicator.style.opacity = '1';
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  }
  core.on('scroll', moveIndicator);
  core.on('language', () => requestAnimationFrame(moveIndicator));

  /* ---------- Timeline progress follows the reader ---------- */
  const timeline = document.querySelector('.timeline');
  function updateTimeline() {
    if (!timeline) return;
    if (core.reduced()) { timeline.style.setProperty('--progress', 1); return; }
    const r = timeline.getBoundingClientRect();
    const p = (innerHeight * 0.6 - r.top) / r.height;
    timeline.style.setProperty('--progress', Math.max(0, Math.min(1, p)).toFixed(3));
  }
  core.on('scroll', updateTimeline);
  core.on('motion', updateTimeline);
  updateTimeline();
  moveIndicator();
})();

/* ===================== 3. Project pages ===================== */
(() => {
  'use strict';
  const core = window.PortfolioCore;

  /* ---------- Image viewer ----------
     Every zoomable image on the page opens here. Left / Right move between images,
     Escape closes, and focus returns to the image that opened the viewer.
     The viewer shows the image currently displayed (desktop, mobile or Chinese version). */
  const dialog = document.querySelector('.pj-lightbox');
  const triggers = [...document.querySelectorAll('[data-zoom]')];
  if (dialog && triggers.length) {
    const stage = dialog.querySelector('.pj-lb-stage');
    const caption = dialog.querySelector('.pj-lb-caption');
    const prev = dialog.querySelector('[data-lb-prev]');
    const next = dialog.querySelector('[data-lb-next]');
    const zoom = dialog.querySelector('[data-lb-zoom]');
    const close = dialog.querySelector('[data-lb-close]');
    let index = 0;
    let opener = null;
    let zoomed = false;

    const captionFor = button => {
      const fig = button.closest('figure');
      const title = fig?.querySelector('figcaption h3, figcaption .pj-cap-title, figcaption');
      return (title?.textContent || button.querySelector('img')?.alt || '').trim().replace(/\s+/g, ' ');
    };

    function setZoom(on) {
      zoomed = on;
      const img = stage.querySelector('img');
      stage.classList.toggle('is-zoomed', on);
      if (img) img.style.width = on ? `${Math.round(Math.max(img.naturalWidth || 0, stage.clientWidth * 1.6))}px` : '';
      zoom.querySelector('.pj-lb-text').textContent = core.t(on ? 'd.pj.zoomFit' : 'd.pj.zoomIn');
      zoom.setAttribute('aria-pressed', String(on));
    }

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      const source = triggers[index].querySelector('img');
      const img = new Image();
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      img.addEventListener('click', () => setZoom(!zoomed));
      stage.replaceChildren(img);
      stage.scrollTo(0, 0);
      setZoom(false);
      caption.textContent = '';
      if (triggers.length > 1) {
        const count = document.createElement('b');
        count.textContent = `${index + 1} ${core.t('d.pj.imageCount')} ${triggers.length}`;
        caption.append(count);
      }
      caption.append(captionFor(triggers[index]));
      prev.disabled = next.disabled = triggers.length < 2;
    }

    function open(button) {
      opener = button;
      show(triggers.indexOf(button));
      dialog.showModal();
      document.body.classList.add('lb-open');
      close.focus();
    }

    triggers.forEach(button => button.addEventListener('click', () => open(button)));
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    zoom.addEventListener('click', () => setZoom(!zoomed));
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && !zoomed) { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft' && !zoomed) { e.preventDefault(); show(index - 1); }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('lb-open');
      stage.replaceChildren();
      opener?.focus();
    });
    core.on('language', () => { if (dialog.open) show(index); });
  }

  /* ---------- "On this page" menu follows the reading position ---------- */
  const tocLinks = [...document.querySelectorAll('.pj-toc a[href^="#"]')];
  const targets = tocLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  function markCurrent() {
    const line = innerHeight * 0.35;
    let current = targets[0];
    targets.forEach(t => { if (t.getBoundingClientRect().top <= line) current = t; });
    tocLinks.forEach(a => {
      const on = current && a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if (tocLinks.length) {
    core.on('scroll', markCurrent);
    markCurrent();
  }
})();
