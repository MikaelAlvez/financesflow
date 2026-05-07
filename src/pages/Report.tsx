import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { SummaryCards } from '../components/Dashboard/SummaryCards';
import { TransactionChart } from '../components/Dashboard/TransactionChart';
import { Button } from '../components/UI/Button';

type PeriodFilter = '7d' | '15d' | '30d' | '90d' | 'custom';

export function Report() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();

  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const periodFiltered = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date = now;

    if (period === '7d') { start = new Date(); start.setDate(now.getDate() - 7); }
    else if (period === '15d') { start = new Date(); start.setDate(now.getDate() - 15); }
    else if (period === '30d') { start = new Date(); start.setDate(now.getDate() - 30); }
    else if (period === '90d') { start = new Date(); start.setDate(now.getDate() - 90); }
    else if (period === 'custom' && customStart && customEnd) {
      start = new Date(customStart + 'T00:00:00');
      end = new Date(customEnd + 'T23:59:59');
    }

    if (!start) return transactions;

    return transactions.filter((t) => {
      const date = new Date(t.date + 'T00:00:00');
      return date >= start! && date <= end;
    });
  }, [transactions, period, customStart, customEnd]);

  const periodIncome = periodFiltered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const periodExpense = periodFiltered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const periodBalance = periodIncome - periodExpense;

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-violet-400">💸 Nossas Finanças 💸</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Relatório</h2>
          <p className="text-zinc-500 text-sm mt-1">Visualize sua evolução financeira por período</p>
        </div>

        {/* Filtro de Período */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">Filtrar por período</p>
          <div className="flex flex-wrap gap-2">
            {(['7d', '15d', '30d', '90d', 'custom'] as PeriodFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '15d' ? '15 dias' : p === '30d' ? '30 dias' : p === '90d' ? '90 dias' : 'Personalizado'}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex gap-3 mt-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-zinc-400">De</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-zinc-400">Até</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}
        </div>

        <SummaryCards balance={periodBalance} totalIncome={periodIncome} totalExpense={periodExpense} />

        {periodFiltered.length > 0 ? (
          <TransactionChart transactions={periodFiltered} />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <p className="text-zinc-500">Nenhuma transação neste período para exibir o gráfico.</p>
          </div>
        )}
      </main>
    </div>
  );
}