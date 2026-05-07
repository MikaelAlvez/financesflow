import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Toast } from '../components/UI/Toast';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Credenciais inválidas');
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {error && <Toast message={error} onClose={() => setError('')} />}

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-400">💸 Nossas Finanças</h1>
          <p className="text-zinc-400 mt-2">Entre na sua conta</p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button
            type="button"
            isLoading={loading}
            className="w-full mt-2"
            onClick={handleSubmit}
          >
            Entrar
          </Button>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-violet-400 font-medium hover:text-violet-300">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}