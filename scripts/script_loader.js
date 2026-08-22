/* Homepage loader and intro animations */
(() => {
  'use strict';

  const MIN_LOADER_TIME = 3800;
  const MAX_ASSET_WAIT = 2600;
  const SKIP_EVENT = 'haxurus:skip-intro';
  const reducedMotion = false;
  const loader = document.getElementById('site-loader');
  const skipButton = loader ? loader.querySelector('[data-skip-loader]') : null;
  const startedAt = performance.now();
  const activeAnimations = new WeakSet();
  let skipped = window.__skipIntro === true;
  let loaderClosed = false;
  let revealObserver = null;

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function forceAnimationsEnabled() {
    const style = document.createElement('style');
    style.setAttribute('data-force-homepage-animations', '');
    style.textContent = `
      #site-loader .site-loader__ring{animation:loader-spin 1.05s linear infinite!important}
      #site-loader .site-loader__dot{animation:loader-pulse 1.15s ease-in-out infinite!important}
      #site-loader .site-loader__text{animation:loader-text 1.4s ease-in-out infinite!important}
      .hero .glitch-logo{animation:glitch-main 2.6s infinite!important}
      .hero .glitch-logo::before{animation:glitch-cyan 1.05s infinite linear alternate-reverse!important}
      .hero .glitch-logo::after{animation:glitch-magenta .85s infinite linear alternate-reverse!important}
      .hero .glitch-logo .scanlines{animation:scanline-move .8s linear infinite!important}
      .hero .glitch-logo .noise{animation:glitch-bars 1.4s infinite steps(1)!important}
      .intro-managed{transition:opacity .62s ease,transform .62s cubic-bezier(.2,.8,.2,1),visibility .62s ease!important}
    `;
    document.head.appendChild(style);
  }

  function createAboutSection() {
    const hero = document.querySelector('.hero');
    if (!hero || document.querySelector('.about-haxurus')) return;

    const section = document.createElement('section');
    section.className = 'about-haxurus';
    section.id = 'about';
    section.innerHTML = `
      <div class="about-haxurus__card">
        <div class="about-haxurus__visual" aria-hidden="true"><img alt="" src="img/favicon.png"></div>
        <div class="about-haxurus__content">
          <span class="about-haxurus__eyebrow">Personal hub</span>
          <h2>About me</h2>
          <p>I’m Haxurus — a gaming, tech and online-culture focused identity. This site collects my profiles, communities, playlists, gaming accounts and projects in one place. I enjoy videogames, anime, manga, music, social platforms and digital spaces, with a strong interest in web development, system administration, networking and cybersecurity. Feel free to explore, follow the profiles that interest you, join the communities, listen to a playlist, or reach out if you want to interact with me.</p>
          <div class="about-haxurus__cta" aria-label="Ways to interact with Haxurus">
            <a class="about-haxurus__button" href="mailto:inviati-49-armonia@icloud.com">Contact me</a>
            <a class="about-haxurus__button about-haxurus__button--ghost" href="#social">Explore my profiles</a>
            <a class="about-haxurus__button about-haxurus__button--ghost" href="#discord">Join a community</a>
          </div>
        </div>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  function prepareGlitchTitle() {
    const title = document.querySelector('.hero-content > h1');
    if (!title) return;
    const text = (title.textContent || 'Haxurus').trim() || 'Haxurus';
    title.className = 'glitch-logo';
    title.dataset.text = text;
    title.setAttribute('aria-label', text);
    title.innerHTML = `<span aria-hidden="true">${text}</span><i class="scanlines" aria-hidden="true"></i><i class="noise" aria-hidden="true"></i>`;
  }

  function managedElements() {
    return [
      document.querySelector('.hero'),
      ...document.querySelectorAll('.quick-links .quick-link'),
      document.querySelector('.about-haxurus'),
      ...document.querySelectorAll('main .category > h2'),
      ...document.querySelectorAll('main .link-card, main .playlist-card')
    ].filter(Boolean);
  }

  function prepareIntro() {
    managedElements().forEach((element) => {
      element.classList.add('intro-managed');
    });
  }

  function showElement(element) {
    if (!element) return;
    element.classList.add('seq-visible');
    if (element.matches('.about-haxurus')) element.classList.add('about-ready');
  }

  async function revealManaged(element) {
    if (!element || activeAnimations.has(element) || element.classList.contains('seq-visible')) return;
    activeAnimations.add(element);
    showElement(element);
    if (element.matches('.about-haxurus')) element.classList.add('about-actions-ready');
  }

  function revealAll() {
    skipped = true;
    window.__skipIntro = true;
    document.body.classList.add('skip-intro');
    document.body.classList.remove('is-loading');
    managedElements().forEach((element) => {
      showElement(element);
      if (element.matches('.about-haxurus')) element.classList.add('about-actions-ready');
    });
    if (revealObserver) revealObserver.disconnect();
  }

  function waitForPageAssets() {
    const pageLoaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    return Promise.race([pageLoaded, wait(MAX_ASSET_WAIT)]);
  }

  async function closeLoader({ instant = false } = {}) {
    if (loaderClosed) return;
    loaderClosed = true;

    if (!instant) {
      const remaining = Math.max(0, MIN_LOADER_TIME - (performance.now() - startedAt));
      if (remaining) await wait(remaining);
    }

    document.body.classList.remove('is-loading');
    if (loader) {
      loader.classList.add('is-hidden');
      window.setTimeout(() => loader.remove(), instant ? 0 : 520);
    }
    window.dispatchEvent(new CustomEvent('haxurus:loader-hidden'));
  }

  function startScrollReveals() {
    const targets = managedElements().filter((element) => !element.matches('.hero, .quick-link'));
    if (skipped || !('IntersectionObserver' in window)) {
      targets.forEach((element) => revealManaged(element));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        revealManaged(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((element) => revealObserver.observe(element));
  }

  async function runIntro() {
    try {
      await waitForPageAssets();
      await closeLoader();
      if (skipped) {
        revealAll();
        return;
      }

      await revealManaged(document.querySelector('.hero'));
      for (const link of document.querySelectorAll('.quick-links .quick-link')) {
        showElement(link);
        await wait(75);
      }
      startScrollReveals();
    } catch (error) {
      console.error('Intro animation failed:', error);
      await closeLoader({ instant: true });
      revealAll();
    }
  }

  function skipIntro() {
    if (skipped) return;
    skipped = true;
    window.__skipIntro = true;
    document.body.classList.add('skip-intro');
    window.dispatchEvent(new CustomEvent(SKIP_EVENT));
    closeLoader({ instant: true });
    revealAll();
  }

  function manageBackgroundVideo() {
    const video = document.querySelector('.background-video');
    if (!video) return;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
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
  }

  forceAnimationsEnabled();
  createAboutSection();
  prepareGlitchTitle();
  prepareIntro();
  manageBackgroundVideo();

  if (skipButton) skipButton.addEventListener('click', skipIntro);
  window.addEventListener(SKIP_EVENT, () => {
    skipped = true;
    revealAll();
  });

  window.setTimeout(() => {
    if (!loaderClosed || document.body.classList.contains('is-loading')) {
      closeLoader({ instant: true });
      revealAll();
    }
  }, 12000);

  runIntro();
})();
