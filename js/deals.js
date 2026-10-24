/* =====================================================================
   Empty legs. Edit the flights here; the homepage carousel, the
   "All empty legs" page and every pop-up update by themselves, in
   English and in Dutch.

   A flight:
     from / to   airport code from AIRPORTS below
     date        'YYYY-MM-DD', or 'MM-DD' when the year is not known yet
                 (then the next time that day comes round is used)
     time        departure time, e.g. '10:29'
     window      instead of time: ['07:00', '17:00'] when it can leave any time in between
     plane       aircraft type, class: 'light' | 'midsize' | 'super-midsize' | 'heavy'
     seats       maximum passengers
     price       price in euros, oldPrice (optional) the regular charter price
     duration    optional, e.g. '55m' or '1h 20m'
     images      photos; the first is shown on the card
   ===================================================================== */

// Airports: position for the route map, and the city and region as shown on the site.
// Add a line here when you add a flight from or to a new airport.
const AIRPORTS = {
  EHAM: { pos: [52.3105, 4.7683],   city: { en: 'Amsterdam', nl: 'Amsterdam' }, region: { en: 'Schiphol, Netherlands', nl: 'Schiphol, Nederland' } },
  EGSS: { pos: [51.8850, 0.2350],   city: { en: 'London Stansted', nl: 'Londen Stansted' }, region: { en: 'United Kingdom', nl: 'Verenigd Koninkrijk' } },
  AMS:  { pos: [52.3105, 4.7683],   city: { en: 'Amsterdam', nl: 'Amsterdam' }, region: { en: 'Netherlands', nl: 'Nederland' } },
  ASE:  { pos: [39.2232, -106.8689], city: { en: 'Aspen', nl: 'Aspen' }, region: { en: 'Colorado', nl: 'Colorado' } },
  CEG:  { pos: [53.1781, -2.9778],  city: { en: 'Hawarden', nl: 'Hawarden' }, region: { en: 'Wales, UK', nl: 'Wales, VK' } },
  CEQ:  { pos: [43.5420, 6.9534],   city: { en: 'Cannes', nl: 'Cannes' }, region: { en: 'France', nl: 'Frankrijk' } },
  FAB:  { pos: [51.2758, -0.7763],  city: { en: 'Farnborough', nl: 'Farnborough' }, region: { en: 'United Kingdom', nl: 'Verenigd Koninkrijk' } },
  FSC:  { pos: [41.5006, 9.0978],   city: { en: 'Figari', nl: 'Figari' }, region: { en: 'Corsica, France', nl: 'Corsica, Frankrijk' } },
  KIR:  { pos: [52.1809, -9.5238],  city: { en: 'Kerry', nl: 'Kerry' }, region: { en: 'Ireland', nl: 'Ierland' } },
  LCY:  { pos: [51.5053, 0.0553],   city: { en: 'London', nl: 'Londen' }, region: { en: 'United Kingdom', nl: 'Verenigd Koninkrijk' } },
  LTN:  { pos: [51.8747, -0.3683],  city: { en: 'London', nl: 'Londen' }, region: { en: 'United Kingdom', nl: 'Verenigd Koninkrijk' } },
  NCE:  { pos: [43.6584, 7.2159],   city: { en: 'Nice', nl: 'Nice' }, region: { en: 'France', nl: 'Frankrijk' } },
  OXF:  { pos: [51.8369, -1.3200],  city: { en: 'London Oxford', nl: 'Londen Oxford' }, region: { en: 'United Kingdom', nl: 'Verenigd Koninkrijk' } },
  PBI:  { pos: [26.6832, -80.0956], city: { en: 'West Palm Beach', nl: 'West Palm Beach' }, region: { en: 'Florida', nl: 'Florida' } },
  RTM:  { pos: [51.9569, 4.4372],   city: { en: 'Rotterdam', nl: 'Rotterdam' }, region: { en: 'Netherlands', nl: 'Nederland' } },
  TEB:  { pos: [40.8501, -74.0608], city: { en: 'Teterboro', nl: 'Teterboro' }, region: { en: 'New Jersey', nl: 'New Jersey' } },
  TLN:  { pos: [43.0973, 6.1460],   city: { en: 'Hyères', nl: 'Hyères' }, region: { en: 'France', nl: 'Frankrijk' } },
  VNY:  { pos: [34.2098, -118.4899], city: { en: 'Van Nuys', nl: 'Van Nuys' }, region: { en: 'California', nl: 'Californië' } }
};
const CLASSES = {
  light:           { en: 'Light jet', nl: 'Light jet' },
  midsize:         { en: 'Midsize', nl: 'Midsize' },
  'super-midsize': { en: 'Super-midsize', nl: 'Super-midsize' },
  heavy:           { en: 'Heavy jet', nl: 'Heavy jet' }
};

const CJ3_PHOTOS = ['images/cj3-exterieur.webp', 'images/cj3-cabine.webp', 'images/cj3-plattegrond.webp'];
const DEALS = [
  { from: 'EHAM', to: 'EGSS', date: '2026-12-02', time: '10:30', plane: 'Cessna Citation CJ3', class: 'light', seats: 7,
    duration: '55m', oldPrice: 11000, price: 5800, images: CJ3_PHOTOS },
  { from: 'EGSS', to: 'EHAM', date: '2026-12-04', time: '18:00', plane: 'Cessna Citation CJ3', class: 'light', seats: 7,
    duration: '55m', oldPrice: 10650, price: 5650, images: CJ3_PHOTOS },
  { from: 'VNY', to: 'ASE', date: '08-02', time: '16:15', plane: 'Bombardier Challenger 350', class: 'super-midsize', seats: 10,
    duration: '1h 20m', oldPrice: 17000, price: 6500, images: ['images/jet-challenger-350.jpg'] },
  { from: 'AMS', to: 'CEQ', date: '08-03', window: ['07:00', '17:00'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 50m', oldPrice: 19500, price: 7800, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'FSC', to: 'TLN', date: '08-09', window: ['06:30', '11:00'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '45m', oldPrice: 14000, price: 5200, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'RTM', to: 'KIR', date: '08-15', window: ['10:30', '11:00'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 40m', oldPrice: 19800, price: 7900, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'LCY', to: 'CEQ', date: '08-15', time: '15:45', plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 35m', oldPrice: 19000, price: 7900, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'AMS', to: 'FAB', date: '08-26', window: ['09:00', '15:45'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 05m', oldPrice: 15500, price: 5950, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'FAB', to: 'AMS', date: '08-27', window: ['19:15', '20:00'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 05m', oldPrice: 15200, price: 5850, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'AMS', to: 'CEG', date: '09-05', window: ['07:00', '08:30'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 10m', oldPrice: 16500, price: 6650, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'CEG', to: 'AMS', date: '09-12', window: ['17:00', '20:00'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 10m', oldPrice: 16200, price: 6500, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'AMS', to: 'OXF', date: '10-13', window: ['09:00', '16:00'], plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 00m', oldPrice: 14300, price: 5300, images: ['images/jet-citation-cj3.jpg'] },
  { from: 'OXF', to: 'AMS', date: '10-17', time: '20:00', plane: 'Cessna CJ3', class: 'midsize', seats: 8,
    duration: '1h 00m', oldPrice: 12500, price: 4450, images: ['images/jet-citation-cj3.jpg'] }
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
  return s + ' · ' + (d.window ? t('window', { a: d.window[0], b: d.window[1] }) : d.time);
}
const LEGS = DEALS.map((d, i) => {
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
document.querySelectorAll('[data-deals="carousel"]').forEach(el => {
  el.innerHTML = LEGS.map((d, i) => dealCardHtml(d, i)).join('');
});
