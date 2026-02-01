"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useRouter } from "next/navigation";

import { useUser } from "@/components/providers/UserProvider";

export default function BudgetCard({ budget, onDelete }: { budget: any, onDelete: (id: string) => void }) {
    const { currencySymbol } = useUser();
    const Icon = (Icons as any)[budget.categories?.icon] || Icons.PieChart;
    const progress = Math.min(100, budget.progress);
    const router = useRouter();

    const getStatusColor = () => {
        if (progress >= 100) return 'text-red-500';
        if (progress >= 80) return 'text-orange-500';
        return 'text-green-500';
    };

    const getBarColor = () => {
        if (progress >= 100) return 'bg-red-500';
        if (progress >= 80) return 'bg-orange-500';
        return 'bg-blue-600';
    };

    const handleCardClick = () => {
        router.push(`/dashboard/budgets/${budget.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evitar que se active el click del card
        onDelete(budget.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-6 group relative cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: budget.categories?.color || '#3b82f6' }}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">{budget.categories?.name || 'Gasto Total Mensual'}</h4>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor()}`}>
                            {progress >= 100 ? 'Superado' : `${progress.toFixed(0)}% Utilizado`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <Icons.Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black italic tabular-nums">{currencySymbol}{budget.spent.toLocaleString()}</p>
                        <span className="text-xs text-gray-600 font-bold not-italic">de {currencySymbol}{budget.amount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${getBarColor()}`}
                    />
                </div>

                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    Resta: <span className="text-white">{currencySymbol}{budget.remaining.toLocaleString()}</span>
                </p>
            </div>
        </div>
    );
}