/* Lightweight homepage setup: no intro, reveal or continuous animations. */
(() => {
  'use strict';

  const style = document.createElement('style');
  style.setAttribute('data-performance-overrides', '');
  style.textContent = `
    html{scroll-behavior:auto!important;scroll-snap-type:none!important}
    *,*::before,*::after{animation:none!important;transition:none!important}
    #site-loader{display:none!important}
    body.is-loading{overflow:auto!important}
    .intro-managed,.intro-managed:not(.seq-visible),
    .animated-sections .category,
    .animated-sections .category.is-active,
    .animated-sections .links-grid,
    .animated-sections .playlist-grid,
    .support-visual,
    .support-card .support-visual,
    .about-haxurus__visual{
      opacity:1!important;
      visibility:visible!important;
      transform:none!important;
      filter:none!important;
      pointer-events:auto!important;
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

  document.body.classList.remove('is-loading');
  document.body.classList.add('skip-intro');
  document.getElementById('site-loader')?.remove();
  createAboutSection();
})();
