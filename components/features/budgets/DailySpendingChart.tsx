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
        <div className="p-4 bg-card rounded-[24px]">
            <div className="mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Gasto Diario vs Promedio</h3>
                <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-primary"></div>
                        <span className="text-muted-foreground/80">Gasto Real</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-muted"></div>
                        <span className="text-muted-foreground/80">Promedio</span>
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