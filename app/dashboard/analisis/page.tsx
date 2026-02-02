"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MonthlyEvolutionChart from "@/components/features/dashboard/MonthlyEvolutionChart";
import CategoryPieChart from "@/components/features/dashboard/CategoryPieChart";
import InsightsCard from "@/components/features/dashboard/InsightsCard";
import { getTransactions } from "@/lib/actions/transactions";
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from 'lucide-react';
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import DashboardHeader from "@/components/layouts/DashboardHeader";

export default function AnalisisPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            const data = await getTransactions();
            setTransactions(data || []);
            setIsLoading(false);
        }
        load();
    }, []);

    const currentMonthMetrics = transactions.reduce((acc, t) => {
        if (new Date(t.date).getMonth() === new Date().getMonth() &&
            new Date(t.date).getFullYear() === new Date().getFullYear()) {

            const amount = Number(t.amount);
            if (t.type === 'income') acc.income += amount;
            else acc.expense += amount;
        }
        acc.balance = acc.income - acc.expense;
        return acc;
    }, { income: 0, expense: 0, balance: 0 });

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <DashboardHeader
                user={{ name: "Saúl", avatarLetter: "S" }}
                label="Análisis"
                title="Análisis"
            />

            <div className="px-6">
                {isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div> : (
                    <div className="space-y-8">
                        {/* 4 Indicadores Clave (Mes Actual) */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="bg-card border border-border/50 p-4 rounded-[24px] space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                                        <ArrowUpCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Ingresos</span>
                                </div>
                                <CurrencyAmount amount={currentMonthMetrics.income} size="xl" className="font-black" />
                            </div>
                            <div className="bg-card border border-border/50 p-4 rounded-[24px] space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                        <ArrowDownCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Gastos</span>
                                </div>
                                <CurrencyAmount amount={-currentMonthMetrics.expense} size="xl" colored={true} className="font-black" />
                            </div>
                            <div className="bg-card border border-border/50 p-4 rounded-[24px] space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Balance</span>
                                </div>
                                <CurrencyAmount amount={currentMonthMetrics.balance} size="xl" className="font-black" />
                            </div>
                            <div className="bg-card border border-border/50 p-4 rounded-[24px] space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                                        <PiggyBank className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Ahorro</span>
                                </div>
                                <span className="text-xl font-black tabular-nums">
                                    {currentMonthMetrics.income > 0
                                        ? `${((currentMonthMetrics.balance / currentMonthMetrics.income) * 100).toFixed(0)}%`
                                        : '0%'}
                                </span>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gemini Insights</h2>
                            </div>
                            <InsightsCard />
                        </section>

                        <section className="space-y-6">
                            <div className="space-y-2 px-2">
                                <h2 className="text-xl font-bold">Evolución Mensual</h2>
                                <p className="text-xs text-muted-foreground font-medium">Comparativa de ingresos vs gastos</p>
                            </div>
                            <div className="bg-card border border-border rounded-[40px] p-6 shadow-sm">
                                <MonthlyEvolutionChart transactions={transactions} />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="space-y-2 px-2">
                                <h2 className="text-xl font-bold">Distribución por Categoría</h2>
                                <p className="text-xs text-muted-foreground font-medium">Tus gastos de este mes</p>
                            </div>
                            <div className="bg-card border border-border rounded-[40px] p-6 shadow-sm">
                                <CategoryPieChart transactions={transactions} />
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}