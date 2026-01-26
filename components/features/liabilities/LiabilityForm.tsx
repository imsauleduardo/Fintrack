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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                {LIAB_TYPES.map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 ${formData.type === type.id
                                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <type.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre (ej: Visa BBVA, Préstamo Personal)"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-red-500 font-bold"
                />
                <input
                    type="number"
                    placeholder="Saldo Pendiente"
                    required
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-2xl font-black tabular-nums outline-none focus:border-red-500"
                />
            </div>

            <button
                disabled={loading}
                className="w-full py-5 bg-white text-black rounded-[32px] font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin text-black" /> : "Guardar Pasivo"}
            </button>
        </form>
    );
}