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
        { value: 'savings', label: 'Ahorro', icon: '💰', description: 'Para emergencias' },
        { value: 'investment', label: 'Inversión', icon: '📈', description: 'Crecimiento' },
        { value: 'debt', label: 'Deuda', icon: '💳', description: 'Pagar deudas' }
    ];

    const icons = ['Target', 'Home', 'Car', 'Plane', 'GraduationCap', 'Heart', 'Gift', 'Briefcase'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 flex gap-3 text-[11px] text-primary leading-tight">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="font-medium">Define una meta financiera y realiza aportes periódicos para alcanzarla.</p>
            </div>

            <div className="space-y-4">
                {/* Tipo de Meta */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Tipo de Meta
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {goalTypes.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type.value })}
                                className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1 ${formData.type === type.value
                                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[0.98]'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                <div className="text-xl">{type.icon}</div>
                                <p className="font-bold text-[9px] uppercase tracking-tighter">{type.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Nombre de la Meta
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Fondo de emergencia"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Monto Objetivo */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                            Monto ($)
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            required
                            min="1"
                            step="0.01"
                            value={formData.target_amount}
                            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                            className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-xl font-black tabular-nums text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* Fecha Objetivo */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Fecha
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.target_date}
                            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                            className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-sm font-bold text-foreground outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Icono y Color */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Icono</label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {icons.slice(0, 8).map(icon => {
                                const IconComponent = (Icons as any)[icon];
                                return (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`p-2 rounded-lg border transition-all flex items-center justify-center ${formData.icon === icon
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Color</label>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-7 h-7 rounded-full border-2 transition-all ${formData.color === color
                                        ? 'border-foreground scale-110'
                                        : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Descripción (Opcional)
                    </label>
                    <textarea
                        placeholder="¿Para qué es esta meta?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={1}
                        className="w-full bg-muted/50 border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all resize-none"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary rounded-[20px] font-black text-white hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
}
