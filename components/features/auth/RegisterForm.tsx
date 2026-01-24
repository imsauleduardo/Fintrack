"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { data: { full_name: data.fullName } }
        });
        setIsLoading(false);
        if (error) alert(error.message);
        else router.push("/auth/login?msg=check-email");
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nombre" icon={<User className="w-5 h-5" />} error={errors.fullName?.message} {...register("fullName")} />
            <Input label="Email" type="email" icon={<Mail className="w-5 h-5" />} error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" icon={<Lock className="w-5 h-5" />} error={errors.password?.message} {...register("password")} />
            <button disabled={isLoading} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex justify-center">
                {isLoading ? <Loader2 className="animate-spin" /> : "Registrarse"}
            </button>
        </form>
    );
}