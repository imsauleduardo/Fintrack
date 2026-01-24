"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Capturamos el mensaje de "verificar email" si viene del registro
    const message = searchParams.get("msg");

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) throw authError;

            // VERIFICACIÓN DE ONBOARDING:
            // Consultamos la tabla 'users' para ver el estado del usuario
            // Usamos .maybeSingle() para que devuelva null si no encuentra la fila en lugar de lanzar un error
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('onboarding_completed')
                .eq('id', user?.id)
                .maybeSingle();

            if (profileError) throw profileError;

            // Si NO existe el perfil o NO ha completado el onboarding, lo mandamos al setup
            if (!profile || !profile.onboarding_completed) {
                router.push("/auth/setup");
            } else {
                // Si YA lo completó, al Dashboard
                router.push("/dashboard");
            }

        } catch (error: any) {
            alert("Error al iniciar sesión: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) alert(error.message);
    };

    return (
        <div className="space-y-6">
            {/* Aviso opcional tras registro exitoso */}
            {message === "check-email" && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm">
                    ¡Registro exitoso! Por favor, verifica tu correo antes de iniciar sesión.
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Correo Electrónico"
                    type="email"
                    placeholder="tu@email.com"
                    icon={<Mail className="w-5 h-5" />}
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div className="space-y-1">
                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock className="w-5 h-5" />}
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <div className="flex justify-end pr-1">
                        <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </div>

                <button
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                </button>
            </form>

            <div className="mt-8 space-y-4">
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/10 w-full"></div>
                    <span className="bg-black px-4 text-xs text-gray-500 uppercase tracking-widest absolute">o continúa con</span>
                </div>

                <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 transition-all"
                >
                    <span className="font-semibold">Continuar con Google</span>
                </button>
            </div>
        </div>
    );
}