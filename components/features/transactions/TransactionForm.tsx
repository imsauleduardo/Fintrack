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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                <button type="button" onClick={() => setValue('type', 'expense')} className={`flex-1 py-4 rounded-xl font-bold transition-all ${selectedType === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500'}`}>Gasto</button>
                <button type="button" onClick={() => setValue('type', 'income')} className={`flex-1 py-4 rounded-xl font-bold transition-all ${selectedType === 'income' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>Ingreso</button>
            </div>

            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-500">$</span>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-10 px-12 text-5xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center"
                    {...register("amount")}
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1 text-[10px]">Categoría</label>
                <div className="grid grid-cols-4 gap-3">
                    {filteredCategories.map(cat => {
                        const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                        const isSelected = watch("category_id") === cat.id;
                        return (
                            <button
                                key={cat.id} type="button" onClick={() => setValue("category_id", cat.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isSelected ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent'}`}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1 text-[10px]">Método de Pago</label>
                <div className="flex gap-3">
                    {paymentMethods.map(method => (
                        <button
                            key={method.id} type="button" onClick={() => setValue("payment_method", method.id)}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${selectedMethod === method.id ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                        >
                            <method.icon className="w-4 h-4" />
                            <span className="text-xs font-bold">{method.id}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Fecha" {...register("date")} />
                <Input label="Descripción" placeholder="Ej: Cena" {...register("description")} />
            </div>

            <button disabled={isLoading} className="w-full bg-blue-600 py-5 rounded-3xl font-bold text-lg flex justify-center items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : initialData ? "Guardar Cambios" : "Registrar Movimiento"}
            </button>
        </form>
    );
}