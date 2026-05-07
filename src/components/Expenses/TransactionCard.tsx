import type { Transaction } from '../../types';
import { Button } from '../UI/Button';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: number) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onDelete, onEdit }: TransactionCardProps) {
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-lg">{isIncome ? '📥' : '📤'}</span>
        <div>
          <p className="font-medium text-zinc-100">{transaction.description}</p>
          <p className="text-xs text-zinc-500">{transaction.category} • {formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-bold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}
          {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onEdit(transaction)}>✏️</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(transaction.id)}>✕</Button>
      </div>
    </div>
  );
}