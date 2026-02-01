"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import StatsSummary from "@/components/features/dashboard/StatsSummary";
import BudgetWidget from "@/components/features/budgets/BudgetWidget";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import TransactionItem from "@/components/ui/TransactionItem";
import { getTransactions } from "@/lib/actions/transactions";
import { getPendingTransactions } from "@/lib/actions/pending";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import * as Icons from "lucide-react";
import { ListX, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadData();
        window.addEventListener('refresh-data', loadData);
        return () => window.removeEventListener('refresh-data', loadData);
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [txData, pData] = await Promise.all([
                getTransactions(),
                getPendingTransactions()
            ]);
            setTransactions(txData || []);
            setPendingCount(pData?.length || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
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
        <div className="w-full max-w-full overflow-x-hidden bg-background text-foreground pb-24">
            <DashboardHeader user={{ name: "Saúl", avatarLetter: "S" }} />

            <div className="space-y-8 mb-8 max-w-full overflow-hidden px-4">
                {/* Alerta de Pendientes */}
                <AnimatePresence>
                    {pendingCount > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => router.push('/dashboard/transactions/pending')}
                            className="w-full p-4 bg-primary rounded-[28px] flex items-center justify-between gap-3 shadow-lg shadow-primary/20 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Revisión pendiente</p>
                                    <p className="text-white/80 text-[10px] font-bold">Tienes {pendingCount} movimientos detectados en tu email</p>
                                </div>
                            </div>
                            <div className="p-2 bg-white/20 rounded-xl text-white">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Resumen */}
                {isLoading ? (
                    <Skeleton height="180px" />
                ) : (
                    <StatsSummary transactions={transactions} />
                )}

                {/* Presupuestos */}
                <div className="space-y-3 max-w-full overflow-hidden">
                    <div className="flex justify-between items-center px-6">
                        <h2 className="text-lg font-bold tracking-tight">Presupuestos</h2>
                        <button
                            onClick={() => router.push('/dashboard/budgets')}
                            className="text-[11px] font-bold text-primary"
                        >
                            Ver todos
                        </button>
                    </div>
                    {isLoading ? <div className="px-4"><Skeleton height="140px" /></div> : <BudgetWidget />}
                </div>
            </div>

            <section className="space-y-4 px-4 max-w-full overflow-hidden">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold tracking-tight">Movimientos</h2>
                    <button
                        onClick={() => router.push('/dashboard/transactions')}
                        className="text-[11px] font-bold text-primary"
                    >
                        Ver todos
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-3 p-2">
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedTransactions).length === 0 ? (
                            <div className="px-2">
                                <div className="bg-card border border-dashed border-border rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 text-center">
                                    <ListX className="w-5 h-5 text-muted-foreground" />
                                    <p className="font-bold text-sm">Sin movimientos</p>
                                </div>
                            </div>
                        ) : (
                            Object.keys(groupedTransactions).map((date) => (
                                <div key={date} className="space-y-2.5">
                                    <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-3 opacity-60">
                                        {formatDateHeader(date)}
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedTransactions[date].slice(0, 5).map((t: any) => (
                                            <TransactionItem
                                                key={t.id}
                                                transaction={t}
                                            // Optional: Add click handler if we want navigation to details
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}