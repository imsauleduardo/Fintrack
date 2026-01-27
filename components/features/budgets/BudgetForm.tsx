"use client";

import { useState, useEffect } from "react";
import { createBudget } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";
import { Loader2, Target, Info, Bell, RefreshCw, Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function BudgetForm({ onSuccess, defaultPeriod = 'monthly' }: { onSuccess: () => void, defaultPeriod?: Period }) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [showInfo, setShowInfo] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category_id: '',
        period: defaultPeriod,
        alert_at_percentage: 80,
        auto_renew: true
    });

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createBudget({
                amount: Number(formData.amount),
                category_id: formData.category_id || undefined,
                period: formData.period,
                alert_at_percentage: formData.alert_at_percentage
            });
            onSuccess();
        } catch (e: any) {
            alert(e.message || "Error al crear presupuesto");
        } finally {
            setLoading(false);
        }
    };

    const periods: { value: Period; label: string; description: string }[] = [
        { value: 'daily', label: 'Diario', description: 'Por día' },
        { value: 'weekly', label: 'Semanal', description: 'Por semana' },
        { value: 'monthly', label: 'Mensual', description: 'Por mes' },
        { value: 'yearly', label: 'Anual', description: 'Por año' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info Toggle Positioned relative to Modal Title via -mt */}
            <div className="flex justify-between items-center -mt-12 mb-4 relative z-[60]">
                <div />
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className={`p-2 rounded-full transition-all ${showInfo ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                    <Info className="w-4 h-4" />
                </button>
            </div>

            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 mb-4 flex gap-3 text-[10px] text-primary leading-tight">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <p className="font-medium">Establece un límite de gasto para controlar tus finanzas automáticamente. Puedes crear uno global o por categoría específica.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {/* Selector de Período */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Período
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {periods.map(period => (
                            <button
                                key={period.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, period: period.value })}
                                className={`p-2.5 rounded-xl border transition-all text-center flex flex-col gap-0.5 ${formData.period === period.value
                                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[0.98]'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                <p className="font-bold text-[10px] tracking-tight">{period.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Tipo de Presupuesto
                    </label>
                    <div className="relative">
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-xs text-foreground font-bold outline-none focus:border-primary transition-all appearance-none"
                        >
                            <option value="">🌍 Gasto Global (Todas las categorías)</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>📁 {c.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Límite Máximo ($)
                    </label>
                    <input
                        type="number"
                        placeholder="0.00"
                        required
                        min="1"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-2xl font-black tabular-nums text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
                    />
                </div>

                {/* Configuración de Alertas */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Bell className="w-3 h-3" />
                        Alerta al alcanzar (%)
                    </label>
                    <div className="flex gap-2">
                        {[70, 80, 90].map(percentage => (
                            <button
                                key={percentage}
                                type="button"
                                onClick={() => setFormData({ ...formData, alert_at_percentage: percentage })}
                                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${formData.alert_at_percentage === percentage
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[0.98]'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {percentage}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggle de Repetición Automática */}
                <div className="p-4 bg-muted/50 border border-border rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto_renew: !formData.auto_renew })}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3 text-left">
                            <div className={`p-2 rounded-lg transition-colors ${formData.auto_renew ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'}`}>
                                <RefreshCw className={`w-3.5 h-3.5 ${formData.auto_renew ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground">Renovación Auto.</p>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Reincio Periódico</p>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-all ${formData.auto_renew ? 'bg-primary' : 'bg-border'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.auto_renew ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary rounded-[20px] font-black text-white hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 mt-2"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                    <>
                        <Target className="w-5 h-5" />
                        Establecer Presupuesto
                    </>
                )}
            </button>
        </form>
    );
}