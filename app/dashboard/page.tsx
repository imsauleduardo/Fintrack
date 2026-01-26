"use client";

import { useEffect, useState } from "react";
import { LogOut, Trash2, Edit2, Calendar, Mail, RefreshCcw, Bell, Target, ChevronRight, ListX } from "lucide-react";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/lib/actions/transactions";
import { parseTransactionText } from "@/lib/actions/ai";
import { getGoogleAuthUrl } from "@/lib/actions/gmail";
import { getPotentialEmails, processSelectedEmails } from "@/lib/actions/gmail-sync";
import { getPendingTransactions } from "@/lib/actions/pending";
import { TransactionInput } from "@/lib/validations/transaction";
import FAB from "@/components/ui/FAB";
import Modal from "@/components/ui/Modal";
import Toast, { ToastType } from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import StatsSummary from "@/components/features/dashboard/StatsSummary";
import BudgetWidget from "@/components/features/budgets/BudgetWidget";
import NetWorthCard from "@/components/features/dashboard/NetWorthCard";
import TransactionForm from "@/components/features/transactions/TransactionForm";
import AITransactionInput from "@/components/features/transactions/AITransactionInput";
import VoiceRecorder from "@/components/features/transactions/VoiceRecorder";
import ReceiptScanner from "@/components/features/transactions/ReceiptScanner";
import GmailMessagePicker from "@/components/features/transactions/GmailMessagePicker";
import * as Icons from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BudgetAlertBanner from "@/components/features/budgets/BudgetAlertBanner";
import CategoryPieChart from "@/components/features/dashboard/CategoryPieChart";
import MonthlyEvolutionChart from "@/components/features/dashboard/MonthlyEvolutionChart";
import InsightsCard from "@/components/features/dashboard/InsightsCard";

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
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
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
                setToast({ message: "Actualizado correctamente", type: 'success' });
            } else {
                await createTransaction(data);
                setToast({ message: "Transacción registrada", type: 'success' });
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
        <div className="min-h-screen bg-background text-foreground p-6 pb-32 max-w-2xl mx-auto container">
            <header className="flex justify-between items-center mb-10 pt-4">
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => router.push('/dashboard/profile')}
                        className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
                    >
                        S
                    </div>
                    <div>
                        <h1 className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0">Tu Resumen</h1>
                        <p className="text-xl font-bold text-foreground">Hola, Saúl</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleStartSync}
                        disabled={isSyncing}
                        className="btn btn-secondary !p-3 rounded-2xl border-white/10"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleConnectGmail}
                        className="btn btn-secondary !p-3 rounded-2xl border-white/10"
                    >
                        <Mail className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async () => { const { supabase } = await import('@/supabase/client'); await supabase.auth.signOut(); window.location.href = '/auth/login'; }}
                        className="btn btn-ghost !p-3 rounded-2xl hover:text-red-500 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="space-y-8 mb-12">
                {/* Banner de Alertas de Presupuesto */}
                <BudgetAlertBanner />

                {/* 1. Card de Patrimonio Neto (Activos - Pasivos) */}
                {isLoading ? <Skeleton height="160px" /> : <NetWorthCard />}

                {/* 2. Resumen de Estadísticas (Ingresos/Gastos del Mes) */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton height="100px" />
                        <Skeleton height="100px" />
                    </div>
                ) : (
                    <StatsSummary transactions={transactions} />
                )}

                {/* 3. Widget de Presupuesto Global */}
                {isLoading ? <Skeleton height="140px" /> : <BudgetWidget />}

                {/* 4. Gráficos de Analytics */}
                {!isLoading && transactions.length > 0 && (
                    <>
                        <MonthlyEvolutionChart transactions={transactions} />
                        <CategoryPieChart transactions={transactions} />
                    </>
                )}

                {/* 5. Botón de Metas Financieras */}
                <button
                    onClick={() => router.push('/dashboard/goals')}
                    className="w-full p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[24px] flex items-center justify-between active:scale-95 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-500">
                            <Target className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-base font-bold text-foreground">Metas Financieras</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Objetivos de Ahorro</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </button>

                {/* 6. Insights de IA */}
                <InsightsCard />
            </div>

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
                            className="w-full p-4 bg-blue-600 rounded-3xl flex items-center justify-between shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-white"
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

            <section className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Movimientos</h2>
                    <div className="p-2 bg-muted rounded-xl border border-border"><Calendar className="w-5 h-5 text-muted-foreground" /></div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton height="80px" />
                        <Skeleton height="80px" />
                        <Skeleton height="80px" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.keys(groupedTransactions).length === 0 ? (
                            <EmptyState
                                icon={ListX}
                                title="No hay movimientos"
                                description="Tus transacciones aparecerán aquí."
                                className="my-8"
                            />
                        ) : (
                            Object.keys(groupedTransactions).map((date) => (
                                <div key={date} className="space-y-3">
                                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{formatDateHeader(date)}</h3>
                                    <div className="space-y-3">
                                        {groupedTransactions[date].map((t: any) => {
                                            const Icon = (Icons as any)[t.category?.icon] || Icons.HelpCircle;
                                            return (
                                                <div key={t.id} className="card group relative flex items-center justify-between p-4 !py-3 hover:bg-muted/50 transition-colors cursor-default">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: t.category?.color || '#3b82f6' }}>
                                                            <Icon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm tracking-tight text-foreground">{t.description || t.category?.name}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t.payment_method}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <CurrencyAmount
                                                            amount={t.type === 'expense' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount))}
                                                            colored={true}
                                                            showSign={true}
                                                            className="font-bold"
                                                        />
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setEditingTransaction(t); setShowModal(true); }} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                            <button onClick={async () => { if (confirm("¿Borrar?")) { await deleteTransaction(t.id); loadData(); } }} className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>

            <FAB onAction={handleFABAction} />

            <Modal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} title="Sincronizar Gmail">
                <GmailMessagePicker emails={potentialEmails} onProcess={handleProcessEmails} onCancel={() => setShowSyncModal(false)} isProcessing={isSyncing} />
            </Modal>

            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingTransaction ? "Editar" : "Nuevo"}>
                <div className="space-y-8">
                    {!editingTransaction && (
                        <div className="space-y-6">
                            <div className="p-6 bg-muted/30 rounded-[32px] border border-border flex flex-col gap-6">
                                <VoiceRecorder onTranscript={handleVoiceTranscript} isProcessing={isAILoading} />
                                <ReceiptScanner onResult={handleAIResult} isProcessing={isAILoading} setIsProcessing={setIsAILoading} />
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-px bg-border flex-1" />
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">o escribe</span>
                                    <div className="h-px bg-border flex-1" />
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