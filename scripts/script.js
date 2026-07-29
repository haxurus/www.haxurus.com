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
    if (supportNote) {
      const text = 'You can join for FREE to see extra content.';
      supportNote.dataset.originalText = text;
      supportNote.textContent = text;
    }
  }

  function activateSections() {
    const sections = [...document.querySelectorAll('.animated-sections .category')];
    if (!sections.length) return;
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-active'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { threshold: 0.22, rootMargin: '-10% 0px -18% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  function enableSectionWheelNavigation() {
    if (!window.matchMedia('(min-width: 721px) and (pointer: fine)').matches) return;

    const sections = [
      document.querySelector('.hero'),
      document.querySelector('.about-haxurus'),
      ...document.querySelectorAll('.animated-sections .category'),
      document.querySelector('.site-footer')
    ].filter(Boolean);

    if (sections.length < 2) return;

    // Native mandatory snapping moves away from tall sections before their
    // content has been fully read. Desktop wheel navigation is managed here.
    document.documentElement.style.scrollSnapType = 'none';

    let locked = false;
    let unlockTimer = 0;
    const edgeTolerance = 3;

    function canScrollableAncestorHandleWheel(target, direction) {
      let element = target instanceof Element ? target : null;
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        const scrollable = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
        if (scrollable) {
          const canScrollDown = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
          const canScrollUp = element.scrollTop > 1;
          if ((direction > 0 && canScrollDown) || (direction < 0 && canScrollUp)) return true;
        }
        element = element.parentElement;
      }
      return false;
    }

    function currentSectionIndex() {
      const pageY = window.scrollY + edgeTolerance;
      let currentIndex = 0;

      sections.forEach((section, index) => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= pageY) currentIndex = index;
      });

      return currentIndex;
    }

    function sectionHasMoreContent(section, direction) {
      const rect = section.getBoundingClientRect();
      if (direction > 0) return rect.bottom > window.innerHeight + edgeTolerance;
      return rect.top < -edgeTolerance;
    }

    window.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.metaKey || document.body.classList.contains('modal-open')) return;
      if (Math.abs(event.deltaY) < 12 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      if (canScrollableAncestorHandleWheel(event.target, direction)) return;

      if (locked) {
        event.preventDefault();
        return;
      }

      const currentIndex = currentSectionIndex();
      const currentSection = sections[currentIndex];

      // Keep normal page scrolling while the current section still extends
      // beyond the viewport in the requested direction.
      if (sectionHasMoreContent(currentSection, direction)) return;

      const nextIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
      if (nextIndex === currentIndex) return;

      event.preventDefault();
      locked = true;
      sections[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => { locked = false; }, 850);
    }, { passive: false });
  }

  function enableModals() {
    const modals = [...document.querySelectorAll('.modal')];
    let activeModal = null;
    let previousFocus = null;

    function openModal(id, trigger) {
      const modal = document.getElementById(id);
      if (!modal) return;
      previousFocus = trigger || document.activeElement;
      activeModal = modal;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const focusTarget = modal.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])');
      if (focusTarget) window.requestAnimationFrame(() => focusTarget.focus());
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      activeModal = null;
      document.body.classList.remove('modal-open');
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    }

    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => openModal(trigger.dataset.modalOpen, trigger));
    });
    document.querySelectorAll('[data-modal-close]').forEach((trigger) => {
      trigger.addEventListener('click', () => closeModal(trigger.closest('.modal')));
    });
    modals.forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target.matches('.modal, .modal-backdrop')) closeModal(modal);
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && activeModal) closeModal(activeModal);
    });
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
  activateSections();
  enableSectionWheelNavigation();
  enableModals();
  setCurrentYear();
})();
