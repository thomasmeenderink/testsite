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

  /* ---------- apply now and to anything added later ---------- */
  function scan(root){
    if (!root.querySelectorAll) return;
    if (root.matches && root.matches('select')) enhanceSelect(root);
    if (root.matches && root.matches('input[list]')) enhanceCity(root);
    root.querySelectorAll('select').forEach(enhanceSelect);
    root.querySelectorAll('input[list]').forEach(enhanceCity);
  }
  scan(document.body);
  new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => {
    if (n.nodeType === 1 && !n.classList.contains('dd-panel')) scan(n);
  }))).observe(document.body, { childList: true, subtree: true });
})();
