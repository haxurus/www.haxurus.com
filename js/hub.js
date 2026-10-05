/* Haxurus hub: boot, reveal, hero parallax, spotlight, tilt, rail, counters, command palette. */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Boot / ready ---------- */
  const ready = () => {
    root.classList.remove('booting');
    root.classList.add('ready');
  };

  const boot = () => {
    const el = $('#boot');
    if (!el || !root.classList.contains('booting') || reduced) {
      if (el) el.remove();
      ready();
      return;
    }
    const bar = $('.boot__bar i', el);
    const num = $('.boot__num', el);
    const start = performance.now();
    let loaded = d.readyState === 'complete';
    let p = 0;
    addEventListener('load', () => { loaded = true; }, { once: true });
    const timer = setInterval(() => {
      const t = performance.now() - start;
      const target = loaded && t > 1000 ? 1 : Math.min(.9, t / 2600);
      p += (target - p) * .16;
      if (target === 1 && p > .985) p = 1;
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      num.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p >= 1) {
        clearInterval(timer);
        try { sessionStorage.setItem('hx-booted', '1'); } catch (e) { /* ignore */ }
        setTimeout(() => {
          el.classList.add('is-done');
          ready();
          setTimeout(() => el.remove(), 1100);
        }, 180);
      }
    }, 32);
  };

  /* ---------- Reveal on scroll ---------- */
  const initReveal = () => {
    $$('[data-stagger] > .tile').forEach((t, i) => { t.dataset.r = ''; t.style.setProperty('--d', i % 8); });
    const els = $$('[data-r]');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      vis.forEach((e, i) => {
        const el = e.target;
        if (!el.classList.contains('tile')) el.style.setProperty('--d', Math.min(i, 6));
        el.classList.add('in');
        io.unobserve(el);
        // Drop the reveal rules afterwards so the element's own hover transitions come back.
        setTimeout(() => { el.removeAttribute('data-r'); el.style.removeProperty('--d'); }, 1800 + Math.min(i, 8) * 70);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- Hero ---------- */
  const initHero = () => {
    const stage = $('.stage');
    const hero = $('.hero');
    if (stage && hero && fine && !reduced) {
      let px = 0, py = 0, frame = 0;
      const apply = () => {
        frame = 0;
        stage.style.setProperty('--px', px.toFixed(3));
        stage.style.setProperty('--py', py.toFixed(3));
      };
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        px = clamp(((e.clientX - r.left) / r.width - .5) * 2, -1, 1);
        py = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1, 1);
        if (!frame) frame = requestAnimationFrame(apply);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { px = 0; py = 0; if (!frame) frame = requestAnimationFrame(apply); });
    }

    const roles = $$('.roles span');
    if (roles.length > 1 && !reduced) {
      let i = 0;
      setInterval(() => {
        if (d.hidden || (hero && hero.classList.contains('is-paused'))) return;
        const cur = roles[i];
        i = (i + 1) % roles.length;
        const next = roles[i];
        cur.classList.remove('on');
        cur.classList.add('out');
        next.classList.add('on');
        setTimeout(() => {
          cur.style.transition = 'none';
          cur.classList.remove('out');
          void cur.offsetWidth;
          cur.style.transition = '';
        }, 700);
      }, 2600);
    }
  };

  /* ---------- Nav, progress, scroll state ---------- */
  const initNav = () => {
    const nav = $('.nav');
    const bar = $('#progress');
    const burger = $('.burger');
    const links = $$('.nav__links a');
    let lastY = scrollY, ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = scrollY;
        const max = root.scrollHeight - innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0})`;
        if (nav && !root.classList.contains('menu-open')) {
          if (y > 260 && y > lastY + 8) nav.classList.add('is-hidden');
          else if (y < lastY - 8 || y < 120) nav.classList.remove('is-hidden');
        }
        lastY = y;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window && links.length) {
      const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.toggle('is-active', a === map.get(e.target.id)));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, id) => { const s = d.getElementById(id); if (s) spy.observe(s); });
      const topObs = $('.hero, .shero');
      if (topObs) new IntersectionObserver((es) => { if (es[0].isIntersecting) links.forEach((a) => a.classList.remove('is-active')); }, { threshold: .6 }).observe(topObs);
    }

    const setMenu = (open) => {
      root.classList.toggle('menu-open', open);
      if (burger) { burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
      const m = $('.mmenu');
      if (m) m.setAttribute('aria-hidden', String(!open));
      if (nav) nav.classList.remove('is-hidden');
    };
    if (burger) burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
    $$('.mmenu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  };

  /* ---------- Spotlight, tile glow, tilt, magnets ---------- */
  const initPointer = () => {
    if (!fine || reduced) return;
    const spot = $('#spot');
    let sx = 0, sy = 0, sFrame = 0;
    addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      sx = e.clientX; sy = e.clientY;
      if (sFrame || !spot) return;
      sFrame = requestAnimationFrame(() => {
        sFrame = 0;
        spot.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
        spot.classList.add('on');
      });
    }, { passive: true });
    root.addEventListener('mouseleave', () => spot && spot.classList.remove('on'));

    let target = null, last = null, tFrame = 0, tilting = null;
    const rail = $('[data-rail]');

    const reset = (el) => { el.classList.remove('is-tilting'); el.style.transform = ''; };
    const paint = () => {
      tFrame = 0;
      if (!target || !last) return;
      const r = target.getBoundingClientRect();
      const x = last.clientX - r.left;
      const y = last.clientY - r.top;
      target.style.setProperty('--mx', `${x.toFixed(0)}px`);
      target.style.setProperty('--my', `${y.toFixed(0)}px`);
      if (tilting === target) {
        const nx = x / r.width, ny = y / r.height;
        const m = r.height > 360 ? 4.5 : 8;
        target.style.transform = `perspective(900px) rotateX(${((.5 - ny) * m).toFixed(2)}deg) rotateY(${((nx - .5) * m * 1.4).toFixed(2)}deg) translateY(-4px) scale(1.02)`;
      }
    };

    d.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const el = e.target.closest && e.target.closest('.tile, .world, .pl, .tier');
      if (el !== target) {
        if (tilting) reset(tilting);
        tilting = null;
        target = el;
        if (target && target.matches('.pl, .tier') && !(rail && rail.classList.contains('is-drag'))) {
          tilting = target;
          target.classList.add('is-tilting');
        }
      }
      if (!target) return;
      last = e;
      if (!tFrame) tFrame = requestAnimationFrame(paint);
    }, { passive: true });
    root.addEventListener('mouseleave', () => { if (tilting) reset(tilting); tilting = null; target = null; });

    $$('[data-magnet]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px`;
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  };

  /* ---------- Counters ---------- */
  const initCounters = () => {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;
    const finalOf = (n) => {
      const k = n.dataset.count;
      if (k === 'years') return new Date().getFullYear() - Number(n.dataset.since || 2016);
      if (k === 'links') return $$('.tile, .world').length || Number(n.dataset.fallback);
      if (k === 'playlists') return $$('.pl').length || Number(n.dataset.fallback);
      return Number(n.textContent) || 0;
    };
    nodes.forEach((n) => { n.textContent = String(finalOf(n)); });
    if (reduced || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const n = e.target, end = finalOf(n), t0 = performance.now(), dur = 1500;
        n.textContent = '0';
        const step = (t) => {
          const k = clamp((t - t0) / dur, 0, 1);
          n.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 4))));
          if (k < 1) requestAnimationFrame(step); else n.textContent = String(end);
        };
        requestAnimationFrame(step);
        setTimeout(() => { n.textContent = String(end); }, dur + 400);
      });
    }, { threshold: .6 });
    nodes.forEach((n) => io.observe(n));
  };

  /* ---------- Playlist rail ---------- */
  const initRail = () => {
    const rail = $('[data-rail]');
    if (!rail) return;
    const fill = $('.rail-bar i');
    const prev = $('[data-rail-prev]');
    const next = $('[data-rail-next]');
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const p = max > 0 ? rail.scrollLeft / max : 1;
      if (fill) fill.style.transform = `scaleX(${(.08 + .92 * clamp(p, 0, 1)).toFixed(3)})`;
    };
    rail.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
    const by = (dir) => rail.scrollBy({ left: dir * Math.min(rail.clientWidth * .8, 640), behavior: 'smooth' });
    if (prev) prev.addEventListener('click', () => by(-1));
    if (next) next.addEventListener('click', () => by(1));

    let down = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) { rail.classList.add('is-drag'); rail.scrollLeft = startLeft - dx; }
    }, { passive: true });
    const end = () => {
      if (!down) return;
      down = false;
      setTimeout(() => rail.classList.remove('is-drag'), 60);
    };
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);
  };

  /* ---------- Misc ---------- */
  const initMisc = () => {
    const year = $('#current-year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Broken icons fall back to a lettermark instead of a broken-image glyph.
    const fallback = (img) => {
      const title = (img.closest('.tile') && $('.tile__title', img.closest('.tile'))) || null;
      const g = d.createElement('span');
      g.className = 'glyph';
      g.textContent = ((title && title.textContent) || '?').trim().slice(0, 2).toUpperCase();
      g.style.cssText = 'width:100%;height:100%;display:grid;place-items:center;background:rgba(255,255,255,.08)';
      img.replaceWith(g);
    };
    d.addEventListener('error', (e) => { if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-icon')) fallback(e.target); }, true);
    $$('img[data-icon]').forEach((img) => { if (img.complete && img.naturalWidth === 0 && img.currentSrc) fallback(img); });

    // Pause continuous animations while their section is off-screen.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)));
      $$('.hero, .marquee, .sup, .shero, .tier--hot').forEach((el) => io.observe(el));
    }
  };

  /* ---------- Command palette ---------- */
  const initPalette = () => {
    const pal = $('.pal');
    if (!pal) return;
    const input = $('input', pal);
    const list = $('.pal__list', pal);
    let items = [];
    let shown = [];
    let sel = 0;
    let opener = null;

    const collect = () => {
      items = [];
      $$('.nav__links a').forEach((a) => items.push({ t: a.textContent.trim(), s: 'Jump to', h: a.getAttribute('href'), g: '→' }));
      $$('a[data-s]').forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const t = ($('.tile__title, .world__title, .pl__title', a) || a).textContent.trim();
        const img = $('img', a);
        items.push({ t, s: a.dataset.s, h: href, i: img && img.getAttribute('src') && !a.classList.contains('world') ? img.getAttribute('src') : null, g: t.slice(0, 2).toUpperCase() });
      });
      const extra = $('#pal-extra');
      if (extra) { try { JSON.parse(extra.textContent).forEach((x) => items.push({ t: x.t, s: x.s, h: x.h, g: x.t.slice(0, 2).toUpperCase() })); } catch (e) { /* ignore */ } }
    };

    const render = () => {
      const q = input.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      shown = items.filter((it) => words.every((w) => (it.t + ' ' + it.s).toLowerCase().includes(w)));
      if (q) shown.sort((a, b) => (b.t.toLowerCase().startsWith(q) ? 1 : 0) - (a.t.toLowerCase().startsWith(q) ? 1 : 0));
      sel = 0;
      list.textContent = '';
      if (!shown.length) {
        const e = d.createElement('div');
        e.className = 'pal__empty';
        e.textContent = 'No results. Try another word.';
        list.appendChild(e);
        return;
      }
      let group = '';
      shown.forEach((it, idx) => {
        if (!q && it.s !== group) {
          group = it.s;
          const g = d.createElement('div');
          g.className = 'pal__grp';
          g.textContent = group;
          list.appendChild(g);
        }
        const row = d.createElement('div');
        row.className = 'pal__item' + (idx === 0 ? ' is-sel' : '');
        row.setAttribute('role', 'option');
        row.dataset.i = idx;
        if (it.i) { const im = d.createElement('img'); im.alt = ''; im.src = it.i; im.loading = 'lazy'; im.onerror = () => { im.replaceWith(Object.assign(d.createElement('span'), { className: 'glyph', textContent: it.g })); }; row.appendChild(im); }
        else row.appendChild(Object.assign(d.createElement('span'), { className: 'glyph', textContent: it.g }));
        row.appendChild(Object.assign(d.createElement('span'), { textContent: it.t }));
        row.appendChild(Object.assign(d.createElement('small'), { textContent: q ? it.s : '' }));
        list.appendChild(row);
      });
    };

    const mark = (n, scroll) => {
      const rows = $$('.pal__item', list);
      if (!rows.length) return;
      sel = (n + rows.length) % rows.length;
      rows.forEach((r, i) => r.classList.toggle('is-sel', i === sel));
      if (scroll) rows[sel].scrollIntoView({ block: 'nearest' });
    };

    const open = () => {
      if (!items.length) collect();
      opener = d.activeElement;
      input.value = '';
      render();
      pal.classList.add('is-open');
      pal.setAttribute('aria-hidden', 'false');
      setTimeout(() => input.focus(), 30);
    };
    const close = () => {
      pal.classList.remove('is-open');
      pal.setAttribute('aria-hidden', 'true');
      if (opener && opener.focus) opener.focus();
    };
    const go = (it) => {
      if (!it) return;
      close();
      if (it.h.startsWith('#')) { const t = d.querySelector(it.h); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
      else if (/^mailto:/i.test(it.h) || !/^https?:/i.test(it.h)) location.href = it.h;
      else window.open(it.h, '_blank', 'noopener');
    };

    input.addEventListener('input', render);
    list.addEventListener('mousemove', (e) => { const r = e.target.closest('.pal__item'); if (r && Number(r.dataset.i) !== sel) mark(Number(r.dataset.i), false); });
    list.addEventListener('click', (e) => { const r = e.target.closest('.pal__item'); if (r) go(shown[Number(r.dataset.i)]); });
    $$('[data-close-palette]').forEach((n) => n.addEventListener('click', close));
    $$('[data-open-palette]').forEach((n) => n.addEventListener('click', open));
    addEventListener('keydown', (e) => {
      const isOpen = pal.classList.contains('is-open');
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); isOpen ? close() : open(); return; }
      if (!isOpen) {
        if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test((d.activeElement || {}).tagName || '')) { e.preventDefault(); open(); }
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); mark(sel + 1, true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(sel - 1, true); }
      else if (e.key === 'Enter') { e.preventDefault(); go(shown[sel]); }
    });
  };

  /* ---------- Go ---------- */
  initMisc();
  initReveal();
  initHero();
  initNav();
  initPointer();
  initCounters();
  initRail();
  initPalette();
  boot();
})();
