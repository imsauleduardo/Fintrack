"use client";

import { useState } from "react";
import { createLiability } from "@/lib/actions/liabilities";
import { Loader2, CreditCard, Home, ReceiptText, MoreHorizontal } from "lucide-react";

const LIAB_TYPES = [
    { id: 'credit_card', label: 'T. Crédito', icon: CreditCard },
    { id: 'loan', label: 'Préstamo', icon: ReceiptText },
    { id: 'mortgage', label: 'Hipoteca', icon: Home },
    { id: 'other', label: 'Otro', icon: MoreHorizontal },
];

export default function LiabilityForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'credit_card', balance: '', interest_rate: '', due_date: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createLiability({
                ...formData,
                balance: Number(formData.balance),
                interest_rate: Number(formData.interest_rate) || 0
            });
            onSuccess();
        } catch (error) {
            alert("Error al guardar pasivo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                {LIAB_TYPES.map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${formData.type === type.id
                            ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20 scale-[0.98]'
                            : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        <type.icon className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{type.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nombre del Pasivo</label>
                    <input
                        type="text"
                        placeholder="ej: Visa BBVA, Préstamo Personal"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-sm font-bold text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-500 transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Saldo Pendiente ($)</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        required
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-2xl font-black tabular-nums text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-500 transition-all"
                    />
                </div>
            </div>

            <button
                disabled={loading}
                className="w-full py-4 bg-primary rounded-[20px] font-black text-white hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 mt-2"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Guardar Pasivo"}
            </button>
        </form>
    );
}