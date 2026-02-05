"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Search, Filter, Loader2, ListX } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import CurrencyAmount from "@/components/ui/CurrencyAmount";
import TransactionItem from "@/components/ui/TransactionItem";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    updateTransaction,
    deleteTransaction,
    deleteTransactions
} from "@/lib/actions/transactions";
import Modal from "@/components/ui/Modal";
import TransactionForm from "@/components/features/transactions/TransactionForm";
import { Trash2, Check, X as CloseIcon, Edit2, Loader2 as LoaderIcon } from "lucide-react";

type TransactionType = 'all' | 'income' | 'expense';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<TransactionType>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [editingTx, setEditingTx] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
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

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        if (newSelected.size > 0) setIsSelectionMode(true);
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`¿Eliminar ${selectedIds.size} movimientos definitivamente? Esto afectará tus balances.`)) return;

        setIsBatchProcessing(true);
        try {
            await deleteTransactions(Array.from(selectedIds));
            setTransactions(prev => prev.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingTx) return;
        setIsProcessing(editingTx.id);
        try {
            await updateTransaction(editingTx.id, data);
            setTransactions(prev => prev.map(t => t.id === editingTx.id ? { ...t, ...data } : t));
            setEditingTx(null);
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDeleteIndividual = async (id: string) => {
        if (!confirm("¿Eliminar este movimiento definitivamente?")) return;
        setIsProcessing(id);
        try {
            await deleteTransaction(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            setEditingTx(null);
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(null);
        }
    };



    return (
        <div className="min-h-screen bg-background text-foreground pb-32 overflow-x-hidden">
            <DashboardHeader user={{ name: "Saúl", avatarLetter: "S" }} />

            <div className="space-y-6 pt-4">
                {/* Cabecera de Página con Buscador */}
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-card border border-border rounded-2xl hover:bg-muted transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold tracking-tight">Movimientos</h1>
                    </div>
                    <button
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            if (isSelectionMode) setSelectedIds(new Set());
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelectionMode ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                    >
                        {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
                    </button>
                </div>

                <div className="relative">
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
                ) : filteredTransactions.length === 0 ? (
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
                    <div className="space-y-2">
                        {filteredTransactions.map((t: any) => (
                            <motion.div
                                layout
                                key={t.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <TransactionItem
                                    transaction={t}
                                    showSelection={isSelectionMode}
                                    isSelected={selectedIds.has(t.id)}
                                    onToggleSelection={() => toggleSelection(t.id)}
                                    onClick={() => isSelectionMode ? toggleSelection(t.id) : setEditingTx(t)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-6 right-6 z-[100] max-w-md mx-auto"
                    >
                        <div className="bg-foreground text-background p-4 rounded-[24px] shadow-2xl flex items-center justify-between gap-4 border border-white/10">
                            <div className="pl-2">
                                <span className="font-bold text-sm block">{selectedIds.size} seleccionados</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBatchDelete}
                                    disabled={isBatchProcessing}
                                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                                >
                                    {isBatchProcessing ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal
                isOpen={!!editingTx}
                onClose={() => setEditingTx(null)}
                title="Editar Movimiento"
            >
                {editingTx && (
                    <div className="space-y-6">
                        <TransactionForm
                            initialData={editingTx}
                            isLoading={isProcessing === editingTx.id}
                            onSubmit={handleUpdate}
                        />
                        <div className="pt-2">
                            <button
                                onClick={() => handleDeleteIndividual(editingTx.id)}
                                disabled={!!isProcessing}
                                className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all uppercase tracking-widest"
                            >
                                {isProcessing === editingTx.id ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Eliminar Movimiento Definitivamente
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
