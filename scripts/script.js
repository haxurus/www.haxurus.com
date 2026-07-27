/* responsive device detection */
(() => {
  const root = document.body;
  if (!root) return;

  function applyDevice() {
    const width = window.innerWidth;
    const touchLike = window.matchMedia('(pointer: coarse), (hover: none)').matches || (navigator.maxTouchPoints || 0) > 0;
    const device = width <= 640 ? 'mobile' : width <= 1024 || (touchLike && width <= 1180) ? 'tablet' : 'desktop';
    root.dataset.device = device;
    root.classList.toggle('is-desktop', device === 'desktop');
    root.classList.toggle('is-touch', device !== 'desktop');
  }

  let frame = 0;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(applyDevice);
  };

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  applyDevice();
})();

/* navigation and contact badges */
(() => {
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
    const patterns = [
      /^mailto:/i,
      /discord\.com\/users\//i,
      /t\.me\//i,
      /instagram\.com\/haxurus/i,
      /vrchat\.com\/home\/user\//i,
      /github\.com\/Haxurus/i,
      /youtube\.com\/@haxurus/i,
      /tiktok\.com\/@haxurus/i
    ];

    document.querySelectorAll('.link-card[href]').forEach((card) => {
      const href = card.getAttribute('href') || '';
      if (patterns.some((pattern) => pattern.test(href))) addBadge(card, 'contact', 'Contact');
    });
  }

  const apply = () => {
    addAboutToNav();
    addContactBadges();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
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

  const play = () => {
    if (document.hidden || !video.paused) return;
    const result = video.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  };

  video.addEventListener('loadeddata', play);
  video.addEventListener('canplay', play);
  video.addEventListener('ended', () => {
    try { video.currentTime = 0; } catch (error) {}
    play();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  window.addEventListener('focus', play);
  window.addEventListener('pointerdown', play, { once: true });
  play();
})();

/* coordinated loader and sequential reveal */
(() => {
  const SKIP_EVENT = 'haxurus:skip-intro';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  let started = false;
  let skipRequested = window.__skipIntro === true;

  function shouldSkip() {
    return skipRequested || window.__skipIntro === true;
  }

  function rememberText(element) {
    if (!element || element.dataset.originalText) return;
    element.dataset.originalText = (element.textContent || '').trim();
  }

  function restoreText(element) {
    if (!element) return;
    rememberText(element);
    element.textContent = element.dataset.originalText || '';
    element.classList.remove('type-caret');
  }

  function showElement(element) {
    if (!element) return;
    element.classList.add('seq-visible');
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.transform = 'none';
  }

  function revealEverything() {
    document.body.classList.remove('is-loading');
    document.querySelectorAll('.hero, .quick-link, .link-card, .playlist-card, .about-haxurus, .category h2').forEach(showElement);
    document.querySelectorAll('.hero-text, .about-haxurus__eyebrow, .about-haxurus h2, .about-haxurus p, .about-haxurus__button, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag').forEach(restoreText);
    const about = document.querySelector('.about-haxurus');
    if (about) about.classList.add('about-ready', 'about-actions-ready');
  }

  function waitForLoader() {
    if (!document.body.classList.contains('is-loading')) return Promise.resolve();

    return new Promise((resolve) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        observer.disconnect();
        resolve();
      };
      const observer = new MutationObserver(() => {
        if (!document.body.classList.contains('is-loading')) finish();
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener(SKIP_EVENT, finish, { once: true });
      window.setTimeout(() => {
        document.body.classList.remove('is-loading');
        const loader = document.getElementById('site-loader');
        if (loader) {
          loader.classList.add('is-hidden');
          window.setTimeout(() => loader.remove(), 550);
        }
        finish();
      }, 10000);
    });
  }

  async function typeText(element, speed) {
    if (!element) return;
    rememberText(element);
    const text = element.dataset.originalText || '';
    if (!text) return;
    if (shouldSkip() || reducedMotion) {
      restoreText(element);
      return;
    }

    element.textContent = '';
    element.classList.add('type-caret');
    for (let index = 1; index <= text.length; index += 1) {
      if (shouldSkip()) break;
      element.textContent = text.slice(0, index);
      await wait(speed);
    }
    element.textContent = text;
    element.classList.remove('type-caret');
  }

  async function revealHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    showElement(hero);

    /* Keep the glitch title markup created by script_loader.js intact. */
    const title = hero.querySelector('h1');
    if (title) {
      title.style.visibility = 'visible';
      title.style.opacity = '1';
    }

    await wait(300);
    await typeText(hero.querySelector('.hero-text'), 12);
  }

  async function revealItem(item) {
    if (!item) return;
    showElement(item);
    const textTargets = item.matches('h2')
      ? [item]
      : [...item.querySelectorAll('.card-title, .card-subtitle, .playlist-title, .playlist-subtitle, .playlist-tag')];

    await wait(item.matches('h2') ? 120 : 90);
    for (const target of textTargets) {
      await typeText(target, target.matches('.card-subtitle, .playlist-subtitle, .playlist-tag') ? 9 : 15);
      if (shouldSkip()) return;
      await wait(35);
    }
  }

  async function revealAbout() {
    const about = document.querySelector('.about-haxurus');
    if (!about) return;
    showElement(about);
    about.classList.add('about-ready');

    const targets = [
      about.querySelector('.about-haxurus__eyebrow'),
      about.querySelector('h2'),
      about.querySelector('p')
    ];

    for (const target of targets) {
      await typeText(target, target && target.matches('p') ? 8 : 18);
      if (shouldSkip()) return;
      await wait(70);
    }

    about.classList.add('about-actions-ready');
    for (const button of about.querySelectorAll('.about-haxurus__button')) {
      await typeText(button, 11);
      await wait(70);
    }
  }

  async function run() {
    if (started) return;
    started = true;

    await waitForLoader();
    if (reducedMotion || shouldSkip()) {
      revealEverything();
      return;
    }

    await revealHero();
    for (const link of document.querySelectorAll('.quick-links .quick-link')) {
      showElement(link);
      await wait(80);
    }

    await revealAbout();

    for (const section of document.querySelectorAll('main .category')) {
      await revealItem(section.querySelector('h2'));
      for (const item of section.querySelectorAll('.link-card, .playlist-card')) {
        await revealItem(item);
        if (shouldSkip()) {
          revealEverything();
          return;
        }
      }
    }
  }

  window.addEventListener(SKIP_EVENT, () => {
    skipRequested = true;
    revealEverything();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();

/* current year in footer */
(() => {
  const yearTarget = document.getElementById('current-year');
  if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());
})();
