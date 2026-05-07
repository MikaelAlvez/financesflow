import { useState } from 'react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../types';
import type { Transaction } from '../../types';

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Transaction;
}

export function TransactionForm({ onSubmit, onCancel, initialData }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type ?? 'expense');
  const [form, setForm] = useState({
    description: initialData?.description ?? '',
    amount: initialData?.amount?.toString() ?? '',
    category: initialData?.category ?? 'Alimentação',
    date: initialData?.date ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.description || !form.amount || !form.date) {
      setError('Preencha todos os campos');
      return;
    }
    try {
      setLoading(true);
      await onSubmit({ ...form, amount: parseFloat(form.amount), type });
      setForm({ description: '', amount: '', category: 'Alimentação', date: '' });
    } catch {
      setError('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex rounded-lg overflow-hidden border border-zinc-700">
        <button
          type="button"
          onClick={() => { setType('expense'); setForm(f => ({ ...f, category: 'Alimentação' })); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
          📤 Gasto
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setForm(f => ({ ...f, category: 'Salário' })); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'income' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
          📥 Entrada
        </button>
      </div>

      <Input
        label="Descrição"
        placeholder={type === 'expense' ? 'Ex: Almoço no restaurante' : 'Ex: Salário de maio'}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        label="Valor (R$)"
        type="number"
        step="0.01"
        placeholder="0,00"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-300">Categoria</label>
        <select
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-violet-500"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((c) => <option key={c} className="bg-zinc-800">{c}</option>)}
        </select>
      </div>
      <Input
        label="Data"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      {error && <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" isLoading={loading}>
          {initialData ? 'Salvar alterações' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}