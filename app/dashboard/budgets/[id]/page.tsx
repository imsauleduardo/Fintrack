"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Edit2, TrendingDown, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getBudgetById, updateBudget } from "@/lib/actions/budgets";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DailySpendingChart from "@/components/features/budgets/DailySpendingChart";

export default function BudgetDetailPage() {
    const [budget, setBudget] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAmount, setEditAmount] = useState("");
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        loadBudget();
    }, [id]);

    const loadBudget = async () => {
        setIsLoading(true);
        try {
            const data = await getBudgetById(id);
            setBudget(data);
            setEditAmount(data.amount.toString());
        } catch (e: any) {
            setToast({ message: e.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await updateBudget(id, { amount: Number(editAmount) });
            setShowEditModal(false);
            loadBudget();
            setToast({ message: "Presupuesto actualizado", type: 'success' });
        } catch (e: any) {
            setToast({ message: e.message, type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="min-h-screen bg-background text-foreground p-6">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Presupuesto no encontrado</p>
                </div>
            </div>
        );
    }

    const progress = Math.min(100, budget.progress);
    const getStatusColor = () => {
        if (progress >= 100) return 'text-red-500';
        if (progress >= 80) return 'text-orange-500';
        return 'text-green-500';
    };

    const getBarColor = () => {
        if (progress >= 100) return 'bg-red-500';
        if (progress >= 80) return 'bg-orange-500';
        return 'bg-primary';
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 pb-24 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/budgets')} className="p-2.5 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-colors overflow-hidden">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{budget.categories?.name || 'Presupuesto Global'}</h1>
                        <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Detalle de {budget.period === 'monthly' ? 'el Mes' : budget.period === 'weekly' ? 'la Semana' : budget.period === 'daily' ? 'hoy' : 'el Año'}</p>
                    </div>
                </div>
                <button onClick={() => setShowEditModal(true)} className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-sm">
                    <Edit2 className="w-4 h-4" />
                </button>
            </header>

            <div className="space-y-4">
                {/* Resumen del Presupuesto */}
                <div className="p-5 bg-card border border-border rounded-[28px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Progreso</p>
                            <p className={`text-3xl font-black tabular-nums ${getStatusColor()}`}>{progress.toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Gastado</p>
                            <p className="text-xl font-black tabular-nums">${budget.spent.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground font-bold mt-0.5">de ${budget.amount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden mb-3 relative z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${getBarColor()}`}
                        />
                    </div>

                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest relative z-10">
                        <p className="text-muted-foreground">Resta: <span className="text-foreground">${budget.remaining.toLocaleString()}</span></p>
                        <p className={getStatusColor()}>
                            {progress >= 100 ? 'Excedido' : progress >= 80 ? 'Cerca' : 'Control'}
                        </p>
                    </div>
                </div>

                {/* Proyección y Datos Rápidos */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-3 h-3 text-primary" />
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Promedio Diario</h3>
                        </div>
                        <p className="text-lg font-black tabular-nums">${(budget.spent / Math.max(1, new Date().getDate())).toFixed(0)}</p>
                    </div>

                    <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Días Restantes</h3>
                        </div>
                        <p className="text-lg font-black tabular-nums">
                            {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                        </p>
                    </div>
                </div>

                {/* Gráfico de Gasto Diario */}
                <div className="p-1.5 bg-card border border-border rounded-[28px] shadow-sm overflow-hidden min-h-[260px]">
                    <DailySpendingChart
                        transactions={budget.transactions}
                        budgetAmount={budget.amount}
                    />
                </div>

                {/* Transacciones Asociadas */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transacciones ({budget.transactions.length})</h3>
                        </div>
                    </div>

                    {budget.transactions.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-[32px] border border-dashed border-border">
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Sin transacciones registradas</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {budget.transactions.map((tx: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="p-4 bg-card border border-border/50 rounded-2xl flex justify-between items-center hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                            <TrendingDown className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{tx.description || 'Gasto'}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                                {format(new Date(tx.date), "d 'de' MMMM", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-black tabular-nums text-foreground">-${Number(tx.amount).toLocaleString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Límite">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nuevo Límite del Período</label>
                        <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl p-4 text-3xl font-black tabular-nums text-foreground outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <button
                        onClick={handleUpdate}
                        className="w-full py-4 bg-primary rounded-[20px] font-black text-white hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 mt-2"
                    >
                        Actualizar Presupuesto
                    </button>
                </div>
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}