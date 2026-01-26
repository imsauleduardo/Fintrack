"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DailySpendingChart({ transactions, budgetAmount }: { transactions: any[], budgetAmount: number }) {
    const chartData = useMemo(() => {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        const days = eachDayOfInterval({ start, end });

        const dailyAverage = budgetAmount / days.length;

        return days.map(day => {
            const dayTransactions = transactions.filter(tx =>
                isSameDay(new Date(tx.date), day)
            );
            const spent = dayTransactions.reduce((acc, tx) => acc + Number(tx.amount), 0);

            return {
                day: format(day, 'd', { locale: es }),
                spent,
                average: dailyAverage,
                isToday: isSameDay(day, new Date()),
                isFuture: day > new Date()
            };
        });
    }, [transactions, budgetAmount]);

    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
            <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Gasto Diario vs Promedio</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-600"></div>
                        <span className="text-gray-500">Gasto Real</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-700"></div>
                        <span className="text-gray-500">Promedio Permitido</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                    <XAxis
                        dataKey="day"
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#666"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Bar dataKey="average" fill="#374151" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    entry.isFuture ? '#1f2937' :
                                        entry.spent > entry.average ? '#ef4444' :
                                            entry.isToday ? '#3b82f6' :
                                                '#10b981'
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}