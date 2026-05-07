import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Senha deve ter ao menos 6 caracteres'); return; }
    try {
      setLoading(true);
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Erro ao criar conta');
      } else {
        setError('Erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-400">💸 Nossas Finanças 💸</h1>
          <p className="text-zinc-400 mt-2">Crie sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="text-red-400 text-sm text-center bg-red-950 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" isLoading={loading} className="w-full mt-2">Criar Conta</Button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-violet-400 font-medium hover:text-violet-300">Entrar</Link>
        </p>
      </div>
    </div>
  );
}