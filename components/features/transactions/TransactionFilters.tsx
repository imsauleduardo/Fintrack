"use client";

import { useState } from "react";
import { Filter, X, Calendar, DollarSign, Tag } from "lucide-react";
import { format } from "date-fns";

interface FilterState {
    type: 'all' | 'income' | 'expense';
    category: string;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
}

export default function TransactionFilters({
    onApplyFilters,
    categories
}: {
    onApplyFilters: (filters: FilterState) => void;
    categories: any[];
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        type: 'all',
        category: '',
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: ''
    });

    const handleApply = () => {
        onApplyFilters(filters);
        setShowFilters(false);
    };

    const handleReset = () => {
        const resetFilters: FilterState = {
            type: 'all',
            category: '',
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: ''
        };
        setFilters(resetFilters);
        onApplyFilters(resetFilters);
    };

    const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all"
            >
                <Filter className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 rounded-full text-xs">{activeFiltersCount}</span>
                )}
            </button>

            {showFilters && (
                <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
                    {/* Tipo */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['all', 'income', 'expense'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilters({ ...filters, type: type as any })}
                                    className={`py-2 px-4 rounded-xl font-bold text-xs transition-all ${filters.type === type
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {type === 'all' ? 'Todos' : type === 'income' ? 'Ingresos' : 'Gastos'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            Categoría
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Rango de Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Desde
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hasta</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Rango de Montos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-3 h-3" />
                                Monto Mínimo
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={filters.minAmount}
                                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Monto Máximo</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={filters.maxAmount}
                                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm text-gray-400 hover:bg-white/10 transition-all"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 py-3 bg-blue-600 rounded-2xl font-bold text-sm text-white hover:bg-blue-500 transition-all"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}