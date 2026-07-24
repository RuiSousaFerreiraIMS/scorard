// Codifica/descodifica uma sessão no fragmento (#) de um URL, para partilhar uma
// vista só-de-leitura SEM servidor. O fragmento nunca é enviado em pedidos HTTP,
// por isso os dados ficam entre quem partilha e quem recebe. UTF-8 seguro (nomes
// com acentos) via TextEncoder + base64url (sem +, /, = para caber num URL).

function toBase64Url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Objeto compacto (chaves curtas) para o link não ficar enorme.
export function encodeSession(session) {
  const compact = {
    v: 1,
    g: session.gameId,
    p: session.players,
    s: session.setup,
    r: session.rounds,
    t: session.startedAt ?? null,
    f: session.finishedAt ?? null,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  return toBase64Url(bytes);
}

export function decodeSession(code) {
  try {
    const json = new TextDecoder().decode(fromBase64Url(code));
    const c = JSON.parse(json);
    if (!c || c.v !== 1 || !c.g || !Array.isArray(c.r)) return null;
    return {
      gameId: c.g,
      players: c.p,
      setup: c.s,
      rounds: c.r,
      startedAt: c.t ?? null,
      finishedAt: c.f ?? null,
    };
  } catch {
    return null;
  }
}

// URL de partilha (usa a localização atual como base → funciona no GitHub Pages).
export function buildShareUrl(session) {
  const base = location.origin + location.pathname;
  return `${base}#s=${encodeSession(session)}`;
}

// Lê a sessão partilhada do hash atual (ou null se não houver / for inválida).
export function readShareHash() {
  const m = (location.hash || '').match(/[#&]s=([^&]+)/);
  return m ? decodeSession(m[1]) : null;
}
