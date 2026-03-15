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
