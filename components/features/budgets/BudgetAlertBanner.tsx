"use client";

import { useEffect, useState } from "react";
import { getBudgetsWithProgress } from "@/lib/actions/budgets";
import { AlertTriangle, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function BudgetAlertBanner() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const budgets = await getBudgetsWithProgress();
            const criticalBudgets = budgets.filter(b => {
                const threshold = b.alert_at_percentage || 80;
                return b.progress >= threshold;
            });
            setAlerts(criticalBudgets);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDismiss = (id: string) => {
        setDismissed([...dismissed, id]);
    };

    const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <AnimatePresence>
                {visibleAlerts.map((budget) => {
                    const progress = Math.min(100, budget.progress);
                    const isExceeded = progress >= 100;
                    const threshold = budget.alert_at_percentage || 80;

                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onClick={() => router.push(`/dashboard/budgets/${budget.id}`)}
                            className={`p-4 rounded-[24px] border cursor-pointer active:scale-[0.98] transition-all ${isExceeded
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-orange-500/10 border-orange-500/30'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-xl ${isExceeded ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                                    {isExceeded ? (
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4 text-orange-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-black ${isExceeded ? 'text-red-500' : 'text-orange-500'}`}>
                                        {isExceeded ? '¡Presupuesto Excedido!' : `Alerta: ${progress.toFixed(0)}% del presupuesto`}
                                    </p>
                                    <p className="text-xs text-gray-400 font-bold mt-1">
                                        {budget.categories?.name || 'Gasto Global'}: ${budget.spent.toLocaleString()} de ${budget.amount.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismiss(budget.id);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}