"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MonthlyEvolutionChart({ transactions }: { transactions: any[] }) {
    // Generar últimos 6 meses
    const endDate = new Date();
    const startDate = subMonths(endDate, 5);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const data = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            month: format(month, 'MMM', { locale: es }),
            ingresos: income,
            gastos: expenses,
            balance: income - expenses
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/20 rounded-2xl p-4 backdrop-blur-xl">
                    <p className="text-xs font-bold text-white mb-2 capitalize">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-1">
                            <span className="text-xs font-bold" style={{ color: entry.color }}>
                                {entry.name}:
                            </span>
                            <span className="text-sm font-black tabular-nums text-white">
                                ${entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Evolución Mensual</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        iconType="circle"
                    />
                    <Line
                        type="monotone"
                        dataKey="ingresos"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Ingresos"
                        dot={{ fill: '#10b981', r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="gastos"
                        stroke="#ef4444"
                        strokeWidth={3}
                        name="Gastos"
                        dot={{ fill: '#ef4444', r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}