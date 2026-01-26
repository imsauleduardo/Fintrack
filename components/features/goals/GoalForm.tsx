"use client";

import { useState } from "react";
import { createGoal } from "@/lib/actions/goals";
import { Loader2, Target, Info, Calendar } from "lucide-react";
import { addMonths, format } from "date-fns";
import * as Icons from "lucide-react";

type GoalType = 'savings' | 'investment' | 'debt';

export default function GoalForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'savings' as GoalType,
        target_amount: '',
        target_date: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
        description: '',
        icon: 'Target',
        color: '#3b82f6'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createGoal({
                name: formData.name,
                type: formData.type,
                target_amount: Number(formData.target_amount),
                target_date: formData.target_date,
                description: formData.description,
                icon: formData.icon,
                color: formData.color
            });
            onSuccess();
        } catch (e: any) {
            alert(e.message || "Error al crear meta");
        } finally {
            setLoading(false);
        }
    };

    const goalTypes: { value: GoalType; label: string; icon: string; description: string }[] = [
        { value: 'savings', label: 'Ahorro', icon: '💰', description: 'Para emergencias o compras' },
        { value: 'investment', label: 'Inversión', icon: '📈', description: 'Crecimiento a largo plazo' },
        { value: 'debt', label: 'Deuda', icon: '💳', description: 'Pagar préstamos o tarjetas' }
    ];

    const icons = ['Target', 'Home', 'Car', 'Plane', 'GraduationCap', 'Heart', 'Gift', 'Briefcase'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3 text-xs text-blue-400 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">Define una meta financiera y realiza aportes periódicos para alcanzarla.</p>
            </div>

            <div className="space-y-4">
                {/* Tipo de Meta */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Tipo de Meta
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {goalTypes.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type.value })}
                                className={`p-3 rounded-2xl border transition-all text-center ${formData.type === type.value
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{type.icon}</div>
                                <p className="font-bold text-xs">{type.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Nombre de la Meta
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Fondo de emergencia"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder:text-gray-700 outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Monto Objetivo */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Monto Objetivo ($)
                    </label>
                    <input
                        type="number"
                        placeholder="0.00"
                        required
                        min="1"
                        step="0.01"
                        value={formData.target_amount}
                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black tabular-nums text-white placeholder:text-gray-700 outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Fecha Objetivo */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Fecha Objetivo
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.target_date}
                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Descripción (Opcional)
                    </label>
                    <textarea
                        placeholder="¿Para qué es esta meta?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-blue-500 transition-all resize-none"
                    />
                </div>

                {/* Icono */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Icono
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                        {icons.map(icon => {
                            const IconComponent = (Icons as any)[icon];
                            return (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`p-3 rounded-xl transition-all ${formData.icon === icon
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Color
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                        {colors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-10 h-10 rounded-xl transition-all ${formData.color === color
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                                    : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
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
                        Crear Meta
                    </>
                )}
            </button>
        </form>
    );
};