/* early reveal guard */
(() => {
  const css = `
    body:not(.skip-intro) .hero:not(.seq-visible),
    body:not(.skip-intro) .quick-link:not(.seq-visible),
    body:not(.skip-intro) .link-card:not(.seq-visible),
    body:not(.skip-intro) .playlist-card:not(.seq-visible),
    body:not(.skip-intro) .category h2:not(.seq-visible) {
      opacity: 0 !important;
      visibility: hidden !important;
      transform: translateY(22px) scale(0.985) !important;
      animation: none !important;
      pointer-events: none !important;
    }

    body:not(.skip-intro) .hero:not(.seq-visible) *,
    body:not(.skip-intro) .quick-link:not(.seq-visible) *,
    body:not(.skip-intro) .link-card:not(.seq-visible) *,
    body:not(.skip-intro) .playlist-card:not(.seq-visible) *,
    body:not(.skip-intro) .category h2:not(.seq-visible) * {
      visibility: hidden !important;
    }

    body.skip-intro .hero,
    body.skip-intro .quick-link,
    body.skip-intro .link-card,
    body.skip-intro .playlist-card,
    body.skip-intro .category h2,
    body:not(.skip-intro) .hero.seq-visible,
    body:not(.skip-intro) .quick-link.seq-visible,
    body:not(.skip-intro) .link-card.seq-visible,
    body:not(.skip-intro) .playlist-card.seq-visible,
    body:not(.skip-intro) .category h2.seq-visible {
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
      pointer-events: auto !important;
    }

    body.skip-intro .hero *,
    body.skip-intro .quick-link *,
    body.skip-intro .link-card *,
    body.skip-intro .playlist-card *,
    body.skip-intro .category h2 *,
    body:not(.skip-intro) .hero.seq-visible *,
    body:not(.skip-intro) .quick-link.seq-visible *,
    body:not(.skip-intro) .link-card.seq-visible *,
    body:not(.skip-intro) .playlist-card.seq-visible *,
    body:not(.skip-intro) .category h2.seq-visible * {
      visibility: visible !important;
    }

    @media (prefers-reduced-motion: reduce) {
      body:not(.skip-intro) .hero,
      body:not(.skip-intro) .quick-link,
      body:not(.skip-intro) .link-card,
      body:not(.skip-intro) .playlist-card,
      body:not(.skip-intro) .category h2 {
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        pointer-events: auto !important;
      }

      body:not(.skip-intro) .hero *,
      body:not(.skip-intro) .quick-link *,
      body:not(.skip-intro) .link-card *,
      body:not(.skip-intro) .playlist-card *,
      body:not(.skip-intro) .category h2 * {
        visibility: visible !important;
      }
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-reveal-guard', '');
  style.textContent = css;
  document.head.prepend(style);
})();

(() => {
  const MIN_LOADER_TIME = 1100;
  const MAX_WAIT_TIME = 4500;
  const SKIP_EVENT = 'haxurus:skip-intro';
  const loader = document.getElementById('site-loader');

  if (!loader) return;

  const skipButton = loader.querySelector('[data-skip-loader]');
  const start = performance.now();
  let loaderClosed = false;

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function requestSkip() {
    window.__skipIntro = true;
    document.body.classList.add('skip-intro');
    window.dispatchEvent(new CustomEvent(SKIP_EVENT));
  }

  function whenImageReady(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
      if (img.complete) resolve(true);
    });
  }

  function whenVideoReady(video) {
    return new Promise((resolve) => {
      if (!video) {
        resolve(false);
        return;
      }

      const done = () => resolve(true);

      if (video.readyState >= 2) {
        resolve(true);
        return;
      }

      video.addEventListener('loadeddata', done, { once: true });
      video.addEventListener('canplay', done, { once: true });
      video.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  async function hideLoader({ instant = false } = {}) {
    if (loaderClosed) return;
    loaderClosed = true;

    if (!instant) {
      const elapsed = performance.now() - start;
      if (elapsed < MIN_LOADER_TIME) {
        await wait(MIN_LOADER_TIME - elapsed);
      }
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      window.setTimeout(() => {
        loader.remove();
      }, 550);
      return;
    }

    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    loader.remove();
  }

  async function initLoader() {
    if (window.__skipIntro === true) {
      await hideLoader({ instant: true });
      return;
    }

    const bgVideo = document.querySelector('.background-video');

    await Promise.race([
      Promise.all([
        whenImageReady('img/banner.png'),
        whenVideoReady(bgVideo),
      ]),
      wait(MAX_WAIT_TIME),
    ]);

    if (window.__skipIntro === true) {
      await hideLoader({ instant: true });
      return;
    }

    await hideLoader();
  }

  if (skipButton) {
    skipButton.addEventListener('click', () => {
      requestSkip();
      hideLoader({ instant: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader, { once: true });
  } else {
    initLoader();
  }
})();

/* combined effects stylesheet */
(() => {
  const href = 'site-effects.css';
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
})();

/* reactive liquid glass */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchLike = window.matchMedia('(pointer: coarse), (hover: none)');
  const selector = '.link-card, .playlist-card, .quick-link';

  if (reduceMotion.matches || touchLike.matches) return;

  function updateGlass(event) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const tiltY = ((x - 50) / 50) * 5;
    const tiltX = -((y - 50) / 50) * 4;

    target.style.setProperty('--liquid-x', `${x}%`);
    target.style.setProperty('--liquid-y', `${y}%`);
    target.style.setProperty('--liquid-tilt-x', `${tiltX}deg`);
    target.style.setProperty('--liquid-tilt-y', `${tiltY}deg`);
  }

  function resetGlass(event) {
    const target = event.currentTarget;
    target.style.setProperty('--liquid-x', '50%');
    target.style.setProperty('--liquid-y', '50%');
    target.style.setProperty('--liquid-tilt-x', '0deg');
    target.style.setProperty('--liquid-tilt-y', '0deg');
  }

  function bind() {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.dataset.liquidGlassBound === 'true') return;
      element.dataset.liquidGlassBound = 'true';
      element.addEventListener('pointermove', updateGlass);
      element.addEventListener('pointerleave', resetGlass);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();

/* hero glitch title */
(() => {
  const title = document.querySelector('.hero-content > h1');
  if (!title || title.classList.contains('glitch-logo')) return;

  const text = 'Haxurus';
  title.classList.add('glitch-logo');
  title.dataset.text = text;
  title.setAttribute('aria-label', text);
  title.innerHTML = '<span aria-hidden="true">Haxurus</span><i class="scanlines" aria-hidden="true"></i><i class="noise" aria-hidden="true"></i>';
})();