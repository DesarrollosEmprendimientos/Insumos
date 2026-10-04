// Imagen del pedido (canvas, sin librerías) y descarga de archivos
window.docs = (() => {
  const fq = q => String(q).replace('.', ',');
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  function b64blob(b64, type) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Blob([u], { type }); }
  function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; }); }
  async function image(o) {
    const W = 800, P = 32, CAT = 44, ROW = 46, groups = [];
    o.lines.forEach(l => { let g = groups.find(x => x.c === l.cat); if (!g) groups.push(g = { c: l.cat, r: [] }); g.r.push(l); });
    const H = 210 + groups.reduce((s, g) => s + CAT + g.r.length * ROW + 14, 0) + 20, S = 2;
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const x = cv.getContext('2d'); x.scale(S, S);
    x.fillStyle = '#fefae8'; x.fillRect(0, 0, W, H);
    x.drawImage(await loadImg('icons/logo.png'), P, 24, 96, 96);
    x.fillStyle = '#052d4b'; x.font = '800 28px Montserrat, Arial, sans-serif'; x.fillText('RESTAURANTE DEL PARQUE', 148, 66, W - 148 - P);
    x.fillStyle = '#ac4c00'; x.font = '700 18px Montserrat, Arial, sans-serif'; x.fillText('Solicitud de compra de provisiones', 148, 96, W - 148 - P);
    x.fillStyle = '#052d4b'; x.font = '600 16px Montserrat, Arial, sans-serif';
    x.fillText('Fecha y hora: ' + o.date + ' ' + o.time + ' hs', P, 152); x.fillText('Solicitó: ' + o.user, P, 178);
    let y = 200;
    groups.forEach(g => {
      x.fillStyle = '#052d4b'; x.fillRect(P, y, W - 2 * P, CAT); x.fillStyle = '#fefae8'; x.font = '700 18px Montserrat, Arial, sans-serif'; x.fillText(g.c, P + 12, y + 29, W - 2 * P - 24); y += CAT;
      g.r.forEach(l => {
        x.fillStyle = '#052d4b'; x.font = '600 16px Montserrat, Arial, sans-serif'; x.textAlign = 'left'; x.fillText(l.name, P + 12, y + 20, 440);
        x.fillStyle = '#6b7b88'; x.font = '500 12px Montserrat, Arial, sans-serif'; x.fillText(l.supplier, P + 12, y + 38, 440);
        x.fillStyle = '#ac4c00'; x.font = '800 17px Montserrat, Arial, sans-serif'; x.textAlign = 'right'; x.fillText(fq(l.qty) + ' ' + l.unit, W - P - 12, y + 28, 260); x.textAlign = 'left';
        x.strokeStyle = 'rgba(5,45,75,.2)'; x.beginPath(); x.moveTo(P, y + ROW); x.lineTo(W - P, y + ROW); x.stroke(); y += ROW; });
      y += 14; });
    return new Promise(r => cv.toBlob(r, 'image/png'));
  }
  const stamp = o => o.date.split('/').reverse().join('-') + '_' + o.time.replace(':', '');
  return {
    async pdf(o, token) { const r = await api('pdf', { token, id: o.id }); download(b64blob(r.b64, 'application/pdf'), r.name); },
    async img(o) { download(await image(o), 'Pedido_' + stamp(o) + '.png'); }
  };
})();
