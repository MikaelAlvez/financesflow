import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { Transaction } from '../../types';

interface TransactionChartProps {
  transactions: Transaction[];
}

interface ChartPoint {
  date: string;
  Entradas: number;
  Gastos: number;
  Saldo: number;
}

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
};

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-zinc-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmt(Number(p.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const grouped = transactions.reduce((acc, t) => {
    const date = new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    if (!acc[date]) acc[date] = { Entradas: 0, Gastos: 0 };

    if (t.type === 'income') acc[date].Entradas += t.amount;
    else acc[date].Gastos += t.amount;

    return acc;
  }, {} as Record<string, { Entradas: number; Gastos: number }>);

  const data: ChartPoint[] = Object.entries(grouped)
    .sort(([a], [b]) => {
      const [da, ma] = a.split('/').map(Number);
      const [db, mb] = b.split('/').map(Number);
      return ma !== mb ? ma - mb : da - db;
    })
    .reduce((acc, [date, values], i) => {
      const prev = acc[i - 1]?.Saldo ?? 0;
      acc.push({
        date,
        Entradas: values.Entradas,
        Gastos: values.Gastos,
        Saldo: prev + values.Entradas - values.Gastos,
      });
      return acc;
    }, [] as ChartPoint[]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6">
        Evolução no período
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `R$${(v / 1000).toFixed(1)}k`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#a1a1aa', fontSize: 13, paddingTop: 16 }}
          />
          <Line
            type="monotone"
            dataKey="Entradas"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ fill: '#4ade80', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Gastos"
            stroke="#f87171"
            strokeWidth={2}
            dot={{ fill: '#f87171', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Saldo"
            stroke="#a78bfa"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={{ fill: '#a78bfa', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}