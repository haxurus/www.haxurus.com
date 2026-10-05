/* Haxurus motion layer: scroll reveal, hero entrance/parallax, card tilt, cursor spotlight, progress bar. */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  const root = document.documentElement;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hero = document.querySelector('.hero');
  const about = document.querySelector('.about-haxurus');

  root.classList.add('m-ready');

  /* ---- Hero title split into letters ---- */
  const title = document.querySelector('.hero h1');
  if (title && !title.querySelector('.m-letter')) {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'm-letter';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', index);
      span.textContent = char === ' ' ? ' ' : char;
      title.appendChild(span);
    });
  }
  document.querySelectorAll('.hero .quick-link').forEach((el, i) => el.style.setProperty('--qi', i));

  /* ---- Scroll reveal ---- */
  const targets = [
    ...document.querySelectorAll('.category h2, .link-card, .playlist-card, .about-haxurus__card, .site-footer__inner')
  ].filter((el) => !el.closest('.hero'));

  targets.forEach((el) => {
    if (el.classList.contains('about-haxurus__card') || el.classList.contains('support-card')) el.dataset.reveal = '';
    else if (el.matches('h2')) el.dataset.reveal = 'left';
    else el.dataset.reveal = '';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    const entering = entries.filter((entry) => entry.isIntersecting).sort((a, b) => {
      const ra = a.boundingClientRect;
      const rb = b.boundingClientRect;
      return ra.top - rb.top || ra.left - rb.left;
    });
    entering.forEach((entry, index) => {
      const el = entry.target;
      el.style.setProperty('--i', Math.min(index, 9));
      el.classList.add('is-in');
      revealObserver.unobserve(el);
      // After the entrance finishes, drop the reveal rules so normal hover transitions return.
      window.setTimeout(() => {
        el.removeAttribute('data-reveal');
        el.style.removeProperty('--i');
      }, 1500 + Math.min(index, 9) * 70);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  /* ---- Pause continuous animations off-screen ---- */
  const pauseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('m-paused', !entry.isIntersecting));
  }, { threshold: 0 });
  [hero, about].filter(Boolean).forEach((el) => pauseObserver.observe(el));

  /* ---- Progress bar + hero parallax (single rAF-throttled scroll handler) ---- */
  const bar = document.createElement('div');
  bar.id = 'm-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      if (hero) {
        const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
        hero.style.setProperty('--hp', p.toFixed(3));
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---- Cursor spotlight + card tilt (mouse devices only) ---- */
  if (canHover) {
    const spot = document.createElement('div');
    spot.id = 'm-spot';
    spot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spot);

    let mx = 0;
    let my = 0;
    let spotFrame = 0;
    window.addEventListener('pointermove', (event) => {
      mx = event.clientX;
      my = event.clientY;
      if (spotFrame) return;
      spotFrame = window.requestAnimationFrame(() => {
        spotFrame = 0;
        spot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        spot.classList.add('is-on');
      });
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => spot.classList.remove('is-on'));

    let active = null;
    let tiltFrame = 0;
    let last = null;

    const reset = (card) => {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    };

    const applyTilt = () => {
      tiltFrame = 0;
      if (!active || !last) return;
      const rect = active.getBoundingClientRect();
      const x = (last.clientX - rect.left) / rect.width;
      const y = (last.clientY - rect.top) / rect.height;
      const max = active.classList.contains('link-card--banner') || rect.width > 420 ? 3.5 : 8;
      active.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      active.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      active.style.transform =
        `perspective(900px) rotateX(${((.5 - y) * max).toFixed(2)}deg) rotateY(${((x - .5) * max * 1.4).toFixed(2)}deg) translateY(-4px) scale(1.02)`;
    };

    document.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      const card = event.target.closest && event.target.closest('.link-card:not(.support-card), .playlist-card');
      if (card !== active) {
        if (active) reset(active);
        active = card;
        if (active) active.classList.add('is-tilting');
      }
      if (!active) return;
      last = event;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(applyTilt);
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => {
      if (active) reset(active);
      active = null;
    });
  }

  /* ---- Go: wait for the loader to leave, then play the entrance ---- */
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    revealStart();
    root.classList.add('m-go');
  };
  const revealStart = () => targets.forEach((el) => revealObserver.observe(el));

  if (!document.body.classList.contains('is-loading')) {
    window.requestAnimationFrame(go);
  } else {
    const bodyObserver = new MutationObserver(() => {
      if (!document.body.classList.contains('is-loading')) {
        bodyObserver.disconnect();
        window.requestAnimationFrame(go);
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
})();
