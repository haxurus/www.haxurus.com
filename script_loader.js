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

/* full section snapping */
(() => {
  const css = `
    html {
      scroll-snap-type: y proximity;
      scroll-padding-top: 0;
    }

    body {
      overscroll-behavior-y: contain;
    }

    .hero,
    .animated-sections .category,
    .site-footer {
      scroll-snap-align: start;
      scroll-snap-stop: normal;
    }

    .animated-sections {
      width: 100% !important;
      max-width: none !important;
      padding-inline: 0 !important;
    }

    .animated-sections .category {
      width: min(100%, var(--maxw));
      min-height: 100svh !important;
      margin-inline: auto !important;
      box-sizing: border-box;
      padding: 112px 26px 64px !important;
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }

    .animated-sections .category:not(.is-active) .links-grid,
    .animated-sections .category:not(.is-active) .playlist-grid {
      opacity: 0.18;
      transform: translateY(18px) scale(0.985);
    }

    .animated-sections .category.is-active .links-grid,
    .animated-sections .category.is-active .playlist-grid {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .animated-sections .links-grid,
    .animated-sections .playlist-grid {
      transition: opacity 0.35s ease, transform 0.35s ease !important;
    }

    @media (max-width: 720px) {
      html {
        scroll-snap-type: none;
      }

      .animated-sections .category {
        width: 100%;
        min-height: auto !important;
        padding: 74px 14px !important;
      }

      .animated-sections .category:not(.is-active) .links-grid,
      .animated-sections .category:not(.is-active) .playlist-grid {
        opacity: 1;
        transform: none;
      }
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-full-section-snapping', '');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* automatic section advance */
(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchQuery = window.matchMedia('(max-width: 720px), (pointer: coarse), (hover: none)');
  const SELECTOR = '.hero, .animated-sections .category, .site-footer';
  const EDGE_TOLERANCE = 84;
  const DELTA_THRESHOLD = 90;
  let locked = false;
  let accumulatedDelta = 0;

  function getSections() {
    return [...document.querySelectorAll(SELECTOR)].filter((section) => section.offsetParent !== null);
  }

  function enabled() {
    return !motionQuery.matches && !touchQuery.matches && getSections().length > 1;
  }

  function visibleAmount(section) {
    const rect = section.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);
    return Math.max(0, visibleBottom - visibleTop);
  }

  function currentIndex(sections) {
    let bestIndex = 0;
    let bestVisible = -1;

    sections.forEach((section, index) => {
      const amount = visibleAmount(section);
      if (amount > bestVisible) {
        bestVisible = amount;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function sectionState(section) {
    const rect = section.getBoundingClientRect();

    return {
      atTop: rect.top >= -EDGE_TOLERANCE,
      atBottom: rect.bottom <= window.innerHeight + EDGE_TOLERANCE,
    };
  }

  function scrollToIndex(index) {
    const sections = getSections();
    const target = sections[index];
    if (!target) return;

    locked = true;
    accumulatedDelta = 0;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      locked = false;
    }, 760);
  }

  function handleWheel(event) {
    if (!enabled()) return;
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

    const sections = getSections();
    const index = currentIndex(sections);
    const current = sections[index];
    if (!current) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const { atTop, atBottom } = sectionState(current);
    const canLeaveDown = direction > 0 && atBottom && index < sections.length - 1;
    const canLeaveUp = direction < 0 && atTop && index > 0;

    if (!canLeaveDown && !canLeaveUp) {
      accumulatedDelta = 0;
      return;
    }

    event.preventDefault();

    if (locked) return;

    accumulatedDelta += event.deltaY;

    if (Math.abs(accumulatedDelta) < DELTA_THRESHOLD) return;

    scrollToIndex(index + direction);
  }

  function handleKeydown(event) {
    if (!enabled() || locked) return;

    const sections = getSections();
    const index = currentIndex(sections);
    const current = sections[index];
    if (!current) return;

    const { atTop, atBottom } = sectionState(current);

    if (['ArrowDown', 'PageDown', ' '].includes(event.key) && atBottom) {
      event.preventDefault();
      scrollToIndex(Math.min(sections.length - 1, index + 1));
    }

    if (['ArrowUp', 'PageUp'].includes(event.key) && atTop) {
      event.preventDefault();
      scrollToIndex(Math.max(0, index - 1));
    }
  }

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeydown);
})();