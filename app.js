(() => {
  'use strict';

  const root = document.documentElement;
  const translations = JSON.parse(document.getElementById('translations').textContent);
  const languageKey = 'portfolio-language';
  const motionKey = 'portfolio-reduced-motion';
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerMedia = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
  const lowEnd = (navigator.hardwareConcurrency || 8) <= 4;
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preference remains active for this page. */ } };
  const strip = html => { const template = document.createElement('template'); template.innerHTML = html; return template.content.textContent; };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  const savedLanguage = read(languageKey);
  let language = ['en', 'zh'].includes(urlLanguage) ? urlLanguage : ['en', 'zh'].includes(savedLanguage) ? savedLanguage : navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  let manualReduced = read(motionKey) === 'true';
  let reduced = systemMotion.matches || manualReduced;

  const nav = document.getElementById('navigation');
  const menu = document.querySelector('.menu-toggle');
  const motionButton = document.querySelector('.motion-toggle');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  const menuMedia = matchMedia('(max-width: 900px)');
  let scrollFrame = 0;
  let menuScrollY = 0;

  function configureMotionDOM() {
    document.querySelectorAll([
      '.section-heading h2', '.research-heading', '.about-grid h2',
      '.education-main h2', '.skills-layout > h2', '.contact-main h2',
      '.project-caption h3', '.case-head h1', '.story-section h2',
      '.next-project-link h2'
    ].join(',')).forEach(element => element.classList.add('motion-title'));

    document.querySelectorAll([
      '.section-heading > p', '.about-copy', '.project-caption p',
      '.case-head > p', '.story-section > p', '.contact-bottom'
    ].join(',')).forEach(element => element.classList.add('motion-copy'));

    document.querySelectorAll('.case-meta, .case-cover, .contact-bottom, .next-project').forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(70 + index * 50, 170)}ms`);
    });
    document.querySelectorAll('.case-cover, .gallery-figure').forEach(element => element.classList.add('motion-image-shell'));

    const staggerGroups = [
      ['.research-list', '.research-row', 70],
      ['.experience-list', '.experience-row', 70],
      ['.workflow-line', ':scope > div', 60],
      ['.outcome-grid', ':scope > div', 60]
    ];
    staggerGroups.forEach(([containerSelector, itemSelector, step]) => {
      document.querySelectorAll(containerSelector).forEach(container => {
        container.querySelectorAll(itemSelector).forEach((item, index) => {
          item.classList.add('reveal', 'motion-stagger-item');
          item.style.setProperty('--reveal-delay', `${Math.min(index * step, 180)}ms`);
        });
      });
    });
  }

  configureMotionDOM();
  root.classList.add('js');

  function applyLanguage(next, { persist = false, announce = false } = {}) {
    language = next;
    const copy = translations[next];
    for (const element of document.querySelectorAll('[data-i18n]')) {
      const value = copy[element.dataset.i18n];
      if (value === undefined) continue;
      if (element.dataset.i18nAttr) element.setAttribute(element.dataset.i18nAttr, strip(value));
      else if (element.tagName === 'TITLE') element.textContent = strip(value);
      else element.innerHTML = value;
    }
    for (const image of document.querySelectorAll('[data-src-en]')) image.src = image.dataset[next === 'zh' ? 'srcZh' : 'srcEn'];
    for (const button of document.querySelectorAll('button[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === next));
    root.lang = next === 'zh' ? 'zh-CN' : 'en';
    root.dataset.language = next;
    for (const link of document.querySelectorAll('a[data-page]')) {
      const url = new URL(link.getAttribute('href'), location.href);
      url.searchParams.set('lang', next);
      link.href = url.href;
    }
    updateMotionLabel();
    if (persist) {
      save(languageKey, next);
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
    }
    if (announce) document.getElementById('language-status').textContent = next === 'zh' ? '已切换为中文。' : 'Language changed to English.';
  }

  document.querySelectorAll('button[data-language]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.language === language) return;
    applyLanguage(button.dataset.language, { persist: true, announce: true });
    setMenu(false);
  }));

  function lockMenuScroll() {
    if (!menuMedia.matches || document.body.classList.contains('menu-open')) return;
    menuScrollY = window.scrollY;
    document.body.style.top = `-${menuScrollY}px`;
    document.body.classList.add('menu-open');
  }

  function unlockMenuScroll() {
    if (!document.body.classList.contains('menu-open')) return;
    root.classList.add('menu-restoring');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, menuScrollY);
    requestAnimationFrame(() => {
      root.classList.remove('menu-restoring');
      scheduleScrollUpdate();
    });
  }

  function setMenu(open, { returnFocus = false } = {}) {
    const wasOpen = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (open && !wasOpen) lockMenuScroll();
    if (!open && wasOpen) unlockMenuScroll();
    const label = menu.querySelector('[data-i18n]');
    label.dataset.i18n = open ? 'nav.close' : 'nav.menu';
    label.textContent = translations[language][label.dataset.i18n];
    if (returnFocus) menu.focus();
  }

  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, { returnFocus: true });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header') && menu.getAttribute('aria-expanded') === 'true') setMenu(false);
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        event.preventDefault();
        setMenu(false);
        history.pushState(null, '', url);
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    } else if (link.closest('nav')) setMenu(false);
  });
  menuMedia.addEventListener('change', event => { if (!event.matches) setMenu(false); });

  function updateMotionLabel() {
    const key = systemMotion.matches ? 'motion.system' : reduced ? 'motion.resume' : 'motion.pause';
    const span = motionButton.querySelector('[data-i18n]');
    span.dataset.i18n = key;
    span.textContent = translations[language][key];
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.disabled = systemMotion.matches;
  }

  function resetMotionTransforms() {
    document.querySelectorAll('[style*="--parallax-y"]').forEach(element => element.style.setProperty('--parallax-y', '0px'));
    document.querySelectorAll('[style*="--lens-x"]').forEach(element => {
      element.style.setProperty('--lens-x', '0deg');
      element.style.setProperty('--lens-y', '0deg');
    });
  }

  function applyMotion() {
    reduced = systemMotion.matches || manualReduced;
    root.dataset.reducedMotion = String(reduced);
    updateMotionLabel();
    if (reduced) {
      document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
      resetMotionTransforms();
    }
    scheduleScrollUpdate();
  }

  motionButton.addEventListener('click', () => {
    manualReduced = !manualReduced;
    save(motionKey, String(manualReduced));
    applyMotion();
  });
  systemMotion.addEventListener('change', applyMotion);
  applyLanguage(language, { persist: Boolean(urlLanguage && ['en', 'zh'].includes(urlLanguage)) });
  applyMotion();

  if ('IntersectionObserver' in window && !reduced) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
    document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));
  } else {
    document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
  }

  const navigationSections = [...document.querySelectorAll('main section[id]')].filter(section => ['work', 'about', 'experience', 'education', 'skills', 'contact'].includes(section.id));
  const navLinks = [...nav.querySelectorAll('a[href*="#"]')];
  const caseSections = [...document.querySelectorAll('.case-story .story-section[id], .gallery-section[id]')];
  const caseLinks = [...document.querySelectorAll('.case-sidebar a[href^="#"]')];
  const ambientBySection = {
    top: '#f5f5f7', work: '#f4f4f7', about: '#efeff4',
    experience: '#f6f6f8', education: '#f2f3f4', skills: '#f4f3f7', contact: '#f1f1f4'
  };
  const parallaxTargets = [...document.querySelectorAll('.decision-lens, .project-media, .case-cover')];
  let lastScroll = scrollY;

  function markActive(links, sectionId) {
    links.forEach(link => {
      const active = new URL(link.href).hash === `#${sectionId}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function sectionAtReadingLine(sections) {
    const line = innerHeight * 0.42;
    return sections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= line && rect.bottom > line;
    });
  }

  function updateParallax() {
    if (reduced || lowEnd || !pointerMedia.matches) {
      resetMotionTransforms();
      return;
    }
    parallaxTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > innerHeight + 120) return;
      const distance = innerHeight * 0.5 - (rect.top + rect.height * 0.5);
      const limit = target.classList.contains('decision-lens') ? 24 : target.classList.contains('case-cover') ? 18 : 14;
      target.style.setProperty('--parallax-y', `${clamp(distance * 0.055, -limit, limit).toFixed(2)}px`);
    });
  }

  function updateScroll() {
    const currentScroll = scrollY;
    const range = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, currentScroll / range) : 0})`;
    header.classList.toggle('is-scrolled', currentScroll > 24);
    if (currentScroll < 72) {
      header.classList.remove('is-going-up', 'is-going-down');
    } else if (currentScroll > lastScroll + 8) {
      header.classList.add('is-going-down');
      header.classList.remove('is-going-up');
    } else if (currentScroll < lastScroll - 8) {
      header.classList.add('is-going-up');
      header.classList.remove('is-going-down');
    }
    lastScroll = currentScroll;

    const activeHomeSection = sectionAtReadingLine(navigationSections);
    markActive(navLinks, activeHomeSection?.id || '');
    if (activeHomeSection) root.style.setProperty('--page-ambient', ambientBySection[activeHomeSection.id] || ambientBySection.top);
    else if (navigationSections.length) root.style.setProperty('--page-ambient', ambientBySection.top);

    const activeCaseSection = sectionAtReadingLine(caseSections);
    markActive(caseLinks, activeCaseSection?.id || '');
    updateParallax();
    scrollFrame = 0;
  }

  function scheduleScrollUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  addEventListener('resize', scheduleScrollUpdate, { passive: true });
  pointerMedia.addEventListener('change', scheduleScrollUpdate);
  updateScroll();

  // The abstract Hero lens responds lightly; project cards retain the system cursor.
  document.querySelectorAll('.decision-lens').forEach(surface => {
    let frame = 0;
    surface.addEventListener('pointermove', event => {
      if (reduced || !pointerMedia.matches || frame) return;
      frame = requestAnimationFrame(() => {
        const rect = surface.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        surface.style.setProperty('--lens-x', `${(x / rect.width - 0.5) * 8}deg`);
        surface.style.setProperty('--lens-y', `${(y / rect.height - 0.5) * -6}deg`);
        frame = 0;
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', () => {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      surface.style.setProperty('--lens-x', '0deg');
      surface.style.setProperty('--lens-y', '0deg');
    });
  });

  const dialog = document.querySelector('.image-dialog');
  if (dialog) {
    let opener;
    let closeTimer = 0;
    const finishClose = () => {
      clearTimeout(closeTimer);
      dialog.classList.remove('is-closing');
      if (dialog.open) dialog.close();
    };
    const requestDialogClose = () => {
      if (!dialog.open || dialog.classList.contains('is-closing')) return;
      if (reduced) { finishClose(); return; }
      dialog.classList.add('is-closing');
      closeTimer = window.setTimeout(finishClose, 260);
    };
    document.querySelectorAll('[data-expand-image]').forEach(button => button.addEventListener('click', () => {
      opener = button;
      clearTimeout(closeTimer);
      dialog.classList.remove('is-closing');
      const image = button.querySelector('img').cloneNode();
      image.loading = 'eager';
      dialog.querySelector('.dialog-image-slot').replaceChildren(image);
      dialog.showModal();
      document.body.classList.add('dialog-open');
    }));
    dialog.querySelector('.dialog-close').addEventListener('click', requestDialogClose);
    dialog.addEventListener('cancel', event => { event.preventDefault(); requestDialogClose(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && dialog.open) {
        event.preventDefault();
        requestDialogClose();
      }
    }, true);
    dialog.addEventListener('click', event => { if (event.target === dialog) requestDialogClose(); });
    dialog.addEventListener('close', () => {
      clearTimeout(closeTimer);
      dialog.classList.remove('is-closing');
      document.body.classList.remove('dialog-open');
      opener?.focus();
    });
  }
})();
