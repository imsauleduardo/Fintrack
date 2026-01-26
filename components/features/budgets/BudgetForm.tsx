"use client";

import { useState, useEffect } from "react";
import { createBudget } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";
import { Loader2, Target, Info, Bell, RefreshCw, Calendar } from "lucide-react";

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function BudgetForm({ onSuccess, defaultPeriod = 'monthly' }: { onSuccess: () => void, defaultPeriod?: Period }) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
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
        { value: 'daily', label: 'Diario', description: 'Límite por día' },
        { value: 'weekly', label: 'Semanal', description: 'Límite por semana' },
        { value: 'monthly', label: 'Mensual', description: 'Límite por mes' },
        { value: 'yearly', label: 'Anual', description: 'Límite por año' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3 text-xs text-blue-400 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">Establece un límite de gasto para controlar tus finanzas automáticamente. Puedes crear uno global o por categoría específica.</p>
            </div>

            <div className="space-y-4">
                {/* Selector de Período */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Período del Presupuesto
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {periods.map(period => (
                            <button
                                key={period.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, period: period.value })}
                                className={`p-3 rounded-2xl border transition-all text-left ${formData.period === period.value
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <p className="font-bold text-sm">{period.label}</p>
                                <p className="text-[10px] opacity-70">{period.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Tipo de Presupuesto
                    </label>
                    <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all"
                    >
                        <option value="">🌍 Gasto Global (Todas las categorías)</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>📁 {c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
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
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black tabular-nums text-white placeholder:text-gray-700 outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Configuración de Alertas */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Bell className="w-3 h-3" />
                        Alertar al alcanzar (%)
                    </label>
                    <div className="flex gap-3">
                        {[70, 80, 90].map(percentage => (
                            <button
                                key={percentage}
                                type="button"
                                onClick={() => setFormData({ ...formData, alert_at_percentage: percentage })}
                                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${formData.alert_at_percentage === percentage
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {percentage}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggle de Repetición Automática */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto_renew: !formData.auto_renew })}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${formData.auto_renew ? 'bg-blue-600/20' : 'bg-white/5'}`}>
                                <RefreshCw className={`w-4 h-4 ${formData.auto_renew ? 'text-blue-500' : 'text-gray-500'}`} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">Renovar Automáticamente</p>
                                <p className="text-[10px] text-gray-500 font-medium">Se reiniciará cada período</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all ${formData.auto_renew ? 'bg-blue-600' : 'bg-gray-700'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all ${formData.auto_renew ? 'ml-6' : 'ml-0.5'}`}></div>
                        </div>
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 rounded-[32px] font-black text-white hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                    <>
                        <Target className="w-5 h-5" />
                        Establecer Presupuesto
                    </>
                )}
            </button>
        </form>
    );
}