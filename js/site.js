/* Haxurus site v2: boot, reveal, hero, manifesto, link index peek, playlist deck, support tiers, command palette. */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  // The OS reduced-motion flag only switches on "calm" mode (no parallax or endless loops); effects are never fully disabled.
  // Visitors can flip the mode with the footer toggle, and the choice is remembered.
  const MOTION_KEY = 'hx-motion';
  const stored = (() => { try { return localStorage.getItem(MOTION_KEY); } catch (e) { return null; } })();
  const calmByDefault = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.toggle('rm', stored ? stored === 'calm' : calmByDefault);
  const isCalm = () => root.classList.contains('rm');
  const reduced = false;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(2, '0');

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
    const lines = $$('.boot__term p', el);
    const bar = $('.boot__bar i', el);
    const num = $('.boot__num', el);
    const start = performance.now();
    let loaded = d.readyState === 'complete';
    let p = 0;
    addEventListener('load', () => { loaded = true; }, { once: true });
    const timer = setInterval(() => {
      const t = performance.now() - start;
      lines.forEach((l, i) => { if (t > 120 + i * 260) l.classList.add('on'); });
      const target = loaded && t > 1250 ? 1 : Math.min(.92, t / 2600);
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
        }, 220);
      }
    }, 32);
  };

  /* ---------- Reveal on scroll ---------- */
  const initReveal = () => {
    $$('[data-stagger] > .row').forEach((t, i) => { t.dataset.r = ''; t.style.setProperty('--d', i % 8); });
    const els = $$('[data-r]');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      vis.forEach((e, i) => {
        const el = e.target;
        if (!el.classList.contains('row')) el.style.setProperty('--d', Math.min(i, 6));
        el.classList.add('in');
        io.unobserve(el);
        setTimeout(() => { el.removeAttribute('data-r'); el.style.removeProperty('--d'); }, 1800 + Math.min(i, 8) * 70);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- Hero ---------- */
  const initHero = () => {
    const hero = $('.hero');
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

  /* ---------- Manifesto: words light up with scroll ---------- */
  let manifestoUpdate = () => {};
  const initManifesto = () => {
    const m = $('[data-manifesto]');
    if (!m || reduced) return;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(d.createTextNode(tok)); return; }
            const s = d.createElement('span');
            s.className = 'w';
            s.textContent = tok;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(m);
    const words = $$('.w', m);
    let last = 0;
    manifestoUpdate = () => {
      const r = m.getBoundingClientRect();
      const p = clamp((innerHeight * .88 - r.top) / (r.height + innerHeight * .2), 0, 1);
      const n = Math.round(p * words.length);
      if (n === last) return;
      if (n > last) for (let i = last; i < n; i++) words[i].classList.add('on');
      else for (let i = n; i < last; i++) words[i].classList.remove('on');
      last = n;
    };
    manifestoUpdate();
  };

  /* ---------- Scroll state: progress, nav, hero var, parallax ---------- */
  const initScroll = () => {
    const nav = $('.nav');
    const bar = $('#progress');
    const hero = $('.hero');
    const par = $$('[data-parallax]');
    let lastY = scrollY, ticking = false;

    const frame = () => {
      ticking = false;
      const y = scrollY;
      const max = root.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0})`;
      if (nav && !root.classList.contains('menu-open')) {
        if (y > 260 && y > lastY + 8) nav.classList.add('is-hidden');
        else if (y < lastY - 8 || y < 120) nav.classList.remove('is-hidden');
      }
      lastY = y;
      if (hero && !isCalm()) hero.style.setProperty('--hp', clamp(y / (hero.offsetHeight || 1), 0, 1).toFixed(3));
      if (!isCalm()) {
        par.forEach((el) => {
          const box = el.parentElement.getBoundingClientRect();
          if (box.bottom < -100 || box.top > innerHeight + 100) return;
          const p = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
          el.style.setProperty('--ty', `${(p * -48).toFixed(1)}px`);
        });
      }
      manifestoUpdate();
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    frame();
  };

  /* ---------- Nav ---------- */
  const initNav = () => {
    const nav = $('.nav');
    const burger = $('.burger');
    const links = $$('.nav__links a[href^="#"]');

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

  /* ---------- Pointer: spotlight, peek, tilt, magnets ---------- */
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

    // Cursor-following preview of the hovered link icon
    const peek = $('#peek');
    if (peek) {
      const img = $('img', peek);
      let hov = null, tx = 0, ty = 0, x = 0, y = 0, loop = 0;
      const tick = () => {
        x += (tx - x) * .16;
        y += (ty - y) * .16;
        const rot = clamp((tx - x) * .08, -14, 14);
        peek.style.transform = `translate3d(${(x + 30).toFixed(1)}px, ${(y - 70).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
        if (hov || peek.classList.contains('on')) loop = requestAnimationFrame(tick); else loop = 0;
      };
      d.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      d.addEventListener('pointerover', (e) => {
        const r = e.target.closest && e.target.closest('.row[data-peek]');
        if (r === hov) return;
        hov = r;
        if (r) {
          if (!peek.classList.contains('on')) { x = tx; y = ty; }
          img.src = r.dataset.peek;
          peek.classList.add('on');
          if (!loop) loop = requestAnimationFrame(tick);
        } else peek.classList.remove('on');
      });
      root.addEventListener('mouseleave', () => { hov = null; peek.classList.remove('on'); });
    }

    // Tilt for the support card
    $$('[data-tilt]').forEach((card) => {
      let frame = 0, ev = null;
      card.addEventListener('pointermove', (e) => {
        ev = e;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = card.getBoundingClientRect();
          const nx = (ev.clientX - r.left) / r.width, ny = (ev.clientY - r.top) / r.height;
          card.classList.add('is-tilting');
          card.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`);
          card.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`);
          card.style.transform = `perspective(1100px) rotateY(${(-9 + (nx - .5) * 16).toFixed(2)}deg) rotateX(${(5 + (.5 - ny) * 12).toFixed(2)}deg) scale(1.02)`;
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => { card.classList.remove('is-tilting'); card.style.transform = ''; });
    });

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
      if (k === 'links') return $$('.row, .film').length || Number(n.dataset.fallback);
      if (k === 'playlists') return $$('.trk').length || Number(n.dataset.fallback);
      if (k === 'worlds') return $$('.film').length || Number(n.dataset.fallback);
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

  /* ---------- Playlist deck ---------- */
  const initDeck = () => {
    const deck = $('[data-deck]');
    if (!deck) return;
    const links = $$('.trk', deck);
    const crate = $('.crate', deck);
    const sleeve = $('.sleeve img', deck);
    const disc = $('.disc img', deck);
    const no = $('.deck__no', deck);
    const title = $('.deck__title', deck);
    const tags = $('.deck__tags', deck);
    const open = $('.deck__open', deck);
    const bar = $('.deck__bar i', deck);
    const DUR = 7000;
    let cur = 0, auto = !reduced, t0 = performance.now(), inView = false;

    const select = (i) => {
      cur = i;
      const a = links[i];
      links.forEach((l, k) => l.classList.toggle('is-active', k === i));
      sleeve.src = disc.src = a.dataset.cover;
      sleeve.alt = `Playlist cover for ${a.dataset.title}`;
      no.textContent = `${pad(i + 1)} / ${pad(links.length)}`;
      title.textContent = a.dataset.title;
      tags.textContent = '';
      a.dataset.tags.split('|').forEach((t) => tags.appendChild(Object.assign(d.createElement('span'), { textContent: t })));
      open.href = a.href;
      if (!reduced) { crate.classList.remove('swap'); void crate.offsetWidth; crate.classList.add('swap'); }
      t0 = performance.now();
    };

    links.forEach((a, i) => {
      a.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        auto = false;
        bar.style.transform = 'scaleX(0)';
        select(i);
      });
      a.addEventListener('pointerenter', () => { new Image().src = a.dataset.cover; });
    });

    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) t0 = performance.now(); }, { threshold: .35 }).observe(deck);
    else inView = true;

    setInterval(() => {
      if (!auto || d.hidden || !inView) return;
      const k = (performance.now() - t0) / DUR;
      bar.style.transform = `scaleX(${clamp(k, 0, 1).toFixed(3)})`;
      if (k >= 1) select((cur + 1) % links.length);
    }, 100);
  };

  /* ---------- Support: tier explorer ---------- */
  const initTiers = () => {
    const tabs = $$('[role="tab"]');
    const panels = $$('.panel');
    if (!tabs.length || tabs.length !== panels.length) return;
    const cols = $$('[data-col]');
    const pick = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => {
        p.hidden = k !== i;
        if (k === i && !reduced) { p.classList.remove('is-enter'); void p.offsetWidth; p.classList.add('is-enter'); }
      });
      cols.forEach((c) => c.classList.toggle('col-sel', Number(c.dataset.col) === i));
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(i));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); pick((i + k + tabs.length) % tabs.length, true); }
        if (e.key === 'Home') { e.preventDefault(); pick(0, true); }
        if (e.key === 'End') { e.preventDefault(); pick(tabs.length - 1, true); }
      });
    });
    $$('[data-tier]').forEach((b) => b.addEventListener('click', () => {
      pick(Number(b.dataset.tier));
      const t = $('#patreon');
      if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }));
    const start = tabs.findIndex((t) => t.dataset.hot === '1');
    pick(start > -1 ? start : 0);
  };

  /* ---------- Censored prices: click to reveal ---------- */
  const initPrices = () => {
    const open = (p) => {
      if (p.classList.contains('is-open')) return;
      p.classList.add('is-open');
      p.removeAttribute('aria-label');
    };
    $$('.price').forEach((p) => {
      if (!p.closest('button, a, [data-price-host]')) {
        p.setAttribute('role', 'button');
        p.tabIndex = 0;
        p.setAttribute('aria-label', 'Reveal price');
      }
    });
    d.addEventListener('click', (e) => {
      let p = e.target.closest && e.target.closest('.price');
      if (!p) {
        const host = e.target.closest && e.target.closest('[data-price-host]');
        if (host) p = $('.price', host);
      }
      if (p) open(p);
      const all = e.target.closest && e.target.closest('[data-reveal-prices]');
      if (all) $$('.price').forEach(open);
    });
    d.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('price') && e.target.getAttribute('role') === 'button') {
        e.preventDefault();
        open(e.target);
      }
    });
  };

  /* ---------- Motion toggle (footer) ---------- */
  const initMotionToggle = () => {
    const wrap = $('.foot .wrap');
    const base = wrap && $('.foot__base', wrap);
    if (!base) return; // only the home footer carries the toggle
    let btn = $('[data-motion-toggle]');
    if (!btn) {
      btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'motion-toggle';
      btn.dataset.motionToggle = '';
      btn.innerHTML = '<i></i><span></span>';
      base.insertBefore(btn, base.lastElementChild);
    }
    const label = () => { $('span', btn).textContent = isCalm() ? 'Motion: calm' : 'Motion: full'; btn.setAttribute('aria-pressed', String(!isCalm())); };
    btn.addEventListener('click', () => {
      const calm = !isCalm();
      root.classList.toggle('rm', calm);
      try { localStorage.setItem(MOTION_KEY, calm ? 'calm' : 'full'); } catch (e) { /* ignore */ }
      label();
    });
    label();
  };

  /* ---------- Misc ---------- */
  const initMisc = () => {
    $$('#current-year').forEach((y) => { y.textContent = String(new Date().getFullYear()); });

    const fallback = (img) => {
      const holder = img.closest('.row, .tile');
      const title = holder && $('.row__title, .tile__title', holder);
      const g = d.createElement('span');
      g.className = 'glyph';
      g.textContent = ((title && title.textContent) || '?').trim().slice(0, 2).toUpperCase();
      g.style.cssText = 'width:100%;height:100%;display:grid;place-items:center;background:rgba(255,255,255,.08)';
      if (holder) holder.removeAttribute('data-peek');
      img.replaceWith(g);
    };
    d.addEventListener('error', (e) => { if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-icon')) fallback(e.target); }, true);
    $$('img[data-icon]').forEach((img) => { if (img.complete && img.naturalWidth === 0 && img.currentSrc) fallback(img); });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)));
      $$('.hero, .ticker, .card3d, .deck, .ladder').forEach((el) => io.observe(el));
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
        const t = ($('.row__title, .film__title, .trk__t', a) || a).textContent.trim();
        const img = $('img', a);
        const icon = a.classList.contains('row') && img ? img.getAttribute('src') : null;
        items.push({ t, s: a.dataset.s, h: href, i: icon, g: t.slice(0, 2).toUpperCase() });
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
  initManifesto();
  initScroll();
  initNav();
  initPointer();
  initCounters();
  initDeck();
  initTiers();
  initPrices();
  initMotionToggle();
  initPalette();
  boot();
})();
