"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileInput } from "@/lib/validations/auth";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/Input";
import { Save, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ProfileForm({ initialData }: { initialData: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: initialData.full_name || "",
            currency: initialData.default_currency || "USD",
        }
    });

    const onSubmit = async (data: ProfileInput) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ full_name: data.fullName, default_currency: data.currency })
                .eq('id', initialData.id);

            if (error) throw error;
            alert("Perfil actualizado correctamente");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
            <Input label="Nombre Completo" error={errors.fullName?.message} {...register("fullName")} />

            <div className="w-full">
                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Moneda Principal</label>
                <select
                    {...register("currency")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="PEN">Sol Peruano (PEN)</option>
                </select>
            </div>

            <button disabled={isLoading} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex justify-center gap-2 items-center">
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
            </button>
        </form>
    );
}