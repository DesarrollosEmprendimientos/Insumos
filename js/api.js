window.api = async function (action, payload = {}) {
  const r = await fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, ...payload }) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'error');
  return j;
};
