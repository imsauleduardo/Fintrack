"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Card Balance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] shadow-lg shadow-blue-600/20 text-white flex flex-col justify-between h-40"
            >
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-white/20 rounded-xl"><Wallet className="w-5 h-5" /></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Balance Total</span>
                </div>
                <p className="text-3xl font-bold tracking-tight">${balance.toLocaleString()}</p>
            </motion.div>

            {/* Card Ingresos */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex flex-col justify-between h-40"
            >
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-green-500/10 rounded-xl text-green-400"><TrendingUp className="w-5 h-5" /></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ingresos</span>
                </div>
                <div>
                    <p className="text-2xl font-bold tracking-tight text-green-400">+${totals.income.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Este mes</p>
                </div>
            </motion.div>

            {/* Card Gastos */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex flex-col justify-between h-40"
            >
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-500"><TrendingDown className="w-5 h-5" /></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gastos</span>
                </div>
                <div>
                    <p className="text-2xl font-bold tracking-tight text-white">-${totals.expense.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Este mes</p>
                </div>
            </motion.div>
        </div>
    );
}