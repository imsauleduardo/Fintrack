"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useRouter } from "next/navigation";
import { differenceInDays } from "date-fns";
import { useUser } from "@/components/providers/UserProvider";

export default function GoalCard({ goal, onDelete }: { goal: any, onDelete: (id: string) => void }) {
    const { currencySymbol } = useUser();
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
            className="p-5 bg-card border border-border rounded-[32px] space-y-4 group relative cursor-pointer hover:bg-muted/50 transition-all active:scale-[0.98]"
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: goal.color || '#3b82f6' }}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">{goal.name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black italic tabular-nums">{currencySymbol}{goal.current_amount.toLocaleString()}</p>
                        <span className="text-[10px] text-muted-foreground font-bold not-italic">de {currencySymbol}{goal.target_amount.toLocaleString()}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                        <p className={`text-xl font-black tabular-nums ${getStatusColor()}`}>{progress.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden xs:block">Progreso</p>
                    </div>
                </div>

                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${getBarColor()}`}
                    />
                </div>

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <div className="space-x-1">
                        <span>Resta:</span>
                        <span className="text-foreground">{currencySymbol}{goal.remaining.toLocaleString()}</span>
                    </div>
                    {goal.isCompleted ? (
                        <span className="text-green-500">✓ Completada</span>
                    ) : (
                        <span className={goal.daysRemaining < 30 ? 'text-orange-500' : ''}>
                            {goal.daysRemaining > 0 ? `${goal.daysRemaining} días` : 'Vencida'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}