'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, color = 'var(--ink)' }: { data: number[]; color?: string }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={28}>
      <LineChart data={series}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
