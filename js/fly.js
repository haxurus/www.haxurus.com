/* Pinned fly-through hero, shared by /commissions/ and /support/.
   The hero is tall; its stage stays pinned while the scroll position drives the camera: the intro flies past the
   viewer, then each scene (.cx-sc) comes out of the distance, holds and flies past in turn.
   Loaded as a classic script at the end of <body>. Without JS, or on small / short screens, the CSS keeps a plain static hero. */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (k) { return k * k * (3 - 2 * k); };
  var ramp = function (v, a, b) { return smooth(clamp((v - a) / (b - a), 0, 1)); };

  var hero = $('[data-cx-hero]');
  if (!hero) return;
  var intro = $('[data-cx-intro]', hero);
  var scenes = $$('.cx-sc', hero).map(function (el) {
    return { el: el, ring: $('.cx-sc__ring', el), no: $('.cx-sc__no', el), word: $('.cx-sc__word', el), body: $('.cx-sc__body', el), art: $('.cx-sc__art', el), key: '', op: 0 };
  });
  var N = scenes.length;
  var tints = $$('.cx-bg__tints i', hero);
  var railItems = $$('.cx-rail__i', hero);
  var rail = railItems[0] && railItems[0].parentNode;
  var railFill = $('.cx-rail__fill i', hero);
  var cue = $('.cx-cue', hero);
  var layers = { aurora: $('.cx-bg__aurora', hero), rings: $('.cx-bg__rings', hero), code: $('.cx-bg__code', hero) };
  var pinMQ = matchMedia('(min-width: 901px) and (min-height: 641px)');
  var pinned = false, inView = true, ticking = false, introKey = '';

  // [enter start, enter end, exit start, exit end] on the 0..1 scroll progress of the pinned hero, for any number of scenes:
  // every scene gets the same time budget (30% flying in, 45% holding, 30% flying out) and the next one starts arriving while it leaves.
  var introEnd = Math.max(.14, .27 - Math.max(0, N - 3) * .03);
  var a0 = introEnd - .11;
  var step = (.88 - a0) / (N - 1 + .3);
  var WIN = scenes.map(function (s, i) {
    var a = a0 + i * step;
    var last = i === N - 1;
    return [a, a + step * .3, last ? 2 : a + step * .75, last ? 3 : a + step * 1.05];
  });

  // Floating glyphs: code on the commissions page, hearts and stars on the support page (data-glyphs="a|b|c").
  var glyphHost = $('[data-glyphs]', hero);
  if (glyphHost) {
    var custom = glyphHost.getAttribute('data-glyphs');
    var bits = custom ? custom.split('|') : ['{ }', '</>', '$ _', '200 OK', 'git push', ':443', 'sudo', 'nginx', 'ssh', '0x1F', 'async', 'docker', 'SELECT *', 'PHP', '=> {}', 'TLS', 'ping', '#!/bin/sh'];
    var frag = d.createDocumentFragment();
    for (var g = 0; g < 18; g++) {
      var sp = d.createElement('span');
      sp.textContent = bits[(g * 7) % bits.length];
      sp.style.left = (4 + ((g * 37) % 92)) + '%';
      sp.style.setProperty('--fs', (11 + (g * 5) % 10) + 'px');
      sp.style.setProperty('--dur', (13 + (g * 3) % 11) + 's');
      sp.style.setProperty('--delay', '-' + ((g * 2.3) % 14).toFixed(1) + 's');
      frag.appendChild(sp);
    }
    glyphHost.appendChild(frag);
  }

  var reset = function () {
    var nodes = [intro];
    scenes.forEach(function (s) { nodes.push(s.el, s.ring, s.no, s.word, s.body, s.art); });
    nodes.forEach(function (n) { if (n) { n.style.transform = n.style.opacity = n.style.visibility = ''; } });
    if (intro) intro.inert = false;
    tints.forEach(function (t) { t.style.opacity = ''; });
    scenes.forEach(function (s) { s.key = ''; });
    introKey = '';
  };

  var update = function () {
    ticking = false;
    if (!pinned || !inView) return;
    var r = hero.getBoundingClientRect();
    var total = hero.offsetHeight - innerHeight;
    var P = total > 0 ? clamp(-r.top / total, 0, 1) : 0;

    // Intro: the camera flies through the headline.
    var t = ramp(P, introEnd - .22, introEnd);
    var ik = t.toFixed(3);
    if (ik !== introKey) {
      introKey = ik;
      intro.style.transform = 'translate3d(0,' + (-t * 30).toFixed(1) + 'px,0) scale(' + (1 + t * .8).toFixed(4) + ')';
      intro.style.opacity = clamp(1 - t * 1.45, 0, 1).toFixed(3);
      intro.style.visibility = t >= .72 ? 'hidden' : '';
      intro.inert = t >= .72;
    }
    var strongest = 0, strongestOp = 0;
    scenes.forEach(function (s, i) {
      var w = WIN[i];
      var eu = ramp(P, w[0], w[1]), ev = ramp(P, w[2], w[3]);
      var op = eu * (1 - ev);
      var key = eu.toFixed(3) + '|' + ev.toFixed(3);
      if (op > strongestOp) { strongestOp = op; strongest = i; }
      s.op = op;
      if (key === s.key) return;
      s.key = key;
      var sw = (.5 + .5 * eu) * (1 + 1.25 * ev);
      var sr = (.32 + .68 * eu) * (1 + 2.3 * ev);
      var sb = (.84 + .16 * eu) * (1 + .5 * ev);
      s.el.style.opacity = op > .002 ? '1' : '0';
      s.el.style.visibility = op > .002 ? '' : 'hidden';
      s.ring.style.transform = 'scale(' + sr.toFixed(4) + ')';
      s.ring.style.opacity = (op * .95).toFixed(3);
      s.word.style.transform = 'translate3d(0,0,0) scale(' + sw.toFixed(4) + ')';
      s.word.style.opacity = op.toFixed(3);
      s.no.style.opacity = op.toFixed(3);
      s.no.style.transform = 'translate3d(0,' + ((1 - eu) * -26).toFixed(1) + 'px,0)';
      var bo = ramp(eu, .3, 1) * (1 - clamp(ev * 1.7, 0, 1));
      s.body.style.opacity = bo.toFixed(3);
      s.body.style.transform = 'translate3d(0,' + ((1 - eu) * 46 - ev * 30).toFixed(1) + 'px,0) scale(' + sb.toFixed(4) + ')';
      if (s.art) {
        var sa = (.3 + .7 * eu) * (1 + 1.7 * ev);
        s.art.style.opacity = op.toFixed(3);
        s.art.style.transform = 'translate3d(' + ((1 - eu) * 120 + ev * 160).toFixed(1) + 'px,' + ((1 - eu) * 80 - ev * 60).toFixed(1) + 'px,0) rotate(' + (6 + (1 - eu) * 14 + ev * 12).toFixed(1) + 'deg) scale(' + sa.toFixed(4) + ')';
      }
    });
    tints.forEach(function (tn, i) {
      var base = i === 0 ? clamp(1 - t * 1.3, 0, 1) * .7 : 0;
      tn.style.opacity = Math.max(base, scenes[i] ? scenes[i].op : 0).toFixed(3);
    });
    railItems.forEach(function (n, i) { n.classList.toggle('is-on', P > .15 && i === strongest); });
    if (rail) rail.style.opacity = ramp(P, .08, .17).toFixed(2);
    if (railFill) railFill.style.transform = 'scaleY(' + P.toFixed(3) + ')';
    if (cue) cue.style.opacity = clamp(1 - P * 14, 0, 1).toFixed(2);
  };
  var schedule = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  var setMode = function () {
    pinned = pinMQ.matches;
    hero.classList.toggle('is-pin', pinned);
    if (pinned) update(); else reset();
  };
  if (pinMQ.addEventListener) pinMQ.addEventListener('change', setMode); else pinMQ.addListener(setMode);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  setMode();

  // Stop all the endless background loops while the hero is off screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      hero.classList.toggle('is-paused', !inView);
      if (inView) schedule();
    }).observe(hero);
  }

  // Pointer parallax on the background layers
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var px = 0, py = 0, cx = 0, cy = 0, loop = 0;
    var tick = function () {
      cx += (px - cx) * .07; cy += (py - cy) * .07;
      if (!root.classList.contains('rm')) {
        if (layers.aurora) layers.aurora.style.transform = 'translate3d(' + (cx * -34).toFixed(1) + 'px,' + (cy * -24).toFixed(1) + 'px,0)';
        if (layers.rings) layers.rings.style.transform = 'translate3d(' + (cx * 18).toFixed(1) + 'px,' + (cy * 12).toFixed(1) + 'px,0)';
        if (layers.code) layers.code.style.transform = 'translate3d(' + (cx * 52).toFixed(1) + 'px,0,0)';
      }
      loop = (Math.abs(px - cx) > .001 || Math.abs(py - cy) > .001) && inView ? requestAnimationFrame(tick) : 0;
    };
    hero.addEventListener('pointermove', function (e) {
      px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5;
      if (!loop) loop = requestAnimationFrame(tick);
    }, { passive: true });
  }
})();
