"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Loader2, Target, TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { getGoals, deleteGoal } from "@/lib/actions/goals";
import Modal from "@/components/ui/Modal";
import GoalForm from "@/components/features/goals/GoalForm";
import GoalCard from "@/components/features/goals/GoalCard";
import Toast from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";

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
        setGoals(data);
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
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Metas Financieras</h1>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em]">Objetivos de Ahorro</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)} className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : goals.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-full text-gray-600"><Target className="w-12 h-12" /></div>
                    <div className="space-y-1">
                        <p className="font-bold text-gray-500">Sin metas activas</p>
                        <p className="text-xs text-gray-700">Crea objetivos de ahorro para alcanzar tus sueños.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Metas Activas */}
                    {activeGoals.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 px-2">Metas Activas ({activeGoals.length})</h2>
                            {activeGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}

                    {/* Metas Completadas */}
                    {completedGoals.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 px-2">Metas Completadas ({completedGoals.length})</h2>
                            {completedGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Meta">
                <GoalForm onSuccess={() => { setShowModal(false); loadData(); setToast({ message: "¡Meta creada!", type: 'success' }); }} />
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}