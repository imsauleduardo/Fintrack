"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, AlertCircle, Calendar, Tag, FileText, Edit2, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { deleteTransaction } from "@/lib/actions/transactions";

export default function TransactionDetailPage() {
    const [transaction, setTransaction] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        loadTransaction();
    }, [id]);

    const loadTransaction = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("transactions")
                .select("*, categories(name, icon, color)")
                .eq("id", id)
                .single();

            if (error) throw error;
            setTransaction(data);
        } catch (e: any) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Eliminar esta transacción?")) return;
        await deleteTransaction(id);
        router.push("/dashboard");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-400">Transacción no encontrada</p>
                </div>
            </div>
        );
    }

    const isIncome = transaction.type === 'income';

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Detalle de Transacción</h1>
                        <p className={`text-xs font-black uppercase tracking-[0.2em] ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                            {isIncome ? 'Ingreso' : 'Gasto'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/transactions/${id}/edit`)}
                        className="p-3 bg-white/5 rounded-2xl border border-white/10 text-blue-400 hover:bg-white/10 transition-all"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-3 bg-white/5 rounded-2xl border border-white/10 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="space-y-6">
                {/* Monto Principal */}
                <div className={`p-8 rounded-[40px] border ${isIncome ? 'bg-green-600/10 border-green-500/20' : 'bg-red-600/10 border-red-500/20'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Monto</p>
                    <p className={`text-6xl font-black tabular-nums ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'}${Number(transaction.amount).toLocaleString()}
                    </p>
                </div>

                {/* Detalles */}
                <div className="space-y-4">
                    {/* Categoría */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center gap-4">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: transaction.categories?.color || '#3b82f6' }}>
                            <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Categoría</p>
                            <p className="text-lg font-bold">{transaction.categories?.name || 'Sin categoría'}</p>
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 rounded-2xl">
                            <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fecha</p>
                            <p className="text-lg font-bold">
                                {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>
                    </div>

                    {/* Descripción */}
                    {transaction.description && (
                        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Descripción</p>
                            </div>
                            <p className="text-sm text-gray-300">{transaction.description}</p>
                        </div>
                    )}

                    {/* Método de Pago */}
                    {transaction.payment_method && (
                        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center gap-4">
                            <div className="p-3 bg-purple-600/20 rounded-2xl">
                                <FileText className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Método de Pago</p>
                                <p className="text-lg font-bold capitalize">{transaction.payment_method}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
