interface SummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function SummaryCards({ balance, totalIncome, totalExpense }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className={`rounded-2xl p-5 text-white ${balance >= 0 ? 'bg-gradient-to-br from-violet-600 to-violet-900' : 'bg-gradient-to-br from-red-600 to-red-900'}`}>
        <p className="text-sm opacity-70">Saldo</p>
        <p className="text-3xl font-bold mt-1">{fmt(balance)}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-sm text-zinc-400">Entradas</p>
        <p className="text-2xl font-bold text-green-400 mt-1">{fmt(totalIncome)}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-sm text-zinc-400">Gastos</p>
        <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalExpense)}</p>
      </div>
    </div>
  );
}