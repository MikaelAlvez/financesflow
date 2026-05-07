import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors({ origin: '*' }));
app.use(express.json());

type AuthRequest = Request & { userId?: number };
type AuthRequestWithParams = Request<{ id: string }> & { userId?: number };

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

initDb();

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET!) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashed]
    );
    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: result.rows[0].id, name, email } });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await pool.query(
    'SELECT id, name, email FROM users WHERE id = $1',
    [req.userId]
  );
  res.json({ user: result.rows[0] });
});

// ─── Expenses ────────────────────────────────────────────────────────────────

app.get('/api/expenses', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await pool.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
    [req.userId]
  );
  res.json({ expenses: result.rows });
});

app.post('/api/expenses', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { description, amount, category, type, date } = req.body as {
    description: string;
    amount: number;
    category: string;
    type: string;
    date: string;
  };
  const result = await pool.query(
    'INSERT INTO expenses (user_id, description, amount, category, type, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [req.userId, description, amount, category, type, date]
  );
  res.status(201).json({ id: result.rows[0].id });
});

app.put('/api/expenses/:id', authMiddleware, async (req: AuthRequestWithParams, res: Response): Promise<void> => {
  const { description, amount, category, type, date } = req.body as {
    description: string;
    amount: number;
    category: string;
    type: string;
    date: string;
  };
  await pool.query(
    'UPDATE expenses SET description=$1, amount=$2, category=$3, type=$4, date=$5 WHERE id=$6 AND user_id=$7',
    [description, amount, category, type, date, req.params.id, req.userId]
  );
  res.json({ message: 'Atualizado' });
});

app.delete('/api/expenses/:id', authMiddleware, async (req: AuthRequestWithParams, res: Response): Promise<void> => {
  await pool.query(
    'DELETE FROM expenses WHERE id=$1 AND user_id=$2',
    [req.params.id, req.userId]
  );
  res.json({ message: 'Removido' });
});

export default app;