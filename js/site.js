// Booking requests and sign-ups are delivered by FormSubmit (formsubmit.co) to this address.
// The first submission triggers a one-time activation mail from FormSubmit to this inbox.
const REQUEST_EMAIL = 'dutchjet0@gmail.com';
function sendRequest(subject, fields){
  return fetch('https://formsubmit.co/ajax/' + REQUEST_EMAIL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(Object.assign({ _subject: subject, _template: 'table', _captcha: 'false' }, fields))
  })
    .then(r => r.json())
    .then(d => { if (String(d.success) !== 'true') throw new Error(d.message || 'Versturen mislukt'); return d; });
}

// Form checks ("Please fill in this field") in the page's language instead of the browser's
document.addEventListener('invalid', e => {
  const el = e.target, v = el.validity;
  el.setCustomValidity('');
  let msg = t('vInvalid');
  if (v.valueMissing) msg = el.tagName === 'SELECT' ? t('vSelect') : el.type === 'checkbox' ? t('vCheck') : t('vRequired');
  else if (v.typeMismatch && el.type === 'email') msg = t('vEmail');
  else if (v.rangeUnderflow && el.min) msg = t('vDateMin', { date: new Date(el.min + 'T00:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' }) });
  el.setCustomValidity(msg);
}, true);
['input', 'change'].forEach(type => document.addEventListener(type, e => {
  if (e.target.setCustomValidity) e.target.setCustomValidity('');
}, true));

(function(){
  const form = document.getElementById('signupForm');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = form.querySelector('button[type=submit]');
    const email = form.elements.email.value.trim();
    const from = form.elements.from ? form.elements.from.value.trim() : '';
    const to = form.elements.to ? form.elements.to.value.trim() : '';
    // the mail to DutchJet stays in Dutch, whatever language the visitor uses
    const route = (from || to) ? (from || 'Overal') + ' → ' + (to || 'Overal') : 'Alle routes';
    btn.disabled = true; btn.textContent = t('send');
    sendRequest('Nieuwe deal-alert: ' + route, { 'Route': route, 'Taal': LANG.toUpperCase(), 'E-mail': email, _replyto: email })
      .then(() => {
        btn.textContent = t('signedUp');
        [...form.elements].forEach(el => { el.disabled = true; });
      })
      .catch(() => { btn.disabled = false; btn.textContent = t('retry'); });
  });
})();

(function(){
  const header = document.getElementById('top');
  const toggle = document.getElementById('menuToggle');
  if(!header || !toggle) return;
  function setOpen(open){
    header.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', ()=> setOpen(!header.classList.contains('open')));
  document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', ()=> setOpen(false)));
})();

// EN | NL: switching language keeps the search filters and an open flight (#deal=…)
document.querySelectorAll('.lang-switch a').forEach(a => a.addEventListener('click', () => {
  a.href = a.href.split(/[?#]/)[0] + location.search + (location.hash.startsWith('#deal=') ? location.hash : '');
}));

(function(){
  const track = document.getElementById('dealsTrack');
  const prevBtn = document.getElementById('dealsPrev');
  const nextBtn = document.getElementById('dealsNext');
  const dotsWrap = document.getElementById('dealsDots');
  if(!track || !prevBtn) return;
  const cards = Array.from(track.querySelectorAll('.deal-card'));

  // Pages are counted in whole cards, so arrows and dots always land on a card edge.
  function cardStep(){
    return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
  }
  function perPage(){
    const gap = cardStep() - cards[0].offsetWidth;
    return Math.max(1, Math.round((track.clientWidth + gap) / cardStep()) || 1);
  }
  function pageCount(){
    return Math.max(1, Math.ceil(cards.length / perPage()));
  }
  function firstVisible(){
    return Math.round(track.scrollLeft / cardStep());
  }
  function currentPage(){
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) return pageCount() - 1;
    return Math.min(pageCount() - 1, Math.round(firstVisible() / perPage()));
  }
  function goTo(page){
    const p = Math.max(0, Math.min(pageCount() - 1, page));
    const idx = Math.min(p * perPage(), Math.max(0, cards.length - perPage()));
    track.scrollTo({ left: cards[idx].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
    setActive(p);
  }
  function buildDots(){
    dotsWrap.innerHTML = '';
    for(let i = 0; i < pageCount(); i++){
      const dot = document.createElement('span');
      dot.addEventListener('click', ()=> goTo(i));
      dotsWrap.appendChild(dot);
    }
    updateDots();
  }
  let page = 0;
  function setActive(active){
    page = active;
    Array.from(dotsWrap.children).forEach((el,i)=> el.classList.toggle('active', i===active));
    prevBtn.classList.toggle('is-off', active === 0);
    nextBtn.classList.toggle('is-off', active === pageCount() - 1);
  }
  function updateDots(){ setActive(currentPage()); }

  prevBtn.addEventListener('click', ()=> goTo(page - 1));
  nextBtn.addEventListener('click', ()=> goTo(page + 1));

  // Desktop: hold the mouse button down on the deals and move left or right to scroll.
  // Touch screens already swipe natively, so this only listens to the mouse.
  let drag = null;       // { x, left, moved, lastX, lastT, speed }
  let justDragged = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('.photo-nav')) return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false, lastX: e.clientX, lastT: e.timeStamp, speed: 0 };
    track.classList.add('is-pressed');   // grabbing hand while the button is down
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;   // a tiny wobble is still a click
    if (!drag.moved) { drag.moved = true; track.classList.add('is-dragging'); }
    track.scrollLeft = drag.left - dx;
    const dt = e.timeStamp - drag.lastT;
    if (dt > 0) drag.speed = (e.clientX - drag.lastX) / dt;   // px per ms, for a little flick at the end
    drag.lastX = e.clientX; drag.lastT = e.timeStamp;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null;
    track.classList.remove('is-pressed');
    if (!d.moved) return;
    track.classList.remove('is-dragging');
    // land on a whole card, a bit further in the direction of a quick flick
    const target = track.scrollLeft - d.speed * 180;
    const idx = Math.max(0, Math.min(cards.length - 1, Math.round(target / cardStep())));
    track.scrollTo({ left: cards[idx].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
  });
  // the click that ends a drag must not open the card under the mouse
  track.addEventListener('click', e => { if (justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  track.addEventListener('dragstart', e => e.preventDefault());

  let scrollTimer;
  track.addEventListener('scroll', ()=>{
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateDots, 60);
  });
  window.addEventListener('resize', ()=>{
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(buildDots, 150);
  });

  buildDots();
})();

/* =====================================================================
   Requests: new-flight pop-up, empty-leg pop-up, detail pop-up, search bar,
   trip card and the "All empty legs" list. Every part checks that its
   elements exist, so the same file works on every page and in both languages.
   Texts come from js/i18n.js (t), flights from js/deals.js (LEGS).
   ===================================================================== */
(function(){
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = new Date().toISOString().slice(0, 10);
  const niceDate = iso => new Date(iso + 'T00:00').toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  // the pop-up lives at the end of <body> on every page
  let modal = $('reqModal');
  if (!modal) {
    modal = document.createElement('dialog');
    modal.className = 'req-modal'; modal.id = 'reqModal';
    modal.setAttribute('aria-labelledby', 'reqTitle');
    document.body.appendChild(modal);
  }
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  // one dialog serves every pop-up; the detail view is wider
  function show(detail){
    modal.classList.toggle('is-detail', !!detail);
    modal.scrollTop = 0;
    if (!modal.open) modal.showModal();
  }

  /* ---------- empty legs come from js/deals.js ---------- */
  const legs = typeof LEGS !== 'undefined' ? LEGS : [];
  const hit = (q, l, side) => !q || (side === 'from' ? l.fromSearch : l.toSearch).includes(q);
  const daysApart = (leg, iso) => Math.round(Math.abs(leg.date - new Date(iso + 'T00:00')) / 864e5);
  function findLegs(q){
    const qf = (q.from || '').toLowerCase(), qt = (q.to || '').toLowerCase(), pax = +q.pax || 0;
    return legs.filter(l =>
      hit(qf, l, 'from') && hit(qt, l, 'to') &&
      (!pax || l.seats >= pax) && (!q.date || daysApart(l, q.date) <= 3)
    ).sort((a, b) => a.priceNum - b.priceNum);
  }

  /* ---------- city suggestions ---------- */
  const POPULAR_FROM = t('popularFrom');
  const POPULAR_TO = t('popularTo');
  let cityList = $('cityList');
  if (!cityList) { cityList = document.createElement('datalist'); cityList.id = 'cityList'; document.body.appendChild(cityList); }
  const cities = [...new Set([POPULAR_FROM, ...POPULAR_TO, ...legs.flatMap(l => [l.from, l.to])])].sort((a, b) => a.localeCompare(b, LOCALE));
  cityList.innerHTML = cities.map(c => `<option value="${esc(c)}">`).join('');

  function closeButton(){
    modal.querySelector('.req-close').addEventListener('click', () => modal.close());
  }
  function showDone(title, text){
    modal.innerHTML = `
      <div class="req-done">
        <div class="tick">✓</div>
        <h3 id="reqTitle">${esc(title)}</h3>
        <p>${esc(text)}</p>
        <button type="button" class="req-ok">${t('close')}</button>
      </div>`;
    modal.querySelector('.req-ok').addEventListener('click', () => modal.close());
  }
  function showError(f){
    const btn = f.querySelector('.req-submit'), note = f.querySelector('.req-note');
    btn.disabled = false; btn.textContent = t('retry');
    note.classList.add('error');
    note.textContent = t('sendFailed', { email: REQUEST_EMAIL });
  }

  /* ---------- pop-up: new flight request ---------- */
  const paxOptions = sel => Array.from({ length: 19 }, (_, i) => String(i + 1))
    .map(n => `<option value="${n}" ${n === String(sel) ? 'selected' : ''}>${n}</option>`).join('');

  function openRequest(q){
    q = q || {};
    modal.innerHTML = `
      <div class="req-head">
        <span class="req-badge">${t('newRequest')}</span>
        <h3 id="reqTitle">${t('buildOwn')}</h3>
        <p>${t('buildOwnLead')}</p>
        <button type="button" class="req-close" aria-label="${t('close')}">×</button>
      </div>
      <form class="req-body" novalidate>
        <span class="req-legend">${t('yourTrip')}</span>
        <div class="req-fields">
          <label>${t('fFrom')}<input name="from" required list="cityList" placeholder="${t('phFrom')}" value="${esc(q.from || '')}"></label>
          <label>${t('fTo')}<input name="to" required list="cityList" placeholder="${t('phTo')}" value="${esc(q.to || '')}"></label>
          <label>${t('fDeparture')}<input name="date" type="date" required min="${today}" value="${esc(q.date || '')}"></label>
          <label>${t('fPax')}<select name="pax" required><option value="">${t('choose')}</option>${paxOptions(q.pax || '')}</select></label>
          <label class="req-check full"><input type="checkbox" name="return" ${q.returnDate ? 'checked' : ''}> ${t('wantReturn')}</label>
          <label class="full req-return" ${q.returnDate ? '' : 'hidden'}>${t('fReturn')}<input name="returnDate" type="date" min="${today}" value="${esc(q.returnDate || '')}" ${q.returnDate ? 'required' : ''}></label>
        </div>

        <span class="req-legend">${t('yourDetails')}</span>
        <div class="req-fields">
          <label>${t('fName')}<input name="name" required placeholder="${t('phName')}" autocomplete="name"></label>
          <label>${t('fEmail')}<input name="email" type="email" required placeholder="${t('phEmail')}" autocomplete="email"></label>
          <label class="full">${t('fPhone')}<input name="phone" type="tel" placeholder="${t('phPhone')}" autocomplete="tel"></label>
          <label class="full">${t('fNote')}<textarea name="message" placeholder="${t('phNote')}"></textarea></label>
        </div>
        <button type="submit" class="req-submit">${t('sendRequest')}</button>
        <p class="req-note">${t('requestNote')}</p>
      </form>`;

    const f = modal.querySelector('form');
    const ret = f.querySelector('.req-return');
    f.elements.return.addEventListener('change', () => {
      ret.hidden = !f.elements.return.checked;
      f.elements.returnDate.required = f.elements.return.checked;
    });
    f.elements.date.addEventListener('change', () => { f.elements.returnDate.min = f.elements.date.value || today; });
    closeButton();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!f.reportValidity()) return;
      const v = n => f.elements[n].value.trim();
      const route = v('from') + ' → ' + v('to');
      const pax = paxText(v('pax'));
      const trip = f.elements.return.checked
        ? t('roundTrip') + ' · ' + t('out') + ' ' + niceDate(v('date')) + ' · ' + t('back') + ' ' + niceDate(v('returnDate'))
        : t('oneWay') + ' · ' + niceDate(v('date'));
      const email = v('email');
      const btn = f.querySelector('.req-submit');
      btn.disabled = true; btn.textContent = t('send');
      sendRequest('Nieuwe vluchtaanvraag: ' + route + ' (' + pax + ')', {
        'Soort': 'Nieuwe vlucht', 'Taal': LANG.toUpperCase(), 'Route': route, 'Reis': trip, 'Passagiers': pax,
        'Naam': v('name'), 'E-mail': email,
        'Telefoon': v('phone') || '-', 'Opmerking': v('message') || '-',
        _replyto: email
      }).then(() => showDone(t('requestSent'), t('requestDone', { route, trip, pax, email })))
        .catch(() => showError(f));
    });
    show(false);
    const firstEmpty = ['from', 'to', 'date', 'pax', 'name'].map(n => f.elements[n]).find(el => !el.value);
    (firstEmpty || f.elements.name).focus();
  }

  /* ---------- pop-up: reserve an empty leg ---------- */
  function openLegs(q, list){
    q = q || {};
    const found = list || findLegs(q);
    const paxLabel = paxText(+q.pax || 1);
    const extras = list && list.length === 1
      ? list[0].when + ' · ' + list[0].plane
      : [q.date ? niceDate(q.date) : t('anyDate'), paxLabel].join(' · ');
    const title = list && list.length === 1
      ? list[0].from + ' → ' + list[0].to
      : (q.from || t('anywhere')) + ' → ' + (q.to || t('anywhere'));
    const head = `
      <div class="req-head">
        <span class="req-badge">${t('emptyLeg')}</span>
        <h3 id="reqTitle">${esc(title)}</h3>
        <p>${esc(extras)}</p>
        <button type="button" class="req-close" aria-label="${t('close')}">×</button>
      </div>`;

    if (!found.length) {
      modal.innerHTML = head + `
        <div class="req-body">
          <div class="req-empty"><strong>${t('noLegFound')}</strong>${t('noLegText')}</div>
          <button type="button" class="req-submit" data-to-new>${t('requestNew')}</button>
        </div>`;
      modal.querySelector('[data-to-new]').addEventListener('click', () => { modal.close(); openRequest(q); });
      closeButton();
      show(false);
      modal.querySelector('[data-to-new]').focus();
      return;
    }

    modal.innerHTML = head + `
      <form class="req-body" novalidate>
        <span class="req-legend">${found.length === 1 ? t('yourFlight') : t('legsFound', { n: found.length })}</span>
        <div class="req-options">
          ${found.map((l, i) => `
            <label class="req-option">
              <input type="radio" name="choice" value="${i}" ${i === 0 ? 'checked' : ''}>
              <span class="o-main">${esc(l.from)} → ${esc(l.to)}<small>${esc(l.when)} · ${esc(l.plane)} · ${esc(l.cap)}</small></span>
              <span class="o-price">${esc(l.price)}</span>
            </label>`).join('')}
        </div>
        <span class="req-legend">${t('yourDetails')}</span>
        <div class="req-fields">
          <label>${t('fName')}<input name="name" required placeholder="${t('phName')}" autocomplete="name"></label>
          <label>${t('fEmail')}<input name="email" type="email" required placeholder="${t('phEmail')}" autocomplete="email"></label>
          <label>${t('fPhone')}<input name="phone" type="tel" placeholder="${t('phPhone')}" autocomplete="tel"></label>
          <label>${t('fPax')}<select name="pax" required>${paxOptions(q.pax || '1')}</select></label>
        </div>
        <button type="submit" class="req-submit">${t('reserveLeg')}</button>
        <p class="req-note">${t('reserveNote')}</p>
      </form>`;
    const f = modal.querySelector('form');
    closeButton();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!f.reportValidity()) return;
      const l = found[+f.elements.choice.value];
      const route = l.from + ' → ' + l.to;
      const pax = paxText(f.elements.pax.value);
      if (l.seats && +f.elements.pax.value > l.seats) {
        const note = f.querySelector('.req-note');
        note.classList.add('error');
        note.textContent = t('tooMany', { n: l.seats });
        return;
      }
      const details = [l.when, l.plane, pax, l.price].join(' · ');
      const email = f.elements.email.value.trim();
      const btn = f.querySelector('.req-submit');
      btn.disabled = true; btn.textContent = t('send');
      sendRequest('Empty leg reserveren: ' + route + ' (' + l.when + ')', {
        'Soort': 'Empty leg', 'Taal': LANG.toUpperCase(), 'Route': route, 'Details': details,
        'Naam': f.elements.name.value.trim(), 'E-mail': email,
        'Telefoon': f.elements.phone.value.trim() || '-',
        _replyto: email
      }).then(() => showDone(t('reservationSent'), t('reservationDone', { route, details, email })))
        .catch(() => showError(f));
    });
    show(false);
    f.elements.name.focus();
  }

  /* ---------- return trips: an empty leg out and one back on the same route ---------- */
  const COMBO_DAYS = 14;
  const combos = [];
  legs.forEach(a => legs.forEach(b => {
    const days = (b.date - a.date) / 864e5;
    if (a.fromCode === b.toCode && a.toCode === b.fromCode && days > 0 && days <= COMBO_DAYS) combos.push([a, b]);
  }));
  combos.sort((x, y) => x[0].date - y[0].date);
  const comboSeats = ([a, b]) => Math.min(a.seats || 99, b.seats || 99);
  const comboPrice = ([a, b]) => a.priceNum + b.priceNum;
  const comboOld = ([a, b]) => (a.oldNum || a.priceNum) + (b.oldNum || b.priceNum);

  function comboCardHtml(c, i){
    const [a, b] = c, seats = comboSeats(c), price = comboPrice(c), old = comboOld(c);
    const pct = Math.round((1 - price / old) * 100);
    return `
      <div class="combo-card" data-combo="${i}" role="button" tabindex="0" aria-label="${esc(a.from + ' ⇄ ' + a.to + ', ' + euro(price))}">
        <div class="combo-img"><img src="${esc(a.img)}" alt="${esc(a.plane)}" loading="lazy" draggable="false">${pct > 0 ? `<span class="dt-discount">−${pct}%</span>` : ''}</div>
        <div class="combo-body">
          <div class="combo-route">${esc(a.from)} <span aria-hidden="true">⇄</span> ${esc(a.to)}</div>
          <div class="combo-legs">
            <div><small>${t('comboOut')}</small><strong>${esc(a.when)}</strong></div>
            <div><small>${t('comboBack')}</small><strong>${esc(b.when)}</strong></div>
          </div>
          <div class="combo-foot">
            <div><div class="cap">${esc(a.plane)} · ${esc(t('upToPax', { n: seats }))}</div><div class="pp">${esc(t('ppCard', { price: euro(price / seats) }))}</div></div>
            <div class="price-block">${old > price ? `<div class="price-old">${euro(old)}</div>` : ''}<div class="price">${euro(price)}</div></div>
          </div>
          <span class="reserve" aria-hidden="true">${t('comboReserve')}</span>
        </div>
      </div>`;
  }
  const comboWrap = document.querySelector('[data-combos]');
  if (comboWrap) {
    comboWrap.innerHTML = combos.map(comboCardHtml).join('');
    comboWrap.closest('section').hidden = !combos.length;
    comboWrap.addEventListener('click', e => { const c = e.target.closest('[data-combo]'); if (c) openCombo(combos[+c.dataset.combo]); });
    comboWrap.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-combo]')) { e.preventDefault(); e.target.click(); }
    });
  }

  function openCombo(c){
    const [a, b] = c, seats = comboSeats(c), price = comboPrice(c);
    modal.innerHTML = `
      <div class="req-head">
        <span class="req-badge">${t('comboBadge')}</span>
        <h3 id="reqTitle">${esc(a.from)} ⇄ ${esc(a.to)}</h3>
        <p>${esc(t('comboLead', { price: euro(price), n: seats }))}</p>
        <button type="button" class="req-close" aria-label="${t('close')}">×</button>
      </div>
      <form class="req-body" novalidate>
        <span class="req-legend">${t('comboYourTrip')}</span>
        <div class="req-options">
          ${c.map((l, i) => `
            <div class="req-option is-fixed">
              <span class="o-step">${i ? t('comboBack') : t('comboOut')}</span>
              <span class="o-main">${esc(l.from)} → ${esc(l.to)}<small>${esc(l.when)} · ${esc(l.plane)}</small></span>
              <span class="o-price">${esc(l.price)}</span>
            </div>`).join('')}
        </div>
        <span class="req-legend">${t('yourDetails')}</span>
        <div class="req-fields">
          <label>${t('fName')}<input name="name" required placeholder="${t('phName')}" autocomplete="name"></label>
          <label>${t('fEmail')}<input name="email" type="email" required placeholder="${t('phEmail')}" autocomplete="email"></label>
          <label>${t('fPhone')}<input name="phone" type="tel" placeholder="${t('phPhone')}" autocomplete="tel"></label>
          <label>${t('fPax')}<select name="pax" required>${paxOptions('1')}</select></label>
        </div>
        <button type="submit" class="req-submit">${t('comboSubmit', { price: euro(price) })}</button>
        <p class="req-note">${t('reserveNote')}</p>
      </form>`;
    const f = modal.querySelector('form');
    closeButton();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!f.reportValidity()) return;
      if (+f.elements.pax.value > seats) {
        const note = f.querySelector('.req-note');
        note.classList.add('error'); note.textContent = t('tooMany', { n: seats });
        return;
      }
      const route = a.from + ' ⇄ ' + a.to, pax = paxText(f.elements.pax.value);
      const details = [t('comboOut') + ' ' + a.when, t('comboBack') + ' ' + b.when, pax, euro(price)].join(' · ');
      const email = f.elements.email.value.trim();
      const btn = f.querySelector('.req-submit');
      btn.disabled = true; btn.textContent = t('send');
      sendRequest('Retour empty legs reserveren: ' + route, {
        'Soort': 'Retour (2 empty legs)', 'Taal': LANG.toUpperCase(), 'Route': route,
        'Heen': a.from + ' → ' + a.to + ' · ' + a.when + ' · ' + a.price,
        'Terug': b.from + ' → ' + b.to + ' · ' + b.when + ' · ' + b.price,
        'Passagiers': pax, 'Totaal': euro(price),
        'Naam': f.elements.name.value.trim(), 'E-mail': email,
        'Telefoon': f.elements.phone.value.trim() || '-',
        _replyto: email
      }).then(() => showDone(t('reservationSent'), t('reservationDone', { route, details, email })))
        .catch(() => showError(f));
    });
    show(false);
    f.elements.name.focus();
  }

  /* ---------- pop-up: details of one empty leg ---------- */
  const toRad = d => d * Math.PI / 180, toDeg = r => r * 180 / Math.PI;
  function distanceNm(a, b){
    const dLat = toRad(b[0] - a[0]), dLon = toRad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * 3440.065 * Math.asin(Math.sqrt(h));
  }
  // points along the great circle, so long routes curve like on a real flight map
  function greatCircle(a, b, n){
    const [φ1, λ1, φ2, λ2] = [a[0], a[1], b[0], b[1]].map(toRad);
    const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
    if (d === 0) return [a, b];
    return Array.from({ length: n + 1 }, (_, i) => {
      const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
      const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
      const z = A * Math.sin(φ1) + B * Math.sin(φ2);
      return [toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))];
    });
  }

  // the map library is only downloaded the first time someone opens a detail pop-up
  let leaflet;
  function loadLeaflet(){
    if (window.L) return Promise.resolve();
    if (!leaflet) leaflet = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      js.onload = resolve; js.onerror = () => { leaflet = null; reject(); };
      document.head.appendChild(js);
    });
    return leaflet;
  }
  const PLANE_SVG = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#1E2E3D" stroke="#fff" stroke-width="1" d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2.5,1.5V22L11.5,21l3.5,1.5v-1.5L12.5,19v-4.5L21,16z"/></svg>';

  function drawMap(el, a, b){
    const map = L.map(el, { scrollWheelZoom: false, zoomControl: false, attributionControl: true });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const path = greatCircle(a, b, 64);
    L.polyline(path, { color: '#1E2E3D', weight: 2.5, opacity: 0.85 }).addTo(map);
    const pin = color => L.divIcon({ className: '', html: `<span class="dt-pin" style="background:${color}"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] });
    L.marker(a, { icon: pin('#1E2E3D'), keyboard: false }).addTo(map);
    L.marker(b, { icon: pin('#F06C25'), keyboard: false }).addTo(map);
    map.fitBounds(L.latLngBounds(path), { padding: [36, 36] });
    // plane halfway, turned along the line as it looks on screen
    const mid = Math.floor(path.length / 2);
    const p1 = map.latLngToLayerPoint(path[mid - 1]), p2 = map.latLngToLayerPoint(path[mid + 1]);
    const angle = toDeg(Math.atan2(p2.y - p1.y, p2.x - p1.x)) + 90;
    L.marker(path[mid], { keyboard: false, interactive: false, icon: L.divIcon({
      className: '', iconSize: [22, 22], iconAnchor: [11, 11],
      html: `<span class="dt-plane-icon" style="transform: rotate(${angle}deg)">${PLANE_SVG}</span>`
    }) }).addTo(map);
    setTimeout(() => map.invalidateSize(), 50);
  }

  /* ---------- photo viewer: one photo large, on top of the detail pop-up ---------- */
  let lightbox;
  function openLightbox(images, start, title){
    if (!lightbox) {
      lightbox = document.createElement('dialog');
      lightbox.className = 'lightbox';
      lightbox.setAttribute('aria-label', t('photos'));
      document.body.appendChild(lightbox);
      lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.classList.contains('lb-stage')) lightbox.close(); });
    }
    let i = start;
    lightbox.innerHTML = `
      <div class="lb-stage">
        <img class="lb-photo" src="${esc(images[i])}" alt="${esc(title)}">
      </div>
      <button type="button" class="lb-close" aria-label="${t('close')}">×</button>
      ${images.length > 1 ? `
        <button type="button" class="lb-nav prev" aria-label="${t('prevPhoto')}">‹</button>
        <button type="button" class="lb-nav next" aria-label="${t('nextPhoto')}">›</button>
        <span class="lb-count">${i + 1} / ${images.length}</span>` : ''}`;
    const img = lightbox.querySelector('.lb-photo');
    const go = step => {
      i = (i + step + images.length) % images.length;
      img.src = images[i];
      lightbox.querySelector('.lb-count').textContent = (i + 1) + ' / ' + images.length;
    };
    lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
    if (images.length > 1) {
      lightbox.querySelector('.lb-nav.prev').addEventListener('click', () => go(-1));
      lightbox.querySelector('.lb-nav.next').addEventListener('click', () => go(1));
      lightbox.onkeydown = e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      };
    } else {
      lightbox.onkeydown = null;
    }
    lightbox.showModal();
  }

  function openDetail(l){
    const a = l.fromPos, b = l.toPos;
    const nm = a && b ? Math.round(distanceNm(a, b)) : null;
    const pct = l.oldNum ? Math.round((1 - l.priceNum / l.oldNum) * 100) : 0;
    const images = l.images.length ? l.images : [l.img];
    // floor plans are shown whole instead of cropped
    const isPlan = src => /plattegrond|layout|floorplan/i.test(src);
    const fmt = n => n.toLocaleString(LOCALE);
    const upTo = t('upTo', { n: l.seats || '?' });
    // price per person when the plane is full: flight price divided by the maximum passengers
    const perPerson = l.seats ? euro(l.priceNum / l.seats) : '';

    modal.innerHTML = `
      <div class="dt">
        <div class="dt-top">
          <div class="dt-gallery${isPlan(images[0]) ? ' is-plan' : ''}">
            <img class="dt-photo" src="${esc(images[0])}" alt="${esc(l.plane)}">
            <button type="button" class="dt-close req-close-btn" aria-label="${t('close')}">×</button>
            <button type="button" class="dt-share" aria-label="${t('shareLabel')}" aria-haspopup="menu" aria-expanded="false">${SHARE_ICON}<span>${t('share')}</span></button>
            ${images.length > 1 ? `
              <button type="button" class="dt-nav prev" aria-label="${t('prevPhoto')}">‹</button>
              <button type="button" class="dt-nav next" aria-label="${t('nextPhoto')}">›</button>
              <span class="dt-count">1 / ${images.length}</span>` : ''}
            <span class="dt-tag">${esc(l.plane)} · ${esc(l.cls)}</span>
            ${pct ? `<span class="dt-discount">−${pct}%</span>` : ''}
          </div>
          <div class="dt-info">
            <div class="dt-route">
              <div><span class="dt-code">${esc(l.fromCode)}</span><strong>${esc(l.from)}</strong><small>${esc(l.fromRegion)}</small></div>
              <div class="dt-mid route-mid"><div class="dur">${esc(l.duration)}</div><div class="dots"></div></div>
              <div class="dest"><span class="dt-code">${esc(l.toCode)}</span><strong>${esc(l.to)}</strong><small>${esc(l.toRegion)}</small></div>
            </div>
            <div class="dt-facts">
              <div>
                <span class="dt-label">${t('departure')} ${l.flexible ? `<em class="dt-flex">${t('flexible')}</em>` : ''}</span>
                <strong><span aria-hidden="true">🕓</span> ${esc(l.when)}</strong>
              </div>
              <div class="right">
                <span class="dt-label">${t('paxLabel')}</span>
                <strong>${esc(upTo)}</strong>
              </div>
            </div>
            <div class="dt-map" id="dtMap">${nm ? `<span class="dt-dist">● ${fmt(nm)} nm</span>` : ''}</div>
          </div>
        </div>

        <div class="dt-section">
          <span class="dt-label">${t('aboutFlight')}</span>
          <div class="dt-specs">
            ${[
              [t('aircraft'), esc(l.plane)],
              [t('cls'), esc(l.cls)],
              [t('passengers').replace(/^./, c => c.toUpperCase()), esc(upTo)],
              l.duration ? [t('duration'), esc(l.duration)] : null,
              nm ? [t('distance'), fmt(nm) + ' nm · ' + fmt(Math.round(nm * 1.852)) + ' km'] : null,
              l.oldPrice ? [t('normalPrice'), '<s>' + esc(l.oldPrice) + '</s>'] : null,
              pct ? [t('youSave'), '<span class="accent">' + pct + '%</span>'] : null,
              perPerson ? [t('perPerson'), perPerson + '<em>' + t('withPax', { n: l.seats }) + '</em>', 'is-pp'] : null
            ].filter(Boolean).map(([k, v, cls]) => `<div${cls ? ` class="${cls}"` : ''}><small>${k}</small><strong>${v}</strong></div>`).join('')}
          </div>
        </div>

        ${l.seats > 1 ? `
        <div class="dt-section dt-split">
          <span class="dt-label">${t('splitTitle')}</span>
          <div class="split-box">
            <div class="split-people" aria-hidden="true">${Array.from({ length: l.seats }, (_, i) => `<span data-n="${i + 1}"></span>`).join('')}</div>
            <input type="range" class="split-range" min="1" max="${l.seats}" value="${Math.min(4, l.seats)}" aria-label="${t('fPax')}">
            <div class="split-out">
              <span class="split-count"></span>
              <strong class="split-pp"></strong>
              <small>${esc(t('splitNote', { price: l.price }))}</small>
            </div>
          </div>
        </div>` : ''}

        <div class="dt-section">
          <span class="dt-label">${t('terms')}</span>
          <ul class="dt-terms">
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
              <p><strong>${t('term1Title')}</strong> ${t('term1')}</p>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>
              <p><strong>${t('term2Title')}</strong> ${t('term2')}</p>
            </li>
          </ul>
        </div>

        <div class="dt-bar">
          <div>
            <div class="dt-price"><strong>${esc(l.price)}</strong>${l.oldPrice ? `<s>${esc(l.oldPrice)}</s>` : ''}</div>
            <small>${esc(t('upToPax', { n: l.seats || '?' }).replace(/^./, c => c.toUpperCase()))}${perPerson ? ' · ' + t('perPersonShort', { price: perPerson }) : ''}</small>
          </div>
          <button type="button" class="dt-book">${t('reserve')}</button>
        </div>
      </div>`;

    modal.querySelector('.dt-close').addEventListener('click', () => modal.close());
    modal.querySelector('.dt-book').addEventListener('click', () => openLegs({ pax: '1' }, [l]));
    let i = 0;
    const gallery = modal.querySelector('.dt-gallery'), count = modal.querySelector('.dt-count');
    const photo = gallery.querySelector('.dt-photo');
    if (images.length > 1) {
      const go = step => {
        i = (i + step + images.length) % images.length;
        photo.src = images[i];
        gallery.classList.toggle('is-plan', isPlan(images[i]));
        count.textContent = (i + 1) + ' / ' + images.length;
      };
      modal.querySelector('.dt-nav.prev').addEventListener('click', () => go(-1));
      modal.querySelector('.dt-nav.next').addEventListener('click', () => go(1));
    }
    // clicking the photo opens it large, starting at the photo that is showing
    photo.addEventListener('click', () => openLightbox(images, i, l.plane));
    modal.querySelector('.dt-share').addEventListener('click', e => shareDeal(l, e.currentTarget));
    // split the cost: move the slider to see what each passenger pays
    const range = modal.querySelector('.split-range');
    if (range) {
      const update = () => {
        const n = +range.value;
        modal.querySelector('.split-count').textContent = t('splitWith', { n: paxText(n) });
        modal.querySelector('.split-pp').textContent = t('perPersonShort', { price: euro(l.priceNum / n) });
        modal.querySelectorAll('.split-people span').forEach(s => s.classList.toggle('on', +s.dataset.n <= n));
        range.style.setProperty('--fill', ((n - 1) / Math.max(1, l.seats - 1) * 100) + '%');
      };
      range.addEventListener('input', update);
      modal.querySelectorAll('.split-people span').forEach(s => s.addEventListener('click', () => { range.value = s.dataset.n; update(); }));
      update();
    }
    show(true);
    // the address bar now points at this flight, so it can be copied or bookmarked as well
    history.replaceState(null, '', '#deal=' + l.slug);
    modal.querySelector('.dt-book').focus({ preventScroll: true });

    const mapEl = modal.querySelector('#dtMap');
    if (a && b) {
      loadLeaflet().then(() => { if (mapEl.isConnected) drawMap(mapEl, a, b); })
        .catch(() => { mapEl.classList.add('is-off'); mapEl.insertAdjacentHTML('beforeend', `<p>${t('mapFailed')}</p>`); });
    } else {
      mapEl.classList.add('is-off');
    }
  }

  /* ---------- share one flight: a link that opens its detail pop-up ---------- */
  const SHARE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  const WHATSAPP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.4 17.1L2 22l5-1.3A11 11 0 0 0 20.5 3.5zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3A9 9 0 1 1 12 20.5zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.3 7.3 0 0 1-3.6-3.2c-.3-.5.3-.4.8-1.4a.5.5 0 0 0 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.6-.7 1.8-1.3s.2-1.2.2-1.3-.2-.2-.5-.3z" fill="currentColor" stroke="none"/></svg>';
  const LINK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
  // every flight has a share page next to the pages of its language (deal/<slug>.html) with its own
  // title, price and photo for WhatsApp and LinkedIn; it sends visitors on to the flight here
  const dealLink = l => new URL('deal/' + l.slug + '.html', location.href).href;
  const dealText = l => `${l.from} → ${l.to} · ${l.when} · ${l.price}${l.oldPrice ? ' (' + t('normally', { price: l.oldPrice }) + ')' : ''} · ${l.plane}`;

  function shareDeal(l, btn){
    const url = dealLink(l), text = dealText(l);
    // phones and tablets: the system share sheet (WhatsApp, Instagram, Messages, …)
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      navigator.share({ title: 'Empty leg ' + l.from + ' → ' + l.to, text, url }).catch(() => {});
      return;
    }
    const gallery = btn.parentElement;
    const old = gallery.querySelector('.dt-share-menu');
    if (old) { old.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
    const menu = document.createElement('div');
    menu.className = 'dt-share-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = `
      <a role="menuitem" href="https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}" target="_blank" rel="noopener">${WHATSAPP_ICON}${t('shareWhatsApp')}</a>
      <button type="button" role="menuitem" data-copy>${LINK_ICON}<span>${t('copyLink')}</span></button>
      ${navigator.share ? `<button type="button" role="menuitem" data-native>${SHARE_ICON}${t('moreOptions')}</button>` : ''}`;
    gallery.appendChild(menu);
    btn.setAttribute('aria-expanded', 'true');
    menu.querySelector('[data-copy]').addEventListener('click', e => {
      const label = e.currentTarget.querySelector('span');
      const done = () => { label.textContent = t('linkCopied'); setTimeout(() => menu.remove(), 1200); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => prompt(t('copyThisLink'), url));
      else prompt(t('copyThisLink'), url);
    });
    const native = menu.querySelector('[data-native]');
    if (native) native.addEventListener('click', () => { navigator.share({ title: 'Empty leg', text, url }).catch(() => {}); menu.remove(); });
    // close the menu when clicking elsewhere in the pop-up
    setTimeout(() => modal.addEventListener('click', function off(e){
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); btn.setAttribute('aria-expanded', 'false'); modal.removeEventListener('click', off); }
    }), 0);
  }

  // closing the pop-up takes "#deal=…" off the address again (Esc and backdrop via the close event,
  // the buttons via close() itself)
  const clearDealHash = () => {
    if (location.hash.startsWith('#deal=')) history.replaceState(null, '', location.pathname + location.search);
  };
  modal.addEventListener('close', clearDealHash);
  const nativeClose = modal.close.bind(modal);
  modal.close = value => { clearDealHash(); nativeClose(value); };
  // a shared link (…#deal=eham-egss-1202) opens that flight straight away
  function openFromHash(){
    const m = location.hash.match(/^#deal=([\w-]+)/);
    const l = m && legs.find(x => x.slug === m[1].toLowerCase());
    if (l) openDetail(l);
  }
  window.addEventListener('hashchange', openFromHash);
  setTimeout(openFromHash, 0);

  /* ---------- buttons anywhere on the page ---------- */
  document.addEventListener('click', e => {
    const dealBtn = e.target.closest('[data-deal]');
    if (dealBtn) { const l = legs[+dealBtn.dataset.deal]; if (l) openDetail(l); return; }
    const reqBtn = e.target.closest('[data-open-request]');
    if (reqBtn) { e.preventDefault(); openRequest({ from: reqBtn.dataset.from || '', to: reqBtn.dataset.to || '', date: reqBtn.dataset.date || '', pax: reqBtn.dataset.pax || '' }); }
  });

  /* ---------- search bar (homepage section "Plan your flight") ---------- */
  const form = $('flightSearch');
  if (form) {
    const fromIn = $('sbFrom'), toIn = $('sbTo'), whenIn = $('sbWhen'), paxIn = $('sbPax');
    const popular = $('popularList');
    if (popular) {
      popular.innerHTML = POPULAR_TO.map(to =>
        `<button type="button" class="chip" data-to="${esc(to)}">${esc(POPULAR_FROM)} → ${esc(to)}</button>`).join('');
      popular.addEventListener('click', e => {
        const chip = e.target.closest('.chip'); if (!chip) return;
        fromIn.value = POPULAR_FROM; toIn.value = chip.dataset.to;
        form.requestSubmit();
      });
    }
    // date field shows a placeholder until it is used
    whenIn.addEventListener('focus', () => { whenIn.type = 'date'; });
    whenIn.addEventListener('blur', () => { if (!whenIn.value) whenIn.type = 'text'; });
    paxIn.addEventListener('change', () => paxIn.classList.toggle('empty', !paxIn.value));
    $('sbSwap').addEventListener('click', () => { [fromIn.value, toIn.value] = [toIn.value, fromIn.value]; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      openRequest({
        from: fromIn.value.trim(), to: toIn.value.trim(),
        date: whenIn.type === 'date' ? whenIn.value : '', pax: paxIn.value
      });
    });
  }

  /* ---------- trip card (hero; charter page uses data-mode="new") ---------- */
  document.querySelectorAll('.trip-card').forEach(trip => {
    let mode = trip.dataset.mode || 'leg';
    const date = trip.elements.date, back = trip.elements.returnDate;

    // date fields show their placeholder until used, like the search and filter bars
    [date, back].forEach(el => {
      el.addEventListener('focus', () => { el.type = 'date'; el.min = el === back && date.value ? date.value : today; });
      el.addEventListener('blur', () => { if (!el.value) el.type = 'text'; });
    });
    const dateValue = el => el.type === 'date' ? el.value : '';

    function setMode(m){
      mode = m;
      trip.classList.toggle('is-new', m === 'new');
      trip.querySelectorAll('.trip-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      trip.querySelectorAll('[data-only]').forEach(el => { el.hidden = el.dataset.only !== m; });
      trip.querySelector('.trip-go').textContent = m === 'new' ? t('requestFlight') : t('searchLegs');
    }
    trip.querySelectorAll('.trip-switch button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    setMode(mode);

    trip.querySelector('.trip-swap').addEventListener('click', () => {
      [trip.elements.from.value, trip.elements.to.value] = [trip.elements.to.value, trip.elements.from.value];
    });

    trip.addEventListener('submit', e => {
      e.preventDefault();
      const q = {
        from: trip.elements.from.value.trim(), to: trip.elements.to.value.trim(),
        date: dateValue(date), pax: trip.elements.pax.value,
        returnDate: mode === 'new' ? dateValue(back) : ''
      };
      if (mode === 'new') { openRequest(q); return; }
      // empty legs: show the results on the empty legs page with these filters
      const params = new URLSearchParams();
      ['from', 'to', 'date', 'pax'].forEach(k => { if (q[k]) params.set(k, q[k]); });
      location.href = 'empty-legs.html' + (params.toString() ? '?' + params : '') + '#results';
    });
  });

  /* ---------- empty legs page: grid with filters ---------- */
  const list = document.querySelector('[data-deals="list"]');
  if (list && typeof dealCardHtml === 'function') {
    const fFrom = $('flFrom'), fTo = $('flTo'), fDate = $('flDate'), fPax = $('flPax'), fSort = $('flSort'), count = $('flCount');
    const WINDOW_DAYS = 7;
    const DAY = 864e5;
    const longDate = d => d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
    const shortDate = d => d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
    // the date field shows "Any time" until it is used, like the search bar on the homepage
    fDate.addEventListener('focus', () => { fDate.type = 'date'; });
    fDate.addEventListener('blur', () => { if (!fDate.value) fDate.type = 'text'; });
    fDate.min = today;
    const chosenDate = () => fDate.type === 'date' && fDate.value ? new Date(fDate.value + 'T00:00') : null;

    // biggest discount first: lowest share of the original price
    const share = l => l.oldNum ? l.priceNum / l.oldNum : 1;
    function sortRows(rows, target){
      const byDate = target
        ? (a, b) => Math.abs(a.date - target) - Math.abs(b.date - target) || a.date - b.date  // closest to your date first
        : (a, b) => a.date - b.date;
      if (fSort.value === 'price') return rows.slice().sort((a, b) => a.priceNum - b.priceNum);
      if (fSort.value === 'discount') return rows.slice().sort((a, b) => share(a) - share(b));
      return rows.slice().sort(byDate);
    }
    /* map with every flight that matches the filters; click a route to open the flight */
    const mapEl = $('legsMap');
    let routeMap, routeLayer;
    // a gentle arc that bends to the left of the direction of travel, so a flight out and
    // the flight back on the same route lie side by side instead of on top of each other
    function arc(a, b){
      const dx = b[1] - a[1], dy = b[0] - a[0], k = 0.16;
      const c = [(a[0] + b[0]) / 2 + dx * k, (a[1] + b[1]) / 2 - dy * k];
      return Array.from({ length: 33 }, (_, i) => {
        const s = i / 32, u = 1 - s;
        return [u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]];
      });
    }
    function drawRoutes(rows){
      if (!mapEl) return;
      loadLeaflet().then(() => {
        if (!routeMap) {
          routeMap = L.map(mapEl, { scrollWheelZoom: false, zoomControl: false });
          L.control.zoom({ position: 'topright' }).addTo(routeMap);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(routeMap);
          routeLayer = L.layerGroup().addTo(routeMap);
        }
        routeLayer.clearLayers();
        const points = [], airports = new Map(), planes = [];
        rows.filter(l => l.fromPos && l.toPos).forEach(l => {
          const path = arc(l.fromPos, l.toPos);
          const line = L.polyline(path, { color: '#1E2E3D', weight: 3, opacity: 0.8 }).addTo(routeLayer);
          // a wide invisible line on top makes the route easy to hit
          const hitLine = L.polyline(path, { color: '#000', opacity: 0, weight: 18 }).addTo(routeLayer);
          hitLine.bindTooltip(`<strong>${esc(l.from)} → ${esc(l.to)}</strong><br>${esc(l.when)} · ${esc(l.price)}`, { sticky: true, className: 'route-tip' });
          hitLine.on('mouseover', () => line.setStyle({ color: '#F06C25', weight: 4, opacity: 1 }));
          hitLine.on('mouseout', () => line.setStyle({ color: '#1E2E3D', weight: 3, opacity: 0.8 }));
          hitLine.on('click', () => openDetail(l));
          airports.set(l.fromCode, [l.fromPos, l.from]); airports.set(l.toCode, [l.toPos, l.to]);
          planes.push(path);
          points.push(...path);
        });
        airports.forEach(([pos, name]) => L.circleMarker(pos, { radius: 5, color: '#fff', weight: 2, fillColor: '#F06C25', fillOpacity: 1 })
          .bindTooltip(name, { direction: 'top', offset: [0, -6] }).addTo(routeLayer));
        mapEl.classList.toggle('is-empty', !points.length);
        if (!points.length) return;
        // Europe first; flights elsewhere (the US) are there when you zoom out
        const europe = points.filter(p => p[1] > -15 && p[1] < 40 && p[0] > 30);
        routeMap.fitBounds(L.latLngBounds(europe.length ? europe : points), { padding: [36, 36], maxZoom: 7 });
        // a small plane halfway along each route shows the direction of the flight
        planes.forEach(path => {
          const mid = 16, p1 = routeMap.latLngToLayerPoint(path[mid - 1]), p2 = routeMap.latLngToLayerPoint(path[mid + 1]);
          const angle = toDeg(Math.atan2(p2.y - p1.y, p2.x - p1.x)) + 90;
          L.marker(path[mid], { keyboard: false, interactive: false, icon: L.divIcon({
            className: '', iconSize: [20, 20], iconAnchor: [10, 10],
            html: `<span class="dt-plane-icon" style="transform: rotate(${angle}deg)">${PLANE_SVG}</span>`
          }) }).addTo(routeLayer);
        });
        setTimeout(() => routeMap.invalidateSize(), 50);
      }).catch(() => { mapEl.classList.add('is-off'); mapEl.innerHTML = `<p>${t('mapFailed')}</p>`; });
    }

    const cards = rows => rows.map(l => dealCardHtml(l, l.index)).join('');
    const group = (title, sub) => `<div class="legs-group"><h3>${esc(title)}</h3>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;

    function render(){
      const qf = fFrom.value.trim().toLowerCase(), qt = fTo.value.trim().toLowerCase(), pax = +fPax.value || 0;
      const target = chosenDate();
      const rows = legs.filter(l => hit(qf, l, 'from') && hit(qt, l, 'to') && (!pax || l.seats >= pax));
      let html = '', shown = 0, visible = rows;

      if (target) {
        // 1. flights on the chosen day, 2. flights up to a week before or after it
        const days = l => Math.round((l.date - target) / DAY);
        const exact = sortRows(rows.filter(l => days(l) === 0), target);
        const near = sortRows(rows.filter(l => days(l) !== 0 && Math.abs(days(l)) <= WINDOW_DAYS), target);
        shown = exact.length + near.length;
        visible = exact.concat(near);
        const from = new Date(+target - WINDOW_DAYS * DAY), to = new Date(+target + WINDOW_DAYS * DAY);
        if (exact.length) html += group(t('on', { date: longDate(target) }), exact.length === 1 ? t('flight1') : t('flightsN', { n: exact.length })) + cards(exact);
        else if (near.length) html += `<div class="legs-note">${esc(t('noLegsOnDay', { date: longDate(target) }))}</div>`;
        if (near.length) html += group(t('weekAround'), shortDate(from) + ' – ' + shortDate(to)) + cards(near);
      } else {
        const sorted = sortRows(rows);
        shown = sorted.length;
        html = cards(sorted);
      }

      const filtered = !!(qf || qt || pax || target);
      count.innerHTML = `<strong>${shown}</strong> ${shown === 1 ? t('legs1') : t('legsN')}${filtered ? t('ofTotal', { n: legs.length }) : ''}`;
      // only offer "Clear filters" when something is set
      $('flReset').hidden = !filtered && fSort.value === 'date';
      list.innerHTML = shown
        ? html
        : `<div class="legs-empty"><strong>${esc(target ? t('noLegsAround', { date: longDate(target) }) : t('noLegsRoute'))}</strong><p>${t('noLegsLead')}</p>
           <button type="button" data-open-request data-from="${esc(fFrom.value.trim())}" data-to="${esc(fTo.value.trim())}" data-date="${target ? fDate.value : ''}" data-pax="${pax || ''}">${t('requestAFlight')}</button></div>`;
      drawRoutes(visible);
    }
    [fFrom, fTo, fDate, fPax, fSort].forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });
    $('flReset').addEventListener('click', () => {
      fFrom.value = ''; fTo.value = ''; fDate.value = ''; fDate.type = 'text'; fPax.value = ''; fSort.value = 'date'; render();
    });
    if ($('flSwap')) $('flSwap').addEventListener('click', () => { [fFrom.value, fTo.value] = [fTo.value, fFrom.value]; render(); });
    // filters handed over by the search on the homepage: empty-legs.html?from=…&to=…&date=…&pax=…
    const params = new URLSearchParams(location.search);
    if (params.get('from')) fFrom.value = params.get('from');
    if (params.get('to')) fTo.value = params.get('to');
    if (/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '')) { fDate.type = 'date'; fDate.value = params.get('date'); }
    if (params.get('pax') && [...fPax.options].some(o => o.value === params.get('pax'))) fPax.value = params.get('pax');
    render();
  }
})();

/* ---------- contact page form ---------- */
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const v = n => form.elements[n].value.trim();
    const btn = form.querySelector('.req-submit'), note = form.querySelector('.req-note');
    btn.disabled = true; btn.textContent = t('send');
    sendRequest('Contactformulier: ' + v('topic') + ' (' + v('name') + ')', {
      'Soort': 'Contactformulier', 'Taal': LANG.toUpperCase(), 'Onderwerp': v('topic'),
      'Naam': v('name'), 'E-mail': v('email'), 'Telefoon': v('phone') || '-',
      'Bericht': v('message'), _replyto: v('email')
    }).then(() => {
      form.innerHTML = `
        <div class="form-done">
          <div class="tick">✓</div>
          <h3>${t('messageSent')}</h3>
          <p>${esc(t('thanks', { name: v('name'), email: v('email') }))}</p>
        </div>`;
    }).catch(() => {
      btn.disabled = false; btn.textContent = t('retry');
      note.classList.add('error');
      note.textContent = t('sendFailed', { email: REQUEST_EMAIL });
    });
  });
})();
