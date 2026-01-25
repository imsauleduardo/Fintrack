"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Check, X, Loader2, AlertCircle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPendingTransactions, approvePendingTransaction, rejectPendingTransaction } from "@/lib/actions/pending";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/ui/Toast";

export default function PendingPage() {
    const [pendings, setPendings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const data = await getPendingTransactions();
        setPendings(data);
        setIsLoading(false);
    };

    const handleApprove = async (p: any) => {
        setProcessingId(p.id);
        try {
            await approvePendingTransaction(p.id, {
                amount: p.amount,
                description: p.description,
                category_id: p.category_id,
                date: p.date || new Date().toISOString().split('T')[0], // Triple seguro: Fallback si la fila ya era null
                type: p.type || 'expense',
                payment_method: "Email Sync"
            });
            setToast({ message: "Movimiento aprobado", type: 'success' });
            setPendings(prev => prev.filter(item => item.id !== p.id));
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await rejectPendingTransaction(id);
            setToast({ message: "Movimiento descartado", type: 'success' });
            setPendings(prev => prev.filter(item => item.id !== id));
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
            if (isNaN(date.getTime())) return "Pendiente";
            return format(date, "d MMM", { locale: es });
        } catch (e) {
            return "Pendiente";
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
            <header className="flex items-center gap-4 mb-10">
                <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 active:scale-95 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Por Revisar</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Movimientos detectados</p>
                </div>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : pendings.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-full"><Check className="w-8 h-8 text-green-500" /></div>
                    <p className="text-gray-500 font-medium">¡Todo al día! No hay pendientes.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {pendings.map((p) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold tracking-tight">${Number(p.amount).toLocaleString()}</p>
                                        <p className="text-sm text-gray-400 font-medium">{p.description}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(p.date)}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleReject(p.id)}
                                        disabled={processingId === p.id}
                                        className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Descartar
                                    </button>
                                    <button
                                        onClick={() => handleApprove(p)}
                                        disabled={processingId === p.id}
                                        className="flex-1 py-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Aprobar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}