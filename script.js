/* responsive device detection */
(() => {
  const root = document.body;
  if (!root) return;
  const queries = [
    window.matchMedia('(max-width: 640px)'),
    window.matchMedia('(max-width: 1024px)'),
    window.matchMedia('(pointer: coarse)'),
    window.matchMedia('(hover: none)'),
  ];

  function detectDevice() {
    const width = window.innerWidth;
    const touchLike = window.matchMedia('(pointer: coarse), (hover: none)').matches || (navigator.maxTouchPoints || 0) > 0;
    if (width <= 640) return 'mobile';
    if (width <= 1024 || (touchLike && width <= 1180)) return 'tablet';
    return 'desktop';
  }

  function applyDevice() {
    const device = detectDevice();
    if (root.dataset.device === device) return;
    root.dataset.device = device;
    root.classList.toggle('is-desktop', device === 'desktop');
    root.classList.toggle('is-touch', device !== 'desktop');
    window.dispatchEvent(new CustomEvent('haxurus:devicechange', { detail: { device } }));
  }

  const requestApply = () => window.requestAnimationFrame(applyDevice);
  queries.forEach((query) => {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', requestApply);
  });
  window.addEventListener('resize', requestApply, { passive: true });
  window.addEventListener('orientationchange', requestApply, { passive: true });
  applyDevice();
})();

/* about final visual fixes */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .about-haxurus__card{display:grid!important;grid-template-columns:minmax(230px,.34fr) 1fr!important;align-items:center!important;gap:clamp(28px,5vw,58px)!important;min-height:420px!important;padding:clamp(28px,4vw,48px)!important;border:1px solid var(--liquid-glass-edge)!important;background:var(--liquid-glass-bg)!important;box-shadow:var(--liquid-glass-shadow)!important;-webkit-backdrop-filter:blur(5px) saturate(132%) brightness(1.08)!important;backdrop-filter:blur(5px) saturate(132%) brightness(1.08)!important}.about-haxurus__card::before,.about-haxurus__card::after{content:none!important;display:none!important}.about-haxurus__visual{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:100%;min-height:260px;opacity:0;transform:translateY(22px) scale(.96);transition:opacity .56s ease,transform .56s cubic-bezier(.2,.8,.2,1)}.about-haxurus__visual img{display:block;width:min(270px,100%);height:auto;max-height:320px;object-fit:contain;filter:drop-shadow(0 0 24px rgba(57,255,20,.44)) drop-shadow(0 22px 34px rgba(0,0,0,.36))}.about-haxurus__content{position:relative;z-index:2;min-width:0}.about-haxurus.about-ready .about-haxurus__visual{opacity:1;transform:none;transition-delay:.12s}.about-haxurus.about-ready:not(.about-actions-ready) .about-haxurus__cta,.about-haxurus.about-ready:not(.about-actions-ready) .about-haxurus__button{opacity:0!important;visibility:hidden!important;transform:translateY(18px)!important;pointer-events:none!important}.about-haxurus.about-actions-ready .about-haxurus__cta{opacity:1!important;visibility:visible!important;transform:none!important}.about-haxurus.about-actions-ready .about-haxurus__button{opacity:0;visibility:hidden;transform:translateY(16px);animation:aboutCtaButtonIn .45s cubic-bezier(.2,.8,.2,1) forwards}.about-haxurus.about-actions-ready .about-haxurus__button:nth-child(1){animation-delay:.02s}.about-haxurus.about-actions-ready .about-haxurus__button:nth-child(2){animation-delay:.16s}.about-haxurus.about-actions-ready .about-haxurus__button:nth-child(3){animation-delay:.30s}@keyframes aboutCtaButtonIn{to{opacity:1;visibility:visible;transform:none}}body.skip-intro .about-haxurus__visual,body.skip-intro .about-haxurus__cta,body.skip-intro .about-haxurus__button{opacity:1!important;visibility:visible!important;transform:none!important;animation:none!important;pointer-events:auto!important}@media (max-width:720px){.about-haxurus__card{grid-template-columns:1fr!important;gap:20px!important;min-height:auto!important;padding:24px!important}.about-haxurus__visual{min-height:150px}.about-haxurus__visual img{width:min(150px,52vw);max-height:170px}}
  `;
  document.head.appendChild(style);

  function normalizeAbout() {
    const card = document.querySelector('.about-haxurus__card');
    if (!card || card.querySelector('.about-haxurus__visual')) return;
    const visual = document.createElement('div');
    visual.className = 'about-haxurus__visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = '<img alt="" src="img/favicon.png"/>';
    const content = document.createElement('div');
    content.className = 'about-haxurus__content';
    while (card.firstChild) content.appendChild(card.firstChild);
    card.appendChild(visual);
    card.appendChild(content);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizeAbout, { once: true });
  else normalizeAbout();
})();

/* modal handling */
(() => {
  const triggers = document.querySelectorAll('[data-modal-open]');
  const closeTargets = document.querySelectorAll('[data-modal-close]');
  const modals = document.querySelectorAll('.modal');
  const focusableSelector = 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let activeModal = null;
  let lastTrigger = null;

  function focusable(container) {
    return [...container.querySelectorAll(focusableSelector)].filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
  }

  function trapFocus(event, modal) {
    if (event.key !== 'Tab') return;
    const panel = modal.querySelector('.modal-panel') || modal;
    const items = focusable(panel);
    if (!items.length) { event.preventDefault(); panel.focus(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !panel.contains(active))) { event.preventDefault(); last.focus(); return; }
    if (!event.shiftKey && (active === last || !panel.contains(active))) { event.preventDefault(); first.focus(); }
  }

  function openModal(id, trigger = null) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastTrigger = trigger || document.activeElement;
    activeModal = modal;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const panel = modal.querySelector('.modal-panel') || modal;
    const items = focusable(panel);
    window.requestAnimationFrame(() => (items[0] || panel).focus());
  }

  function closeModal(modal, { restoreFocus = true } = {}) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    const openModals = [...modals].filter((item) => item.classList.contains('is-open'));
    activeModal = openModals[openModals.length - 1] || null;
    if (!activeModal) document.body.classList.remove('modal-open');
    if (restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function' && document.contains(lastTrigger)) window.requestAnimationFrame(() => lastTrigger.focus());
  }

  triggers.forEach((trigger) => trigger.addEventListener('click', () => openModal(trigger.dataset.modalOpen, trigger)));
  closeTargets.forEach((target) => target.addEventListener('click', () => closeModal(target.closest('.modal'))));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { if (activeModal) closeModal(activeModal); return; }
    if (activeModal) trapFocus(event, activeModal);
  });
})();

/* background video */
(() => {
  const bgVideo = document.querySelector('.background-video');
  if (!bgVideo) return;
  const tryPlay = () => {
    const promise = bgVideo.play();
    if (promise && typeof promise.catch === 'function') promise.catch(() => {});
  };
  bgVideo.addEventListener('loadeddata', tryPlay);
  bgVideo.addEventListener('canplay', tryPlay);
  bgVideo.addEventListener('ended', () => { bgVideo.currentTime = 0; tryPlay(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); });
  window.addEventListener('focus', tryPlay);
  window.addEventListener('pointerdown', tryPlay, { once: true });
  tryPlay();
})();

/* particles */
(() => {
  const canvas = document.getElementById('particle-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const particles = [];
  const mouse = { x: -9999, y: -9999, active: false };
  let rafId = null;
  let enabled = false;

  function shouldEnable() {
    const device = document.body?.dataset?.device;
    const touchLike = window.matchMedia('(pointer: coarse), (hover: none)').matches || (navigator.maxTouchPoints || 0) > 0;
    return device ? device === 'desktop' && !touchLike : window.innerWidth > 768 && !touchLike;
  }
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function randomBetween(min, max) { return Math.random() * (max - min) + min; }
  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < 150; i += 1) {
      particles.push({ x: randomBetween(0, window.innerWidth), y: randomBetween(0, window.innerHeight), vx: randomBetween(-0.12, 0.12), vy: randomBetween(-0.12, 0.12), size: randomBetween(1.2, 3.1), glow: randomBetween(8, 18), hue: [120, 135, 145][Math.floor(Math.random() * 3)], phase: randomBetween(0, Math.PI * 2), drift: randomBetween(0.0015, 0.0035) });
    }
  }
  function drawParticle(p) {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 85%, 68%, 0.78)`;
    ctx.shadowBlur = p.glow;
    ctx.shadowColor = `hsla(${p.hue}, 85%, 65%, 0.45)`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  function drawLinks() {
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 135) { ctx.beginPath(); ctx.strokeStyle = `rgba(120, 255, 170, ${0.12 * (1 - dist / 135)})`; ctx.lineWidth = 1; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      if (mouse.active) {
        const dist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dist < 150) { ctx.beginPath(); ctx.strokeStyle = `rgba(187, 247, 208, ${0.18 * (1 - dist / 150)})`; ctx.lineWidth = 1; ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
    }
  }
  function updateParticles() {
    const time = performance.now();
    for (const p of particles) {
      p.vx += Math.cos(time * p.drift + p.phase) * 0.0028;
      p.vy += Math.sin(time * p.drift * 0.8 + p.phase) * 0.0028;
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 0.1) { const force = (140 - dist) / 140; p.vx -= (dx / dist) * force * 0.03; p.vy -= (dy / dist) * force * 0.03; }
      }
      p.x += p.vx; p.y += p.vy; p.vx *= 0.996; p.vy *= 0.996;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;
    }
  }
  function render() { if (!enabled) return; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); drawLinks(); particles.forEach(drawParticle); updateParticles(); rafId = window.requestAnimationFrame(render); }
  function start() { if (enabled) return; enabled = true; canvas.style.display = 'block'; resize(); createParticles(); render(); }
  function stop() { enabled = false; canvas.style.display = 'none'; mouse.active = false; if (rafId) window.cancelAnimationFrame(rafId); rafId = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  function sync() { shouldEnable() ? start() : stop(); }
  window.addEventListener('mousemove', (event) => { if (!enabled) return; mouse.x = event.clientX; mouse.y = event.clientY; mouse.active = true; });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('resize', () => { if (enabled) { resize(); createParticles(); } sync(); }, { passive: true });
  window.addEventListener('haxurus:devicechange', sync);
  document.addEventListener('visibilitychange', () => { if (document.hidden && enabled && rafId) { window.cancelAnimationFrame(rafId); rafId = null; } else if (!document.hidden && enabled && !rafId) render(); });
  sync();
})();

/* sequential reveal */
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SKIP_EVENT = 'haxurus:skip-intro';
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  let skipRequested = window.__skipIntro === true;
  let sequenceStarted = false;
  function shouldSkip() { return skipRequested || window.__skipIntro === true; }
  function rememberText(el) { if (el && !el.dataset.originalText) el.dataset.originalText = (el.textContent || '').trim(); }
  function restoreText(el) { if (!el) return; rememberText(el); el.textContent = el.dataset.originalText || ''; el.classList.remove('type-caret'); }
  function revealEverything() {
    const allAnimated = document.querySelectorAll('.hero, .quick-link, .block .link-card, .about-haxurus, .category h2, .category .link-card, .playlist-card');
    const allText = document.querySelectorAll('.hero h1, .hero-text, .about-haxurus h2, .about-haxurus p, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag');
    allText.forEach((el) => restoreText(el));
    allAnimated.forEach((el) => { el.classList.add('seq-visible'); if (el.classList.contains('about-haxurus')) el.classList.add('about-ready', 'about-actions-ready'); el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'none'; });
  }
  function waitForLoader() {
    if (!document.body.classList.contains('is-loading')) return Promise.resolve();
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (done) return; done = true; observer.disconnect(); window.setTimeout(resolve, 90); };
      const observer = new MutationObserver(() => { if (!document.body.classList.contains('is-loading')) finish(); });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener(SKIP_EVENT, finish, { once: true });
      window.setTimeout(() => { if (!document.body.classList.contains('is-loading')) finish(); }, 5000);
    });
  }
  async function typeText(el, speed) {
    const fullText = el.dataset.originalText || '';
    if (!fullText) return;
    if (shouldSkip()) { el.textContent = fullText; el.classList.remove('type-caret'); return; }
    el.classList.add('type-caret');
    for (let i = 1; i <= fullText.length; i += 1) { if (shouldSkip()) { el.textContent = fullText; break; } el.textContent = fullText.slice(0, i); await wait(speed); }
    el.classList.remove('type-caret');
  }
  function prepareTextTargets(container) {
    const textTargets = container.matches('h2, .hero h1, .hero-text, .about-haxurus h2, .about-haxurus p') ? [container] : [...container.querySelectorAll('.card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag')];
    textTargets.forEach((el) => { rememberText(el); if (!shouldSkip()) el.textContent = ''; });
    return textTargets;
  }
  function setupHero(hero, heroTitle, heroText) { if (!hero) return; hero.style.opacity = '0'; hero.style.transform = 'translateY(26px) scale(0.985)'; hero.style.transition = 'opacity 0.65s ease, transform 0.65s ease'; [heroTitle, heroText].forEach((el) => { if (el) { rememberText(el); el.textContent = ''; } }); }
  async function revealHero(hero, heroTitle, heroText) {
    if (!hero) return;
    hero.classList.add('seq-visible'); hero.style.opacity = '1'; hero.style.transform = 'translateY(0) scale(1)';
    if (shouldSkip()) { revealEverything(); return; }
    await wait(380);
    if (heroTitle) { await typeText(heroTitle, 28); if (shouldSkip()) { revealEverything(); return; } await wait(90); }
    if (heroText) { await typeText(heroText, 12); if (shouldSkip()) { revealEverything(); return; } await wait(120); }
  }
  async function revealItem(item, speed = 16) {
    const textTargets = prepareTextTargets(item);
    item.classList.add('seq-visible');
    if (shouldSkip()) { textTargets.forEach((el) => restoreText(el)); item.style.opacity = '1'; item.style.transform = 'none'; item.style.transition = 'none'; return; }
    await wait(item.matches('.quick-link') ? 90 : item.matches('h2') ? 130 : 150);
    for (const el of textTargets) { const textSpeed = el.matches('.card-subtitle, .playlist-subtitle, .playlist-tag') ? 10 : speed; await typeText(el, textSpeed); if (shouldSkip()) { revealEverything(); return; } await wait(35); }
    await wait(item.matches('h2') ? 110 : 75);
  }
  async function revealAbout(about) {
    if (!about) return;
    const title = about.querySelector('h2');
    const text = about.querySelector('p');
    about.classList.remove('about-actions-ready');
    [title, text].forEach((el) => { if (el) { rememberText(el); if (!shouldSkip()) el.textContent = ''; } });
    about.classList.add('about-ready', 'seq-visible');
    await wait(260);
    if (title) await typeText(title, 20);
    await wait(70);
    if (text) await typeText(text, 8);
    await wait(120);
    about.classList.add('about-actions-ready');
    await wait(220);
  }
  async function runSequence() {
    if (sequenceStarted) return;
    sequenceStarted = true;
    await waitForLoader();
    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero h1');
    const heroText = document.querySelector('.hero-text');
    const quickLinks = [...document.querySelectorAll('.quick-links .quick-link')];
    const about = document.querySelector('.about-haxurus');
    const sections = [...document.querySelectorAll('main .category')];
    document.querySelectorAll('.hero h1, .hero-text, .about-haxurus h2, .about-haxurus p, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag').forEach((el) => rememberText(el));
    if (prefersReducedMotion || shouldSkip()) { revealEverything(); return; }
    setupHero(hero, heroTitle, heroText);
    await revealHero(hero, heroTitle, heroText);
    if (shouldSkip()) { revealEverything(); return; }
    for (const link of quickLinks) { link.classList.add('seq-visible'); if (shouldSkip()) { revealEverything(); return; } await wait(80); }
    await revealAbout(about);
    if (shouldSkip()) { revealEverything(); return; }
    for (const section of sections) {
      const heading = section.querySelector('h2');
      if (heading) { await revealItem(heading, 22); if (shouldSkip()) return; }
      const items = [...section.querySelectorAll('.link-card, .playlist-card')];
      for (const item of items) { await revealItem(item); if (shouldSkip()) return; }
    }
  }
  window.addEventListener(SKIP_EVENT, () => { skipRequested = true; revealEverything(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runSequence, { once: true });
  else runSequence();
})();

/* current year in footer */
(() => {
  const yearTarget = document.getElementById('current-year');
  if (!yearTarget) return;
  yearTarget.textContent = String(new Date().getFullYear());
})();