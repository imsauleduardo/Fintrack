"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Download, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/lib/actions/transactions";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import CategoryPieChart from "@/components/features/dashboard/CategoryPieChart";
import MonthlyEvolutionChart from "@/components/features/dashboard/MonthlyEvolutionChart";

type Period = 'month' | 'quarter' | 'year' | 'custom';

export default function ReportsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setIsLoading(false);
    };

    const getDateRange = () => {
        const now = new Date();
        switch (period) {
            case 'month':
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case 'quarter':
                const quarterStart = subMonths(now, 3);
                return { start: startOfMonth(quarterStart), end: endOfMonth(now) };
            case 'year':
                return { start: startOfYear(now), end: endOfYear(now) };
            case 'custom':
                return {
                    start: customStart ? new Date(customStart) : startOfMonth(now),
                    end: customEnd ? new Date(customEnd) : endOfMonth(now)
                };
            default:
                return { start: startOfMonth(now), end: endOfMonth(now) };
        }
    };

    const { start, end } = getDateRange();
    const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= start && tDate <= end;
    });

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    const exportToCSV = () => {
        const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
        const rows = filteredTransactions.map(t => [
            format(new Date(t.date), 'yyyy-MM-dd'),
            t.type === 'income' ? 'Ingreso' : 'Gasto',
            t.categories?.name || 'Sin categoría',
            t.description || '',
            t.amount
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${format(start, 'yyyy-MM-dd')}-${format(end, 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-4xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em]">Análisis Financiero</p>
                    </div>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </header>

            {/* Selector de Período */}
            <div className="mb-8 p-1 bg-white/5 rounded-[24px] border border-white/10 grid grid-cols-4 gap-1">
                {[
                    { value: 'month', label: 'Mes' },
                    { value: 'quarter', label: 'Trimestre' },
                    { value: 'year', label: 'Año' },
                    { value: 'custom', label: 'Personalizado' }
                ].map(p => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value as Period)}
                        className={`py-3 px-2 rounded-[20px] font-bold text-xs transition-all ${period === p.value
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Rango Personalizado */}
            {period === 'custom' && (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-[32px] grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Desde</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Hasta</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            )}

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-6 bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 rounded-[32px]">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ingresos</p>
                    </div>
                    <p className="text-3xl font-black tabular-nums text-green-400">${totalIncome.toLocaleString()}</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-600/10 to-red-600/5 border border-red-500/20 rounded-[32px]">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gastos</p>
                    </div>
                    <p className="text-3xl font-black tabular-nums text-red-400">${totalExpenses.toLocaleString()}</p>
                </div>

                <div className={`p-6 bg-gradient-to-br ${balance >= 0 ? 'from-blue-600/10 to-blue-600/5 border-blue-500/20' : 'from-orange-600/10 to-orange-600/5 border-orange-500/20'} border rounded-[32px]`}>
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-4 h-4 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Balance</p>
                    </div>
                    <p className={`text-3xl font-black tabular-nums ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        ${Math.abs(balance).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="space-y-8">
                <MonthlyEvolutionChart transactions={filteredTransactions} />
                <CategoryPieChart transactions={filteredTransactions} />
            </div>
        </div>
    );
}