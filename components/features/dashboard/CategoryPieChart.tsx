"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

export default function CategoryPieChart({ transactions }: { transactions: any[] }) {
    // Agrupar gastos por categoría
    const categoryMap = new Map<string, { name: string; total: number; color: string }>();

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const categoryId = t.category_id || 'uncategorized';
            const categoryName = t.categories?.name || 'Sin categoría';
            const categoryColor = t.categories?.color || '#6b7280';

            if (categoryMap.has(categoryId)) {
                const existing = categoryMap.get(categoryId)!;
                existing.total += Number(t.amount);
            } else {
                categoryMap.set(categoryId, {
                    name: categoryName,
                    total: Number(t.amount),
                    color: categoryColor
                });
            }
        });

    const data: CategoryData[] = Array.from(categoryMap.values())
        .map(cat => ({
            name: cat.name,
            value: cat.total,
            color: cat.color
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 categorías

    if (data.length === 0) {
        return (
            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Gastos por Categoría</h3>
                </div>
                <div className="text-center py-12">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sin datos de gastos</p>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const percentage = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="bg-black/90 border border-white/20 rounded-2xl p-4 backdrop-blur-xl">
                    <p className="text-xs font-bold text-white mb-1">{payload[0].name}</p>
                    <p className="text-lg font-black tabular-nums text-white">${payload[0].value.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-bold">{percentage}% del total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
            <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Gastos por Categoría</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Leyenda personalizada */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold tabular-nums">${item.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}