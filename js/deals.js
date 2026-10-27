/* =====================================================================
   Empty legs. Edit the flights here; the homepage carousel, the
   "All empty legs" page and every pop-up update by themselves, in
   English and in Dutch.

   A flight:
     from / to   airport code from AIRPORTS below
     date        'YYYY-MM-DD', or 'MM-DD' when the year is not known yet
                 (then the next time that day comes round is used)
     time        departure time, e.g. '10:29' (optional: without it only the date is shown)
     window      instead of time: ['07:00', '17:00'] when it can leave any time in between
     plane       aircraft type, class: 'light' | 'midsize' | 'super-midsize' | 'heavy'
     seats       maximum passengers
     price       price in euros, oldPrice (optional) the regular charter price
     duration    optional, e.g. '55m' or '1h 20m'
     images      photos; the first is shown on the card

   Flights that have left are hidden by themselves; remove them here whenever convenient.
   ===================================================================== */

// Airports: position for the route map, and the city and region as shown on the site.
// Add a line here when you add a flight from or to a new airport.
const AIRPORTS = {
  EHAM: { pos: [52.3105, 4.7683],   city: { en: 'Amsterdam', nl: 'Amsterdam' }, region: { en: 'Schiphol, Netherlands', nl: 'Schiphol, Nederland' } },
  EGSS: { pos: [51.8850, 0.2350],   city: { en: 'London Stansted', nl: 'Londen Stansted' }, region: { en: 'United Kingdom', nl: 'Verenigd Koninkrijk' } },
  LFMD: { pos: [43.5420, 6.9535],   city: { en: 'Cannes', nl: 'Cannes' }, region: { en: 'Cannes-Mandelieu, France', nl: 'Cannes-Mandelieu, Frankrijk' } },
  EBAW: { pos: [51.1894, 4.4603],   city: { en: 'Antwerp', nl: 'Antwerpen' }, region: { en: 'Belgium', nl: 'België' } },
  LEIB: { pos: [38.8729, 1.3731],   city: { en: 'Ibiza', nl: 'Ibiza' }, region: { en: 'Spain', nl: 'Spanje' } },
  LSGG: { pos: [46.2381, 6.1090],   city: { en: 'Geneva', nl: 'Genève' }, region: { en: 'Switzerland', nl: 'Zwitserland' } }
};
const CLASSES = {
  light:           { en: 'Light jet', nl: 'Light jet' },
  midsize:         { en: 'Midsize', nl: 'Midsize' },
  'super-midsize': { en: 'Super-midsize', nl: 'Super-midsize' },
  heavy:           { en: 'Heavy jet', nl: 'Heavy jet' }
};

const CJ3_PHOTOS = ['images/cj3-exterieur.webp', 'images/cj3-cabine.webp', 'images/cj3-plattegrond.webp'];
const PC24_PHOTOS = ['images/pc24-hangar.webp', 'images/pc24-voorkant.webp', 'images/pc24-cabine-lengte.webp', 'images/pc24-cabine-catering.webp', 'images/pc24-stoelen.webp', 'images/pc24-stoel-detail.webp', 'images/pc24-catering.webp'];
const CJ2PLUS_PHOTOS = ['images/cj2plus-exterieur.webp', 'images/cj2plus-cabine-lang.webp', 'images/cj2plus-cabine.webp'];
const FALCON900LX_PHOTOS = ['images/falcon900lx-hangar.webp', 'images/falcon900lx-neus.webp', 'images/falcon900lx-cabine-lang.webp', 'images/falcon900lx-cabine.webp', 'images/falcon900lx-tafel.webp', 'images/falcon900lx-gangpad.webp', 'images/falcon900lx-lounge-zij.webp'];
const DEALS = [
  { from: 'EHAM', to: 'EGSS', date: '2026-12-02', time: '10:30', plane: 'Cessna Citation CJ3', class: 'light', seats: 7,
    duration: '55m', oldPrice: 11000, price: 5800, images: CJ3_PHOTOS },
  { from: 'EGSS', to: 'EHAM', date: '2026-12-04', time: '18:00', plane: 'Cessna Citation CJ3', class: 'light', seats: 7,
    duration: '55m', oldPrice: 10650, price: 5650, images: CJ3_PHOTOS },
  { from: 'EHAM', to: 'LFMD', date: '2026-10-31', time: '14:00', plane: 'Cessna Citation CJ2+', class: 'light', seats: 7,
    duration: '1h 45m', oldPrice: 14500, price: 9500, images: CJ2PLUS_PHOTOS },
  { from: 'EBAW', to: 'LEIB', date: '2026-12-29', time: '14:00', plane: 'Pilatus PC-24', class: 'light', seats: 8,
    duration: '2h 05m', oldPrice: 19350, price: 11750, images: PC24_PHOTOS },
  { from: 'EBAW', to: 'LSGG', date: '2026-11-07', window: ['09:00', '12:00'], plane: 'Dassault Falcon 900LX', class: 'heavy', seats: 12,
    duration: '1h 15m', oldPrice: 16250, price: 9550, images: FALCON900LX_PHOTOS }
];

/* ---------- turn the data into what the pages show, in the page's language ---------- */
function dealDate(d){
  const today = new Date(new Date().toDateString());
  const parts = d.date.split('-').map(Number);
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  const date = new Date(today.getFullYear(), parts[0] - 1, parts[1]);
  if (date < today) date.setFullYear(date.getFullYear() + 1);
  return date;
}
function whenText(d, date){
  const opts = { weekday: 'short', day: 'numeric', month: 'short' };
  if (d.date.length === 10) opts.year = 'numeric';
  // "Wed 2 Dec 2026" / "Wo 2 dec 2026"
  let s = date.toLocaleDateString(LOCALE, opts).replace(/\./g, '').replace(/,/g, '');
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (d.window) return s + ' · ' + t('window', { a: d.window[0], b: d.window[1] });
  return d.time ? s + ' · ' + d.time : s;
}
// A flight disappears from the site by itself once it has left: at its departure time,
// at the end of its time window, or at the end of the day when no time is given.
function departsAt(d){
  const at = dealDate(d), hm = (d.window ? d.window[1] : d.time || '23:59').split(':').map(Number);
  at.setHours(hm[0], hm[1]);
  return at;
}
const LEGS = DEALS.filter(d => departsAt(d) > new Date()).map((d, i) => {
  const A = AIRPORTS[d.from] || {}, B = AIRPORTS[d.to] || {};
  const date = dealDate(d);
  const name = (ap, code) => (ap.city && ap.city[LANG]) || code;
  const reg = ap => (ap.region && ap.region[LANG]) || '';
  const cls = (CLASSES[d.class] && CLASSES[d.class][LANG]) || d.class || '';
  return {
    index: i,
    // stable short name used in share links, e.g. "eham-egss-1202"
    slug: [d.from, d.to, String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0')].join('-').toLowerCase(),
    fromCode: d.from, toCode: d.to,
    from: name(A, d.from), fromRegion: reg(A), to: name(B, d.to), toRegion: reg(B),
    fromPos: A.pos || null, toPos: B.pos || null,
    // all names in both languages, so "London" and "Londen" both find a flight
    fromSearch: [d.from].concat(Object.values(A.city || {}), Object.values(A.region || {})).join(' ').toLowerCase(),
    toSearch: [d.to].concat(Object.values(B.city || {}), Object.values(B.region || {})).join(' ').toLowerCase(),
    date, flexible: !!d.window, when: whenText(d, date),
    plane: d.plane, cls, seats: d.seats || 0,
    cap: cls + ' · ' + t('upToPax', { n: d.seats }),
    duration: d.duration || '',
    priceNum: d.price, price: euro(d.price),
    oldNum: d.oldPrice || 0, oldPrice: d.oldPrice ? euro(d.oldPrice) : '',
    images: (d.images || []).map(src => ROOT + src),
    img: ROOT + ((d.images || [])[0] || ''), imgClass: d.imgClass || ''
  };
});

function dealCardHtml(d, i){
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const photos = d.images.length ? d.images : [d.img];
  const isPlan = src => /plattegrond|layout|floorplan/i.test(src);
  const label = t('cardLabel', { from: d.from, to: d.to, when: d.when, price: d.price });
  return `
    <div class="deal-card" data-deal="${i}" role="button" tabindex="0" aria-label="${esc(label)}">
      <div class="deal-scene">
        <div class="card-photos">
          ${photos.map((src, n) => `<img src="${esc(src)}" alt="${esc(d.plane)}${photos.length > 1 ? ', ' + t('photo') + ' ' + (n + 1) : ''}" class="${esc(d.imgClass || '')}${isPlan(src) ? ' is-plan' : ''}" loading="lazy" draggable="false">`).join('')}
        </div>
        ${photos.length > 1 ? `
          <button type="button" class="photo-nav prev" aria-label="${t('prevPhoto')}" tabindex="-1">‹</button>
          <button type="button" class="photo-nav next" aria-label="${t('nextPhoto')}" tabindex="-1">›</button>
          <div class="photo-dots">${photos.map((_, n) => `<span${n === 0 ? ' class="on"' : ''}></span>`).join('')}</div>` : ''}
      </div>
      <div class="deal-body">
        <div class="codes"><span>${esc(d.fromCode)}</span><span>${esc(d.toCode)}</span></div>
        <div class="route-cities">
          <div class="place">${esc(d.from)}<div class="region">${esc(d.fromRegion)}</div></div>
          <div class="route-mid"><div class="dur">${esc(d.duration || '')}</div><div class="dots"></div></div>
          <div class="place dest">${esc(d.to)}<div class="region">${esc(d.toRegion)}</div></div>
        </div>
        <div class="deal-when">${esc(d.when)}</div>
        <div class="deal-plane">
          <div><div class="name">${esc(d.plane)}</div><div class="cap">${esc(d.cap)}</div></div>
          <div class="price-block">${d.oldPrice ? `<div class="price-old">${esc(d.oldPrice)}</div>` : ''}<div class="price">${esc(d.price)}</div>${d.seats ? `<div class="pp">${esc(t('ppCard', { price: euro(d.priceNum / d.seats) }))}</div>` : ''}</div>
        </div>
        <div class="deal-actions">
          <span class="reserve" aria-hidden="true">${t('moreInfo')}</span>
        </div>
      </div>
    </div>`;
}

// Photo strips inside the cards: arrows scroll one photo, swiping works natively and the
// dots follow the scroll position. This runs in the capture phase so a click on an arrow
// never opens the detail pop-up.
document.addEventListener('click', e => {
  const nav = e.target.closest('.photo-nav');
  if (!nav) return;
  e.stopPropagation(); e.preventDefault();
  const strip = nav.parentElement.querySelector('.card-photos');
  const count = strip.children.length;
  const current = Math.round(strip.scrollLeft / strip.clientWidth);
  // wrap around at either end
  const target = (current + (nav.classList.contains('next') ? 1 : -1) + count) % count;
  strip.scrollTo({ left: target * strip.clientWidth, behavior: 'smooth' });
  setPhotoDot(strip, target);
}, true);
function setPhotoDot(strip, n){
  strip.parentElement.querySelectorAll('.photo-dots span').forEach((dot, k) => dot.classList.toggle('on', k === n));
}
document.addEventListener('scroll', e => {
  const strip = e.target;
  if (!strip.classList || !strip.classList.contains('card-photos')) return;
  setPhotoDot(strip, Math.round(strip.scrollLeft / strip.clientWidth));
}, true);
// cards are focusable: Enter or Space opens the detail pop-up like a click
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.deal-card[data-deal]')) {
    e.preventDefault(); e.target.click();
  }
});

// Fill every container that asks for deals: <div data-deals="carousel"> on the homepage.
// The first flight to leave comes first.
document.querySelectorAll('[data-deals="carousel"]').forEach(el => {
  // no flights at the moment: hide the whole block instead of an empty row
  if (!LEGS.length) { const section = el.closest('section'); if (section) section.hidden = true; return; }
  el.innerHTML = LEGS.slice().sort((a, b) => a.date - b.date).map(d => dealCardHtml(d, d.index)).join('');
});
