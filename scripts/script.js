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

/* section spacing overrides */
(() => {
  const style = document.createElement('style');
  style.setAttribute('data-section-spacing-overrides', '');
  style.textContent = `
    .hero + .about-haxurus{margin-top:clamp(92px,12vh,150px)!important;margin-bottom:clamp(96px,12vh,160px)!important}
    #support.support-category{padding-top:clamp(110px,14vh,180px)!important}
    @media (max-width:720px){.hero + .about-haxurus{margin-top:58px!important;margin-bottom:72px!important}#support.support-category{padding-top:86px!important}}
  `;
  document.head.appendChild(style);
})();

/* about final visual fixes */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .about-haxurus:not(.seq-visible) .about-haxurus__card{opacity:0!important;visibility:hidden!important;transform:translateY(26px) scale(.985)!important;pointer-events:none!important}.about-haxurus:not(.seq-visible) .about-haxurus__visual,.about-haxurus:not(.seq-visible) .about-haxurus__content{opacity:0!important;visibility:hidden!important}.about-haxurus__card{display:grid!important;grid-template-columns:minmax(230px,.34fr) 1fr!important;align-items:center!important;gap:clamp(28px,5vw,58px)!important;min-height:420px!important;padding:clamp(28px,4vw,48px)!important;border:1px solid var(--liquid-glass-edge)!important;background:var(--liquid-glass-bg)!important;box-shadow:var(--liquid-glass-shadow)!important;-webkit-backdrop-filter:blur(5px) saturate(132%) brightness(1.08)!important;backdrop-filter:blur(5px) saturate(132%) brightness(1.08)!important}.about-haxurus__card::before,.about-haxurus__card::after{content:none!important;display:none!important}.about-haxurus__visual{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:100%;min-height:260px;opacity:0;transform:translateY(22px) scale(.96);transition:opacity .56s ease,transform .56s cubic-bezier(.2,.8,.2,1)}.about-haxurus__visual img{display:block;width:min(270px,100%);height:auto;max-height:320px;object-fit:contain;filter:drop-shadow(0 0 24px rgba(57,255,20,.44)) drop-shadow(0 22px 34px rgba(0,0,0,.36))}.about-haxurus__content{position:relative;z-index:2;min-width:0}.about-haxurus.about-ready .about-haxurus__visual{opacity:1;transform:none;transition-delay:.12s}.about-haxurus.about-ready:not(.about-actions-ready) .about-haxurus__cta,.about-haxurus.about-ready:not(.about-actions-ready) .about-haxurus__button{opacity:0!important;visibility:hidden!important;transform:translateY(18px)!important;pointer-events:none!important}.about-haxurus.about-actions-ready .about-haxurus__cta{opacity:1!important;visibility:visible!important;transform:none!important}.about-haxurus.about-actions-ready .about-haxurus__button{opacity:0;visibility:hidden;transform:translateY(16px);animation:aboutCtaButtonIn .45s cubic-bezier(.2,.8,.2,1) forwards}.about-haxurus.about-actions-ready .about-haxurus__button:nth-child(1){animation-delay:.02s}.about-haxurus.about-actions-ready .about-haxurus__button:nth-child(2){animation-delay:.16s}.about-haxurus.about-actions-ready .about-haxurus__button:nth-child(3){animation-delay:.30s}@keyframes aboutCtaButtonIn{to{opacity:1;visibility:visible;transform:none}}body.skip-intro .about-haxurus__card,body.skip-intro .about-haxurus__visual,body.skip-intro .about-haxurus__content,body.skip-intro .about-haxurus__cta,body.skip-intro .about-haxurus__button{opacity:1!important;visibility:visible!important;transform:none!important;animation:none!important;pointer-events:auto!important}@media (max-width:720px){.about-haxurus__card{grid-template-columns:1fr!important;gap:20px!important;min-height:auto!important;padding:24px!important}.about-haxurus__visual{min-height:150px}.about-haxurus__visual img{width:min(150px,52vw);max-height:170px}.site-nav__inner{align-items:center!important;text-align:center!important}.site-nav__brand{align-self:center!important;justify-content:center!important;width:100%!important}.site-nav__links{justify-content:center!important;text-align:center!important;flex-wrap:wrap!important;gap:8px!important;width:100%!important}.site-nav__links a{ text-align:center!important}}
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

/* navigation and contact badges */
(() => {
  const style = document.createElement('style');
  style.textContent = `.card-badge--contact{border-color:rgba(57,255,20,.38)!important;background:rgba(57,255,20,.12)!important;color:#dfffe7!important}`;
  document.head.appendChild(style);

  function addAboutToNav() {
    const navLinks = document.querySelector('.site-nav__links');
    if (!navLinks || navLinks.querySelector('a[href="#about"]')) return;
    const link = document.createElement('a');
    link.href = '#about';
    link.textContent = 'About';
    navLinks.insertBefore(link, navLinks.firstElementChild);
  }

  function getCardBody(card) {
    return card.querySelector('.card-body, .link-card-banner-body, .playlist-info') || card;
  }

  function addBadge(card, type, label) {
    const body = getCardBody(card);
    let badges = body.querySelector('.card-badges');
    if (!badges) {
      badges = document.createElement('div');
      badges.className = 'card-badges';
      body.appendChild(badges);
    }
    if (badges.querySelector(`[data-badge-type="${type}"]`)) return;
    const badge = document.createElement('span');
    badge.className = `card-badge card-badge--${type}`;
    badge.dataset.badgeType = type;
    badge.textContent = label;
    badges.appendChild(badge);
    card.classList.add('has-card-badges');
  }

  function addContactBadges() {
    const contactPatterns = [
      /^mailto:/i,
      /discord\.com\/users\//i,
      /t\.me\/(haxurus_official|limitati_haxbot)/i,
      /instagram\.com\/haxurus/i,
      /vrchat\.com\/home\/user\//i,
      /github\.com\/Haxurus/i,
      /youtube\.com\/@haxurus/i,
      /tiktok\.com\/@haxurus/i
    ];
    document.querySelectorAll('.link-card[href]').forEach((card) => {
      const href = card.getAttribute('href') || '';
      if (contactPatterns.some((pattern) => pattern.test(href))) addBadge(card, 'contact', 'Contact');
    });
  }

  function apply() {
    addAboutToNav();
    addContactBadges();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
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
  const video = document.querySelector('.background-video');
  if (!video) return;

  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('loop', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  let retryTimer = null;

  function play() {
    if (document.hidden || !video.paused) return;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  }

  function scheduleRetry() {
    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(play, 250);
  }

  function restart() {
    try { video.currentTime = 0; } catch (error) {}
    play();
  }

  video.addEventListener('loadeddata', play);
  video.addEventListener('canplay', play);
  video.addEventListener('ended', restart);
  video.addEventListener('stalled', scheduleRetry);
  video.addEventListener('waiting', scheduleRetry);
  video.addEventListener('pause', scheduleRetry);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) play();
  });
  window.addEventListener('focus', play);
  window.addEventListener('pointerdown', play, { once: true });

  play();
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
  function primeAbout(about) {
    if (!about || shouldSkip() || prefersReducedMotion) return;
    const targets = [about.querySelector('.about-haxurus__eyebrow'), about.querySelector('h2'), about.querySelector('p'), ...about.querySelectorAll('.about-haxurus__button')];
    targets.forEach((el) => { if (!el) return; rememberText(el); el.textContent = ''; el.classList.remove('type-caret'); });
    about.classList.remove('about-ready', 'about-actions-ready', 'seq-visible');
  }
  function revealEverything() {
    const allAnimated = document.querySelectorAll('.hero, .quick-link, .block .link-card, .about-haxurus, .category h2, .category .link-card, .playlist-card');
    const allText = document.querySelectorAll('.hero h1, .hero-text, .about-haxurus__eyebrow, .about-haxurus h2, .about-haxurus p, .about-haxurus__button, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag');
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
    const textTargets = container.matches('h2, .hero h1, .hero-text, .about-haxurus__eyebrow, .about-haxurus h2, .about-haxurus p, .about-haxurus__button') ? [container] : [...container.querySelectorAll('.card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag')];
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
    const eyebrow = about.querySelector('.about-haxurus__eyebrow');
    const title = about.querySelector('h2');
    const text = about.querySelector('p');
    const buttons = [...about.querySelectorAll('.about-haxurus__button')];
    about.classList.remove('about-actions-ready');
    [eyebrow, title, text, ...buttons].forEach((el) => { if (el) { rememberText(el); if (!shouldSkip()) el.textContent = ''; } });
    about.classList.add('about-ready', 'seq-visible');
    await wait(260);
    if (eyebrow) await typeText(eyebrow, 18);
    await wait(70);
    if (title) await typeText(title, 20);
    await wait(70);
    if (text) await typeText(text, 8);
    await wait(120);
    about.classList.add('about-actions-ready');
    for (const button of buttons) {
      await typeText(button, 12);
      await wait(90);
    }
    await wait(180);
  }
  async function runSequence() {
    if (sequenceStarted) return;
    sequenceStarted = true;
    const about = document.querySelector('.about-haxurus');
    primeAbout(about);
    await waitForLoader();
    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero h1');
    const heroText = document.querySelector('.hero-text');
    const quickLinks = [...document.querySelectorAll('.quick-links .quick-link')];
    const sections = [...document.querySelectorAll('main .category')];
    document.querySelectorAll('.hero h1, .hero-text, .about-haxurus__eyebrow, .about-haxurus h2, .about-haxurus p, .about-haxurus__button, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag').forEach((el) => rememberText(el));
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

