const body = document.body;
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = [...document.querySelectorAll('[data-nav]')];
const sections = [...document.querySelectorAll('main section[id]')];

// Add or remove staff members here.
// Assign the same `level` to members that should appear on the same row.
// Rows are shown in the order defined in staffLevelOrder.
// Suggested image path: ../img/neocelestia/staff/filename.webp
const staffLevelOrder = ['Founder', 'Admin', 'Moderator', 'Staffer'];

const staffMembers = [
  {
    name: 'Haxurus',
    role: 'Founder',
    level: 'Founder',
    image: '../img/neocelestia/staff/haxurus.webp'
  },
  {
    name: 'Nome staffer',
    role: 'Ruolo',
    level: 'Staffer',
    image: '../img/neocelestia/staff/staffer-2.webp'
  },
  {
    name: 'Nome staffer',
    role: 'Ruolo',
    level: 'Staffer',
    image: '../img/neocelestia/staff/staffer-3.webp'
  }
];

const staffGrid = document.getElementById('staff-grid');

if (staffGrid) {
  staffGrid.classList.add('staff-grid--levels');

  const staffStyles = document.createElement('style');
  staffStyles.textContent = `
    .staff-grid.staff-grid--levels{display:block}
    .staff-level + .staff-level{margin-top:44px}
    .staff-level__header{display:flex;align-items:center;gap:14px;margin-bottom:18px}
    .staff-level__title{margin:0;color:#d69aff;font-size:.78rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
    .staff-level__line{width:100%;height:1px;background:linear-gradient(90deg,rgba(202,131,255,.35),rgba(255,255,255,.06),transparent)}
    .staff-level__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
    @media(max-width:980px){.staff-level__grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.staff-level + .staff-level{margin-top:34px}.staff-level__grid{grid-template-columns:1fr}.staff-level__header{margin-bottom:14px}}
  `;
  document.head.appendChild(staffStyles);

  const levelRank = new Map(staffLevelOrder.map((level, index) => [level, index]));
  const groupedMembers = new Map();

  staffMembers.forEach((member) => {
    const level = member.level || member.role || 'Staff';
    if (!groupedMembers.has(level)) groupedMembers.set(level, []);
    groupedMembers.get(level).push(member);
  });

  const orderedLevels = [...groupedMembers.keys()].sort((a, b) => {
    const rankA = levelRank.has(a) ? levelRank.get(a) : Number.MAX_SAFE_INTEGER;
    const rankB = levelRank.has(b) ? levelRank.get(b) : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b, 'it');
  });

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

  orderedLevels.forEach((level) => {
    const section = document.createElement('div');
    section.className = 'staff-level reveal';

    const header = document.createElement('div');
    header.className = 'staff-level__header';

    const title = document.createElement('h3');
    title.className = 'staff-level__title';
    title.textContent = level;

    const line = document.createElement('span');
    line.className = 'staff-level__line';
    line.setAttribute('aria-hidden', 'true');

    header.append(title, line);

    const row = document.createElement('div');
    row.className = 'staff-level__grid';
    groupedMembers.get(level).forEach((member) => row.appendChild(createStaffCard(member)));

    section.append(header, row);
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
