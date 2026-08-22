/* Lightweight homepage setup with a 5 second loading screen. */
(() => {
  'use strict';

  const LOADER_TIME = 5000;
  const loader = document.getElementById('site-loader');
  const skipButton = loader?.querySelector('[data-skip-loader]');

  const style = document.createElement('style');
  style.setAttribute('data-performance-overrides', '');
  style.textContent = `
    html{scroll-behavior:auto!important;scroll-snap-type:none!important}
    body.is-loading{overflow:hidden!important}
    body:not(.is-loading){overflow-y:auto!important}

    #site-loader .site-loader__skip{display:none!important}

    body.is-loading .site-nav,
    body.is-loading .page,
    body.is-loading .site-footer,
    body.is-loading .background-video,
    body.is-loading #particle-bg{
      visibility:hidden!important;
    }

    .page *,
    .page *::before,
    .page *::after,
    .site-nav *,
    .site-nav *::before,
    .site-nav *::after,
    .site-footer *,
    .site-footer *::before,
    .site-footer *::after{
      animation:none!important;
      transition:none!important;
    }

    .intro-managed,
    .intro-managed:not(.seq-visible),
    .animated-sections,
    .animated-sections .category,
    .animated-sections .category.is-active,
    .animated-sections .links-grid,
    .animated-sections .playlist-grid,
    .animated-sections .link-card,
    .animated-sections .playlist-card,
    .support-visual,
    .support-card .support-visual,
    .about-haxurus,
    .about-haxurus__visual,
    .about-haxurus__cta{
      opacity:1!important;
      visibility:visible!important;
      transform:none!important;
      filter:none!important;
      pointer-events:auto!important;
    }

    .animated-sections .category{
      display:flex!important;
    }
  `;
  document.head.appendChild(style);

  function createAboutSection() {
    const hero = document.querySelector('.hero');
    if (!hero || document.querySelector('.about-haxurus')) return;

    const section = document.createElement('section');
    section.className = 'about-haxurus about-ready about-actions-ready';
    section.id = 'about';
    section.innerHTML = `
      <div class="about-haxurus__card">
        <div class="about-haxurus__visual" aria-hidden="true"><img alt="" src="img/favicon.png"></div>
        <div class="about-haxurus__content">
          <span class="about-haxurus__eyebrow">Personal hub</span>
          <h2>About me</h2>
          <p>I’m Haxurus - a gaming, tech and online-culture focused identity. This site collects my profiles, communities, playlists, gaming accounts and projects in one place. I enjoy videogames, anime, manga, music, social platforms and digital spaces, with a strong interest in web development, system administration, networking and cybersecurity. Feel free to explore, follow the profiles that interest you, join the communities, listen to a playlist, or reach out if you want to interact with me.</p>
          <div class="about-haxurus__cta" aria-label="Ways to interact with Haxurus">
            <a class="about-haxurus__button" href="mailto:inviati-49-armonia@icloud.com">Contact me</a>
            <a class="about-haxurus__button about-haxurus__button--ghost" href="#social">Explore my profiles</a>
            <a class="about-haxurus__button about-haxurus__button--ghost" href="#discord">Join a community</a>
          </div>
        </div>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  function revealSite() {
    document.body.classList.remove('is-loading');
    document.body.classList.add('skip-intro');

    document.querySelectorAll('.animated-sections .category').forEach((section) => {
      section.classList.add('is-active', 'seq-visible');
    });

    document.querySelectorAll('.link-card, .playlist-card, .quick-link').forEach((element) => {
      element.classList.add('seq-visible');
    });

    loader?.remove();
  }

  skipButton?.remove();
  createAboutSection();

  window.setTimeout(revealSite, LOADER_TIME);
})();
