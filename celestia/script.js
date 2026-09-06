const body = document.body;
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = [...document.querySelectorAll('[data-nav]')];
const sections = [...document.querySelectorAll('main section[id]')];

// Add or remove staff/community members here.
// `level` must be a number from 1 to 5.
// Level 1 is shown at the top; level 5 is shown at the bottom.
// Levels are used only to separate members into rows and are not shown on the page.
// Levels 1-3 are staff; levels 4-5 are shown below the "No staff" divider.
// Level 2 is always sorted alphabetically by name.
// Suggested image path: ../img/neocelestia/staff/filename.webp
const staffMembers = [
  {
    name: 'Haxurus',
    role: 'CEO',
    level: 1,
    image: '../img/neocelestia/staff/haxurus.webp'
  },

  // Level 2 - Moderatori. Keep these members in alphabetical order.
  {
    name: 'Altr3xa',
    role: 'Moderatore',
    level: 2,
    image: '../img/neocelestia/staff/altr3xa.webp'
  },
  {
    name: 'Golden Luna',
    role: 'Moderatore',
    level: 2,
    image: '../img/neocelestia/staff/golden-luna.webp'
  },
  {
    name: 'Julie Senpai',
    role: 'Moderatore',
    level: 2,
    image: '../img/neocelestia/staff/julie-senpai.webp'
  },
  {
    name: 'Lil Shark',
    role: 'Moderatore',
    level: 2,
    image: '../img/neocelestia/staff/lil-shark.webp'
  },
  {
    name: 'Yuko',
    role: 'Moderatore',
    level: 2,
    image: '../img/neocelestia/staff/yuko.webp'
  },

  {
    name: 'Neko Senpai',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/neocelestia/staff/neko-senpai.webp'
  },
  {
    name: 'Autoincazzata',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/neocelestia/staff/autoincazzata.webp'
  },
  {
    name: 'Killer Jack',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/neocelestia/staff/killer-jack.webp'
  },
  {
    name: 'Wodoox',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/neocelestia/staff/wodoox.webp'
  },
  {
    name: 'Julie Senpai',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/neocelestia/staff/julie-senpai.webp'
  },
  {
    name: 'Haxurus',
    role: 'Padre fondatore',
    level: 4,
    image: '../img/neocelestia/staff/haxurus.webp'
  },

  {
    name: 'Walife',
    role: 'Collaboratore · Editor grafiche',
    level: 5,
    image: '../img/neocelestia/staff/walife.webp'
  },
  {
    name: 'Kaira',
    role: 'Collaboratore · Editor mappa',
    level: 5,
    image: '../img/neocelestia/staff/kaira.webp'
  }
];

const staffGrid = document.getElementById('staff-grid');

if (staffGrid) {
  staffGrid.classList.add('staff-grid--levels');

  const staffStyles = document.createElement('style');
  staffStyles.textContent = `
    .staff-grid.staff-grid--levels{display:block}
    .staff-level + .staff-level{margin-top:34px;padding-top:34px;border-top:1px solid rgba(255,255,255,.08)}
    .staff-level__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,270px));justify-content:center;gap:16px}
    .staff-level__grid .staff-card__media{width:160px;height:160px;aspect-ratio:1;margin:24px auto 0;border:1px solid rgba(255,255,255,.12);border-radius:50%}
    .staff-level__grid .staff-card__media img{border-radius:50%}
    .staff-level__grid .staff-card__info{text-align:center}
    .staff-divider{display:flex;align-items:center;gap:18px;margin:42px 0 34px;color:#9d99ad;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
    .staff-divider::before,.staff-divider::after{height:1px;flex:1;background:rgba(255,255,255,.10);content:""}
    .staff-divider span{white-space:nowrap}
    @media(max-width:980px){.staff-level__grid{grid-template-columns:repeat(auto-fit,minmax(220px,270px));justify-content:center}}
    @media(max-width:620px){.staff-level + .staff-level{margin-top:28px;padding-top:28px}.staff-level__grid{grid-template-columns:minmax(0,1fr)}.staff-divider{margin:34px 0 28px}.staff-level__grid .staff-card__media{width:144px;height:144px}}
  `;
  document.head.appendChild(staffStyles);

  const groupedMembers = new Map();

  staffMembers.forEach((member) => {
    const parsedLevel = Number(member.level);
    const level = Number.isInteger(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 5 ? parsedLevel : 5;
    if (!groupedMembers.has(level)) groupedMembers.set(level, []);
    groupedMembers.get(level).push(member);
  });

  if (groupedMembers.has(2)) {
    groupedMembers.get(2).sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  }

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
