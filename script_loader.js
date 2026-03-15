(() => {
  const MIN_LOADER_TIME = 1100;
  const MAX_WAIT_TIME = 4500;
  const loader = document.getElementById('site-loader');

  if (!loader) return;

  const start = performance.now();

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
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

  async function hideLoader() {
    const elapsed = performance.now() - start;
    if (elapsed < MIN_LOADER_TIME) {
      await wait(MIN_LOADER_TIME - elapsed);
    }

    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');

    window.setTimeout(() => {
      loader.remove();
    }, 550);
  }

  async function initLoader() {
    const bgVideo = document.querySelector('.background-video');

    await Promise.race([
      Promise.all([
        whenImageReady('img/banner.png'),
        whenVideoReady(bgVideo),
      ]),
      wait(MAX_WAIT_TIME),
    ]);

    await hideLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader, { once: true });
  } else {
    initLoader();
  }
})();
