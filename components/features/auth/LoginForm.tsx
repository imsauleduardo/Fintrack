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
                    <div className="border-t border-border w-full"></div>
                    <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-widest absolute">o continúa con</span>
                </div>

                <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-card hover:bg-muted text-foreground py-4 rounded-2xl border border-border flex items-center justify-center gap-3 transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="font-semibold">Continuar con Google</span>
                </button>
            </div>
        </div>
    );
}