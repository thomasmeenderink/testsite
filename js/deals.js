// All empty legs on the site. Add, change or remove a flight here and it updates
// the homepage carousel, the "Alle empty legs" page and the search pop-ups at once.
const DEALS = [
  { from: 'Teterboro', fromRegion: 'New Jersey', fromCode: 'TEB', to: 'West Palm Beach', toRegion: 'Florida', toCode: 'PBI',
    duration: '2h 05m', when: 'Do 30 jul · 14:00', plane: 'Cessna Citation CJ3', cap: 'Midsize · tot 8 passagiers',
    oldPrice: '€11.500', price: '€4.200', img: 'images/jet-citation-cj3.jpg' },
  { from: 'Londen', fromRegion: 'Verenigd Koninkrijk', fromCode: 'LTN', to: 'Nice', toRegion: 'Frankrijk', toCode: 'NCE',
    duration: '1h 55m', when: 'Za 1 aug · 09:30', plane: 'Embraer Phenom 300', cap: 'Light jet · tot 7 passagiers',
    oldPrice: '€11.000', price: '€3.800', img: 'images/jet-phenom-300.jpg', imgClass: 'crop-phenom' },
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
  return `
    <div class="deal-card">
      <div class="deal-scene">
        <img src="${esc(d.img)}" alt="${esc(d.plane)}"${d.imgClass ? ` class="${esc(d.imgClass)}"` : ''} loading="lazy">
      </div>
      <div class="deal-body">
        <div class="codes"><span>${esc(d.fromCode)}</span><span>${esc(d.toCode)}</span></div>
        <div class="route-cities">
          <div class="place">${esc(d.from)}<div class="region">${esc(d.fromRegion)}</div></div>
          <div class="route-mid"><div class="dur">${esc(d.duration)}</div><div class="dots"></div></div>
          <div class="place dest">${esc(d.to)}<div class="region">${esc(d.toRegion)}</div></div>
        </div>
        <div class="deal-when">${esc(d.when)}</div>
        <div class="deal-plane">
          <div><div class="name">${esc(d.plane)}</div><div class="cap">${esc(d.cap)}</div></div>
          <div class="price-block"><div class="price-old">${esc(d.oldPrice)}</div><div class="price">${esc(d.price)}</div><div class="whole">Heel toestel</div></div>
        </div>
        <div class="deal-actions">
          <button type="button" class="reserve" data-deal="${i}">RESERVEER ›</button>
        </div>
      </div>
    </div>`;
}

// Fill every container that asks for deals: <div data-deals="carousel"> on the homepage.
document.querySelectorAll('[data-deals="carousel"]').forEach(el => {
  el.innerHTML = DEALS.map((d, i) => dealCardHtml(d, i)).join('');
});
