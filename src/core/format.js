// Formatação partilhada (comum a todos os jogos).

export function formatEuro(n) {
  const v = Number(n) || 0;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)} €`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
