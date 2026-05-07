export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Vestuário',
  'Outros',
] as const;

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Presente',
  'Outros',
] as const;