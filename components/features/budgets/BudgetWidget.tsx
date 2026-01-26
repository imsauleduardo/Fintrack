"use client";

import { useEffect, useState } from "react";
import { getBudgetsWithProgress } from "@/lib/actions/budgets";
import { TrendingDown, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BudgetWidget() {
    const [globalBudget, setGlobalBudget] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadBudget();
    }, []);

    const loadBudget = async () => {
        setIsLoading(true);
        try {
            const budgets = await getBudgetsWithProgress();
            // Buscar presupuesto global (sin category_id)
            const global = budgets.find(b => !b.category_id);
            setGlobalBudget(global);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !globalBudget) return null;

    const progress = Math.min(100, globalBudget.progress);
    const isWarning = progress >= 80 && progress < 100;
    const isDanger = progress >= 100;

    const getStatusConfig = () => {
        if (isDanger) return {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-500',
            icon: AlertTriangle,
            label: '¡Límite Excedido!'
        };
        if (isWarning) return {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            text: 'text-orange-500',
            icon: TrendingDown,
            label: 'Cerca del límite'
        };
        return {
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            text: 'text-green-500',
            icon: CheckCircle2,
            label: 'Bajo control'
        };
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push('/dashboard/budgets')}
            className={`w-full p-5 ${config.bg} border ${config.border} rounded-[32px] flex items-center justify-between active:scale-95 transition-all`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 ${config.bg} rounded-2xl ${config.text}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Presupuesto Mensual</p>
                    <p className={`text-sm font-black ${config.text}`}>{config.label}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                        ${globalBudget.spent.toLocaleString()} de ${globalBudget.amount.toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className={`text-2xl font-black tabular-nums ${config.text}`}>{progress.toFixed(0)}%</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Consumido</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
        </motion.button>
    );
}