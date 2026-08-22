/* General homepage behaviour */
(() => {
  'use strict';

  function applyDeviceClass() {
    const body = document.body;
    if (!body) return;
    const width = window.innerWidth;
    const touchLike = window.matchMedia('(pointer: coarse), (hover: none)').matches || (navigator.maxTouchPoints || 0) > 0;
    const device = width <= 640 ? 'mobile' : width <= 1024 || (touchLike && width <= 1180) ? 'tablet' : 'desktop';
    body.dataset.device = device;
    body.classList.toggle('is-desktop', device === 'desktop');
    body.classList.toggle('is-touch', device !== 'desktop');
  }

  function addAboutNavigation() {
    const links = document.querySelector('.site-nav__links');
    if (!links || links.querySelector('a[href="#about"]')) return;
    const link = document.createElement('a');
    link.href = '#about';
    link.textContent = 'About';
    links.prepend(link);
  }

  function getCardBody(card) {
    return card.querySelector('.card-body, .link-card-banner-body, .playlist-info') || card;
  }

  function addBadge(card, type, label) {
    if (!card || card.dataset.noBadges === 'true') return;
    const body = getCardBody(card);
    let badges = body.querySelector('.card-badges');
    if (!badges) {
      badges = document.createElement('div');
      badges.className = 'card-badges';
      body.appendChild(badges);
    }
    if (badges.querySelector(`[data-badge-type="${type}"]`)) return;
    const badge = document.createElement('span');
    badge.className = `card-badge card-badge--${type}`;
    badge.dataset.badgeType = type;
    badge.textContent = label;
    badges.appendChild(badge);
    card.classList.add('has-card-badges');
  }

  function applyCardBadges() {
    const cards = [...document.querySelectorAll('.link-card, .playlist-card')];
    const contactPatterns = [
      /^mailto:/i,
      /discord\.com\/users\//i,
      /t\.me\//i,
      /instagram\.com\/haxurus/i,
      /vrchat\.com\/home\/user\//i,
      /github\.com\/Haxurus/i,
      /youtube\.com\/@haxurus/i,
      /tiktok\.com\/@haxurus/i
    ];

    cards.forEach((card) => {
      if (card.dataset.noBadges === 'true') {
        card.querySelector('.card-badges')?.remove();
        card.classList.remove('has-card-badges');
        return;
      }

      const href = card.getAttribute('href') || '';
      const text = card.textContent || '';
      const aria = card.getAttribute('aria-label') || '';

      if (contactPatterns.some((pattern) => pattern.test(href))) addBadge(card, 'contact', 'Contact');
      if (card.classList.contains('is-inactive') || /💤|inactive/i.test(text) || /💤|inactive/i.test(aria)) {
        const title = card.querySelector('.card-title, .playlist-title');
        if (title) title.textContent = (title.textContent || '').replace(/\s*💤\s*/g, ' ').trim();
        card.querySelectorAll('.card-subtitle, .playlist-subtitle').forEach((subtitle) => {
          if (/inactive/i.test(subtitle.textContent || '')) subtitle.remove();
        });
        addBadge(card, 'inactive', 'Inactive');
      }
      if (/Telegram\s*\(Chat Bot\)/i.test(text)) addBadge(card, 'bot', 'Bot');
    });

    document.querySelectorAll('#discord .link-card, #vrchat a[href*="vrc.group"]').forEach((card) => {
      if (card.dataset.noBadges !== 'true') addBadge(card, 'community', 'Community');
    });

    const supportNote = document.querySelector('.support-note');
    if (supportNote) supportNote.textContent = 'You can join for FREE to see extra content.';
  }

  function setCurrentYear() {
    const target = document.getElementById('current-year');
    if (target) target.textContent = String(new Date().getFullYear());
  }

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(applyDeviceClass);
  }, { passive: true });
  window.addEventListener('orientationchange', applyDeviceClass, { passive: true });

  applyDeviceClass();
  addAboutNavigation();
  applyCardBadges();
  setCurrentYear();
})();
