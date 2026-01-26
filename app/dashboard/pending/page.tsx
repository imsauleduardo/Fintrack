"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Check, X, Loader2, Calendar, CheckCheck, Square, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPendingTransactions, approvePendingTransaction, rejectPendingTransaction, approveSelectedTransactions } from "@/lib/actions/pending";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/ui/Toast";

export default function PendingPage() {
    const [pendings, setPendings] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const data = await getPendingTransactions();
        setPendings(data);
        setIsLoading(false);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleApprove = async (p: any) => {
        setProcessingId(p.id);
        try {
            await approvePendingTransaction(p.id, { ...p, payment_method: "Email Sync" });
            setToast({ message: "Movimiento aprobado", type: 'success' });
            setPendings(prev => prev.filter(item => item.id !== p.id));
            setSelectedIds(prev => prev.filter(i => i !== p.id));
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveSelected = async () => {
        const ids = selectedIds.length > 0 ? selectedIds : pendings.map(p => p.id);
        if (!confirm(`¿Aprobar los ${ids.length} movimientos seleccionados?`)) return;

        setIsBulkApproving(true);
        try {
            const result = await approveSelectedTransactions(ids);
            setToast({ message: `¡Listo! Se aprobaron ${result.count} movimientos`, type: 'success' });
            setPendings(prev => prev.filter(item => !ids.includes(item.id)));
            setSelectedIds([]);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsBulkApproving(false);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await rejectPendingTransaction(id);
            setToast({ message: "Movimiento descartado", type: 'success' });
            setPendings(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
            return format(date, "d MMM", { locale: es });
        } catch (e) { return "Pendiente"; }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 active:scale-95 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Por Revisar</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                            {selectedIds.length > 0 ? `${selectedIds.length} seleccionados` : 'Movimientos detectados'}
                        </p>
                    </div>
                </div>
                {pendings.length > 0 && (
                    <button
                        onClick={handleApproveSelected}
                        disabled={isBulkApproving}
                        className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                    >
                        {isBulkApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                        {selectedIds.length > 0 ? `Aprobar Selección` : 'Aprobar Todo'}
                    </button>
                )}
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
                        {pendings.map((p) => {
                            const isSelected = selectedIds.includes(p.id);
                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className={`p-6 border rounded-[32px] transition-all cursor-pointer ${isSelected ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/5 border-white/10'
                                        }`}
                                    onClick={() => toggleSelection(p.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 transition-colors ${isSelected ? 'text-blue-500' : 'text-gray-600'}`}>
                                                {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-2xl font-bold tracking-tight">${Number(p.amount).toLocaleString()}</p>
                                                <p className="text-sm text-gray-400 font-medium">{p.description}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(p.date)}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleReject(p.id)}
                                            disabled={processingId === p.id}
                                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Descartar
                                        </button>
                                        <button
                                            onClick={() => handleApprove(p)}
                                            disabled={processingId === p.id}
                                            className="flex-1 py-4 bg-blue-600 rounded-2xl text-white shadow-lg active:scale-95 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {processingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Aprobar
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}