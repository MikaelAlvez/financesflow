import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { SummaryCards } from '../components/Dashboard/SummaryCards';
import { TransactionForm } from '../components/Expenses/TransactionForm';
import { TransactionCard } from '../components/Expenses/TransactionCard';
import { Button } from '../components/UI/Button';
import type { Transaction } from '../types';

type FilterType = 'all' | 'income' | 'expense';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { transactions, loading, addTransaction, editTransaction, removeTransaction } = useTransactions();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  function handleEdit(transaction: Transaction) {
    setEditing(transaction);
    setShowForm(false);
  }

  function handleCloseEdit() {
    setEditing(null);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-violet-400">💸 Nossas Finanças 💸</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">
            Olá, <strong className="text-zinc-200">{user?.name}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        <SummaryCards balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} />

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">
              Transações
              <span className="ml-2 text-sm font-normal text-zinc-500">({filtered.length})</span>
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/report')}>
                📊 Relatório
              </Button>
              <Button size="sm" onClick={() => { setShowForm(!showForm); setEditing(null); }}>
                {showForm ? '− Fechar' : '+ Nova Transação'}
              </Button>
            </div>
          </div>

          {/* Formulário de nova transação */}
          {showForm && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
              <TransactionForm
                onSubmit={async (d) => { await addTransaction(d); setShowForm(false); }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Formulário de edição */}
          {editing && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-xl border border-violet-700">
              <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-3">
                ✏️ Editando transação
              </p>
              <TransactionForm
                initialData={editing}
                onSubmit={async (d) => { await editTransaction(editing.id, d); handleCloseEdit(); }}
                onCancel={handleCloseEdit}
              />
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'income' ? 'Entradas' : 'Gastos'}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-zinc-500 py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Nenhuma transação encontrada.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  onDelete={removeTransaction}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}