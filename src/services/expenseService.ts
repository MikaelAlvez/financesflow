import api from './api';
import type { Transaction } from '../types';

export const expenseService = {
  async getAll(): Promise<Transaction[]> {
    const res = await api.get('/expenses');
    return res.data.expenses;
  },

  async create(data: Omit<Transaction, 'id' | 'created_at'>): Promise<void> {
    await api.post('/expenses', data);
  },

  async update(id: number, data: Partial<Transaction>): Promise<void> {
    await api.put(`/expenses/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};