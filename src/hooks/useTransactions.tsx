import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { expenseService } from '../services/expenseService';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await expenseService.getAll();
        if (!cancelled) setTransactions(data);
      } catch {
        if (!cancelled) setError('Erro ao carregar transações');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setTransactions(data);
    } catch {
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(data: Omit<Transaction, 'id' | 'created_at'>) {
    await expenseService.create(data);
    await fetchTransactions();
  }

  async function editTransaction(id: number, data: Omit<Transaction, 'id' | 'created_at'>) {
    await expenseService.update(id, data);
    await fetchTransactions();
  }

  async function removeTransaction(id: number) {
    await expenseService.delete(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    totalIncome,
    totalExpense,
    balance,
    byCategory,
  };
}