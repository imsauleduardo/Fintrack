"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MonthlyEvolutionChart from "@/components/features/dashboard/MonthlyEvolutionChart";
import CategoryPieChart from "@/components/features/dashboard/CategoryPieChart";
import InsightsCard from "@/components/features/dashboard/InsightsCard";
import { getTransactions } from "@/lib/actions/transactions";
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

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <DashboardHeader
                user={{ name: "Saúl", avatarLetter: "S" }}
                label="Análisis"
                title="Mis Finanzas"
            />

            <div className="px-6">
                {isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div> : (
                    <div className="space-y-10">
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