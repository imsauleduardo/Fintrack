"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useRouter } from "next/navigation";
import { differenceInDays } from "date-fns";

export default function GoalCard({ goal, onDelete }: { goal: any, onDelete: (id: string) => void }) {
    const Icon = (Icons as any)[goal.icon] || Icons.Target;
    const progress = Math.min(100, goal.progress);
    const router = useRouter();

    const getStatusColor = () => {
        if (goal.isCompleted) return 'text-green-500';
        if (goal.daysRemaining < 30) return 'text-orange-500';
        return 'text-blue-500';
    };

    const getBarColor = () => {
        if (goal.isCompleted) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-600';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-gray-600';
    };

    const getTypeLabel = () => {
        const types: Record<string, string> = {
            savings: 'Ahorro',
            investment: 'Inversión',
            debt: 'Deuda'
        };
        return types[goal.type] || goal.type;
    };

    const handleCardClick = () => {
        router.push(`/dashboard/goals/${goal.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(goal.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-6 group relative cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: goal.color || '#3b82f6' }}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">{goal.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                            {getTypeLabel()}
                        </p>
                    </div>
                </div>
                {!goal.isCompleted && (
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <Icons.Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black italic tabular-nums">${goal.current_amount.toLocaleString()}</p>
                        <span className="text-xs text-gray-600 font-bold not-italic">de ${goal.target_amount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                        <p className={`text-2xl font-black tabular-nums ${getStatusColor()}`}>{progress.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progreso</p>
                    </div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${getBarColor()}`}
                    />
                </div>

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span>Resta: <span className="text-white">${goal.remaining.toLocaleString()}</span></span>
                    {!goal.isCompleted && (
                        <span className={goal.daysRemaining < 30 ? 'text-orange-500' : 'text-gray-500'}>
                            {goal.daysRemaining > 0 ? `${goal.daysRemaining} días` : 'Vencida'}
                        </span>
                    )}
                    {goal.isCompleted && (
                        <span className="text-green-500">✓ Completada</span>
                    )}
                </div>
            </div>
        </div>
    );
}