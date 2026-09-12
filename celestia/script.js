const body = document.body;
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = [...document.querySelectorAll('[data-nav]')];
const sections = [...document.querySelectorAll('main section[id]')];

// Add or remove staff/community members here.
// `level` must be a number from 1 to 5.
// Level 1 is shown at the top; level 5 is shown at the bottom.
// Levels are used only to separate members into rows and are not shown on the page.
// Levels 1-3 are staff; level 4 is below the "No staff" divider; level 5 is below the "Collaboratori esterni" divider.
// IMPORTANT: members inside every level/category must always be displayed in alphabetical order by name.
// Suggested image path: ../img/celestia/users/filename.webp
const staffMembers = [
  {
    name: 'Haxurus',
    role: 'CEO',
    level: 1,
    image: '../img/celestia/users/haxurus.webp'
  },

  // Level 2 - Moderatori. Keep these members in alphabetical order.
  {
    name: 'Altr3xa',
    role: 'Moderatore',
    level: 2,
    image: '../img/celestia/users/altr3xa.webp'
  },
  {
    name: 'GoldenLuna',
    role: 'Moderatore',
    level: 2,
    image: '../img/celestia/users/golden-luna.webp'
  },
  {
    name: 'Julie Senpai',
    role: 'Moderatore',
    level: 2,
    image: '../img/celestia/users/julie-senpai.webp'
  },
  {
    name: 'Lil Shark',
    role: 'Moderatore',
    level: 2,
    image: '../img/celestia/users/lil-shark.webp'
  },
  {
    name: 'Yuko',
    role: 'Moderatore',
    level: 2,
    image: '../img/celestia/users/yuko.webp'
  },

  // Level 4 - Padri fondatori. Keep these members in alphabetical order.
  {
    name: 'Autoincazzata',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/celestia/users/autoincazzata.webp'
  },
  {
    name: 'Haxurus',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/celestia/users/haxurus.webp'
  },
  {
    name: 'Julie Senpai',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/celestia/users/julie-senpai.webp'
  },
  {
    name: 'Killer Jack',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/celestia/users/killer-jack.webp'
  },
  {
    name: 'Neko Senpai',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/celestia/users/neko-senpai.webp'
  },
  {
    name: 'Wodoox',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/celestia/users/wodoox.webp'
  },

  // Level 5 - Collaboratori esterni. Keep these members in alphabetical order.
  {
    name: 'Kaira',
    role: 'Editor mappa',
    level: 5,
    image: '../img/celestia/users/kaira.webp'
  },
  {
    name: 'ThaWalife',
    role: 'Graphic Designer',
    level: 5,
    image: '../img/celestia/users/walife.webp'
  }
];

const staffGrid = document.getElementById('staff-grid');

if (staffGrid) {
  staffGrid.classList.add('staff-grid--levels');

  const staffStyles = document.createElement('style');
  staffStyles.textContent = `
    .staff-grid.staff-grid--levels{display:block}
    .staff-level + .staff-level{margin-top:34px;padding-top:34px;border-top:1px solid var(--line)}
    .staff-level__grid{display:flex;flex-wrap:wrap;justify-content:center;gap:16px}
    .staff-level__grid .staff-card{flex:0 1 270px;width:min(100%,270px)}
    .staff-level__grid .staff-card__media{width:160px;height:160px;aspect-ratio:1;margin:24px auto 0;border:1px solid var(--line);border-radius:50%}
    .staff-level__grid .staff-card__media img{border-radius:50%}
    .staff-level__grid .staff-card__info{text-align:center}
    .staff-divider{display:flex;align-items:center;gap:18px;margin:42px 0 34px;color:var(--muted);font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
    .staff-divider::before,.staff-divider::after{height:1px;flex:1;background:var(--line);content:""}
    .staff-divider span{white-space:nowrap}
    @media(max-width:620px){.staff-level + .staff-level{margin-top:28px;padding-top:28px}.staff-level__grid .staff-card{flex-basis:100%;width:100%}.staff-divider{margin:34px 0 28px}.staff-level__grid .staff-card__media{width:144px;height:144px}}
  `;
  document.head.appendChild(staffStyles);

  const groupedMembers = new Map();

  staffMembers.forEach((member) => {
    const parsedLevel = Number(member.level);
    const level = Number.isInteger(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 5 ? parsedLevel : 5;
    if (!groupedMembers.has(level)) groupedMembers.set(level, []);
    groupedMembers.get(level).push(member);
  });

  groupedMembers.forEach((members) => {
    members.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  });

  const orderedLevels = [...groupedMembers.keys()].sort((a, b) => a - b);

  const createStaffCard = (member) => {
    const card = document.createElement('article');
    card.className = 'staff-card reveal';

    const media = document.createElement('div');
    media.className = 'staff-card__media';

    const img = document.createElement('img');
    img.src = member.image;
    img.alt = `${member.name} - ${member.role}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      media.classList.add('is-placeholder');
      img.remove();
    }, { once: true });

    const initials = document.createElement('span');
    initials.className = 'staff-card__initials';
    initials.textContent = member.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?';

    media.append(img, initials);

    const info = document.createElement('div');
    info.className = 'staff-card__info';

    const name = document.createElement('h3');
    name.textContent = member.name;

    const role = document.createElement('span');
    role.className = 'staff-card__role';
    role.textContent = member.role;

    info.append(name, role);
    card.append(media, info);
    return card;
  };

  const fragment = document.createDocumentFragment();
  let noStaffDividerAdded = false;
  let collaboratorsDividerAdded = false;

  orderedLevels.forEach((level) => {
    if (level >= 4 && !noStaffDividerAdded) {
      const divider = document.createElement('div');
      divider.className = 'staff-divider';
      const label = document.createElement('span');
      label.textContent = 'No staff';
      divider.appendChild(label);
      fragment.appendChild(divider);
      noStaffDividerAdded = true;
    }

    if (level >= 5 && !collaboratorsDividerAdded) {
      const divider = document.createElement('div');
      divider.className = 'staff-divider';
      const label = document.createElement('span');
      label.textContent = 'Collaboratori esterni';
      divider.appendChild(label);
      fragment.appendChild(divider);
      collaboratorsDividerAdded = true;
    }

    const section = document.createElement('div');
    section.className = 'staff-level';
    section.setAttribute('data-level', String(level));

    const row = document.createElement('div');
    row.className = 'staff-level__grid';
    groupedMembers.get(level).forEach((member) => row.appendChild(createStaffCard(member)));

    section.appendChild(row);
    fragment.appendChild(section);
  });

  staffGrid.appendChild(fragment);
}

// Trailer YouTube. Inserire qui l'ID del video quando disponibile.
const trailerVideoId = '';
const heroSection = document.querySelector('.hero');

if (heroSection && !document.getElementById('trailer')) {
  const trailerStyles = document.createElement('style');
  trailerStyles.textContent = `
    .trailer-section{padding-top:72px;padding-bottom:72px;background:linear-gradient(180deg,rgba(25,24,38,.16),transparent)}
    .trailer-head{max-width:760px;margin:0 auto 30px;text-align:center}
    .trailer-head h2{margin-top:8px;font-size:clamp(2rem,5vw,3.6rem);letter-spacing:-.04em}
    .trailer-head p{margin-top:14px;color:var(--muted);line-height:1.7}
    .trailer-player{position:relative;width:min(100%,1080px);margin:0 auto;aspect-ratio:16/9;overflow:hidden;border:1px solid rgba(194,199,208,.16);border-radius:24px;background:linear-gradient(135deg,rgba(63,60,84,.34),rgba(25,24,38,.92));box-shadow:var(--shadow)}
    .trailer-player iframe{display:block;width:100%;height:100%;border:0}
    .trailer-placeholder{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;background:radial-gradient(circle at 50% 45%,rgba(96,93,135,.28),transparent 34%),linear-gradient(135deg,#191826,#111111)}
    .trailer-placeholder__inner{max-width:520px}
    .trailer-placeholder__play{display:grid;place-items:center;width:78px;height:78px;margin:0 auto 20px;border:1px solid rgba(194,199,208,.34);border-radius:50%;background:rgba(96,93,135,.20);color:#e5e5e5;font-size:1.8rem;box-shadow:0 0 34px rgba(96,93,135,.22)}
    .trailer-placeholder h3{font-size:clamp(1.4rem,3vw,2rem);letter-spacing:-.03em}
    .trailer-placeholder p{margin-top:10px;color:var(--muted);line-height:1.65}
    @media(max-width:760px){.trailer-section{padding-top:54px;padding-bottom:54px}.trailer-player{border-radius:18px}.trailer-placeholder__play{width:64px;height:64px;font-size:1.45rem}}
  `;
  document.head.appendChild(trailerStyles);

  const trailerSection = document.createElement('section');
  trailerSection.className = 'section trailer-section';
  trailerSection.id = 'trailer';

  const container = document.createElement('div');
  container.className = 'container';

  const head = document.createElement('div');
  head.className = 'trailer-head reveal';
  head.innerHTML = `
    <span class="section-kicker">Celestia Remastered</span>
    <h2>Guarda il trailer.</h2>
    <p>Scopri in anteprima la nuova versione di Celestia e preparati a tornare tra le stelle.</p>
  `;

  const player = document.createElement('div');
  player.className = 'trailer-player reveal';

  if (trailerVideoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailerVideoId)}?rel=0`;
    iframe.title = 'Trailer Celestia Remastered';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.appendChild(iframe);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'trailer-placeholder';
    placeholder.innerHTML = `
      <div class="trailer-placeholder__inner">
        <div class="trailer-placeholder__play" aria-hidden="true">▶</div>
        <h3>Trailer in arrivo</h3>
        <p>Il player YouTube è già predisposto. Verrà attivato appena sarà disponibile il link ufficiale del trailer.</p>
      </div>
    `;
    player.appendChild(placeholder);
  }

  container.append(head, player);
  trailerSection.appendChild(container);
  heroSection.insertAdjacentElement('afterend', trailerSection);
}

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/celestia.ita',
    external: true
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@celestiaita',
    external: true
  }
];

const heroActions = document.querySelector('.hero-actions');
if (heroActions) {
  socialLinks.forEach(({ label, href, external }) => {
    if (heroActions.querySelector(`[data-social="${label.toLowerCase()}"]`)) return;
    const link = document.createElement('a');
    link.className = 'button button-secondary';
    link.href = href;
    link.dataset.social = label.toLowerCase();
    link.textContent = label;
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    heroActions.appendChild(link);
  });
}

const footerLinks = document.querySelector('.footer-links');
if (footerLinks) {
  socialLinks.forEach(({ label, href, external }) => {
    if (footerLinks.querySelector(`[data-social="${label.toLowerCase()}"]`)) return;
    const link = document.createElement('a');
    link.href = href;
    link.dataset.social = label.toLowerCase();
    link.textContent = label;
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    footerLinks.insertBefore(link, footerLinks.querySelector('a[href="../"]'));
  });
}

if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const navObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
  });
}, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.4] });

sections.forEach((section) => navObserver.observe(section));

document.getElementById('year').textContent = new Date().getFullYear();