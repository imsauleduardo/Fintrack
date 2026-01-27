"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionInput } from "@/lib/validations/transaction";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/actions/categories";
import * as Icons from "lucide-react";
import { Loader2, Wallet, CreditCard, Banknote } from "lucide-react";

interface TransactionFormProps {
    onSubmit: (data: TransactionInput) => void;
    isLoading: boolean;
    initialData?: any;
}

const paymentMethods = [
    { id: 'Efectivo', icon: Banknote },
    { id: 'Tarjeta', icon: CreditCard },
    { id: 'Transferencia', icon: Wallet },
];

export default function TransactionForm({ onSubmit, isLoading, initialData }: TransactionFormProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: initialData ? {
            ...initialData,
            amount: initialData.amount.toString()
        } : {
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'Efectivo'
        }
    });

    useEffect(() => {
        async function load() {
            const data = await getCategories();
            setCategories(data);
        }
        load();
    }, []);

    const selectedType = watch("type");
    const selectedMethod = watch("payment_method");
    const filteredCategories = categories.filter(c => c.type === selectedType);

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
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground opacity-50">$</span>
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
                        const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                        const isSelected = watch("category_id") === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setValue("category_id", cat.id)}
                                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-md shadow-primary/10' : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : ''}`} style={!isSelected ? { backgroundColor: cat.color + '15', color: cat.color } : {}}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold truncate w-full text-center tracking-tight">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Método de Pago</label>
                <div className="flex gap-2">
                    {paymentMethods.map(method => (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => setValue("payment_method", method.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${selectedMethod === method.id ? 'bg-primary border-primary text-white shadow-md shadow-primary/10' : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <method.icon className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">{method.id}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Fecha y Descripción */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fecha</label>
                    <input
                        type="date"
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