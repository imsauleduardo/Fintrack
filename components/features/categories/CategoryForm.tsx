"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/lib/validations/category";
import { Input } from "@/components/ui/Input";
import IconPicker from "./IconPicker";
import ColorPicker from "./ColorPicker";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
    onSubmit: (data: CategoryInput) => void;
    isLoading: boolean;
    initialData?: any; // Añadimos esto para edición
}

export default function CategoryForm({ onSubmit, isLoading, initialData }: CategoryFormProps) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: initialData || { type: 'expense', icon: 'ShoppingCart', color: '#3b82f6' }
    });

    // Si initialData cambia (por ejemplo, al cambiar de una edición a otra), reseteamos el form
    useEffect(() => {
        if (initialData) reset(initialData);
    }, [initialData, reset]);

    const selectedIcon = watch("icon");
    const selectedColor = watch("color");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Nombre de Categoría" placeholder="Ej: Supermercado" error={errors.name?.message} {...register("name")} />

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Tipo</label>
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                    <button type="button" onClick={() => setValue('type', 'expense')} className={`flex-1 py-3 rounded-xl transition-all ${watch('type') === 'expense' ? 'bg-white/10 text-white font-bold' : 'text-gray-500'}`}>Gasto</button>
                    <button type="button" onClick={() => setValue('type', 'income')} className={`flex-1 py-3 rounded-xl transition-all ${watch('type') === 'income' ? 'bg-white/10 text-white font-bold' : 'text-gray-500'}`}>Ingreso</button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Icono</label>
                <IconPicker selected={selectedIcon} onChange={(val) => setValue('icon', val)} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Color</label>
                <ColorPicker selected={selectedColor} onChange={(val) => setValue('color', val)} />
            </div>

            <button disabled={isLoading} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : initialData ? "Guardar Cambios" : "Crear Categoría"}
            </button>
        </form>
    );
}