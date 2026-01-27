"use client";

import { useEffect, useState } from "react";
import { getBudgetsWithProgress } from "@/lib/actions/budgets";
import { TrendingDown, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import * as Icons from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BudgetWidget() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadBudgets();
        window.addEventListener('refresh-data', loadBudgets);
        return () => window.removeEventListener('refresh-data', loadBudgets);
    }, []);

    const loadBudgets = async () => {
        setIsLoading(true);
        try {
            const data = await getBudgetsWithProgress();
            setBudgets(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return null;

    if (budgets.length === 0) {
        return (
            <div className="px-6">
                <div className="bg-card border border-dashed border-border rounded-[28px] p-6 flex flex-col items-center justify-center gap-2 text-center">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                    <p className="font-bold text-sm">Sin presupuestos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Contenedor Flex con Scroll Horizontal CSS Nativo */}
            <div className="carousel-container no-scrollbar flex gap-4 px-6 pb-2">
                {budgets.map((budget) => {
                    const progress = Math.min(100, budget.progress);
                    const isWarning = progress >= 80 && progress < 100;
                    const isDanger = progress >= 100;

                    const config = isDanger
                        ? { bg: 'bg-red-500/10', text: 'text-red-500', bar: 'bg-red-50' }
                        : isWarning
                            ? { bg: 'bg-orange-500/10', text: 'text-orange-500', bar: 'bg-orange-500' }
                            : { bg: 'bg-muted/30', text: 'text-primary', bar: 'bg-primary' };

                    const Icon = budget.category?.icon ? (Icons as any)[budget.category.icon] || CheckCircle2 : CheckCircle2;

                    return (
                        <div
                            key={budget.id}
                            className="carousel-item w-[85%] last:mr-6"
                        >
                            <button
                                onClick={() => router.push(`/dashboard/budgets/${budget.id}`)}
                                className={`w-full p-5 ${config.bg} border border-border/50 rounded-[32px] text-left transition-all active:scale-[0.98] shadow-sm`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-2xl bg-background shadow-sm ${config.text}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                                                {budget.category?.name || 'Global'}
                                            </p>
                                            <p className={`text-sm font-bold ${config.text}`}>
                                                {isDanger ? 'Excedido' : isWarning ? 'Límite' : 'En control'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xl font-black tabular-nums ${config.text}`}>
                                        {progress.toFixed(0)}%
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${config.bar} rounded-full transition-all duration-700`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                        <p className="text-muted-foreground">
                                            ${budget.spent.toLocaleString()} / <span className="text-foreground">${budget.amount.toLocaleString()}</span>
                                        </p>
                                        <p className={config.text}>Resta ${budget.remaining.toLocaleString()}</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}