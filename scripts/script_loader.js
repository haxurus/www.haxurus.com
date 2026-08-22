(() => {
  'use strict';

  const loader = document.getElementById('site-loader');
  const hero = document.querySelector('.hero');

  if (hero && !document.querySelector('.about-haxurus')) {
    const section = document.createElement('section');
    section.className = 'about-haxurus';
    section.id = 'about';
    section.innerHTML = `
      <div class="about-haxurus__card">
        <div class="about-haxurus__visual" aria-hidden="true"><img alt="" src="img/favicon.png" loading="lazy" decoding="async"></div>
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

  document.querySelectorAll('.about-haxurus img, .animated-sections img, .site-footer img').forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
    image.fetchPriority = 'low';
  });

  document.querySelectorAll('.site-nav img, .hero img').forEach((image) => {
    image.loading = 'eager';
    image.decoding = 'async';
  });

  window.setTimeout(() => {
    document.body.classList.remove('is-loading');
    loader?.remove();
  }, 5000);
})();
