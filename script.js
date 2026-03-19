
/* responsive device detection */
(() => {
  const root = document.body;
  if (!root) return;

  const media = [
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

  media.forEach((query) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', requestApply);
    }
  });

  window.addEventListener('resize', requestApply, { passive: true });
  window.addEventListener('orientationchange', requestApply, { passive: true });

  applyDevice();
})();

const modalTriggers = document.querySelectorAll('[data-modal-open]');
const modalCloseTargets = document.querySelectorAll('[data-modal-close]');
const modals = document.querySelectorAll('.modal');

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');

  const hasOpenModal = [...modals].some((item) => item.classList.contains('is-open'));
  if (!hasOpenModal) {
    document.body.classList.remove('modal-open');
  }
}

modalTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openModal(trigger.dataset.modalOpen));
});

modalCloseTargets.forEach((target) => {
  target.addEventListener('click', () => closeModal(target.closest('.modal')));
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  modals.forEach((modal) => {
    if (modal.classList.contains('is-open')) closeModal(modal);
  });
});

(() => {
  const bgVideo = document.querySelector('.background-video');
  if (!bgVideo) return;

  const tryPlay = () => {
    const promise = bgVideo.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };

  bgVideo.addEventListener('loadeddata', tryPlay);
  bgVideo.addEventListener('canplay', tryPlay);
  bgVideo.addEventListener('ended', () => {
    bgVideo.currentTime = 0;
    tryPlay();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });

  window.addEventListener('focus', tryPlay);
  window.addEventListener('pointerdown', tryPlay, { once: true });
  tryPlay();
})();

(() => {
  const canvas = document.getElementById('particle-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];
  const mouse = { x: -9999, y: -9999, active: false };
  const particleCount = 150;
  let rafId = null;
  let enabled = false;

  function shouldEnableParticles() {
    const device = document.body?.dataset?.device;
    const touchLike = window.matchMedia('(pointer: coarse), (hover: none)').matches || (navigator.maxTouchPoints || 0) > 0;

    if (device) return device === 'desktop' && !touchLike;
    return window.innerWidth > 768 && !touchLike;
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: randomBetween(0, window.innerWidth),
        y: randomBetween(0, window.innerHeight),
        vx: randomBetween(-0.12, 0.12),
        vy: randomBetween(-0.12, 0.12),
        size: randomBetween(1.2, 3.1),
        glow: randomBetween(8, 18),
        hue: [120, 135, 145][Math.floor(Math.random() * 3)],
        phase: randomBetween(0, Math.PI * 2),
        drift: randomBetween(0.0015, 0.0035),
      });
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
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 135) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(120, 255, 170, ${0.12 * (1 - dist / 135)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (mouse.active) {
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);

        if (mdist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(187, 247, 208, ${0.18 * (1 - mdist / 150)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function updateParticles() {
    const time = performance.now();

    for (const p of particles) {
      const floatX = Math.cos(time * p.drift + p.phase) * 0.35;
      const floatY = Math.sin(time * p.drift * 0.8 + p.phase) * 0.35;

      p.vx += floatX * 0.008;
      p.vy += floatY * 0.008;

      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 140 && dist > 0.1) {
          const force = (140 - dist) / 140;
          p.vx -= (dx / dist) * force * 0.03;
          p.vy -= (dy / dist) * force * 0.03;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.996;
      p.vy *= 0.996;

      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;
    }
  }

  function render() {
    if (!enabled) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawLinks();
    for (const p of particles) drawParticle(p);
    updateParticles();
    rafId = window.requestAnimationFrame(render);
  }

  function start() {
    if (enabled) return;
    enabled = true;
    canvas.style.display = 'block';
    resize();
    createParticles();
    render();
  }

  function stop() {
    enabled = false;
    canvas.style.display = 'none';
    mouse.active = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function syncParticles() {
    if (shouldEnableParticles()) {
      start();
    } else {
      stop();
    }
  }

  window.addEventListener('mousemove', (event) => {
    if (!enabled) return;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', () => {
    if (enabled) {
      resize();
      createParticles();
    }
    syncParticles();
  }, { passive: true });

  window.addEventListener('haxurus:devicechange', syncParticles);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && enabled && rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && enabled && !rafId) {
      render();
    }
  });

  syncParticles();
})();

/* theme toggle */
(() => {
  const STORAGE_KEY = 'haxurusTheme';

  function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    const icon = document.querySelector('.theme-toggle__icon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light';
  }

  function createToggle() {
    if (document.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle light and dark mode');
    btn.innerHTML = '<span class="theme-toggle__icon" aria-hidden="true">☾</span>';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createToggle();
      applyTheme(getInitialTheme());
    }, { once: true });
  } else {
    createToggle();
    applyTheme(getInitialTheme());
  }
})();

/* sequential reveal */
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SKIP_EVENT = 'haxurus:skip-intro';
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  let skipRequested = window.__skipIntro === true;
  let sequenceStarted = false;

  function shouldSkip() {
    return skipRequested || window.__skipIntro === true;
  }

  function rememberText(el) {
    if (!el) return;
    if (!el.dataset.originalText) {
      el.dataset.originalText = (el.textContent || '').trim();
    }
  }

  function restoreText(el) {
    if (!el) return;
    rememberText(el);
    el.textContent = el.dataset.originalText || '';
    el.classList.remove('type-caret');
  }

  function revealEverything() {
    const allAnimated = document.querySelectorAll('.hero, .quick-link, .block .link-card, .category h2, .category .link-card, .playlist-card');
    const allText = document.querySelectorAll('.hero h1, .hero-text, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle');

    allText.forEach((el) => restoreText(el));

    allAnimated.forEach((el) => {
      el.classList.add('seq-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  }

  async function typeText(el, speed) {
    const fullText = el.dataset.originalText || '';
    if (!fullText) return;

    if (shouldSkip()) {
      el.textContent = fullText;
      el.classList.remove('type-caret');
      return;
    }

    el.classList.add('type-caret');
    for (let i = 1; i <= fullText.length; i += 1) {
      if (shouldSkip()) {
        el.textContent = fullText;
        break;
      }
      el.textContent = fullText.slice(0, i);
      await wait(speed);
    }
    el.classList.remove('type-caret');
  }

  function prepareTextTargets(container) {
    const textTargets = container.matches('h2, .hero h1, .hero-text')
      ? [container]
      : [...container.querySelectorAll('.card-title, .card-subtitle, .playlist-title, .playlist-subtitle')];

    textTargets.forEach((el) => {
      rememberText(el);
      if (!shouldSkip()) {
        el.textContent = '';
      }
    });

    return textTargets;
  }

  function setupHero(hero, heroTitle, heroText) {
    if (!hero) return;
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(26px) scale(0.985)';
    hero.style.transition = 'opacity 0.65s ease, transform 0.65s ease';

    if (heroTitle) {
      rememberText(heroTitle);
      heroTitle.textContent = '';
    }

    if (heroText) {
      rememberText(heroText);
      heroText.textContent = '';
    }
  }

  async function revealHero(hero, heroTitle, heroText) {
    if (!hero) return;
    hero.classList.add('seq-visible');
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0) scale(1)';

    if (shouldSkip()) {
      revealEverything();
      return;
    }

    await wait(380);

    if (heroTitle) {
      await typeText(heroTitle, 28);
      if (shouldSkip()) {
        revealEverything();
        return;
      }
      await wait(90);
    }

    if (heroText) {
      await typeText(heroText, 12);
      if (shouldSkip()) {
        revealEverything();
        return;
      }
      await wait(120);
    }
  }

  async function revealItem(item, speed = 16) {
    const textTargets = prepareTextTargets(item);
    item.classList.add('seq-visible');

    if (shouldSkip()) {
      textTargets.forEach((el) => restoreText(el));
      item.style.opacity = '1';
      item.style.transform = 'none';
      item.style.transition = 'none';
      return;
    }

    await wait(item.matches('.quick-link') ? 90 : item.matches('h2') ? 130 : 150);

    for (const el of textTargets) {
      const textSpeed = el.matches('.card-subtitle, .playlist-subtitle') ? 10 : speed;
      await typeText(el, textSpeed);
      if (shouldSkip()) {
        revealEverything();
        return;
      }
      await wait(35);
    }

    await wait(item.matches('h2') ? 110 : 75);
  }

  async function runSequence() {
    if (sequenceStarted) return;
    sequenceStarted = true;

    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero h1');
    const heroText = document.querySelector('.hero-text');
    const quickLinks = [...document.querySelectorAll('.quick-links .quick-link')];
    const aboutCard = document.querySelector('.block .link-card');
    const sections = [...document.querySelectorAll('main .category')];

    document.querySelectorAll('.hero h1, .hero-text, .card-title, .card-subtitle, .playlist-title, .playlist-subtitle').forEach((el) => rememberText(el));

    if (prefersReducedMotion || shouldSkip()) {
      revealEverything();
      return;
    }

    setupHero(hero, heroTitle, heroText);
    await revealHero(hero, heroTitle, heroText);

    if (shouldSkip()) {
      revealEverything();
      return;
    }

    for (const link of quickLinks) {
      link.classList.add('seq-visible');
      if (shouldSkip()) {
        revealEverything();
        return;
      }
      await wait(80);
    }

    if (aboutCard) {
      await revealItem(aboutCard);
      if (shouldSkip()) return;
    }

    for (const section of sections) {
      const heading = section.querySelector('h2');
      if (heading) {
        await revealItem(heading, 22);
        if (shouldSkip()) return;
      }

      const items = [...section.querySelectorAll('.link-card, .playlist-card')];
      for (const item of items) {
        await revealItem(item);
        if (shouldSkip()) return;
      }
    }
  }

  window.addEventListener(SKIP_EVENT, () => {
    skipRequested = true;
    revealEverything();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSequence, { once: true });
  } else {
    runSequence();
  }
})();

/* age gate */
(() => {
  const selector = '.age-gated-link';
  if (!document.querySelector(selector)) return;

  let modal = document.getElementById('age-gate-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'age-gate-modal';
    modal.className = 'age-gate-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="age-gate-modal__backdrop"></div>
      <div class="age-gate-modal__panel" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle">
        <button type="button" class="age-gate-modal__close" aria-label="Close">×</button>
        <h3 id="ageGateTitle" class="age-gate-modal__title">Unlock link with your Date of Birth</h3>
        <p class="age-gate-modal__message"></p>
        <div class="age-gate-modal__fields">
          <input class="age-gate-input" data-part="day" inputmode="numeric" placeholder="DD" maxlength="2" />
          <input class="age-gate-input" data-part="month" inputmode="numeric" placeholder="MM" maxlength="2" />
          <input class="age-gate-input age-gate-input--year" data-part="year" inputmode="numeric" placeholder="YYYY" maxlength="4" />
        </div>
        <p class="age-gate-modal__status" aria-live="polite"></p>
        <button type="button" class="age-gate-modal__unlock">Unlock</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const panel = modal.querySelector('.age-gate-modal__panel');
  const closeBtn = modal.querySelector('.age-gate-modal__close');
  const messageEl = modal.querySelector('.age-gate-modal__message');
  const statusEl = modal.querySelector('.age-gate-modal__status');
  const unlockBtn = modal.querySelector('.age-gate-modal__unlock');

  const inputs = {
    day: modal.querySelector('[data-part="day"]'),
    month: modal.querySelector('[data-part="month"]'),
    year: modal.querySelector('[data-part="year"]'),
  };

  let activeLink = null;

  function digitsOnly(value, max) {
    return value.replace(/\D+/g, '').slice(0, max);
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.classList.remove('is-ok');
  }

  function unlockKey(link) {
    return `ageGateUnlocked:${link.dataset.ageKey || link.dataset.ageHref || 'default'}`;
  }

  function isUnlocked(link) {
    try {
      return sessionStorage.getItem(unlockKey(link)) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberUnlock(link) {
    try {
      sessionStorage.setItem(unlockKey(link), '1');
    } catch (e) {}
  }

  function navigateToLink(link) {
    const href = link.dataset.ageHref || link.getAttribute('href');
    const target = link.getAttribute('target');
    if (!href || href === '#') return;
    if (target === '_blank') {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = href;
    }
  }

  function openModal(link) {
    activeLink = link;
    messageEl.textContent = link.dataset.ageMessage || `Please confirm your date of birth to access this ${link.dataset.ageMin || '18'}+ link.`;
    inputs.day.value = '';
    inputs.month.value = '';
    inputs.year.value = '';
    clearStatus();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    inputs.day.focus();
  }

  function closeModal() {
    modal.hidden = true;
    activeLink = null;
    clearStatus();
    document.body.classList.remove('modal-open');
  }

  function parseDate() {
    const day = Number(inputs.day.value);
    const month = Number(inputs.month.value);
    const year = Number(inputs.year.value);

    if (!day || !month || !year) return { error: 'Enter your full date of birth.' };
    if (year < 1900 || year > new Date().getFullYear()) return { error: 'Enter a valid year.' };

    const dob = new Date(year, month - 1, day);
    if (Number.isNaN(dob.getTime()) || dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
      return { error: 'Enter a valid date.' };
    }
    return { dob };
  }

  function getAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
    return age;
  }

  function setStatus(message, ok = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-ok', ok);
  }

  Object.values(inputs).forEach((input) => {
    const max = input.dataset.part === 'year' ? 4 : 2;
    input.addEventListener('input', () => {
      input.value = digitsOnly(input.value, max);
      clearStatus();
      if (input.value.length === max) {
        if (input.dataset.part === 'day') inputs.month.focus();
        if (input.dataset.part === 'month') inputs.year.focus();
      }
    });
  });

  unlockBtn.addEventListener('click', () => {
    if (!activeLink) return;
    const parsed = parseDate();
    if (parsed.error) {
      setStatus(parsed.error);
      return;
    }
    const minAge = Number(activeLink.dataset.ageMin || 18);
    const age = getAge(parsed.dob);
    if (age < minAge) {
      setStatus(`You must be at least ${minAge} years old to open this link.`);
      return;
    }
    rememberUnlock(activeLink);
    setStatus('Age verified. Opening link…', true);
    window.setTimeout(() => {
      const linkToOpen = activeLink;
      closeModal();
      navigateToLink(linkToOpen);
    }, 260);
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('age-gate-modal__backdrop')) {
      closeModal();
    }
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest(selector);
    if (!link) return;

    event.preventDefault();
    if (isUnlocked(link)) {
      navigateToLink(link);
      return;
    }
    openModal(link);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
})();

/* current year in footer */
(() => {
  const yearTarget = document.getElementById('current-year');
  if (!yearTarget) return;
  yearTarget.textContent = String(new Date().getFullYear());
})();
