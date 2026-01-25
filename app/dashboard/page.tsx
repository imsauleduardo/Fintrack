"use client";

import { useEffect, useState } from "react";
import { LogOut, Loader2, Trash2, Edit2, Calendar, Mail, RefreshCcw, Bell } from "lucide-react";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/lib/actions/transactions";
import { parseTransactionText } from "@/lib/actions/ai";
import { getGoogleAuthUrl } from "@/lib/actions/gmail";
import { getPotentialEmails, processSelectedEmails } from "@/lib/actions/gmail-sync"; // Nuevas acciones
import { getPendingTransactions } from "@/lib/actions/pending";
import { TransactionInput } from "@/lib/validations/transaction";
import FAB from "@/components/ui/FAB";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import TransactionForm from "@/components/features/transactions/TransactionForm";
import AITransactionInput from "@/components/features/transactions/AITransactionInput";
import VoiceRecorder from "@/components/features/transactions/VoiceRecorder";
import ReceiptScanner from "@/components/features/transactions/ReceiptScanner";
import GmailMessagePicker from "@/components/features/transactions/GmailMessagePicker"; // Nuevo componente
import * as Icons from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [potentialEmails, setPotentialEmails] = useState<any[]>([]);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [aiResult, setAiResult] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
    const router = useRouter();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [txData, pendingData] = await Promise.all([
            getTransactions(),
            getPendingTransactions()
        ]);
        setTransactions(txData);
        setPendingCount(pendingData.length);
        setIsLoading(false);
    };

    const handleConnectGmail = async () => {
        try {
            const url = await getGoogleAuthUrl();
            window.location.href = url;
        } catch (error) {
            setToast({ message: "Error al iniciar conexión", type: 'error' });
        }
    };

    // NUEVO: Flujo de sincronización interactiva
    const handleStartSync = async () => {
        setIsSyncing(true);
        try {
            const emails = await getPotentialEmails();
            if (emails.length === 0) {
                setToast({ message: "No se encontraron correos nuevos en los últimos 30 días", type: 'success' });
            } else {
                setPotentialEmails(emails);
                setShowSyncModal(true);
            }
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleProcessEmails = async (selectedIds: string[]) => {
        setIsSyncing(true);
        try {
            const result = await processSelectedEmails(selectedIds);
            await loadData();
            setShowSyncModal(false);
            setToast({ message: `¡Listo! Se procesaron ${result.count} correos`, type: 'success' });
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
        setAiResult(null);
    };

    const handleFABAction = (action: "income" | "expense" | "scan" | "voice") => {
        setAiResult(null);
        setEditingTransaction(null);
        if (action === "income") setAiResult({ type: "income", amount: "" });
        else if (action === "expense") setAiResult({ type: "expense", amount: "" });
        setShowModal(true);
    };

    const handleAIResult = (data: any) => {
        setAiResult((prev: any) => ({ ...(prev || {}), ...data }));
    };

    const handleVoiceTranscript = async (text: string) => {
        setIsAILoading(true);
        try {
            const result = await parseTransactionText(text);
            handleAIResult(result);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsAILoading(false);
        }
    };

    const handleSubmit = async (data: TransactionInput) => {
        setIsSaving(true);
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, data);
                setToast({ message: "Actualizado", type: 'success' });
            } else {
                await createTransaction(data);
                setToast({ message: "Registrado", type: 'success' });
            }
            handleCloseModal();
            loadData();
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const groupedTransactions = transactions.reduce((groups: any, t) => {
        const date = t.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
        return groups;
    }, {});

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        if (isToday(date)) return "Hoy";
        if (isYesterday(date)) return "Ayer";
        return format(date, "EEEE, d 'de' MMMM", { locale: es });
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-2xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">S</div>
                    <div>
                        <h1 className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tu Resumen</h1>
                        <p className="text-lg font-bold">Hola, Saúl</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleStartSync}
                        disabled={isSyncing}
                        className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-blue-400 transition-all"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleConnectGmail}
                        className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-blue-400 transition-all"
                    >
                        <Mail className="w-5 h-5" />
                    </button>
                    <button onClick={async () => { const { supabase } = await import('@/supabase/client'); await supabase.auth.signOut(); window.location.href = '/auth/login'; }} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-red-500 transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {pendingCount > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <button
                            onClick={() => router.push('/dashboard/pending')}
                            className="w-full p-4 bg-blue-600 rounded-3xl flex items-center justify-between shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-xl"><Bell className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Sync Automática</p>
                                    <p className="text-sm font-bold">Tienes {pendingCount} movimientos por revisar</p>
                                </div>
                            </div>
                            <Icons.ChevronRight className="w-5 h-5 opacity-60" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="space-y-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight">Movimientos</h2>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Calendar className="w-5 h-5 text-gray-500" /></div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                    <div className="space-y-10">
                        {Object.keys(groupedTransactions).map((date) => (
                            <div key={date} className="space-y-4">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{formatDateHeader(date)}</h3>
                                <div className="space-y-3">
                                    {groupedTransactions[date].map((t: any) => {
                                        const Icon = (Icons as any)[t.category?.icon] || Icons.HelpCircle;
                                        return (
                                            <div key={t.id} className="group relative flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-3xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: t.category?.color || '#3b82f6' }}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{t.description || t.category?.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.payment_method}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className={`font-bold ${t.type === 'expense' ? 'text-white' : 'text-green-400'}`}>
                                                        {t.type === 'expense' ? '-' : '+'} ${Number(t.amount).toLocaleString()}
                                                    </p>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingTransaction(t); setShowModal(true); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><Edit2 className="w-3 h-3" /></button>
                                                        <button onClick={async () => { if (confirm("¿Borrar?")) { await deleteTransaction(t.id); loadData(); } }} className="p-2 bg-red-500/10 text-red-500 rounded-xl"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <FAB onAction={handleFABAction} />

            {/* Modal de Sincronización Interactiva */}
            <Modal
                isOpen={showSyncModal}
                onClose={() => setShowSyncModal(false)}
                title="Sincronizar Gmail"
            >
                <GmailMessagePicker
                    emails={potentialEmails}
                    onProcess={handleProcessEmails}
                    onCancel={() => setShowSyncModal(false)}
                    isProcessing={isSyncing}
                />
            </Modal>

            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingTransaction ? "Editar" : "Nuevo"}>
                <div className="space-y-8">
                    {!editingTransaction && (
                        <div className="space-y-6">
                            <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col gap-6">
                                <VoiceRecorder onTranscript={handleVoiceTranscript} isProcessing={isAILoading} />
                                <ReceiptScanner onResult={handleAIResult} isProcessing={isAILoading} setIsProcessing={setIsAILoading} />
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-px bg-white/5 flex-1" />
                                    <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">o escribe</span>
                                    <div className="h-px bg-white/5 flex-1" />
                                </div>
                                <AITransactionInput onResult={handleAIResult} />
                            </div>
                        </div>
                    )}
                    <TransactionForm onSubmit={handleSubmit} isLoading={isSaving} initialData={editingTransaction || aiResult} key={editingTransaction?.id || JSON.stringify(aiResult)} />
                </div>
            </Modal>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}
