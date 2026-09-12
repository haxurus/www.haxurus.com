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

  function addAdminLoginLink() {
    if (document.querySelector('.admin-login-link')) return;

    const link = document.createElement('a');
    link.className = 'admin-login-link';
    link.href = '/wp-admin/';
    link.setAttribute('aria-label', 'WordPress admin login');
    link.title = 'WordPress admin login';
    link.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.5 14a5.5 5.5 0 1 1 4.87-2.94L22 20.69V22h-1.31l-1-1H18v-1.69l-1-1H15.31l-1.44-1.44A5.47 5.47 0 0 1 7.5 14Zm0-3A2.5 2.5 0 1 0 5 8.5 2.5 2.5 0 0 0 7.5 11Z"/>
      </svg>`;

    Object.assign(link.style, {
      position: 'fixed',
      top: '14px',
      right: '14px',
      zIndex: '1400',
      width: '60px',
      height: '60px',
      display: 'grid',
      placeItems: 'center',
      border: '1px solid rgba(255,255,255,.28)',
      borderRadius: '50%',
      background: 'rgba(7,16,12,.72)',
      boxShadow: '0 10px 24px rgba(0,0,0,.22)',
      color: '#dfffe7',
      textDecoration: 'none'
    });

    const svg = link.querySelector('svg');
    if (svg) {
      Object.assign(svg.style, {
        width: '24px',
        height: '24px',
        fill: 'currentColor',
        pointerEvents: 'none'
      });
    }

    document.body.appendChild(link);
  }

  function updateCelestiaInvite() {
    const invite = 'https://discord.gg/8d4ZRhRN6y';
    document.querySelectorAll('a[href="https://discord.gg/celestiaita"]').forEach((link) => {
      link.href = invite;
    });
  }

  function addRdr2Game() {
    const grid = document.querySelector('#games .links-grid');
    if (!grid || grid.querySelector('[data-game="rdr2"]')) return;

    const card = document.createElement('a');
    card.className = 'link-card';
    card.dataset.game = 'rdr2';
    card.href = 'https://www.rockstargames.com/reddeadredemption2';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.innerHTML = `
      <div class="card-icon thumb small-thumb">
        <span aria-hidden="true" style="display:grid;place-items:center;width:100%;height:100%;border-radius:inherit;background:rgba(120,0,0,.72);color:#fff;font-size:.68rem;font-weight:900;letter-spacing:-.04em;line-height:1">RDR2</span>
      </div>
      <div class="card-body centered"><span class="card-title">RDR2</span></div>
      <div class="card-more">⋮</div>`;

    const rainbowSix = [...grid.querySelectorAll('.link-card')].find((item) =>
      /r6\.tracker\.network\/r6siege/i.test(item.getAttribute('href') || '')
    );

    grid.insertBefore(card, rainbowSix || null);
  }

  function configureVrchatCards() {
    const section = document.querySelector('#vrchat');
    if (!section) return;

    const grid = section.querySelector('.links-grid');
    if (!grid) return;

    const smallCards = [...section.querySelectorAll('.link-card:not(.link-card--banner)')];
    const worldCards = [...section.querySelectorAll('.link-card--banner')];
    const isDesktop = document.body.dataset.device === 'desktop';

    grid.style.alignItems = 'start';

    if (isDesktop) {
      grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      grid.style.gridAutoFlow = 'row';

      smallCards.forEach((card, index) => {
        card.style.alignSelf = 'start';
        card.style.height = '86px';
        card.style.minHeight = '86px';
        card.style.maxHeight = '86px';
        card.style.gridRow = '1';
        card.style.gridColumn = String(index + 1);
      });

      worldCards.forEach((card, index) => {
        card.style.alignSelf = 'start';
        card.style.gridRow = '2';
        card.style.gridColumn = String(index + 1);
      });
    } else {
      grid.style.gridTemplateColumns = '';
      grid.style.gridAutoFlow = '';

      smallCards.forEach((card) => {
        card.style.alignSelf = '';
        card.style.height = '';
        card.style.minHeight = '';
        card.style.maxHeight = '';
        card.style.gridRow = '';
        card.style.gridColumn = '';
      });

      worldCards.forEach((card) => {
        card.style.alignSelf = '';
        card.style.gridRow = '';
        card.style.gridColumn = '';
      });
    }

    const helixHorizon = worldCards.find((card) => /Helix Horizon/i.test(card.textContent || ''));
    const celestiaRemastered = worldCards.find((card) => /Celestia Remastered/i.test(card.textContent || ''));

    if (helixHorizon) {
      helixHorizon.href = '#';
      helixHorizon.removeAttribute('target');
      helixHorizon.removeAttribute('rel');
    }

    if (celestiaRemastered) {
      celestiaRemastered.href = 'https://vrchat.com/home/world/wrld_bf374d5b-f1ca-4a8e-a42b-3d373b86be06/';
      celestiaRemastered.target = '_blank';
      celestiaRemastered.rel = 'noopener noreferrer';
      const cover = celestiaRemastered.querySelector('.link-card-banner-media img');
      if (cover) cover.src = 'img/celestia/hero.webp';
    }
  }

  function enableDesktopWheelNavigation() {
    let locked = false;
    let accumulatedDelta = 0;
    let resetTimer = 0;

    const getSections = () => [
      document.querySelector('.hero'),
      document.querySelector('.about-haxurus'),
      ...document.querySelectorAll('.animated-sections .category'),
      document.querySelector('.site-footer')
    ].filter(Boolean);

    const nearestSectionIndex = (sections) => {
      const viewportCenter = window.scrollY + (window.innerHeight / 2);
      let bestIndex = 0;
      let bestDistance = Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = window.scrollY + rect.top + (rect.height / 2);
        const distance = Math.abs(center - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    };

    window.addEventListener('wheel', (event) => {
      if (document.body.dataset.device !== 'desktop' || event.ctrlKey || event.deltaY === 0) return;
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;

      const sections = getSections();
      if (sections.length < 2) return;

      event.preventDefault();
      if (locked) return;

      accumulatedDelta += event.deltaY;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulatedDelta = 0;
      }, 140);

      if (Math.abs(accumulatedDelta) < 36) return;

      const direction = accumulatedDelta > 0 ? 1 : -1;
      const currentIndex = nearestSectionIndex(sections);
      const targetIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
      accumulatedDelta = 0;

      if (targetIndex === currentIndex) return;

      locked = true;
      window.scrollTo({
        top: Math.max(0, Math.round(window.scrollY + sections[targetIndex].getBoundingClientRect().top)),
        behavior: 'smooth'
      });

      window.setTimeout(() => {
        locked = false;
      }, 650);
    }, { passive: false });
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
    const forcedInactivePatterns = [
      /x\.com\/haxurus/i,
      /r6\.tracker\.network\/r6siege/i
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

      if (forcedInactivePatterns.some((pattern) => pattern.test(href))) {
        card.classList.add('is-inactive');
      }

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
      const href = card.getAttribute('href') || '';
      if (/discord\.com\/users\//i.test(href)) return;
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
    resizeFrame = window.requestAnimationFrame(() => {
      applyDeviceClass();
      configureVrchatCards();
    });
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    applyDeviceClass();
    configureVrchatCards();
  }, { passive: true });

  applyDeviceClass();
  addAboutNavigation();
  addAdminLoginLink();
  updateCelestiaInvite();
  addRdr2Game();
  configureVrchatCards();
  applyCardBadges();
  setCurrentYear();
  enableDesktopWheelNavigation();
})();
