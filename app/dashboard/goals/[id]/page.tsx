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
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="min-h-screen bg-background text-foreground p-6">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Meta no encontrada</p>
                </div>
            </div>
        );
    }

    const progress = Math.min(100, goal.progress);
    const getStatusColor = () => {
        if (goal.isCompleted) return 'text-green-500';
        if (progress >= 75) return 'text-primary';
        if (progress >= 50) return 'text-orange-500';
        return 'text-muted-foreground';
    };

    const getBarColor = () => {
        if (goal.isCompleted) return 'bg-green-500';
        if (progress >= 75) return 'bg-primary';
        if (progress >= 50) return 'bg-orange-500';
        return 'bg-muted';
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 pb-24 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/goals')} className="p-2.5 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{goal.name}</h1>
                        <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Detalle de la Meta</p>
                    </div>
                </div>
                {!goal.isCompleted && (
                    <button onClick={() => setShowModal(true)} className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                )}
            </header>

            <div className="space-y-4">
                {/* Resumen de la Meta */}
                <div className="p-5 bg-card border border-border rounded-[28px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Progreso Actual</p>
                            <p className={`text-3xl font-black tabular-nums ${getStatusColor()}`}>{progress.toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Acumulado</p>
                            <p className="text-xl font-black tabular-nums">${goal.current_amount.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground font-bold mt-0.5">de ${goal.target_amount.toLocaleString()}</p>
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
                        <p className="text-muted-foreground">Resta: <span className="text-foreground">${goal.remaining.toLocaleString()}</span></p>
                        <p className={getStatusColor()}>
                            {goal.isCompleted ? '✓ Completada' : `${goal.daysRemaining} días restantes`}
                        </p>
                    </div>
                </div>

                {/* Proyección */}
                {!goal.isCompleted && (
                    <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Proyección</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Aporte Sugerido</p>
                                <p className="text-lg font-black tabular-nums">${goal.monthlyRequired.toFixed(0)}<span className="text-[10px] text-muted-foreground ml-1">/mes</span></p>
                            </div>
                            <div>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Fecha Objetivo</p>
                                <p className="text-lg font-black">{format(new Date(goal.target_date), "d MMM yyyy", { locale: es })}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Historial de Aportes */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Historial de Aportes ({goal.contributions.length})</h3>
                    </div>

                    {goal.contributions.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-[24px] border border-dashed border-border">
                            <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">Sin aportes registrados</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {goal.contributions.map((contribution: any, idx: number) => (
                                <motion.div
                                    key={contribution.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="p-3.5 bg-card border border-border/50 rounded-2xl flex justify-between items-center group hover:bg-muted/30 transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{contribution.description || 'Aporte'}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                            {format(new Date(contribution.contribution_date), "d 'de' MMMM, yyyy", { locale: es })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-lg font-black tabular-nums text-green-500">+${Number(contribution.amount).toLocaleString()}</p>
                                        <button
                                            onClick={() => handleDeleteContribution(contribution.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" />
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
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Monto del Aporte</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-3xl font-black tabular-nums text-foreground outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Ahorro mensual"
                            value={contributionDescription}
                            onChange={(e) => setContributionDescription(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-xs font-bold text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <button
                        onClick={handleAddContribution}
                        disabled={!contributionAmount || Number(contributionAmount) <= 0}
                        className="w-full py-4 bg-primary rounded-[20px] font-black text-white hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/10 mt-2"
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