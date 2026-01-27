"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Check, X, Edit2, Mail, Loader2, Sparkles, Filter, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPendingTransactions, approvePendingTransaction, rejectPendingTransaction, approveAllPendingTransactions } from "@/lib/actions/pending";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import TransactionForm from "@/components/features/transactions/TransactionForm";

export default function PendingTransactionsPage() {
    const [pendings, setPendings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [editingTx, setEditingTx] = useState<any | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadPendings();
    }, []);

    const loadPendings = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingTransactions();
            setPendings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
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

    const handleApproveAll = async () => {
        if (!confirm(`¿Aprobar los ${pendings.length} movimientos automáticamente?`)) return;
        setIsLoading(true);
        try {
            await approveAllPendingTransactions();
            setPendings([]);
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            <header className="flex items-center justify-between gap-4 mb-8 pt-4 px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Por Aprobar</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detecciones de Email</p>
                    </div>
                </div>
                {pendings.length > 1 && (
                    <button
                        onClick={handleApproveAll}
                        className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        Aprobar Todo
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
                            return (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="p-5 bg-card border border-border rounded-[32px] space-y-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: tx.category?.color || '#3b82f6' }}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm leading-tight truncate pr-4">{tx.description}</p>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{tx.category?.name || 'Sin Categoría'}</p>
                                            </div>
                                        </div>
                                        <CurrencyAmount
                                            amount={tx.type === 'expense' ? -tx.amount : tx.amount}
                                            colored={true}
                                            size="lg"
                                            className="font-black tabular-nums"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-2xl border border-border/50">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                        <p className="text-[10px] text-muted-foreground font-medium truncate italic">
                                            Asunto: {tx.source_email_subject || 'Email automático'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingTx(tx)}
                                            disabled={isProcessing === tx.id}
                                            className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Editar</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(tx.id)}
                                            disabled={isProcessing === tx.id}
                                            className="p-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl transition-all active:scale-95 border border-red-500/10"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleApprove(tx.id, tx)}
                                            disabled={isProcessing === tx.id}
                                            className="flex-[2] py-3 bg-primary text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            {isProcessing === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            <span>Aprobar</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

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
