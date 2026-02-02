"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, Sparkles, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCategories, deleteCategory, createCategory, updateCategory } from "@/lib/actions/categories";
import { generateCategoryDescription } from "@/lib/actions/ai-categories";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/lib/validations/category";
import EmojiPicker, { Theme } from 'emoji-picker-react';

export default function CategoriesSettingsPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { loadCategories(); }, []);

    const loadCategories = async () => {
        setIsLoading(true);
        const data = await getCategories();
        setCategories(data || []);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta categoría?")) return;
        await deleteCategory(id);
        loadCategories();
    };

    const filteredCategories = categories.filter(c => c.type === activeTab);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <header className="flex items-center gap-4 mb-8 pt-4">
                <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-muted rounded-[20px] mb-8 border border-border">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'expense' ? 'bg-background shadow-sm text-red-500' : 'text-muted-foreground'}`}
                >
                    <ArrowDownCircle className="w-4 h-4" /> Gastos
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'income' ? 'bg-background shadow-sm text-green-500' : 'text-muted-foreground'}`}
                >
                    <ArrowUpCircle className="w-4 h-4" /> Ingresos
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
                <div className="space-y-3">
                    {filteredCategories.map(cat => (
                        <div key={cat.id} className="p-4 bg-card border border-border rounded-[24px] flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-muted" style={{ backgroundColor: cat.color + '20' }}>
                                    {cat.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{cat.name}</h3>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{cat.description || "Sin descripción"}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                                    className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 bg-muted hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                        className="w-full py-4 border-2 border-dashed border-border rounded-[24px] flex items-center justify-center gap-2 text-muted-foreground font-bold hover:bg-muted/50 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Categoría
                    </button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}>
                <CategoryForm
                    initialData={editingCategory}
                    type={activeTab}
                    onSuccess={() => { setIsModalOpen(false); loadCategories(); }}
                />
            </Modal>
        </div>
    );
}

function CategoryForm({ initialData, type, onSuccess }: { initialData?: any, type: 'income' | 'expense', onSuccess: () => void }) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            icon: initialData?.icon || "🏷️",
            color: initialData?.color || "#3b82f6",
            type: initialData?.type || type,
            description: initialData?.description || ""
        }
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const currentIcon = watch('icon');
    const currentColor = watch('color');
    const currentName = watch('name');

    const handleGenerateDescription = async () => {
        if (!currentName) return alert("Escribe un nombre primero");
        setIsGenerating(true);
        try {
            const result = await generateCategoryDescription(currentName);
            // Result es un objeto { description, icon } si todo sale bien
            if (typeof result === 'object' && result !== null) {
                setValue('description', result.description);
                setValue('icon', result.icon);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const onSubmit = async (data: CategoryInput) => {
        try {
            if (initialData) {
                await updateCategory(initialData.id, data);
            } else {
                await createCategory(data);
            }
            onSuccess();
        } catch (e) {
            alert("Error al guardar");
        }
    };

    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center text-4xl border-2 border-border hover:border-primary transition-all"
                        style={{ backgroundColor: currentColor + '20' }}
                    >
                        {currentIcon}
                    </button>
                    {showEmojiPicker && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowEmojiPicker(false)}>
                            <div className="relative bg-card rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        setValue('icon', emojiData.emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                    lazyLoadEmojis={true}
                                    theme={Theme.DARK}
                                    width={320}
                                    height={400}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre</label>
                    <input
                        {...register('name')}
                        className="w-full bg-muted border border-border rounded-xl p-4 font-bold outline-none focus:border-primary transition-colors mt-2"
                        placeholder="Ej. Comida, Transporte..."
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripción</label>
                        <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating || !currentName}
                            className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generar con IA
                        </button>
                    </div>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full bg-muted border border-border rounded-xl p-4 text-sm outline-none focus:border-primary transition-colors resize-none"
                        placeholder="Descripción corta de la categoría..."
                    />
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(c => (
                            <button
                                type="button"
                                key={c}
                                onClick={() => setValue('color', c)}
                                className={`w-8 h-8 rounded-full transition-all ${currentColor === c ? 'scale-110 ring-2 ring-offset-2 ring-primary ring-offset-background' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-[24px] shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" />
                Guardar Categoría
            </button>
        </form>
    );
}
