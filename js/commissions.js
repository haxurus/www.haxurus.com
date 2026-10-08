/* Commissions page: skills stack (render, search, filter), service chips, glow, jump bar, process timeline.
   Loaded as a classic script at the end of <body> so the skill cards exist before site.js runs its reveal setup. */
(function () {
  'use strict';

  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- Skills ---------- */
  var names = {
    'Backend & Programmazione': 'Backend & Programming',
    'Framework / Runtime / Librerie': 'Frameworks / Runtime / Libraries',
    'Virtualizzazione': 'Virtualization',
    'CMS / Siti': 'CMS / Websites'
  };
  var levelMap = {
    'Avanzato': ['advanced', 'Advanced'],
    'Intermedio': ['intermediate', 'Intermediate'],
    'Base': ['basic', 'Basic']
  };
  var grid = $('#skills-grid');
  var dataEl = $('#skills-data');
  if (grid && dataEl) {
    var data = JSON.parse(dataEl.textContent);
    var totals = { advanced: 0, intermediate: 0, basic: 0, all: 0 };
    Object.keys(data).forEach(function (category) {
      var article = d.createElement('article');
      article.className = 'skill-group';
      var h = d.createElement('h3');
      var t = d.createElement('span');
      t.textContent = names[category] || category;
      var c = d.createElement('small');
      c.textContent = String(data[category].length).padStart(2, '0') + ' skills';
      h.appendChild(t);
      h.appendChild(c);
      var list = d.createElement('div');
      list.className = 'skill-list';
      data[category].forEach(function (item) {
        var m = levelMap[item[1]];
        var chip = d.createElement('span');
        chip.className = 'skill-chip';
        chip.dataset.level = m[0];
        chip.dataset.levelLabel = m[1];
        chip.tabIndex = 0;
        var dot = d.createElement('i');
        dot.className = 'dot';
        chip.appendChild(dot);
        chip.appendChild(d.createTextNode(item[0]));
        list.appendChild(chip);
        totals[m[0]] += 1;
        totals.all += 1;
      });
      article.appendChild(h);
      article.appendChild(list);
      grid.appendChild(article);
    });

    $$('[data-lvl-count]').forEach(function (n) { n.textContent = String(totals[n.dataset.lvlCount]); });
    var input = $('#skill-search');
    var buttons = $$('[data-skill-filter]');
    var counter = $('.stack-count');
    var empty = $('.stack-empty');
    var level = 'all';

    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      $$('.skill-chip').forEach(function (chip) {
        var ok = (level === 'all' || chip.dataset.level === level) && (!q || chip.textContent.toLowerCase().indexOf(q) > -1);
        chip.classList.toggle('is-hidden', !ok);
        if (ok) shown += 1;
      });
      $$('.skill-group').forEach(function (g) {
        g.classList.toggle('is-empty', !g.querySelector('.skill-chip:not(.is-hidden)'));
      });
      if (counter) counter.textContent = 'Showing ' + shown + ' of ' + totals.all;
      if (empty) empty.hidden = shown !== 0;
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        level = b.dataset.skillFilter;
        buttons.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
    apply();
  }


  /* ---------- Technology logo card (hover / focus) ---------- */
  var LOGOS = window.TECH_LOGOS || {};
  var tip = d.createElement('div');
  tip.className = 'techtip';
  tip.setAttribute('role', 'tooltip');
  tip.innerHTML = '<span class="techtip__logo"></span><span class="techtip__txt"><b></b><small></small></span>';
  d.body.appendChild(tip);
  var tipLogo = $('.techtip__logo', tip), tipName = $('b', tip), tipLevel = $('small', tip);
  var current = null;

  var readable = function (hex) {
    if (!hex) return null;
    var n = parseInt(hex, 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.28 ? '#e8f5ec' : '#' + hex;   // very dark brand colours would vanish on the dark card
  };
  var showTip = function (el) {
    var name = el.textContent.trim();
    var entry = LOGOS[name.toLowerCase()];
    if (!entry) return;
    current = el;
    tipLogo.style.setProperty('--logo', 'url("' + new URL('../img/tech/' + entry[0], d.baseURI).href + '")');
    tipLogo.style.setProperty('--c', readable(entry[1]) || 'var(--g)');
    tipName.textContent = name;
    tipLevel.textContent = el.dataset.levelLabel || '';
    tipLevel.hidden = !el.dataset.levelLabel;
    tip.classList.add('on');
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    var left = clamp(r.left + r.width / 2 - w / 2, 8, innerWidth - w - 8);
    var top = r.top - h - 10;
    if (top < 8) top = r.bottom + 10;
    tip.style.transform = 'translate3d(' + Math.round(left) + 'px,' + Math.round(top) + 'px,0)';
  };
  var hideTip = function () { current = null; tip.classList.remove('on'); };
  var TIP_SEL = '.skill-chip, .services .chips li';
  $$('.services .chips li').forEach(function (li) { li.tabIndex = 0; });
  d.addEventListener('pointerover', function (e) {
    var el = e.target.closest && e.target.closest(TIP_SEL);
    if (el) showTip(el); else if (current) hideTip();
  });
  d.addEventListener('focusin', function (e) { var el = e.target.closest && e.target.closest(TIP_SEL); if (el) showTip(el); });
  d.addEventListener('focusout', hideTip);
  d.addEventListener('pointerdown', function (e) { if (!(e.target.closest && e.target.closest(TIP_SEL))) hideTip(); });
  addEventListener('scroll', hideTip, { passive: true });

  /* ---------- Service chips: show the first six, expand on demand ---------- */
  $$('.chips[data-chips]').forEach(function (ul) {
    var items = $$('li', ul);
    var LIMIT = 6;
    if (items.length <= LIMIT) return;
    items.slice(LIMIT).forEach(function (li) { li.hidden = true; });
    var btn = d.createElement('button');
    btn.type = 'button';
    btn.className = 'chips-more';
    var extra = items.length - LIMIT;
    btn.textContent = '+' + extra + ' more';
    var open = false;
    btn.addEventListener('click', function () {
      open = !open;
      items.slice(LIMIT).forEach(function (li) { li.hidden = !open; });
      btn.textContent = open ? 'Show less' : '+' + extra + ' more';
    });
    ul.insertAdjacentElement('afterend', btn);
  });

  /* ---------- Cursor glow on service cards ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var frame = 0, ev = null;
    d.addEventListener('pointermove', function (e) {
      var s = e.target.closest && e.target.closest('.service');
      if (!s) return;
      ev = { s: s, x: e.clientX, y: e.clientY };
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        var r = ev.s.getBoundingClientRect();
        ev.s.style.setProperty('--mx', (ev.x - r.left) + 'px');
        ev.s.style.setProperty('--my', (ev.y - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- Jump bar: highlight the service in view ---------- */
  var jump = $$('.cx-jump a');
  if (jump.length && 'IntersectionObserver' in window) {
    var byId = {};
    jump.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        jump.forEach(function (a) { a.classList.toggle('is-active', a === byId[e.target.id]); });
        var a = byId[e.target.id];
        if (a && a.parentElement) a.parentElement.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) { var s = d.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Process timeline ---------- */
  var tl = $('.timeline');
  if (tl) {
    var fill = $('.timeline__line i', tl);
    var steps = $$('.tstep', tl);
    var vertical = matchMedia('(max-width: 980px)');
    var ticking = false;
    var run = function () {
      ticking = false;
      var r = tl.getBoundingClientRect();
      var p = clamp((innerHeight * .72 - r.top) / (r.height + 20), 0, 1);
      fill.style.transform = vertical.matches ? 'scaleY(' + p.toFixed(3) + ')' : 'scaleX(' + p.toFixed(3) + ')';
      steps.forEach(function (s, i) { s.classList.toggle('is-lit', p >= (i + .35) / steps.length); });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    run();
  }
})();
