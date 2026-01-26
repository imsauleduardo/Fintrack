"use client";

import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";
import { getAssets } from "@/lib/actions/assets";
import { getLiabilities } from "@/lib/actions/liabilities";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NetWorthCard() {
    const [totals, setTotals] = useState({ assets: 0, liabilities: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTotals = async () => {
            try {
                const [assets, liabilities] = await Promise.all([getAssets(), getLiabilities()]);
                const totalAssets = assets.reduce((acc, a) => acc + Number(a.balance), 0);
                const totalLiabs = liabilities.reduce((acc, l) => acc + Number(l.balance), 0);
                setTotals({ assets: totalAssets, liabilities: totalLiabs });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadTotals();
    }, []);

    const netWorth = totals.assets - totals.liabilities;

    if (loading) return (
        <div className="h-[240px] bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group"
        >
            {/* Background Icon Decoration */}
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                <Wallet className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Patrimonio Neto Total</p>
                        <h2 className="text-4xl font-black tracking-tighter">
                            ${netWorth.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                        </h2>
                    </div>
                    <Link href="/dashboard/net-worth" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all border border-white/10">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-2 mb-2 text-green-300">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-50/70">Activos</span>
                        </div>
                        <p className="text-xl font-black">${totals.assets.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-2 mb-2 text-red-300">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-50/70">Pasivos</span>
                        </div>
                        <p className="text-xl font-black">${totals.liabilities.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}