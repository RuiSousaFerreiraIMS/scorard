// Acerto de contas: transforma saldos (+ recebe, − paga) na lista mais curta
// possível de transferências "quem paga a quem".
//
// Trabalha em cêntimos (inteiros) para não haver restos de vírgula flutuante:
// 0.1 + 0.2 em JavaScript dá 0.30000000000000004, e isso não pode aparecer numa
// conta de dinheiro. Diferenças abaixo de 1 cêntimo são ignoradas.
//
// Estratégia: emparelhar sempre o maior devedor com o maior credor. Isto dá no
// máximo (n − 1) transferências, que é o mínimo garantido sem resolver um
// problema NP-difícil — e para uma mesa de amigos é sempre o resultado esperado.

const toCents = (v) => Math.round(Number(v) * 100);

export function settleUp(entries) {
  const creditors = []; // recebem
  const debtors = []; // pagam

  for (const e of entries) {
    const c = toCents(e.amount);
    if (c > 0) creditors.push({ ...e, cents: c });
    else if (c < 0) debtors.push({ ...e, cents: -c });
  }

  // maior primeiro, para juntar as pontas grandes e fechar dívidas depressa
  creditors.sort((a, b) => b.cents - a.cents);
  debtors.sort((a, b) => b.cents - a.cents);

  const transfers = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amount = Math.min(d.cents, c.cents);

    if (amount > 0) {
      transfers.push({
        from: d.playerId,
        fromName: d.name,
        to: c.playerId,
        toName: c.name,
        amount: amount / 100,
      });
    }

    d.cents -= amount;
    c.cents -= amount;
    if (d.cents === 0) i++;
    if (c.cents === 0) j++;
  }

  return transfers;
}

// Texto pronto a mandar para o grupo (WhatsApp & afins).
export function buildSettleText(transfers, phones = {}) {
  if (transfers.length === 0) return 'Ninguém deve nada. Contas certas! 🃏';
  const lines = transfers.map((t) => {
    const phone = phones[t.to] ? ` (${phones[t.to]})` : '';
    return `• ${t.fromName} → ${t.toName}${phone}: ${t.amount.toFixed(2)} €`;
  });
  return ['💸 Acerto de contas', ...lines].join('\n');
}
