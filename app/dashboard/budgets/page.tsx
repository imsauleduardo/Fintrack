"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBudgetsWithProgress, deleteBudget } from "@/lib/actions/budgets";
import Modal from "@/components/ui/Modal";
import BudgetForm from "@/components/features/budgets/BudgetForm";
import BudgetCard from "@/components/features/budgets/BudgetCard";
import Toast from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    useEffect(() => { loadData(); }, [selectedPeriod]);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getBudgetsWithProgress();
        // Filtrar por período seleccionado
        const filtered = data.filter(b => (b.period || 'monthly') === selectedPeriod);
        setBudgets(filtered);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este presupuesto?")) return;
        await deleteBudget(id);
        loadData();
        setToast({ message: "Presupuesto eliminado", type: 'success' });
    };

    const periods: { value: Period; label: string; emoji: string }[] = [
        { value: 'daily', label: 'Diario', emoji: '📅' },
        { value: 'weekly', label: 'Semanal', emoji: '📆' },
        { value: 'monthly', label: 'Mensual', emoji: '🗓️' },
        { value: 'yearly', label: 'Anual', emoji: '📊' }
    ];

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em]">Control de Gastos</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)} className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </header>

            {/* Tabs de Períodos */}
            <div className="mb-8 p-1 bg-white/5 rounded-[24px] border border-white/10 grid grid-cols-4 gap-1">
                {periods.map(period => (
                    <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`py-3 px-2 rounded-[20px] font-bold text-xs transition-all ${selectedPeriod === period.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-lg">{period.emoji}</span>
                            <span>{period.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-full text-gray-600"><Target className="w-12 h-12" /></div>
                    <div className="space-y-1">
                        <p className="font-bold text-gray-500">Sin presupuestos {periods.find(p => p.value === selectedPeriod)?.label.toLowerCase()}es</p>
                        <p className="text-xs text-gray-700">Establece límites para controlar tus finanzas.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {budgets.map(b => (
                        <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Presupuesto">
                <BudgetForm
                    defaultPeriod={selectedPeriod}
                    onSuccess={() => {
                        setShowModal(false);
                        loadData();
                        setToast({ message: "¡Presupuesto listo!", type: 'success' });
                    }}
                />
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}