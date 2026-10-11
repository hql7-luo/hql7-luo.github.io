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
     Moves only when the reader acts: trackpad swipe or Shift+wheel (native),
     mouse drag, arrow buttons, or arrow keys when the row is focused.
     The ordinary mouse wheel always scrolls the page up and down. */
  const shelf = document.querySelector('.shelf');
  const prevBtn = document.querySelector('[data-shelf-prev]');
  const nextBtn = document.querySelector('[data-shelf-next]');
  const bar = document.querySelector('.shelf-progress');
  const thumb = bar.querySelector('span');

  function updateShelf() {
    const max = shelf.scrollWidth - shelf.clientWidth;
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
  function stepSize() {
    const card = shelf.querySelector('.card:not([hidden])');
    return card ? card.getBoundingClientRect().width + 20 : shelf.clientWidth * 0.8;
  }
  function resetShelf() {
    shelf.scrollTo({ left: 0, behavior: 'auto' });
    requestAnimationFrame(updateShelf);
  }
  prevBtn.addEventListener('click', () => shelf.scrollBy({ left: -stepSize(), behavior: core.reduced() ? 'auto' : 'smooth' }));
  nextBtn.addEventListener('click', () => shelf.scrollBy({ left: stepSize(), behavior: core.reduced() ? 'auto' : 'smooth' }));
  shelf.addEventListener('scroll', () => requestAnimationFrame(updateShelf), { passive: true });
  addEventListener('resize', updateShelf, { passive: true });
  core.on('language', () => requestAnimationFrame(updateShelf));

  // Keyboard: with the row or one of its cards focused, Left / Right move one card.
  shelf.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const shelfCards = [...shelf.querySelectorAll('.card:not([hidden])')];
    const i = shelfCards.indexOf(document.activeElement);
    if (i !== -1 && shelfCards[i + dir]) shelfCards[i + dir].focus({ preventScroll: true });
    shelf.scrollBy({ left: dir * stepSize(), behavior: core.reduced() ? 'auto' : 'smooth' });
  });

  // Mouse drag to scroll (touch already swipes natively)
  let drag = null;
  let justDragged = false;
  shelf.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    justDragged = false;
    drag = { x: e.clientX, left: shelf.scrollLeft, moved: false };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; shelf.classList.add('is-dragging'); }
    if (drag.moved) shelf.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    if (drag.moved) {
      justDragged = true;
      shelf.classList.remove('is-dragging');
      setTimeout(() => { justDragged = false; }, 0); // the click that ends a drag fires before this runs
    }
    drag = null;
  });
  // A drag should not count as a click on a project (keyboard clicks have detail 0 and always pass)
  shelf.addEventListener('click', e => {
    if (justDragged && e.detail !== 0) { e.preventDefault(); e.stopPropagation(); justDragged = false; }
  }, true);
  shelf.addEventListener('dragstart', e => e.preventDefault());
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
