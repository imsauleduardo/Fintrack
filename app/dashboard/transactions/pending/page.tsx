"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Check, X, Edit2, Mail, Loader2, Sparkles, Filter, Trash2, CheckSquare, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    getPendingTransactions,
    approvePendingTransaction,
    rejectPendingTransaction,
    approveAllPendingTransactions,
    approveSelectedTransactions,
    rejectSelectedTransactions
} from "@/lib/actions/pending";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import TransactionItem from "@/components/ui/TransactionItem";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import TransactionForm from "@/components/features/transactions/TransactionForm";

export default function PendingTransactionsPage() {
    const [pendings, setPendings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [editingTx, setEditingTx] = useState<any | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const router = useRouter();

    useEffect(() => {
        loadPendings();
    }, []);

    const loadPendings = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingTransactions();
            setPendings(data);
            setSelectedIds(new Set()); // Reset selections on reload
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === pendings.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendings.map(p => p.id)));
        }
    };

    const handleBatchApprove = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`¿Aprobar ${selectedIds.size} movimientos seleccionados?`)) return;

        setIsBatchProcessing(true);
        try {
            await approveSelectedTransactions(Array.from(selectedIds));
            setPendings(prev => prev.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const handleBatchReject = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`¿Descartar ${selectedIds.size} movimientos seleccionados?`)) return;

        setIsBatchProcessing(true);
        try {
            await rejectSelectedTransactions(Array.from(selectedIds));
            setPendings(prev => prev.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const handleApprove = async (id: string, data: any) => {
        setIsProcessing(id);
        try {
            await approvePendingTransaction(id, data);
            setPendings(prev => prev.filter(p => p.id !== id));
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(null);
            setEditingTx(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("¿Descartar este movimiento?")) return;
        setIsProcessing(id);
        try {
            await rejectPendingTransaction(id);
            setPendings(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-40"> {/* pb aumentado para el footer fijo */}
            <header className="flex items-center justify-between gap-4 mb-4 pt-4 px-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Por Aprobar</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {pendings.length} {pendings.length === 1 ? 'pendiente' : 'pendientes'}
                        </p>
                    </div>
                </div>

                {pendings.length > 0 && (
                    <button
                        onClick={toggleSelectAll}
                        className="p-3 bg-muted rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        {selectedIds.size === pendings.length ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                        <span className="hidden sm:inline">Seleccionar Todo</span>
                    </button>
                )}
            </header>

            <div className="px-6 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cargando pendientes...</p>
                    </div>
                ) : pendings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-muted rounded-[32px] flex items-center justify-center">
                            <Mail className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black">Bandeja Limpia</h2>
                            <p className="text-sm text-muted-foreground font-medium max-w-[200px] mx-auto">No hay nuevos movimientos detectados por confirmar ahora mismo.</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/settings/email-sync')}
                            className="px-6 py-3 bg-muted rounded-2xl text-xs font-bold uppercase tracking-widest border border-border"
                        >
                            Configurar Escaneo
                        </button>
                    </div>
                ) : (
                    <AnimatePresence>
                        {pendings.map((tx) => {
                            const Icon = (Icons as any)[tx.category?.icon] || Icons.HelpCircle;
                            const isSelected = selectedIds.has(tx.id);

                            return (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <TransactionItem
                                        transaction={tx}
                                        showSelection={true}
                                        isSelected={isSelected}
                                        onToggleSelection={() => toggleSelection(tx.id)}
                                        onClick={() => setEditingTx(tx)}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Barra Flotante de Acciones por Lote */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto"
                    >
                        <div className="bg-foreground text-background p-4 rounded-[24px] shadow-2xl flex items-center justify-between gap-4 border border-white/10">
                            <div className="pl-2">
                                <span className="font-bold text-sm block">{selectedIds.size} seleccionados</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBatchReject}
                                    disabled={isBatchProcessing}
                                    className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleBatchApprove}
                                    disabled={isBatchProcessing}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    {isBatchProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Aprobar ({selectedIds.size})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de edición */}
            <Modal
                isOpen={!!editingTx}
                onClose={() => setEditingTx(null)}
                title="Corregir Movimiento"
            >
                {editingTx && (
                    <TransactionForm
                        initialData={editingTx}
                        isLoading={isProcessing === editingTx.id}
                        onSubmit={(data) => handleApprove(editingTx.id, data)}
                    />
                )}
            </Modal>
        </div>
    );
}
