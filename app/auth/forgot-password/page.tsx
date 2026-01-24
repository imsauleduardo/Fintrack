"use client";

import AuthLayout from "@/components/features/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/supabase/client";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

const forgotSchema = z.object({
    email: z.string().email("Email inválido"),
});

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            setIsSent(true);
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recuperar acceso"
            subtitle="Te enviaremos un enlace para restablecer tu contraseña."
        >
            {!isSent ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="tu@email.com"
                        icon={<Mail className="w-5 h-5" />}
                        error={errors.email?.message as string}
                        {...register("email")}
                    />
                    <button
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar enlace"}
                    </button>
                </form>
            ) : (
                <div className="text-center space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl text-blue-400">
                        ¡Enlace enviado! Revisa tu bandeja de entrada para continuar.
                    </div>
                    <Link href="/auth/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al inicio
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
}