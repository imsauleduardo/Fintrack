"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Search, Filter, Loader2, ListX } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import TransactionItem from "@/components/ui/TransactionItem";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TransactionType = 'all' | 'income' | 'expense';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<TransactionType>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const router = useRouter();

    useEffect(() => {
        loadData();
        window.addEventListener('refresh-data', loadData);
        return () => window.removeEventListener('refresh-data', loadData);
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [txData, catData] = await Promise.all([
            getTransactions(),
            getCategories()
        ]);
        setTransactions(txData);
        setCategories(catData);
        setIsLoading(false);
    };

    const filteredTransactions = transactions.filter(t => {
        const descMatch = (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        const catMatch = (t.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = descMatch || catMatch;

        const matchesType = selectedType === 'all' || t.type === selectedType;
        const matchesCategory = selectedCategory === 'all' || t.category_id === selectedCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    const groupedTransactions = filteredTransactions.reduce((groups: any, t) => {
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
        <div className="min-h-screen bg-background text-foreground pb-32 overflow-x-hidden">
            <DashboardHeader user={{ name: "Saúl", avatarLetter: "S" }} />

            <div className="px-6 space-y-6 pt-4">
                {/* Cabecera de Página con Buscador */}
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-card border border-border rounded-2xl hover:bg-muted transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar movimientos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Filtros de Tipo */}
                <div className="flex gap-1.5 bg-muted/40 p-1 rounded-[18px] border border-border/50">
                    {['all', 'income', 'expense'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type as TransactionType)}
                            className={`flex-1 py-2 rounded-[14px] text-[9px] font-bold uppercase tracking-widest transition-all ${selectedType === type
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                        >
                            {type === 'all' ? 'Todos' : type === 'income' ? 'Ingresos' : 'Gastos'}
                        </button>
                    ))}
                </div>

                {/* Filtro de Categoría (Dropdown) */}
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-card border border-border rounded-[18px] py-3 px-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-muted-foreground"
                    >
                        <option value="all">Todas las categorías</option>
                        {categories
                            .filter(cat => selectedType === 'all' || cat.type === selectedType)
                            .map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Lista de Movimientos */}
                <div className="space-y-8 pt-2">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                    ) : Object.keys(groupedTransactions).length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border border-dashed border-border rounded-[40px] py-20 px-6 flex flex-col items-center justify-center gap-6 text-center"
                        >
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                <ListX className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">No se encontraron movimientos</p>
                                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">Prueba ajustando los filtros o buscando otro término.</p>
                            </div>
                        </motion.div>
                    ) : (
                        Object.keys(groupedTransactions).map((date) => (
                            <div key={date} className="space-y-2.5">
                                <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-3 opacity-60">
                                    {formatDateHeader(date)}
                                </h3>
                                <div className="space-y-2">
                                    {groupedTransactions[date].map((t: any) => (
                                        <motion.div
                                            layout
                                            key={t.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <TransactionItem transaction={t} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
