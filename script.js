(function () {
  // Inject small runtime styles so we don't need to touch HTML/CSS
  const runtimeStyle = document.createElement('style');
  runtimeStyle.textContent = `
    #theme-toggle {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 100;
      width: 46px;
      height: 46px;
      border-radius: 999px;
      border: 1px solid rgba(0, 0, 0, 0.75);
      background: rgba(255, 255, 255, 0.92);
      color: #111;
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
      transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
    #theme-toggle:hover { transform: translateY(-2px); }

    body.theme-dark #theme-toggle {
      background: rgba(15, 15, 15, 0.92);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.75);
    }

    body.theme-dark .link-card,
    body.theme-dark .playlist-card,
    body.theme-dark .quick-link,
    body.theme-dark .modal-panel {
      background: rgba(10, 10, 10, 0.92) !important;
      color: #fff !important;
      border: 1px solid rgba(255, 255, 255, 0.7) !important;
    }

    body.theme-dark .link-card.is-inactive {
      background: rgba(36, 36, 36, 0.94) !important;
      color: rgba(255, 255, 255, 0.92) !important;
    }

    body.theme-dark .card-title,
    body.theme-dark .card-subtitle,
    body.theme-dark .playlist-title,
    body.theme-dark .playlist-subtitle,
    body.theme-dark .card-more,
    body.theme-dark .modal-content,
    body.theme-dark .modal-close,
    body.theme-dark .category h2,
    body.theme-dark .hero-text {
      color: #fff !important;
    }

    body:not(.theme-dark) .link-card,
    body:not(.theme-dark) .playlist-card,
    body:not(.theme-dark) .quick-link {
      border: 1px solid rgba(0, 0, 0, 0.7) !important;
    }

    .seq-hidden {
      opacity: 0 !important;
      transform: translateY(22px) scale(0.988) !important;
    }
    .seq-visible {
      opacity: 1 !important;
      transform: translateY(0) scale(1) !important;
      transition: opacity 0.46s ease, transform 0.46s ease;
    }
    .type-caret::after {
      content: "";
      display: inline-block;
      width: 0.08em;
      height: 1em;
      margin-left: 0.12em;
      background: currentColor;
      vertical-align: -0.12em;
      animation: caretBlink 0.9s steps(1, end) infinite;
    }
    @keyframes caretBlink { 50% { opacity: 0; } }
  `;
  document.head.appendChild(runtimeStyle);

  // Modal
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
    if (!hasOpenModal) document.body.classList.remove('modal-open');
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

  // Theme toggle
  (function setupThemeToggle() {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Cambia tema');

    function applyTheme(theme) {
      const isDark = theme === 'dark';
      document.body.classList.toggle('theme-dark', isDark);
      button.textContent = isDark ? '☀️' : '🌙';
      try { localStorage.setItem('haxurus-theme', theme); } catch (_) {}
    }

    let savedTheme = 'light';
    try { savedTheme = localStorage.getItem('haxurus-theme') || 'light'; } catch (_) {}

    applyTheme(savedTheme);
    button.addEventListener('click', () => {
      applyTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
    });

    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(button);
    }, { once: true });
  })();

  // Background video
  (function setupVideo() {
    const bgVideo = document.querySelector('.background-video');
    if (!bgVideo) return;

    const tryPlay = () => {
      const promise = bgVideo.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    };

    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.loop = true;
    bgVideo.playsInline = true;
    bgVideo.setAttribute('muted', '');
    bgVideo.setAttribute('autoplay', '');
    bgVideo.setAttribute('loop', '');
    bgVideo.setAttribute('playsinline', '');
    bgVideo.setAttribute('webkit-playsinline', '');

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

  // Particles
  (function setupParticles() {
    const canvas = document.getElementById('particle-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const particleCount = 150;

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
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawLinks();
      for (const p of particles) drawParticle(p);
      updateParticles();
      requestAnimationFrame(render);
    }

    window.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
    window.addEventListener('resize', () => { resize(); createParticles(); });

    resize();
    createParticles();
    render();
  })();

  // Sequential animations (hero + headings + cards)
  (function setupSequence() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

    function setHidden(el) {
      if (el) el.classList.add('seq-hidden');
    }

    function setVisible(el) {
      if (!el) return;
      el.classList.remove('seq-hidden');
      el.classList.add('seq-visible');
    }

    function prepareText(el) {
      if (!el) return;
      el.dataset.originalText = (el.textContent || '').trim();
      el.textContent = '';
    }

    async function typeText(el, speed) {
      if (!el) return;
      const fullText = el.dataset.originalText || '';
      if (!fullText) return;
      el.classList.add('type-caret');
      for (let i = 1; i <= fullText.length; i += 1) {
        el.textContent = fullText.slice(0, i);
        await wait(speed);
      }
      el.classList.remove('type-caret');
    }

    async function revealCard(card) {
      const texts = [...card.querySelectorAll('.card-title, .card-subtitle, .playlist-title, .playlist-subtitle')];
      texts.forEach(prepareText);
      setVisible(card);
      await wait(card.matches('.quick-link') ? 90 : 150);
      for (const text of texts) {
        await typeText(text, text.matches('.card-subtitle, .playlist-subtitle') ? 10 : 16);
        await wait(35);
      }
      await wait(80);
    }

    async function runSequence() {
      const hero = document.querySelector('.hero');
      const heroTitle = document.querySelector('.hero h1');
      const heroText = document.querySelector('.hero-text');
      const quickLinks = [...document.querySelectorAll('.quick-links .quick-link')];
      const aboutCard = document.querySelector('.intro-block .link-card, .block .link-card');
      const sections = [...document.querySelectorAll('main .category')];

      // prepare hidden state before reveal
      setHidden(hero);
      quickLinks.forEach(setHidden);
      if (aboutCard) setHidden(aboutCard);
      sections.forEach((section) => {
        setHidden(section.querySelector('h2'));
        section.querySelectorAll('.link-card, .playlist-card').forEach(setHidden);
      });

      if (prefersReducedMotion) {
        setVisible(hero);
        quickLinks.forEach(setVisible);
        if (aboutCard) setVisible(aboutCard);
        sections.forEach((section) => {
          setVisible(section.querySelector('h2'));
          section.querySelectorAll('.link-card, .playlist-card').forEach(setVisible);
        });
        return;
      }

      // Hero first
      prepareText(heroTitle);
      prepareText(heroText);
      setVisible(hero);
      await wait(420);
      await typeText(heroTitle, 28);
      await wait(90);
      await typeText(heroText, 12);
      await wait(130);

      // Quick links just reveal one by one
      for (const link of quickLinks) {
        setVisible(link);
        await wait(85);
      }

      if (aboutCard) {
        await revealCard(aboutCard);
      }

      // Each category: heading, then its cards
      for (const section of sections) {
        const heading = section.querySelector('h2');
        if (heading) {
          prepareText(heading);
          setVisible(heading);
          await wait(130);
          await typeText(heading, 22);
          await wait(110);
        }

        const items = [...section.querySelectorAll('.link-card, .playlist-card')];
        for (const item of items) {
          await revealCard(item);
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runSequence, { once: true });
    } else {
      runSequence();
    }
  })();
})();
