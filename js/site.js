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

(function(){
  const form = document.getElementById('signupForm');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const email = form.elements.email.value;
    btn.disabled = true; btn.textContent = 'Versturen…';
    sendRequest('Nieuwe aanmelding voor empty leg-alerts', { 'E-mail': email, _replyto: email })
      .then(() => { btn.textContent = 'Aangemeld ✓'; form.elements.email.disabled = true; })
      .catch(() => { btn.disabled = false; btn.textContent = 'Opnieuw proberen'; });
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
   Requests: new-flight pop-up, empty-leg pop-up, search bar, trip card
   and the "Alle empty legs" list. Every part checks that its elements
   exist, so the same file works on every page.
   ===================================================================== */
(function(){
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = new Date().toISOString().slice(0, 10);
  const niceDate = iso => new Date(iso + 'T00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const paxText = n => n + (+n === 1 ? ' passagier' : ' passagiers');

  // the pop-up lives at the end of <body> on every page
  let modal = $('reqModal');
  if (!modal) {
    modal = document.createElement('dialog');
    modal.className = 'req-modal'; modal.id = 'reqModal';
    modal.setAttribute('aria-labelledby', 'reqTitle');
    document.body.appendChild(modal);
  }
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  /* ---------- empty legs come from js/deals.js ---------- */
  const MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const legs = (typeof DEALS !== 'undefined' ? DEALS : []).map((d, i) => {
    const m = d.when.match(/(\d{1,2}) ([a-z]{3})/);
    return Object.assign({}, d, {
      index: i,
      day: m ? +m[1] : null, month: m ? MONTHS.indexOf(m[2]) : -1,
      seats: +((d.cap.match(/tot (\d+)/) || [])[1] || 0),
      priceNum: +d.price.replace(/\D/g, '')
    });
  });
  const hit = (q, name, region) => !q || name.toLowerCase().includes(q) || region.toLowerCase().includes(q);
  function daysApart(leg, iso){
    if (leg.month < 0) return Infinity;
    const d = new Date(iso + 'T00:00');
    return Math.round(Math.abs(new Date(d.getFullYear(), leg.month, leg.day) - d) / 864e5);
  }
  function findLegs(q){
    const qf = (q.from || '').toLowerCase(), qt = (q.to || '').toLowerCase(), pax = +q.pax || 0;
    return legs.filter(l =>
      hit(qf, l.from, l.fromRegion) && hit(qt, l.to, l.toRegion) &&
      (!pax || l.seats >= pax) && (!q.date || daysApart(l, q.date) <= 3)
    ).sort((a, b) => a.priceNum - b.priceNum);
  }

  /* ---------- city suggestions ---------- */
  const POPULAR_FROM = 'Amsterdam';
  const POPULAR_TO = ['Londen', 'Nice', 'Ibiza', 'Cannes', 'Genève', 'Mykonos'];
  let cityList = $('cityList');
  if (!cityList) { cityList = document.createElement('datalist'); cityList.id = 'cityList'; document.body.appendChild(cityList); }
  const cities = [...new Set([POPULAR_FROM, ...POPULAR_TO, ...legs.flatMap(l => [l.from, l.to])])].sort((a, b) => a.localeCompare(b, 'nl'));
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
        <button type="button" class="req-ok">Sluiten</button>
      </div>`;
    modal.querySelector('.req-ok').addEventListener('click', () => modal.close());
  }
  function showError(f){
    const btn = f.querySelector('.req-submit'), note = f.querySelector('.req-note');
    btn.disabled = false; btn.textContent = 'Opnieuw proberen';
    note.classList.add('error');
    note.textContent = 'Versturen is niet gelukt. Probeer het opnieuw of mail ons via ' + REQUEST_EMAIL + '.';
  }

  /* ---------- pop-up: new flight request ---------- */
  const paxOptions = sel => Array.from({ length: 19 }, (_, i) => String(i + 1))
    .map(n => `<option value="${n}" ${n === String(sel) ? 'selected' : ''}>${n}</option>`).join('');

  function openRequest(q){
    q = q || {};
    modal.innerHTML = `
      <div class="req-head">
        <span class="req-badge">NIEUWE VLUCHTAANVRAAG</span>
        <h3 id="reqTitle">Stel je <em>eigen vlucht</em> samen</h3>
        <p>Vul je reis aan en laat je gegevens achter. We sturen je een voorstel op maat.</p>
        <button type="button" class="req-close" aria-label="Sluiten">×</button>
      </div>
      <form class="req-body" novalidate>
        <span class="req-legend">JE REIS</span>
        <div class="req-fields">
          <label>VAN<input name="from" required list="cityList" placeholder="Vertrekplaats" value="${esc(q.from || '')}"></label>
          <label>NAAR<input name="to" required list="cityList" placeholder="Bestemming" value="${esc(q.to || '')}"></label>
          <label>VERTREKDATUM<input name="date" type="date" required min="${today}" value="${esc(q.date || '')}"></label>
          <label>PASSAGIERS<select name="pax" required><option value="">Kies</option>${paxOptions(q.pax || '')}</select></label>
          <label class="req-check full"><input type="checkbox" name="return" ${q.returnDate ? 'checked' : ''}> Ik wil ook een retourvlucht</label>
          <label class="full req-return" ${q.returnDate ? '' : 'hidden'}>RETOURDATUM<input name="returnDate" type="date" min="${today}" value="${esc(q.returnDate || '')}" ${q.returnDate ? 'required' : ''}></label>
        </div>

        <span class="req-legend">JE GEGEVENS</span>
        <div class="req-fields">
          <label>NAAM<input name="name" required placeholder="Voor- en achternaam" autocomplete="name"></label>
          <label>E-MAIL<input name="email" type="email" required placeholder="jij@voorbeeld.nl" autocomplete="email"></label>
          <label class="full">TELEFOON<input name="phone" type="tel" placeholder="+31 6 12345678" autocomplete="tel"></label>
          <label class="full">OPMERKING<textarea name="message" placeholder="Bijvoorbeeld gewenste vertrektijd, bagage of huisdieren"></textarea></label>
        </div>
        <button type="submit" class="req-submit">Verstuur aanvraag</button>
        <p class="req-note">Je aanvraag is vrijblijvend. Je ontvangt eerst een voorstel; pas na jouw akkoord wordt de vlucht geboekt.</p>
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
        ? 'Retour · heen ' + niceDate(v('date')) + ' · terug ' + niceDate(v('returnDate'))
        : 'Enkele reis · ' + niceDate(v('date'));
      const email = v('email');
      const btn = f.querySelector('.req-submit');
      btn.disabled = true; btn.textContent = 'Versturen…';
      sendRequest('Nieuwe vluchtaanvraag: ' + route + ' (' + pax + ')', {
        'Soort': 'Nieuwe vlucht', 'Route': route, 'Reis': trip, 'Passagiers': pax,
        'Naam': v('name'), 'E-mail': email,
        'Telefoon': v('phone') || '-', 'Opmerking': v('message') || '-',
        _replyto: email
      }).then(() => showDone('Aanvraag verstuurd',
        route + ' · ' + trip + ' · ' + pax + '. We sturen je zo snel mogelijk een voorstel via ' + email + '.'))
        .catch(() => showError(f));
    });
    modal.showModal();
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
      : [q.date ? niceDate(q.date) + ' (± 3 dagen)' : 'Elke datum', paxLabel].join(' · ');
    const title = list && list.length === 1
      ? list[0].from + ' → ' + list[0].to
      : (q.from || 'Overal') + ' → ' + (q.to || 'Overal');
    const head = `
      <div class="req-head">
        <span class="req-badge">EMPTY LEG</span>
        <h3 id="reqTitle">${esc(title)}</h3>
        <p>${esc(extras)}</p>
        <button type="button" class="req-close" aria-label="Sluiten">×</button>
      </div>`;

    if (!found.length) {
      modal.innerHTML = head + `
        <div class="req-body">
          <div class="req-empty"><strong>Geen empty leg gevonden</strong>Er vliegt op dit moment geen lege vlucht die bij je zoekopdracht past. We kunnen wel een nieuwe vlucht voor je aanvragen.</div>
          <button type="button" class="req-submit" data-to-new>Vraag een nieuwe vlucht aan</button>
        </div>`;
      modal.querySelector('[data-to-new]').addEventListener('click', () => { modal.close(); openRequest(q); });
      closeButton();
      modal.showModal();
      modal.querySelector('[data-to-new]').focus();
      return;
    }

    modal.innerHTML = head + `
      <form class="req-body" novalidate>
        <span class="req-legend">${found.length === 1 ? 'JE VLUCHT' : found.length + ' EMPTY LEGS GEVONDEN'}</span>
        <div class="req-options">
          ${found.map((l, i) => `
            <label class="req-option">
              <input type="radio" name="choice" value="${i}" ${i === 0 ? 'checked' : ''}>
              <span class="o-main">${esc(l.from)} → ${esc(l.to)}<small>${esc(l.when)} · ${esc(l.plane)} · ${esc(l.cap)}</small></span>
              <span class="o-price">${esc(l.price)}</span>
            </label>`).join('')}
        </div>
        <span class="req-legend">JE GEGEVENS</span>
        <div class="req-fields">
          <label>NAAM<input name="name" required placeholder="Voor- en achternaam" autocomplete="name"></label>
          <label>E-MAIL<input name="email" type="email" required placeholder="jij@voorbeeld.nl" autocomplete="email"></label>
          <label>TELEFOON<input name="phone" type="tel" placeholder="+31 6 12345678" autocomplete="tel"></label>
          <label>PASSAGIERS<select name="pax" required>${paxOptions(q.pax || '1')}</select></label>
        </div>
        <button type="submit" class="req-submit">Reserveer deze empty leg</button>
        <p class="req-note">Je reservering is pas definitief na bevestiging door de operator. Routes en tijden kunnen tot vlak voor vertrek wijzigen.</p>
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
        note.textContent = 'Dit toestel heeft plaats voor maximaal ' + l.seats + ' passagiers.';
        return;
      }
      const details = [l.when, l.plane, pax, l.price + ' heel toestel'].join(' · ');
      const email = f.elements.email.value.trim();
      const btn = f.querySelector('.req-submit');
      btn.disabled = true; btn.textContent = 'Versturen…';
      sendRequest('Empty leg reserveren: ' + route + ' (' + l.when + ')', {
        'Soort': 'Empty leg', 'Route': route, 'Details': details,
        'Naam': f.elements.name.value.trim(), 'E-mail': email,
        'Telefoon': f.elements.phone.value.trim() || '-',
        _replyto: email
      }).then(() => showDone('Reservering verstuurd',
        route + ' · ' + details + '. We bevestigen je reservering zo snel mogelijk via ' + email + '.'))
        .catch(() => showError(f));
    });
    modal.showModal();
    f.elements.name.focus();
  }

  /* ---------- buttons anywhere on the page ---------- */
  document.addEventListener('click', e => {
    const dealBtn = e.target.closest('[data-deal]');
    if (dealBtn) { const l = legs[+dealBtn.dataset.deal]; if (l) openLegs({ pax: '1' }, [l]); return; }
    const reqBtn = e.target.closest('[data-open-request]');
    if (reqBtn) { e.preventDefault(); openRequest({ from: reqBtn.dataset.from || '', to: reqBtn.dataset.to || '' }); }
  });

  /* ---------- search bar (homepage section "Vlucht samenstellen") ---------- */
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
    const MAX_PAX = 19;
    let mode = trip.dataset.mode || 'leg', pax = 1;
    trip.elements.date.min = today; trip.elements.returnDate.min = today;

    function setMode(m){
      mode = m;
      trip.classList.toggle('is-new', m === 'new');
      trip.querySelectorAll('.trip-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      trip.querySelectorAll('[data-only]').forEach(el => { el.hidden = el.dataset.only !== m; });
      trip.querySelector('[data-date-label]').textContent = m === 'new' ? 'Vertrekdatum' : 'Datum (± 3 dagen)';
      trip.querySelector('.trip-go').textContent = m === 'new' ? 'Vraag deze vlucht aan' : 'Zoek empty legs';
    }
    trip.querySelectorAll('.trip-switch button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    setMode(mode);

    trip.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
      pax = Math.min(MAX_PAX, Math.max(1, pax + +b.dataset.step));
      trip.querySelector('output[name=pax]').value = pax;
    }));
    trip.querySelector('.trip-swap').addEventListener('click', () => {
      [trip.elements.from.value, trip.elements.to.value] = [trip.elements.to.value, trip.elements.from.value];
    });
    trip.elements.date.addEventListener('change', () => { trip.elements.returnDate.min = trip.elements.date.value || today; });

    trip.addEventListener('submit', e => {
      e.preventDefault();
      const q = {
        from: trip.elements.from.value.trim(), to: trip.elements.to.value.trim(),
        date: trip.elements.date.value, pax: String(pax),
        returnDate: mode === 'new' ? trip.elements.returnDate.value : ''
      };
      if (mode === 'new') openRequest(q); else openLegs(q);
    });
  });

  /* ---------- "Alle empty legs" page: grid with filters ---------- */
  const list = document.querySelector('[data-deals="list"]');
  if (list && typeof dealCardHtml === 'function') {
    const fFrom = $('flFrom'), fTo = $('flTo'), fPax = $('flPax'), fSort = $('flSort'), count = $('flCount');
    function render(){
      const qf = fFrom.value.trim().toLowerCase(), qt = fTo.value.trim().toLowerCase(), pax = +fPax.value || 0;
      let rows = legs.filter(l => hit(qf, l.from, l.fromRegion) && hit(qt, l.to, l.toRegion) && (!pax || l.seats >= pax));
      if (fSort.value === 'price') rows = rows.slice().sort((a, b) => a.priceNum - b.priceNum);
      // biggest discount first: lowest share of the original price
      const share = l => l.priceNum / +l.oldPrice.replace(/\D/g, '');
      if (fSort.value === 'discount') rows = rows.slice().sort((a, b) => share(a) - share(b));
      count.textContent = rows.length + (rows.length === 1 ? ' empty leg' : ' empty legs');
      list.innerHTML = rows.length
        ? rows.map(l => dealCardHtml(l, l.index)).join('')
        : `<div class="legs-empty"><strong>Geen empty legs op deze route</strong><p>Vraag een nieuwe vlucht aan, dan sturen we je een voorstel op maat.</p>
           <button type="button" data-open-request data-from="${esc(fFrom.value.trim())}" data-to="${esc(fTo.value.trim())}">Vraag een vlucht aan</button></div>`;
    }
    [fFrom, fTo, fPax, fSort].forEach(el => el.addEventListener('input', render));
    $('flReset').addEventListener('click', () => { fFrom.value = ''; fTo.value = ''; fPax.value = ''; fSort.value = 'date'; render(); });
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
    btn.disabled = true; btn.textContent = 'Versturen…';
    sendRequest('Contactformulier: ' + v('topic') + ' (' + v('name') + ')', {
      'Soort': 'Contactformulier', 'Onderwerp': v('topic'),
      'Naam': v('name'), 'E-mail': v('email'), 'Telefoon': v('phone') || '-',
      'Bericht': v('message'), _replyto: v('email')
    }).then(() => {
      form.innerHTML = `
        <div class="form-done">
          <div class="tick">✓</div>
          <h3>Bericht verstuurd</h3>
          <p>Bedankt, ${esc(v('name'))}. We reageren zo snel mogelijk via ${esc(v('email'))}.</p>
        </div>`;
    }).catch(() => {
      btn.disabled = false; btn.textContent = 'Opnieuw proberen';
      note.classList.add('error');
      note.textContent = 'Versturen is niet gelukt. Probeer het opnieuw of mail ons via ' + REQUEST_EMAIL + '.';
    });
  });
})();