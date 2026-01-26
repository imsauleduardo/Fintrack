"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Loader2, AlertCircle, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getGoalById, addContribution, deleteContribution } from "@/lib/actions/goals";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function GoalDetailPage() {
    const [goal, setGoal] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [contributionAmount, setContributionAmount] = useState("");
    const [contributionDescription, setContributionDescription] = useState("");
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        loadGoal();
    }, [id]);

    const loadGoal = async () => {
        setIsLoading(true);
        try {
            const data = await getGoalById(id);
            setGoal(data);
        } catch (e: any) {
            setToast({ message: e.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddContribution = async () => {
        try {
            const result = await addContribution(id, {
                amount: Number(contributionAmount),
                description: contributionDescription
            });
            setShowModal(false);
            setContributionAmount("");
            setContributionDescription("");
            loadGoal();

            if (result.isCompleted) {
                setToast({ message: "¡Felicidades! Meta completada 🎉", type: 'success' });
            } else {
                setToast({ message: "Aporte registrado", type: 'success' });
            }
        } catch (e: any) {
            setToast({ message: e.message, type: 'error' });
        }
    };

    const handleDeleteContribution = async (contributionId: string) => {
        if (!confirm("¿Eliminar este aporte?")) return;
        try {
            await deleteContribution(contributionId, id);
            loadGoal();
            setToast({ message: "Aporte eliminado", type: 'success' });
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

    if (!goal) {
        return (
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-400">Meta no encontrada</p>
                </div>
            </div>
        );
    }

    const progress = Math.min(100, goal.progress);
    const getStatusColor = () => {
        if (goal.isCompleted) return 'text-green-500';
        if (progress >= 75) return 'text-blue-500';
        if (progress >= 50) return 'text-yellow-500';
        return 'text-gray-500';
    };

    const getBarColor = () => {
        if (goal.isCompleted) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-600';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-gray-600';
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/goals')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{goal.name}</h1>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em]">Detalle de la Meta</p>
                    </div>
                </div>
                {!goal.isCompleted && (
                    <button onClick={() => setShowModal(true)} className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                        <Plus className="w-6 h-6 text-white" />
                    </button>
                )}
            </header>

            <div className="space-y-8">
                {/* Resumen de la Meta */}
                <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[40px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Progreso Actual</p>
                            <p className={`text-5xl font-black tabular-nums ${getStatusColor()}`}>{progress.toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Acumulado</p>
                            <p className="text-3xl font-black tabular-nums">${goal.current_amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1">de ${goal.target_amount.toLocaleString()}</p>
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
                        <p className="text-gray-500 font-bold">Resta: <span className="text-white">${goal.remaining.toLocaleString()}</span></p>
                        <p className={`font-bold ${getStatusColor()}`}>
                            {goal.isCompleted ? '✓ Completada' : `${goal.daysRemaining} días restantes`}
                        </p>
                    </div>
                </div>

                {/* Proyección */}
                {!goal.isCompleted && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Proyección</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Aporte Mensual Sugerido</p>
                                <p className="text-xl font-black tabular-nums">${goal.monthlyRequired.toFixed(0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Fecha Objetivo</p>
                                <p className="text-xl font-black">{format(new Date(goal.target_date), "d MMM yyyy", { locale: es })}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Historial de Aportes */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Historial de Aportes ({goal.contributions.length})</h3>
                    </div>

                    {goal.contributions.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sin aportes aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {goal.contributions.map((contribution: any, idx: number) => (
                                <motion.div
                                    key={contribution.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="font-bold text-sm">{contribution.description || 'Aporte'}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                            {format(new Date(contribution.contribution_date), "d 'de' MMMM, yyyy", { locale: es })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xl font-black tabular-nums text-green-400">+${Number(contribution.amount).toLocaleString()}</p>
                                        <button
                                            onClick={() => handleDeleteContribution(contribution.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Nuevo Aporte */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Aporte">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Monto del Aporte</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black tabular-nums text-white outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Ahorro mensual"
                            value={contributionDescription}
                            onChange={(e) => setContributionDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleAddContribution}
                        disabled={!contributionAmount || Number(contributionAmount) <= 0}
                        className="w-full py-5 bg-blue-600 rounded-[32px] font-black text-white hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Registrar Aporte
                    </button>
                </div>
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}