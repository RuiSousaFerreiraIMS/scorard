// Números de telemóvel dos jogadores, para o acerto de contas (MB WAY).
// Guardados por NOME e só neste telemóvel — não vão para a cloud nem para o
// link de partilha. São dados pessoais de terceiros: ficam onde foram escritos.

const KEY = 'scorard:phones';

export function loadPhones() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function setPhone(name, phone) {
  const all = loadPhones();
  const clean = String(phone || '').trim();
  if (clean) all[name] = clean;
  else delete all[name];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignora */
  }
  return all;
}
