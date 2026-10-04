(() => {
  const $ = id => document.getElementById(id), LS = localStorage;
  const S = { token: LS.rdp_t || '', user: LS.rdp_u || '', cats: [], cur: null, qty: JSON.parse(LS.rdp_q || '{}') };
  const key = (c, i) => c + '|' + i, show = v => ['login', 'cats', 'items'].forEach(n => $('v-' + n).hidden = n !== v);
  const toast = m => { const t = $('toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); };
  const save = () => LS.rdp_q = JSON.stringify(S.qty);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n > 0 ? Math.round(n * 1000) / 1000 : 0; };
  const countCat = c => c.items.filter(i => S.qty[key(c.name, i.name)] > 0).length;

  function logout(msg) { LS.removeItem('rdp_t'); LS.removeItem('rdp_u'); S.token = ''; show('login'); $('err').textContent = msg || ''; }
  const fail = e => e.message === 'session' ? logout('La sesión venció, ingresá de nuevo.') : toast('No se pudo conectar. Reintentá.');

  async function load() {
    try { const r = await api('catalog', { token: S.token }); S.cats = r.data.categories;
      // limpiar cantidades de artículos que ya no existen en la planilla
      const ok = new Set(S.cats.flatMap(c => c.items.map(i => key(c.name, i.name))));
      Object.keys(S.qty).forEach(k => ok.has(k) || delete S.qty[k]); save();
      if (S.cur && !S.cats.find(c => c.name === S.cur)) { S.cur = null; show('cats'); }
      drawCats(); S.cur && drawItems();
    } catch (e) { fail(e); }
  }
  function drawCats() {
    $('who').textContent = S.user; const g = $('grid'); g.replaceChildren();
    S.cats.forEach(c => { const b = el('button', 'cat', c.name), n = countCat(c);
      if (n) b.append(el('span', 'dot', n)); b.append(el('em', '', c.items.length + ' ítems'));
      b.onclick = () => { S.cur = c.name; drawItems(); show('items'); scrollTo(0, 0); }; g.append(b); });
  }
  function drawItems() {
    const c = S.cats.find(x => x.name === S.cur); if (!c) return;
    $('ct').textContent = c.name; const l = $('list'); l.replaceChildren();
    c.items.forEach(i => { const k = key(c.name, i.name), card = el('div', 'item'), q = el('div', 'qty');
      const inp = el('input'); inp.inputMode = 'decimal'; inp.value = S.qty[k] || ''; inp.placeholder = '0'; inp.setAttribute('aria-label', 'Cantidad de ' + i.name);
      const set = v => { v = num(v); v ? S.qty[k] = v : delete S.qty[k]; inp.value = v || ''; save(); total(); };
      const m = el('button', '', '−'), p = el('button', '', '+'); m.setAttribute('aria-label', 'Restar'); p.setAttribute('aria-label', 'Sumar');
      m.onclick = () => set((S.qty[k] || 0) - 1); p.onclick = () => set((S.qty[k] || 0) + 1); inp.onchange = () => set(inp.value);
      q.append(m, inp, p); card.append(el('b', '', i.name), el('small', '', i.supplier), q, el('div', 'unit', i.unit)); l.append(card); });
    total();
  }
  function total() { const n = Object.keys(S.qty).length; $('cnt').textContent = n ? '(' + n + ')' : ''; }

  $('go').onclick = async () => {
    const b = $('go'); b.disabled = true; $('err').textContent = '';
    try { const r = await api('login', { user: $('u').value, pass: $('p').value });
      S.token = LS.rdp_t = r.token; S.user = LS.rdp_u = r.user; $('p').value = ''; show('cats'); await load();
    } catch (e) { $('err').textContent = e.message === 'locked' ? 'Demasiados intentos. Esperá 15 minutos.' : e.message === 'credenciales' ? 'Usuario o contraseña incorrectos.' : 'No se pudo conectar.'; }
    b.disabled = false;
  };
  $('p').onkeydown = e => e.key === 'Enter' && $('go').click();
  $('out').onclick = () => { if (Object.keys(S.qty).length && !confirm('Hay cantidades cargadas. ¿Salir igual?')) return; S.qty = {}; save(); logout(); };
  $('back').onclick = () => { S.cur = null; drawCats(); show('cats'); };
  $('send').onclick = () => toast('El envío del pedido se habilita en la etapa 2');
  document.addEventListener('visibilitychange', () => !document.hidden && S.token && load());
  setInterval(() => !document.hidden && S.token && load(), 60000);

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  if (S.token) { show('cats'); load(); } else show('login');
})();
