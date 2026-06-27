/* early reveal guard */
(() => {
  const css = `
    body:not(.skip-intro) .hero:not(.seq-visible),body:not(.skip-intro) .quick-link:not(.seq-visible),body:not(.skip-intro) .link-card:not(.seq-visible),body:not(.skip-intro) .playlist-card:not(.seq-visible),body:not(.skip-intro) .category h2:not(.seq-visible){opacity:0!important;visibility:hidden!important;transform:translateY(22px) scale(.985)!important;animation:none!important;pointer-events:none!important}
    body:not(.skip-intro) .hero:not(.seq-visible) *,body:not(.skip-intro) .quick-link:not(.seq-visible) *,body:not(.skip-intro) .link-card:not(.seq-visible) *,body:not(.skip-intro) .playlist-card:not(.seq-visible) *,body:not(.skip-intro) .category h2:not(.seq-visible) *{visibility:hidden!important}
    body.skip-intro .hero,body.skip-intro .quick-link,body.skip-intro .link-card,body.skip-intro .playlist-card,body.skip-intro .category h2,body:not(.skip-intro) .hero.seq-visible,body:not(.skip-intro) .quick-link.seq-visible,body:not(.skip-intro) .link-card.seq-visible,body:not(.skip-intro) .playlist-card.seq-visible,body:not(.skip-intro) .category h2.seq-visible{opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:auto!important}
    body.skip-intro .hero *,body.skip-intro .quick-link *,body.skip-intro .link-card *,body.skip-intro .playlist-card *,body.skip-intro .category h2 *,body:not(.skip-intro) .hero.seq-visible *,body:not(.skip-intro) .quick-link.seq-visible *,body:not(.skip-intro) .link-card.seq-visible *,body:not(.skip-intro) .playlist-card.seq-visible *,body:not(.skip-intro) .category h2.seq-visible *{visibility:visible!important}
    @media (prefers-reduced-motion:reduce){body:not(.skip-intro) .hero,body:not(.skip-intro) .quick-link,body:not(.skip-intro) .link-card,body:not(.skip-intro) .playlist-card,body:not(.skip-intro) .category h2{opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:auto!important}body:not(.skip-intro) .hero *,body:not(.skip-intro) .quick-link *,body:not(.skip-intro) .link-card *,body:not(.skip-intro) .playlist-card *,body:not(.skip-intro) .category h2 *{visibility:visible!important}}
  `;
  const style = document.createElement('style');
  style.setAttribute('data-reveal-guard', '');
  style.textContent = css;
  document.head.prepend(style);
})();

/* loader */
(() => {
  const MIN_LOADER_TIME = 1100;
  const MAX_WAIT_TIME = 4500;
  const SKIP_EVENT = 'haxurus:skip-intro';
  const loader = document.getElementById('site-loader');
  if (!loader) return;
  const skipButton = loader.querySelector('[data-skip-loader]');
  const start = performance.now();
  let loaderClosed = false;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function requestSkip() {
    window.__skipIntro = true;
    document.body.classList.add('skip-intro');
    window.dispatchEvent(new CustomEvent(SKIP_EVENT));
  }

  function whenImageReady(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
      if (img.complete) resolve(true);
    });
  }

  function whenVideoReady(video) {
    return new Promise((resolve) => {
      if (!video) { resolve(false); return; }
      const done = () => resolve(true);
      if (video.readyState >= 2) { resolve(true); return; }
      video.addEventListener('loadeddata', done, { once: true });
      video.addEventListener('canplay', done, { once: true });
      video.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  async function hideLoader({ instant = false } = {}) {
    if (loaderClosed) return;
    loaderClosed = true;
    if (!instant) {
      const elapsed = performance.now() - start;
      if (elapsed < MIN_LOADER_TIME) await wait(MIN_LOADER_TIME - elapsed);
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      window.setTimeout(() => loader.remove(), 550);
      return;
    }
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    loader.remove();
  }

  async function initLoader() {
    if (window.__skipIntro === true) { await hideLoader({ instant: true }); return; }
    const bgVideo = document.querySelector('.background-video');
    await Promise.race([
      Promise.all([whenImageReady('img/hero/banner_summer.png'), whenVideoReady(bgVideo)]),
      wait(MAX_WAIT_TIME),
    ]);
    if (window.__skipIntro === true) { await hideLoader({ instant: true }); return; }
    await hideLoader();
  }

  if (skipButton) skipButton.addEventListener('click', () => { requestSkip(); hideLoader({ instant: true }); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLoader, { once: true });
  else initLoader();
})();

/* background video loop watchdog */
(() => {
  const video = document.querySelector('.background-video');
  if (!video) return;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('loop', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  const play = () => {
    if (document.hidden) return;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') promise.catch(() => {});
  };
  const restart = () => { try { video.currentTime = 0; } catch (error) {} play(); };
  video.addEventListener('ended', restart);
  video.addEventListener('stalled', play);
  video.addEventListener('suspend', play);
  video.addEventListener('waiting', play);
  video.addEventListener('pause', () => { if (!document.hidden) window.setTimeout(play, 120); });
  video.addEventListener('timeupdate', () => {
    if (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime >= video.duration - 0.08) restart();
  });
  document.addEventListener('visibilitychange', play);
  window.addEventListener('focus', play);
  window.setInterval(() => { if (!document.hidden && (video.paused || video.ended)) play(); }, 3000);
  play();
})();

/* combined effects stylesheet */
(() => {
  const href = 'site-effects.css';
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  if (!document.querySelector('style[data-hero-summer-banner]')) {
    const override = document.createElement('style');
    override.setAttribute('data-hero-summer-banner', '');
    override.textContent = '.hero{background:#020805!important}.hero::before{background:url("img/hero/banner_summer.png") center/cover no-repeat!important}';
    document.head.appendChild(override);
  }
})();

/* reactive liquid glass */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchLike = window.matchMedia('(pointer: coarse), (hover: none)');
  const selector = '.link-card, .playlist-card, .quick-link';
  if (reduceMotion.matches || touchLike.matches) return;
  function updateGlass(event) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    target.style.setProperty('--liquid-x', `${x}%`);
    target.style.setProperty('--liquid-y', `${y}%`);
    target.style.setProperty('--liquid-tilt-x', `${-((y - 50) / 50) * 4}deg`);
    target.style.setProperty('--liquid-tilt-y', `${((x - 50) / 50) * 5}deg`);
  }
  function resetGlass(event) {
    const target = event.currentTarget;
    target.style.setProperty('--liquid-x', '50%');
    target.style.setProperty('--liquid-y', '50%');
    target.style.setProperty('--liquid-tilt-x', '0deg');
    target.style.setProperty('--liquid-tilt-y', '0deg');
  }
  function bind() {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.dataset.liquidGlassBound === 'true') return;
      element.dataset.liquidGlassBound = 'true';
      element.addEventListener('pointermove', updateGlass);
      element.addEventListener('pointerleave', resetGlass);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();

/* hero glitch title */
(() => {
  const title = document.querySelector('.hero-content > h1');
  if (!title || title.classList.contains('glitch-logo')) return;
  const text = 'Haxurus';
  title.classList.add('glitch-logo');
  title.dataset.text = text;
  title.setAttribute('aria-label', text);
  title.innerHTML = '<span aria-hidden="true">Haxurus</span><i class="scanlines" aria-hidden="true"></i><i class="noise" aria-hidden="true"></i>';
})();

/* about section */
(() => {
  const hero = document.querySelector('.hero');
  const main = document.querySelector('main.animated-sections');
  if (!hero || !main || document.querySelector('.about-haxurus')) return;
  const style = document.createElement('style');
  style.textContent = `
    .about-haxurus{width:min(100% - 36px,var(--maxw,1120px));margin:34px auto 42px;scroll-margin-top:110px}.about-haxurus__card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:28px;background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.045));box-shadow:0 22px 60px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.18);padding:clamp(22px,4vw,36px);-webkit-backdrop-filter:blur(22px) saturate(165%);backdrop-filter:blur(22px) saturate(165%)}.about-haxurus__card::before{content:"";position:absolute;inset:-40% auto auto -18%;width:320px;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(57,255,20,.18),transparent 68%);filter:blur(4px);pointer-events:none}.about-haxurus__eyebrow{display:inline-flex;margin-bottom:12px;border:1px solid rgba(57,255,20,.30);border-radius:999px;background:rgba(57,255,20,.08);padding:6px 10px;color:#c9ffd4;font-size:.72rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.about-haxurus h2{position:relative;margin:0 0 14px;color:#f7fff9;font-size:clamp(2.1rem,6vw,4.8rem);line-height:.92;letter-spacing:-.065em}.about-haxurus p{position:relative;max-width:940px;margin:0;color:rgba(244,255,247,.82);font-size:clamp(1rem,2vw,1.16rem);line-height:1.75}.about-haxurus__cta{position:relative;display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.about-haxurus__button{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(57,255,20,.34);border-radius:999px;background:rgba(57,255,20,.105);padding:10px 14px;color:#dfffe7;font-weight:900;text-decoration:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.about-haxurus__button:hover{background:rgba(57,255,20,.18);color:#fff}.about-haxurus__button--ghost{border-color:rgba(255,255,255,.20);background:rgba(255,255,255,.07)}.about-haxurus:not(.about-ready) .about-haxurus__card,.about-haxurus:not(.about-ready) .about-haxurus__card::after,.about-haxurus:not(.about-ready) .about-haxurus__eyebrow,.about-haxurus:not(.about-ready) h2,.about-haxurus:not(.about-ready) p,.about-haxurus:not(.about-ready) .about-haxurus__cta{opacity:0!important;transform:translateY(24px) scale(.985)!important;animation:none!important}.about-haxurus.about-ready .about-haxurus__card,.about-haxurus.about-ready .about-haxurus__card::after,.about-haxurus.about-ready .about-haxurus__eyebrow,.about-haxurus.about-ready h2,.about-haxurus.about-ready p,.about-haxurus.about-ready .about-haxurus__cta{opacity:1!important;transform:none!important;animation:none!important;transition:opacity .58s ease,transform .58s cubic-bezier(.2,.8,.2,1)}.about-haxurus.about-ready .about-haxurus__card::after{transition-delay:.12s}.about-haxurus.about-ready .about-haxurus__eyebrow{transition-delay:.18s}.about-haxurus.about-ready h2{transition-delay:.28s}.about-haxurus.about-ready p{transition-delay:.38s}.about-haxurus.about-ready .about-haxurus__cta{transition-delay:.48s}@media (max-width:720px){.about-haxurus{width:min(100% - 24px,var(--maxw,1120px));margin:24px auto 34px}.about-haxurus__cta{flex-direction:column}.about-haxurus__button{width:100%}}@media (prefers-reduced-motion:reduce){.about-haxurus:not(.about-ready) .about-haxurus__card,.about-haxurus:not(.about-ready) .about-haxurus__card::after,.about-haxurus:not(.about-ready) .about-haxurus__eyebrow,.about-haxurus:not(.about-ready) h2,.about-haxurus:not(.about-ready) p,.about-haxurus:not(.about-ready) .about-haxurus__cta{opacity:1!important;transform:none!important}}
  `;
  document.head.appendChild(style);
  const section = document.createElement('section');
  section.className = 'about-haxurus';
  section.id = 'about';
  section.innerHTML = `
    <div class="about-haxurus__card">
      <span class="about-haxurus__eyebrow">Personal hub</span>
      <h2>About me</h2>
      <p>I’m Haxurus — a gaming, tech and online-culture focused identity. This site collects my profiles, communities, playlists, gaming accounts and projects in one place. I enjoy videogames, anime, manga, music, social platforms and digital spaces, with a strong interest in web development, system administration, networking and cybersecurity. Feel free to explore, follow the profiles that interest you, join the communities, listen to a playlist, or reach out if you want to interact with me.</p>
      <div class="about-haxurus__cta" aria-label="Ways to interact with Haxurus"><a class="about-haxurus__button" href="mailto:inviati-49-armonia@icloud.com">Contact me</a><a class="about-haxurus__button about-haxurus__button--ghost" href="#social">Explore my profiles</a><a class="about-haxurus__button about-haxurus__button--ghost" href="#discord">Join a community</a></div>
    </div>
  `;
  hero.insertAdjacentElement('afterend', section);
  const showAbout = () => section.classList.add('about-ready');
  if (window.__skipIntro || window.matchMedia('(prefers-reduced-motion: reduce)').matches) showAbout();
  else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.setTimeout(showAbout, 180);
      observer.disconnect();
    }, { threshold: 0.34 });
    observer.observe(section);
  } else window.setTimeout(showAbout, 900);
})();

/* card status badges */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .card-badges{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;margin-top:8px}.link-card-banner-body .card-badges{justify-content:flex-start}.card-badge{display:inline-flex;align-items:center;min-height:20px;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:3px 8px;background:rgba(255,255,255,.065);color:rgba(255,255,255,.86);font-size:.68rem;font-weight:900;letter-spacing:.055em;text-transform:uppercase;line-height:1;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 6px 14px rgba(0,0,0,.16)}.card-badge--inactive{border-color:rgba(190,199,195,.24);background:rgba(150,160,156,.10);color:rgba(224,230,227,.72)}.card-badge--bot{border-color:rgba(190,120,255,.38);background:rgba(160,80,255,.14);color:#efdfff}.card-badge--community{border-color:rgba(0,234,255,.34);background:rgba(0,234,255,.10);color:#d7fbff}.link-card.has-card-badges .card-subtitle:empty{display:none}
  `;
  document.head.appendChild(style);
  function getCardBody(card) { return card.querySelector('.card-body, .link-card-banner-body, .playlist-info') || card; }
  function addBadge(card, type, label) {
    const body = getCardBody(card);
    let badges = body.querySelector('.card-badges');
    if (!badges) { badges = document.createElement('div'); badges.className = 'card-badges'; body.appendChild(badges); }
    if (badges.querySelector(`[data-badge-type="${type}"]`)) return;
    const badge = document.createElement('span');
    badge.className = `card-badge card-badge--${type}`;
    badge.dataset.badgeType = type;
    badge.textContent = label;
    badges.appendChild(badge);
    card.classList.add('has-card-badges');
  }
  function cleanText(value) { return value.replace(/\s*💤\s*/g, ' ').replace(/\s+—\s+inactive\s+(account|group)/gi, '').replace(/\s+/g, ' ').trim(); }
  function markInactive(card) {
    const title = card.querySelector('.card-title, .playlist-title');
    if (title) title.textContent = cleanText(title.textContent || '');
    card.querySelectorAll('.card-subtitle, .playlist-subtitle').forEach((subtitle) => { if (/inactive/i.test(subtitle.textContent || '')) subtitle.remove(); });
    const label = card.getAttribute('aria-label');
    if (label) card.setAttribute('aria-label', cleanText(label));
    addBadge(card, 'inactive', 'Inactive');
  }
  const cards = [...document.querySelectorAll('.link-card, .playlist-card')];
  cards.forEach((card) => {
    const text = card.textContent || '';
    const aria = card.getAttribute('aria-label') || '';
    if (card.classList.contains('is-inactive') || /💤|inactive/i.test(text) || /💤|inactive/i.test(aria)) markInactive(card);
  });
  const botCard = cards.find((card) => /Telegram\s*\(Chat Bot\)/i.test(card.textContent || ''));
  if (botCard) addBadge(botCard, 'bot', 'Bot');
  document.querySelectorAll('#discord .link-card, #vrchat a[href*="vrc.group"]').forEach((card) => addBadge(card, 'community', 'Community'));
})();

/* League of Legends profile modal */
(() => {
  const opggUrl = 'https://op.gg/lol/summoners/euw/Haxurus-YANG';
  const lolCard = document.querySelector('a.link-card[href*="op.gg/lol/summoners/euw/Haxurus-YANG"]');
  if (!lolCard) return;
  const css = `.lol-modal{position:fixed;inset:0;z-index:2500;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,0,0,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}.lol-modal.is-open{display:flex}.lol-modal__panel{position:relative;width:min(920px,100%);max-height:min(760px,92vh);overflow:auto;border:1px solid rgba(119,255,144,.44);border-radius:28px;background:linear-gradient(135deg,rgba(5,18,13,.96),rgba(2,8,6,.93));box-shadow:0 28px 90px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.20);color:#f4fff7}.lol-modal__close{position:absolute;top:16px;right:16px;z-index:2;width:42px;height:42px;border:1px solid rgba(255,255,255,.24);border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font-size:1.45rem;cursor:pointer}.lol-modal__header{padding:32px 32px 20px;border-bottom:1px solid rgba(255,255,255,.12);background:radial-gradient(circle at 20% 0,rgba(57,255,20,.20),transparent 38%),radial-gradient(circle at 86% 12%,rgba(0,234,255,.10),transparent 34%)}.lol-modal__title{margin:0;color:#39ff14;font-size:clamp(2.4rem,7vw,5rem);line-height:.9;letter-spacing:-.07em;text-shadow:0 0 18px rgba(57,255,20,.72)}.lol-modal__username{display:inline-flex;align-items:center;gap:8px;margin-top:14px;color:#dfffe7;font-weight:800;text-decoration:none}.lol-modal__username:hover{color:#39ff14}.lol-modal__body{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;padding:24px 32px 32px}.lol-modal__box{border:1px solid rgba(255,255,255,.14);border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.025));padding:18px}.lol-modal__box h3{margin:0 0 14px;color:#9dffb0;font-size:1rem;text-transform:uppercase;letter-spacing:.08em}.lol-rank{display:grid;grid-template-columns:54px 1fr;gap:14px;align-items:center;margin:12px 0}.lol-rank img,.lol-role img{width:54px;height:54px;object-fit:contain;filter:drop-shadow(0 0 12px rgba(57,255,20,.25))}.lol-rank strong,.lol-role strong{display:block;color:#fff;font-size:1.02rem}.lol-rank span,.lol-role span,.lol-meta{display:block;color:rgba(244,255,247,.76);font-size:.92rem}.lol-role{display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:start;margin:14px 0}.lol-role img{width:44px;height:44px}.lol-chipline{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.lol-chip{border:1px solid rgba(57,255,20,.22);border-radius:999px;background:rgba(57,255,20,.08);padding:7px 10px;color:#eaffee;font-weight:700;font-size:.86rem}.lol-clash{display:flex;align-items:center;gap:12px;margin-top:14px}.lol-clash img{width:46px;height:46px;object-fit:contain}.lol-server{font-weight:800;color:#fff}.lol-modal__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.lol-button{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(57,255,20,.42);border-radius:999px;background:rgba(57,255,20,.12);padding:10px 14px;color:#dfffe7;font-weight:900;text-decoration:none}.lol-button:hover{background:rgba(57,255,20,.20);color:#fff}@media (max-width:720px){.lol-modal{padding:12px}.lol-modal__panel{border-radius:22px}.lol-modal__header{padding:28px 20px 18px}.lol-modal__body{grid-template-columns:1fr;padding:20px}.lol-rank{grid-template-columns:48px 1fr}.lol-rank img{width:48px;height:48px}}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  const modal = document.createElement('div');
  modal.className = 'lol-modal';
  modal.id = 'lol-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'lol-modal-title');
  modal.innerHTML = `<div class="lol-modal__panel" tabindex="-1"><button class="lol-modal__close" type="button" aria-label="Close League of Legends profile">×</button><div class="lol-modal__header"><h2 class="lol-modal__title" id="lol-modal-title">League of Legends</h2><a class="lol-modal__username" href="${opggUrl}" target="_blank" rel="noopener noreferrer">Username: Haxurus#YANG ↗</a></div><div class="lol-modal__body"><div class="lol-modal__box"><h3>Ranked queues</h3><span class="lol-server">🌍 Server: EUW</span><div class="lol-rank"><img src="img/games/lol/emerald.png" alt="Emerald rank"><div><strong>SOLO/DUO queue: Emerald 3 - 7 LP</strong><span>23V 8S · 74% WR</span></div></div><div class="lol-rank"><img src="img/games/lol/silver.png" alt="Silver rank"><div><strong>Flex queue: Silver 4 - 61 LP</strong><span>18V 16S · 53% WR</span></div></div><div class="lol-clash"><img src="img/games/lol/clash.png" alt="Clash"><div><strong>Clash queue: Tier 2</strong><span class="lol-meta">Tournament profile</span></div></div><div class="lol-modal__actions"><a class="lol-button" href="${opggUrl}" target="_blank" rel="noopener noreferrer">Open OP.GG</a></div></div><div class="lol-modal__box"><h3>Roles & champion pool</h3><div class="lol-role"><img src="img/games/lol/adc.png" alt="ADC role"><div><strong>Main role: ADC</strong><span>Champion pool</span><div class="lol-chipline"><span class="lol-chip">Caitlyn</span><span class="lol-chip">Jhin</span><span class="lol-chip">Varus</span><span class="lol-chip">Xayah</span></div></div></div><div class="lol-role"><img src="img/games/lol/support.png" alt="Support role"><div><strong>Secondary role: Support</strong><span>Champion pool</span><div class="lol-chipline"><span class="lol-chip">Rakan</span><span class="lol-chip">Leona</span><span class="lol-chip">Tahm Kench</span><span class="lol-chip">Seraphine</span></div></div></div></div></div></div>`;
  document.body.appendChild(modal);
  const panel = modal.querySelector('.lol-modal__panel');
  const closeButton = modal.querySelector('.lol-modal__close');
  let lastFocus = null;
  function openModal(event) { event.preventDefault(); lastFocus = document.activeElement; modal.classList.add('is-open'); document.body.classList.add('modal-open'); window.requestAnimationFrame(() => panel.focus()); }
  function closeModal() { modal.classList.remove('is-open'); document.body.classList.remove('modal-open'); if (lastFocus && typeof lastFocus.focus === 'function') window.requestAnimationFrame(() => lastFocus.focus()); }
  lolCard.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
})();