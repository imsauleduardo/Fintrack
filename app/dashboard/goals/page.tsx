"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { getGoals, deleteGoal } from "@/lib/actions/goals";
import Modal from "@/components/ui/Modal";
import GoalForm from "@/components/features/goals/GoalForm";
import GoalCard from "@/components/features/goals/GoalCard";
import Toast from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/layouts/DashboardHeader";

export default function GoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getGoals();
        setGoals(data || []);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta meta?")) return;
        await deleteGoal(id);
        loadData();
        setToast({ message: "Meta eliminada", type: 'success' });
    };

    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <DashboardHeader
                user={{ name: "Saúl", avatarLetter: "S" }}
                label="Metas Financieras"
                title="Metas"
            />

            <div className="px-6 relative pt-4">

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-[40px] border border-dashed border-border flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted rounded-full text-muted-foreground">
                            <Target className="w-12 h-12" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-foreground">Sin metas activas</p>
                            <p className="text-xs text-muted-foreground">Crea objetivos de ahorro para alcanzar tus sueños.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Metas Activas */}
                        {activeGoals.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                                    Metas Activas ({activeGoals.length})
                                </h2>
                                <div className="space-y-4">
                                    {activeGoals.map(goal => (
                                        <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metas Completadas */}
                        {completedGoals.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                                    Metas Completadas ({completedGoals.length})
                                </h2>
                                <div className="space-y-4 opacity-70">
                                    {completedGoals.map(goal => (
                                        <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Meta">
                <GoalForm onSuccess={() => { setShowModal(false); loadData(); setToast({ message: "¡Meta creada!", type: 'success' }); }} />
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}