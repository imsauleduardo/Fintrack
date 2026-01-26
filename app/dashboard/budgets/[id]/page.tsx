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
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-400">Presupuesto no encontrado</p>
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
        return 'bg-blue-600';
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/budgets')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{budget.categories?.name || 'Presupuesto Global'}</h1>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em]">Detalle del Mes</p>
                    </div>
                </div>
                <button onClick={() => setShowEditModal(true)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all">
                    <Edit2 className="w-5 h-5" />
                </button>
            </header>

            <div className="space-y-8">
                {/* Resumen del Presupuesto */}
                <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[40px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Progreso del Mes</p>
                            <p className={`text-5xl font-black tabular-nums ${getStatusColor()}`}>{progress.toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Gastado</p>
                            <p className="text-3xl font-black tabular-nums">${budget.spent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1">de ${budget.amount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${getBarColor()}`}
                        />
                    </div>

                    <div className="flex justify-between text-xs">
                        <p className="text-gray-500 font-bold">Resta: <span className="text-white">${budget.remaining.toLocaleString()}</span></p>
                        <p className={`font-bold ${getStatusColor()}`}>
                            {progress >= 100 ? 'Límite Excedido' : progress >= 80 ? 'Cerca del Límite' : 'Bajo Control'}
                        </p>
                    </div>
                </div>

                {/* Proyección de Consumo */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Proyección</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Promedio Diario</p>
                            <p className="text-xl font-black tabular-nums">${(budget.spent / new Date().getDate()).toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Días Restantes</p>
                            <p className="text-xl font-black tabular-nums">{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Gasto Diario */}
                <DailySpendingChart
                    transactions={budget.transactions}
                    budgetAmount={budget.amount}
                />

                {/* Transacciones Asociadas */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Transacciones del Mes ({budget.transactions.length})</h3>
                    </div>

                    {budget.transactions.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sin transacciones aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {budget.transactions.map((tx: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold text-sm">{tx.description || 'Sin descripción'}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                            {format(new Date(tx.date), "d 'de' MMMM", { locale: es })}
                                        </p>
                                    </div>
                                    <p className="text-xl font-black tabular-nums text-red-400">-${Number(tx.amount).toLocaleString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Presupuesto">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nuevo Límite Mensual</label>
                        <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black tabular-nums text-white outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleUpdate}
                        className="w-full py-5 bg-blue-600 rounded-[32px] font-black text-white hover:bg-blue-500 transition-all"
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