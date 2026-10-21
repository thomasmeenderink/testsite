// Airport positions (latitude, longitude) for the route map in the detail pop-up.
// Add a line here when you add a flight from or to a new airport.
const AIRPORTS = {
  EHAM: [52.3105, 4.7683],  EGSS: [51.8850, 0.2350],
  AMS: [52.3105, 4.7683],   CEG: [53.1781, -2.9778],  CEQ: [43.5420, 6.9534],
  FAB: [51.2758, -0.7763],  FSC: [41.5006, 9.0978],   KIR: [52.1809, -9.5238],
  LCY: [51.5053, 0.0553],   LTN: [51.8747, -0.3683],  NCE: [43.6584, 7.2159],
  OXF: [51.8369, -1.3200],  PBI: [26.6832, -80.0956], RTM: [51.9569, 4.4372],
  TEB: [40.8501, -74.0608], TLN: [43.0973, 6.1460],   VNY: [34.2098, -118.4899],
  ASE: [39.2232, -106.8689]
};

// All empty legs on the site. Add, change or remove a flight here and it updates
// the homepage carousel, the "Alle empty legs" page and the search pop-ups at once.
// Fields: duration and oldPrice are optional; leave them out when they are not known.
// images: extra photos for the detail pop-up (the first one is also shown on the card).
const CJ3_PHOTOS = ['images/cj3-exterieur.webp', 'images/cj3-cabine.webp', 'images/cj3-plattegrond.webp'];
const DEALS = [
  { from: 'Amsterdam', fromRegion: 'Schiphol, Nederland', fromCode: 'EHAM', to: 'Londen Stansted', toRegion: 'Verenigd Koninkrijk', toCode: 'EGSS',
    duration: '55m', when: 'Wo 2 dec 2026 · 10:29', plane: 'Cessna Citation CJ3', cap: 'Light jet · tot 7 passagiers',
    oldPrice: '€11.000', price: '€6.500', img: CJ3_PHOTOS[0], images: CJ3_PHOTOS },
  { from: 'Londen Stansted', fromRegion: 'Verenigd Koninkrijk', fromCode: 'EGSS', to: 'Amsterdam', toRegion: 'Schiphol, Nederland', toCode: 'EHAM',
    duration: '55m', when: 'Wo 9 dec 2026 · 18:00', plane: 'Cessna Citation CJ3', cap: 'Light jet · tot 7 passagiers',
    oldPrice: '€11.000', price: '€5.350', img: CJ3_PHOTOS[0], images: CJ3_PHOTOS },
  { from: 'Van Nuys', fromRegion: 'Californië', fromCode: 'VNY', to: 'Aspen', toRegion: 'Colorado', toCode: 'ASE',
    duration: '1h 20m', when: 'Zo 2 aug · 16:15', plane: 'Bombardier Challenger 350', cap: 'Super-midsize · tot 10 passagiers',
    oldPrice: '€17.000', price: '€6.500', img: 'images/jet-challenger-350.jpg' },
  { from: 'Amsterdam', fromRegion: 'Nederland', fromCode: 'AMS', to: 'Cannes', toRegion: 'Frankrijk', toCode: 'CEQ',
    duration: '1h 50m', when: 'Ma 3 aug · Beschikbaar tussen 07:00 en 17:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€19.500', price: '€7.800', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Figari', fromRegion: 'Corsica, Frankrijk', fromCode: 'FSC', to: 'Hyères', toRegion: 'Frankrijk', toCode: 'TLN',
    duration: '45m', when: 'Zo 9 aug · Beschikbaar tussen 06:30 en 11:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€14.000', price: '€5.200', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Rotterdam', fromRegion: 'Nederland', fromCode: 'RTM', to: 'Kerry', toRegion: 'Ierland', toCode: 'KIR',
    duration: '1h 40m', when: 'Za 15 aug · Beschikbaar tussen 10:30 en 11:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€19.800', price: '€7.900', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Londen', fromRegion: 'Verenigd Koninkrijk', fromCode: 'LCY', to: 'Cannes', toRegion: 'Frankrijk', toCode: 'CEQ',
    duration: '1h 35m', when: 'Za 15 aug · 15:45', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€19.000', price: '€7.900', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Amsterdam', fromRegion: 'Nederland', fromCode: 'AMS', to: 'Farnborough', toRegion: 'Verenigd Koninkrijk', toCode: 'FAB',
    duration: '1h 05m', when: 'Wo 26 aug · Beschikbaar tussen 09:00 en 15:45', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€15.500', price: '€5.950', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Farnborough', fromRegion: 'Verenigd Koninkrijk', fromCode: 'FAB', to: 'Amsterdam', toRegion: 'Nederland', toCode: 'AMS',
    duration: '1h 05m', when: 'Do 27 aug · Beschikbaar tussen 19:15 en 20:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€15.200', price: '€5.850', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Amsterdam', fromRegion: 'Nederland', fromCode: 'AMS', to: 'Hawarden', toRegion: 'Wales, VK', toCode: 'CEG',
    duration: '1h 10m', when: 'Za 5 sep · Beschikbaar tussen 07:00 en 08:30', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€16.500', price: '€6.650', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Hawarden', fromRegion: 'Wales, VK', fromCode: 'CEG', to: 'Amsterdam', toRegion: 'Nederland', toCode: 'AMS',
    duration: '1h 10m', when: 'Za 12 sep · Beschikbaar tussen 17:00 en 20:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€16.200', price: '€6.500', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Amsterdam', fromRegion: 'Nederland', fromCode: 'AMS', to: 'Londen Oxford', toRegion: 'Verenigd Koninkrijk', toCode: 'OXF',
    duration: '1h 00m', when: 'Di 13 okt · Beschikbaar tussen 09:00 en 16:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€14.300', price: '€5.300', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Londen Oxford', fromRegion: 'Verenigd Koninkrijk', fromCode: 'OXF', to: 'Amsterdam', toRegion: 'Nederland', toCode: 'AMS',
    duration: '1h 00m', when: 'Za 17 okt · 20:00', plane: 'Cessna CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€12.500', price: '€4.450', img: 'images/jet-citation-cj3.jpg' }
];

function dealCardHtml(d, i){
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const photos = d.images || [d.img];
  const isPlan = src => /plattegrond|layout|floorplan/i.test(src);
  const label = `${d.from} naar ${d.to}, ${d.when}, ${d.price}. Meer informatie`;
  return `
    <div class="deal-card" data-deal="${i}" role="button" tabindex="0" aria-label="${esc(label)}">
      <div class="deal-scene">
        <div class="card-photos">
          ${photos.map((src, n) => `<img src="${esc(src)}" alt="${esc(d.plane)}${photos.length > 1 ? ', foto ' + (n + 1) : ''}" class="${esc(d.imgClass || '')}${isPlan(src) ? ' is-plan' : ''}" loading="lazy" draggable="false">`).join('')}
        </div>
        ${photos.length > 1 ? `
          <button type="button" class="photo-nav prev" aria-label="Vorige foto" tabindex="-1">‹</button>
          <button type="button" class="photo-nav next" aria-label="Volgende foto" tabindex="-1">›</button>
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
          <div class="price-block">${d.oldPrice ? `<div class="price-old">${esc(d.oldPrice)}</div>` : ''}<div class="price">${esc(d.price)}</div><div class="whole">Heel toestel</div></div>
        </div>
        <div class="deal-actions">
          <span class="reserve" aria-hidden="true">MEER INFORMATIE ›</span>
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
  el.innerHTML = DEALS.map((d, i) => dealCardHtml(d, i)).join('');
});
