/* =====================================================================
   Styled dropdowns.
   - Every <select> gets a button and a list in the site's style. The real
     <select> stays in the form (invisible), so form values, "required" checks
     and the existing scripts keep working unchanged.
   - Every city field (<input list="...">) gets its own suggestion list instead
     of the browser's datalist.
   Fields that appear later (pop-ups) are picked up automatically.
   ===================================================================== */
(function(){
  const CHEVRON = '<svg class="dd-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const PIN = '<svg class="dd-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let uid = 0;

  /* ---------- one open list at a time, placed under (or above) its field ---------- */
  let current = null; // { panel, anchor, close }
  function place(panel, anchor){
    const r = anchor.getBoundingClientRect();
    const below = window.innerHeight - r.bottom, above = r.top;
    const wanted = Math.min(panel.scrollHeight, 300);
    const up = below < wanted + 16 && above > below;
    panel.classList.toggle('up', up);
    panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - Math.max(r.width, 220) - 8)) + 'px';
    panel.style.minWidth = Math.max(r.width, 220) + 'px';
    panel.style.maxHeight = Math.max(160, Math.min(300, (up ? above : below) - 24)) + 'px';
    if (up) { panel.style.top = ''; panel.style.bottom = (window.innerHeight - r.top + 6) + 'px'; }
    else { panel.style.bottom = ''; panel.style.top = (r.bottom + 6) + 'px'; }
  }
  function openPanel(panel, anchor, onClose){
    if (current) current.close();
    // inside a pop-up the list must live in the pop-up, otherwise it would sit behind it
    (anchor.closest('dialog') || document.body).appendChild(panel);
    place(panel, anchor);
    current = { panel, anchor, close(){ panel.remove(); current = null; onClose(); } };
  }
  document.addEventListener('pointerdown', e => {
    if (current && !current.panel.contains(e.target) && !current.anchor.contains(e.target)) current.close();
  }, true);
  window.addEventListener('resize', () => { if (current) place(current.panel, current.anchor); });
  document.addEventListener('scroll', e => {
    if (current && !current.panel.contains(e.target)) place(current.panel, current.anchor);
  }, true);

  function moveActive(panel, step){
    const items = [...panel.querySelectorAll('li:not(.is-disabled)')];
    if (!items.length) return null;
    let i = items.findIndex(li => li.classList.contains('is-active'));
    i = i < 0 ? (step > 0 ? 0 : items.length - 1) : Math.max(0, Math.min(items.length - 1, i + step));
    items.forEach(li => li.classList.remove('is-active'));
    items[i].classList.add('is-active');
    items[i].scrollIntoView({ block: 'nearest' });
    return items[i];
  }

  /* ---------- <select> ---------- */
  const valueProp = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

  function enhanceSelect(sel){
    if (sel.dataset.dd) return;
    sel.dataset.dd = '1';
    const host = sel.parentElement;
    host.classList.add('dd-host');
    sel.classList.add('dd-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    const listId = 'dd-list-' + (++uid);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', listId);
    btn.innerHTML = '<span class="dd-value"></span>' + CHEVRON;
    sel.after(btn);

    const name = (host.firstChild && host.firstChild.nodeType === 3 ? host.firstChild.textContent : (host.querySelector('span') || {}).textContent || '').trim();
    function refresh(){
      const o = sel.options[sel.selectedIndex];
      btn.querySelector('.dd-value').textContent = o ? o.textContent : '';
      btn.classList.toggle('is-empty', !valueProp.get.call(sel));
      btn.setAttribute('aria-label', (name ? name + ': ' : '') + (o ? o.textContent : ''));
    }
    // keep the button in step when a script sets select.value directly
    Object.defineProperty(sel, 'value', {
      configurable: true,
      get(){ return valueProp.get.call(this); },
      set(v){ valueProp.set.call(this, v); refresh(); }
    });
    sel.addEventListener('change', refresh);
    refresh();

    function choose(li){
      valueProp.set.call(sel, li.dataset.value);
      refresh();
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      if (current) current.close();
      btn.focus();
    }
    function open(){
      const panel = document.createElement('ul');
      panel.className = 'dd-panel';
      panel.id = listId;
      panel.setAttribute('role', 'listbox');
      panel.tabIndex = -1;
      // an empty first option is a placeholder ("Kies", "Passagiers"), unless the select says it is a real choice
      const keepEmpty = sel.hasAttribute('data-keep-empty');
      panel.innerHTML = [...sel.options].filter(o => o.value !== '' || keepEmpty).map(o => `
        <li role="option" data-value="${esc(o.value)}" aria-selected="${o.selected}"
            class="${o.disabled ? 'is-disabled' : ''}${o.value === '' ? ' is-placeholder' : ''}${o.selected ? ' is-active' : ''}">
          <span>${esc(o.textContent)}</span>
        </li>`).join('');
      panel.addEventListener('click', e => { const li = e.target.closest('li'); if (li && !li.classList.contains('is-disabled')) choose(li); });
      panel.addEventListener('pointermove', e => {
        const li = e.target.closest('li'); if (!li || li.classList.contains('is-disabled')) return;
        panel.querySelectorAll('li').forEach(x => x.classList.toggle('is-active', x === li));
      });
      let typed = '', typedAt = 0;
      panel.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(panel, 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(panel, -1); }
        else if (e.key === 'Home') { e.preventDefault(); panel.querySelectorAll('li').forEach(x => x.classList.remove('is-active')); moveActive(panel, 1); }
        else if (e.key === 'End') { e.preventDefault(); panel.querySelectorAll('li').forEach(x => x.classList.remove('is-active')); moveActive(panel, -1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const li = panel.querySelector('li.is-active'); if (li) choose(li); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); current.close(); btn.focus(); }
        else if (e.key === 'Tab') { current.close(); }
        else if (e.key.length === 1) {
          // type to jump to an option
          typed = (Date.now() - typedAt > 700 ? '' : typed) + e.key.toLowerCase(); typedAt = Date.now();
          const li = [...panel.querySelectorAll('li:not(.is-disabled)')].find(x => x.textContent.trim().toLowerCase().startsWith(typed));
          if (li) { panel.querySelectorAll('li').forEach(x => x.classList.toggle('is-active', x === li)); li.scrollIntoView({ block: 'nearest' }); }
        }
      });
      btn.setAttribute('aria-expanded', 'true');
      openPanel(panel, btn, () => btn.setAttribute('aria-expanded', 'false'));
      const active = panel.querySelector('li.is-active');
      if (active) active.scrollIntoView({ block: 'nearest' });
      panel.focus({ preventScroll: true });
    }
    btn.addEventListener('click', () => { if (current && current.anchor === btn) current.close(); else open(); });
    btn.addEventListener('keydown', e => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
    });
  }

  /* ---------- city fields ---------- */
  function enhanceCity(input){
    if (input.dataset.dd) return;
    input.dataset.dd = '1';
    const source = document.getElementById(input.getAttribute('list'));
    input.removeAttribute('list');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.parentElement.classList.add('dd-host');
    const listId = 'dd-list-' + (++uid);
    input.setAttribute('aria-controls', listId);
    let quiet = false;

    function choose(value){
      input.value = value;
      quiet = true;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      quiet = false;
      if (current) current.close();
    }
    function open(){
      const all = source ? [...source.options].map(o => o.value) : [];
      const q = fold(input.value.trim());
      // cities that start with the typed text come first
      const hits = all.filter(c => !q || fold(c).includes(q))
        .sort((a, b) => (fold(a).startsWith(q) ? 0 : 1) - (fold(b).startsWith(q) ? 0 : 1))
        .slice(0, 8);
      if (!hits.length || (hits.length === 1 && fold(hits[0]) === q)) { if (current && current.anchor === input) current.close(); return; }
      const mark = c => {
        if (!q) return esc(c);
        const i = fold(c).indexOf(q);
        return esc(c.slice(0, i)) + '<mark>' + esc(c.slice(i, i + q.length)) + '</mark>' + esc(c.slice(i + q.length));
      };
      const panel = document.createElement('ul');
      panel.className = 'dd-panel dd-cities';
      panel.id = listId;
      panel.setAttribute('role', 'listbox');
      panel.innerHTML = hits.map(c => `<li role="option" data-value="${esc(c)}">${PIN}<span>${mark(c)}</span></li>`).join('');
      // mousedown instead of click, so the field keeps its focus
      panel.addEventListener('mousedown', e => { e.preventDefault(); const li = e.target.closest('li[data-value]'); if (li) choose(li.dataset.value); });
      panel.addEventListener('pointermove', e => {
        const li = e.target.closest('li[data-value]'); if (!li) return;
        panel.querySelectorAll('li').forEach(x => x.classList.toggle('is-active', x === li));
      });
      input.setAttribute('aria-expanded', 'true');
      openPanel(panel, input, () => input.setAttribute('aria-expanded', 'false'));
    }
    input.addEventListener('focus', open);
    input.addEventListener('click', () => { if (!current || current.anchor !== input) open(); });
    input.addEventListener('input', () => { if (!quiet) open(); });
    input.addEventListener('blur', () => setTimeout(() => { if (current && current.anchor === input) current.close(); }, 120));
    input.addEventListener('keydown', e => {
      const openHere = current && current.anchor === input;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!openHere) open();
        if (current && current.anchor === input) moveActive(current.panel, e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter' && openHere) {
        const li = current.panel.querySelector('li.is-active');
        if (li) { e.preventDefault(); choose(li.dataset.value); }
      } else if (e.key === 'Escape' && openHere) {
        e.preventDefault(); e.stopPropagation(); current.close();
      }
    });
  }

  /* ---------- date fields ----------
     The browser's own date picker speaks the browser's language ("dd-mm-jjjj" on a Dutch
     computer). This calendar speaks the page's language. The real input stays in the form
     (invisible) and still holds the date as 2026-12-02, so "required", "min" and the
     existing scripts keep working. */
  const CAL = '<svg class="dd-chev dd-cal-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  const inputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  const pageLocale = typeof LOCALE !== 'undefined' ? LOCALE : document.documentElement.lang || 'en';
  const say = (key, en, vars) => (typeof t === 'function' && t(key, vars) !== key ? t(key, vars) : en);
  const pad = n => String(n).padStart(2, '0');
  const isoOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const dateOf = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? new Date(iso + 'T00:00') : null;
  // weekday names Monday to Sunday in the page's language
  const WEEKDAYS = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(pageLocale, { weekday: 'short' }).replace('.', ''));

  function enhanceDate(input){
    if (input.dataset.dd) return;
    input.dataset.dd = '1';
    const host = input.parentElement;
    host.classList.add('dd-host');
    input.classList.add('dd-native');
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd-btn dd-date';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="dd-value"></span>' + CAL;
    input.after(btn);
    const name = (host.firstChild && host.firstChild.nodeType === 3 ? host.firstChild.textContent : (host.querySelector('span') || {}).textContent || '').trim();

    function refresh(){
      const d = dateOf(inputValue.get.call(input));
      const text = d ? d.toLocaleDateString(pageLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '') : (input.placeholder || '');
      btn.querySelector('.dd-value').textContent = text;
      btn.classList.toggle('is-empty', !d);
      btn.setAttribute('aria-label', (name ? name + ': ' : '') + text);
    }
    // keep the button in step when a script sets the date directly
    Object.defineProperty(input, 'value', {
      configurable: true,
      get(){ return inputValue.get.call(this); },
      set(v){ inputValue.set.call(this, v); refresh(); }
    });
    input.addEventListener('change', refresh);
    refresh();

    function set(iso){
      // the existing scripts only read a date from a field of type "date"
      input.type = iso ? 'date' : 'text';
      inputValue.set.call(input, iso);
      refresh();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      if (current) current.close();
      btn.focus();
    }

    function open(){
      // the page scripts set the earliest date when a date field gets focus (e.g. return after departure)
      input.dispatchEvent(new Event('focus'));
      const today = new Date(new Date().toDateString());
      const minDate = [dateOf(input.min), today].filter(Boolean).reduce((a, b) => (a > b ? a : b));
      const chosen = dateOf(inputValue.get.call(input));
      let month = new Date((chosen || minDate).getFullYear(), (chosen || minDate).getMonth(), 1);
      let focusIso = isoOf(chosen || minDate);

      const panel = document.createElement('div');
      panel.className = 'dd-panel dd-cal';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', name || say('chooseDate', 'Choose a date'));

      function draw(){
        const first = (month.getDay() + 6) % 7;            // Monday = 0
        const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const title = month.toLocaleDateString(pageLocale, { month: 'long', year: 'numeric' });
        const canBack = new Date(month.getFullYear(), month.getMonth(), 0) >= minDate;
        let cells = '';
        for (let i = 0; i < first; i++) cells += '<span></span>';
        for (let d = 1; d <= days; d++) {
          const day = new Date(month.getFullYear(), month.getMonth(), d), iso = isoOf(day);
          const off = day < minDate;
          cells += `<button type="button" data-iso="${iso}" tabindex="${iso === focusIso ? 0 : -1}"${off ? ' disabled' : ''}
            class="${chosen && iso === isoOf(chosen) ? 'is-chosen' : ''}${iso === isoOf(today) ? ' is-today' : ''}"
            aria-label="${esc(day.toLocaleDateString(pageLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}">${d}</button>`;
        }
        panel.innerHTML = `
          <div class="cal-head">
            <button type="button" class="cal-nav" data-step="-1" aria-label="${esc(say('prevMonth', 'Previous month'))}" ${canBack ? '' : 'disabled'}>‹</button>
            <strong>${esc(title.charAt(0).toUpperCase() + title.slice(1))}</strong>
            <button type="button" class="cal-nav" data-step="1" aria-label="${esc(say('nextMonth', 'Next month'))}">›</button>
          </div>
          <div class="cal-grid cal-week">${WEEKDAYS.map(w => `<span>${esc(w)}</span>`).join('')}</div>
          <div class="cal-grid cal-days">${cells}</div>
          ${chosen && !input.required ? `<button type="button" class="cal-clear">${esc(say('clearDate', 'Clear date'))}</button>` : ''}`;
      }
      function focusDay(){
        const b = panel.querySelector(`[data-iso="${focusIso}"]`);
        if (b && !b.disabled) b.focus({ preventScroll: true }); else panel.querySelector('.cal-days button:not([disabled])')?.focus({ preventScroll: true });
      }
      function moveTo(d){
        if (d < minDate) d = minDate;
        focusIso = isoOf(d);
        if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) month = new Date(d.getFullYear(), d.getMonth(), 1);
        draw(); focusDay();
      }
      draw();
      panel.addEventListener('click', e => {
        const nav = e.target.closest('.cal-nav');
        if (nav) { month = new Date(month.getFullYear(), month.getMonth() + +nav.dataset.step, 1); focusIso = isoOf(month < minDate ? minDate : month); draw(); return; }
        if (e.target.closest('.cal-clear')) { set(''); return; }
        const day = e.target.closest('[data-iso]');
        if (day && !day.disabled) set(day.dataset.iso);
      });
      panel.addEventListener('keydown', e => {
        const d = dateOf(focusIso);
        const go = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (go) { e.preventDefault(); d.setDate(d.getDate() + go); moveTo(d); }
        else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); d.setMonth(d.getMonth() + (e.key === 'PageUp' ? -1 : 1)); moveTo(d); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); current.close(); btn.focus(); }
      });
      btn.setAttribute('aria-expanded', 'true');
      openPanel(panel, btn, () => btn.setAttribute('aria-expanded', 'false'));
      panel.style.maxHeight = '';
      place(panel, btn);
      panel.style.maxHeight = '';
      focusDay();
    }
    btn.addEventListener('click', () => { if (current && current.anchor === btn) current.close(); else open(); });
    btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); } });
    // a click on the field's label lands on the hidden input
    input.addEventListener('click', e => { e.preventDefault(); if (!current || current.anchor !== btn) open(); });
  }

  /* ---------- apply now and to anything added later ---------- */
  const DATE_FIELDS = 'input[type="date"], input[data-date]';
  function scan(root){
    if (!root.querySelectorAll) return;
    if (root.matches && root.matches('select')) enhanceSelect(root);
    if (root.matches && root.matches('input[list]')) enhanceCity(root);
    if (root.matches && root.matches(DATE_FIELDS)) enhanceDate(root);
    root.querySelectorAll('select').forEach(enhanceSelect);
    root.querySelectorAll('input[list]').forEach(enhanceCity);
    root.querySelectorAll(DATE_FIELDS).forEach(enhanceDate);
  }
  scan(document.body);
  new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => {
    if (n.nodeType === 1 && !n.classList.contains('dd-panel')) scan(n);
  }))).observe(document.body, { childList: true, subtree: true });
})();
