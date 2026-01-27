"use client";

import { useEffect, useState } from "react";
import { Landmark, LandmarkIcon, Briefcase, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAssets } from "@/lib/actions/assets";
import { getLiabilities } from "@/lib/actions/liabilities";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { motion } from "framer-motion";

export default function PatrimonioPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [liabilities, setLiabilities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            const [a, l] = await Promise.all([getAssets(), getLiabilities()]);
            setAssets(a || []);
            setLiabilities(l || []);
            setIsLoading(false);
        }
        load();

        window.addEventListener('refresh-patrimonio', load);
        return () => window.removeEventListener('refresh-patrimonio', load);
    }, []);

    const totalAssets = assets.reduce((acc, a) => acc + Number(a.current_value || 0), 0);
    const totalLiabs = liabilities.reduce((acc, l) => acc + Number(l.current_balance || 0), 0);
    const netWorth = totalAssets - totalLiabs;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <DashboardHeader
                user={{ name: "Saúl", avatarLetter: "S" }}
                label="Activos y Pasivos"
                title="Mi Patrimonio"
            />

            <div className="">
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                    <div className="space-y-10">
                        {/* Tarjeta de Patrimonio Premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4"
                        >
                            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 rounded-[42px] text-white shadow-2xl shadow-primary/30">
                                {/* Decoración */}
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-60" />
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-black/20 rounded-full blur-2xl opacity-40" />

                                <div className="relative z-10 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div className="p-3.5 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-inner">
                                            <Briefcase className="w-6 h-6" strokeWidth={1.5} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-1">Patrimonio Neto</p>
                                            <div className="flex items-baseline justify-end gap-1">
                                                <span className="text-3xl font-black text-white">$</span>
                                                <CurrencyAmount
                                                    amount={netWorth}
                                                    colored={false}
                                                    currency=""
                                                    size="3xl"
                                                    className="font-black tracking-tighter text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-green-500/20 rounded-lg">
                                                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Activos</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <CurrencyAmount
                                                    amount={totalAssets}
                                                    colored={false}
                                                    className="text-2xl font-extrabold text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Pasivos</span>
                                                <div className="p-1.5 bg-red-500/20 rounded-lg">
                                                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline justify-end gap-1">
                                                <CurrencyAmount
                                                    amount={-totalLiabs}
                                                    colored={false}
                                                    className="text-2xl font-extrabold text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <section className="space-y-6">
                            <div className="flex justify-between items-center px-6">
                                <h2 className="text-xl font-bold tracking-tight">Activos</h2>
                                <button onClick={() => router.push('/dashboard/net-worth')} className="text-xs font-bold text-primary hover:underline">Ver todos</button>
                            </div>
                            <div className="relative overflow-x-auto pb-4 no-scrollbar">
                                <div className="flex gap-4 px-6 min-w-full">
                                    {assets.length > 0 ? assets.map(a => (
                                        <div key={a.id} className="card p-5 flex flex-col justify-between min-w-[280px] h-40 bg-card border border-border rounded-[32px] hover:bg-muted/50 transition-all flex-shrink-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                                                    <Landmark className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm line-clamp-1">{a.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1">{a.institution || a.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Saldo Actual</p>
                                                <CurrencyAmount amount={a.current_value} size="2xl" className="font-black" />
                                            </div>
                                        </div>
                                    )) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-card border border-dashed border-border rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-center group transition-all w-full"
                                        >
                                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <Landmark className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">Sin activos</p>
                                                <p className="text-[10px] text-muted-foreground leading-relaxed px-4">Registra tus cuentas bancarias o inversiones para verlas aquí.</p>
                                            </div>
                                            <div className="flex gap-1.5 pt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <div className="w-1.2 h-1.2 rounded-full bg-muted" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex justify-between items-center px-6">
                                <h2 className="text-xl font-bold tracking-tight">Pasivos</h2>
                                <button onClick={() => router.push('/dashboard/net-worth')} className="text-xs font-bold text-primary hover:underline">Ver todos</button>
                            </div>
                            <div className="relative overflow-x-auto pb-4 no-scrollbar">
                                <div className="flex gap-4 px-6 min-w-full">
                                    {liabilities.length > 0 ? liabilities.map(l => (
                                        <div key={l.id} className="card p-5 flex flex-col justify-between min-w-[280px] h-40 bg-card border border-border rounded-[32px] hover:bg-muted/50 transition-all flex-shrink-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                                    <LandmarkIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm line-clamp-1">{l.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1">{l.institution || l.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deuda Pendiente</p>
                                                <CurrencyAmount amount={-Math.abs(Number(l.current_balance))} size="2xl" colored={true} className="font-bold" />
                                            </div>
                                        </div>
                                    )) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-card border border-dashed border-border rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-center group transition-all w-full"
                                        >
                                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                                                <LandmarkIcon className="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">Sin pasivos</p>
                                                <p className="text-[10px] text-muted-foreground leading-relaxed px-4">Aquí aparecerán tus deudas, tarjetas de crédito o préstamos.</p>
                                            </div>
                                            <div className="flex gap-1.5 pt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                <div className="w-1.2 h-1.2 rounded-full bg-muted" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}