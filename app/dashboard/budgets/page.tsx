"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBudgetsWithProgress, deleteBudget } from "@/lib/actions/budgets";
import Modal from "@/components/ui/Modal";
import BudgetForm from "@/components/features/budgets/BudgetForm";
import BudgetCard from "@/components/features/budgets/BudgetCard";
import Toast from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";
import { AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/layouts/DashboardHeader";

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
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <DashboardHeader
                user={{ name: "Saúl", avatarLetter: "S" }}
                title="Presupuestos"
            />

            <div className="mb-8 p-1 bg-muted rounded-[24px] border border-border grid grid-cols-4 gap-1">
                {periods.map(period => (
                    <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`py-3 px-1 rounded-[20px] font-bold text-[10px] uppercase tracking-tighter transition-all ${selectedPeriod === period.value
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-base">{period.emoji}</span>
                            <span>{period.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : budgets.length === 0 ? (
                <EmptyState
                    icon={Target}
                    title={`Sin presupuestos ${periods.find(p => p.value === selectedPeriod)?.label.toLowerCase()}es`}
                    description="Establece límites para controlar tus finanzas."
                    className="py-20"
                />
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