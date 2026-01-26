"use client";

import { useState } from "react";
import { createAsset } from "@/lib/actions/assets";
import { Loader2, Plus, Wallet, Building2, Car, Landmark, Coins } from "lucide-react";

const ASSET_TYPES = [
    { id: 'cash', label: 'Efectivo', icon: Coins },
    { id: 'bank', label: 'Cuenta Bancaria', icon: Landmark },
    { id: 'investment', label: 'Inversión', icon: Wallet },
    { id: 'real_estate', label: 'Propiedad', icon: Building2 },
    { id: 'vehicle', label: 'Vehículo', icon: Car },
    { id: 'other', label: 'Otro', icon: Plus },
];

export default function AssetForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'bank', balance: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAsset({ ...formData, balance: Number(formData.balance) });
            setFormData({ name: '', type: 'bank', balance: '' });
            onSuccess();
        } catch (error) {
            alert("Error al guardar activo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                {ASSET_TYPES.map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 ${formData.type === type.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <type.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{type.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre (ej: Santander, Binance, etc.)"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all font-bold"
                />
                <input
                    type="number"
                    placeholder="Saldo Actual"
                    required
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-300 transition-all text-2xl font-black tabular-nums"
                />
            </div>

            <button
                disabled={loading}
                className="w-full py-5 bg-blue-600 rounded-[32px] font-black text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Guardar Activo"}
            </button>
        </form>
    );
}