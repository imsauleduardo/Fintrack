"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionInput } from "@/lib/validations/transaction";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import { getLiabilities } from "@/lib/actions/liabilities";
import { getUserProfile } from "@/lib/actions/profile";
import * as Icons from "lucide-react";
import { Loader2, Wallet, CreditCard, Banknote, Landmark, ArrowRightLeft, Plus } from "lucide-react";

interface TransactionFormProps {
    onSubmit: (data: TransactionInput) => void;
    isLoading: boolean;
    initialData?: any;
}

export default function TransactionForm({ onSubmit, isLoading, initialData }: TransactionFormProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [liabilities, setLiabilities] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isFetchingData, setIsFetchingData] = useState(true);

    const toLocalISO = (date: Date) => {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: initialData ? {
            ...initialData,
            amount: initialData.amount.toString(),
            date: initialData.date ? toLocalISO(new Date(initialData.date)) : toLocalISO(new Date())
        } : {
            type: 'expense',
            date: toLocalISO(new Date()),
            payment_method: 'Efectivo'
        }
    });

    useEffect(() => {
        async function load() {
            setIsFetchingData(true);
            try {
                const [cats, assts, liabs, profile] = await Promise.all([
                    getCategories(),
                    getAssets(),
                    getLiabilities(),
                    getUserProfile()
                ]);
                setCategories(cats || []);
                setAssets(assts || []);
                setLiabilities(liabs || []);
                setUserProfile(profile);
            } catch (e) {
                console.error("Error loading form data:", e);
            } finally {
                setIsFetchingData(false);
            }
        }
        load();
    }, []);

    const selectedType = watch("type");
    const selectedAssetId = watch("asset_id");
    const selectedLiabilityId = watch("liability_id");
    const filteredCategories = categories.filter(c => c.type === selectedType);

    const currencySymbol = userProfile?.default_currency === 'PEN' ? 'S/' :
        userProfile?.default_currency === 'EUR' ? '€' : '$';

    if (isFetchingData) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cargando opciones...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Tipo de Movimiento */}
            <div className="flex gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/50">
                <button
                    type="button"
                    onClick={() => setValue('type', 'expense')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${selectedType === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Gasto
                </button>
                <button
                    type="button"
                    onClick={() => setValue('type', 'income')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${selectedType === 'income' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Ingreso
                </button>
            </div>

            {/* Monto Principal */}
            <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground opacity-50">{currencySymbol}</span>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-muted/50 border border-border rounded-[28px] py-7 px-12 text-4xl font-black text-foreground focus:outline-none focus:border-primary transition-all text-center tabular-nums shadow-inner"
                    {...register("amount")}
                />
            </div>

            {/* Selector de Categorías */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                <div className="grid grid-cols-4 gap-2">
                    {filteredCategories.map(cat => {
                        const iconName = cat.icon ? cat.icon.charAt(0).toUpperCase() + cat.icon.slice(1) : 'HelpCircle';
                        const LucideIcon = (Icons as any)[iconName];
                        const isSelected = watch("category_id") === cat.id;

                        // Detectar si el icono es un emoji (simple check)
                        const isEmoji = !LucideIcon && cat.icon && cat.icon.length <= 4;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setValue("category_id", cat.id)}
                                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-md shadow-primary/10' : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : ''}`} style={!isSelected ? { backgroundColor: cat.color + '15', color: cat.color } : {}}>
                                    {LucideIcon ? (
                                        <LucideIcon className="w-5 h-5" />
                                    ) : (
                                        <span className="text-xl">{cat.icon || "🏷️"}</span>
                                    )}
                                </div>
                                <span className="text-[9px] font-bold truncate w-full text-center tracking-tight leading-none">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Vínculo con Cuenta (Activo o Pasivo) */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    {selectedType === 'expense' ? '¿De dónde sale el dinero?' : '¿A qué cuenta ingresa?'}
                </label>

                <div className="grid grid-cols-2 gap-3">
                    {/* Activos */}
                    <div className="space-y-2 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Landmark className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase">Activos</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {assets.map(asset => (
                                <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => {
                                        setValue("asset_id", asset.id);
                                        setValue("liability_id", undefined);
                                        setValue("payment_method", asset.name);
                                    }}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${selectedAssetId === asset.id ? 'bg-primary border-primary text-white' : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}`}
                                >
                                    <span className="text-[9px] font-bold truncate w-full text-center">{asset.name}</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("asset_id", undefined);
                                    setValue("liability_id", undefined);
                                    setValue("payment_method", "Efectivo");
                                }}
                                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${!selectedAssetId && !selectedLiabilityId ? 'bg-primary border-primary text-white' : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <span className="text-[9px] font-bold">Efectivo</span>
                            </button>
                        </div>
                    </div>

                    {/* Pasivos (solo si es gasto para marcar deuda o ingreso para pagar deuda) */}
                    <div className="space-y-2 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase">Pasivos / Deudas</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {liabilities.map(liab => (
                                <button
                                    key={liab.id}
                                    type="button"
                                    onClick={() => {
                                        setValue("liability_id", liab.id);
                                        setValue("asset_id", undefined);
                                        setValue("payment_method", liab.name);
                                    }}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${selectedLiabilityId === liab.id ? 'bg-primary border-primary text-white' : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}`}
                                >
                                    <span className="text-[9px] font-bold truncate w-full text-center">{liab.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fecha y Descripción */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fecha y Hora</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-muted/50 border border-border rounded-xl p-3 text-[11px] font-bold text-foreground outline-none focus:border-primary transition-all"
                        {...register("date")}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
                    <input
                        placeholder="Ej: Cena"
                        className="w-full bg-muted/50 border border-border rounded-xl p-3 text-[11px] font-bold text-foreground placeholder:opacity-50 outline-none focus:border-primary transition-all"
                        {...register("description")}
                    />
                </div>
            </div>

            <button
                disabled={isLoading}
                className="w-full bg-primary py-4.5 rounded-[22px] font-black text-white hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 mt-2"
            >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : initialData ? "Guardar Cambios" : "Registrar Movimiento"}
            </button>
        </form>
    );
}