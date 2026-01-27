"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import CurrencyAmount from "@/components/ui/CurrencyAmount";

interface StatsSummaryProps {
    transactions: any[];
}

export default function StatsSummary({ transactions }: StatsSummaryProps) {
    const totals = transactions.reduce((acc, t) => {
        const amount = Number(t.amount);
        if (t.type === 'income') acc.income += amount;
        else acc.expense += amount;
        return acc;
    }, { income: 0, expense: 0 });

    const balance = totals.income - totals.expense;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4"
        >
            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 rounded-[42px] text-white shadow-2xl shadow-primary/30">
                {/* Elementos Decorativos de Diseño (Efectos de luz) */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-black/20 rounded-full blur-2xl opacity-40" />

                <div className="relative z-10 space-y-8">
                    {/* Fila Superior: Icono y Saldo Principal */}
                    <div className="flex justify-between items-center">
                        <div className="p-3.5 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-inner">
                            <Wallet className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-1">Saldo Disponible</p>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="text-3xl font-black text-white">$</span>
                                <CurrencyAmount
                                    amount={balance}
                                    colored={false}
                                    currency=""
                                    size="3xl"
                                    className="font-black tracking-tighter text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Separador Sutil con Brillo */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Fila Inferior: Métricas de Flujo Mensual */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Ingresos */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/20 rounded-lg">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Ingresos</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <CurrencyAmount
                                    amount={totals.income}
                                    colored={false}
                                    className="text-2xl font-extrabold text-white"
                                />
                            </div>
                        </div>

                        {/* Gastos */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Gastos</span>
                                <div className="p-1.5 bg-red-500/20 rounded-lg">
                                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                                </div>
                            </div>
                            <div className="flex items-baseline justify-end gap-1">
                                <CurrencyAmount
                                    amount={-totals.expense}
                                    colored={false}
                                    className="text-2xl font-extrabold text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}   