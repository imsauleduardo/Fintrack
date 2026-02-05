"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronLeft, Trash2, Loader2, Edit2, ShieldCheck } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import CategoryForm from "@/components/features/categories/CategoryForm";
import { CategoryInput } from "@/lib/validations/category";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: CategoryInput) => {
        setIsProcessing(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data);
            } else {
                await createCategory(data);
            }
            setShowForm(false);
            setEditingCategory(null);
            await loadCategories();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
        try {
            await deleteCategory(id);
            await loadCategories();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const startEdit = (cat: any) => {
        setEditingCategory(cat);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-100">Categorías</h1>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingCategory(null); }}
                    className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </header>

            {showForm && (
                <div className="mb-10 p-6 bg-white/5 border border-white/10 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <button onClick={() => { setShowForm(false); setEditingCategory(null); }} className="text-gray-500 hover:text-white text-sm">Cancelar</button>
                    </div>
                    <CategoryForm
                        onSubmit={handleSubmit}
                        isLoading={isProcessing}
                        initialData={editingCategory}
                    />
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat) => {
                        const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                        const isSystem = cat.user_id === null || cat.is_default;

                        return (
                            <div
                                key={cat.id}
                                className="group relative bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center gap-3 transition-all hover:bg-white/[0.07]"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg relative"
                                    style={{ backgroundColor: cat.color }}
                                >
                                    <Icon className="w-7 h-7" />
                                    {isSystem && (
                                        <div className="absolute -top-1 -right-1 bg-black rounded-full p-1" title="Categoría del Sistema">
                                            <ShieldCheck className="w-3 h-3 text-blue-400" />
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${cat.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                    {cat.type === 'expense' ? 'Gasto' : 'Ingreso'}
                                </span>

                                {!isSystem && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}