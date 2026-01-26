"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NetWorthChart({ data }: { data: any[] }) {
    if (data.length === 0) return (
        <div className="h-48 flex items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500 text-xs font-bold uppercase tracking-widest">
            Sin datos históricos suficientes
        </div>
    );

    const chartData = data.map(d => ({
        date: format(new Date(d.snapshot_date + 'T00:00:00'), 'MMM', { locale: es }),
        valor: Number(d.net_worth)
    }));

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                        dy={10}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="valor"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorNetWorth)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}