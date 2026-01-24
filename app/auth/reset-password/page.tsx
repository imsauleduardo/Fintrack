"use client";

import AuthLayout from "@/components/features/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/supabase/client";
import { Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const resetSchema = z.object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });
            if (error) throw error;
            alert("¡Contraseña actualizada con éxito!");
            router.push("/auth/login");
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Nueva contraseña"
            subtitle="Escribe tu nueva contraseña de acceso."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Nueva Contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    error={errors.password?.message as string}
                    {...register("password")}
                />
                <button
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Actualizar contraseña"}
                </button>
            </form>
        </AuthLayout>
    );
}