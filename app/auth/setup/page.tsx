"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase/client";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";

import StepWelcome from "@/components/features/auth/setup/StepWelcome";
import StepCurrency from "@/components/features/auth/setup/StepCurrency";
import StepCategories from "@/components/features/auth/setup/StepCategories";
import StepNotifications from "@/components/features/auth/setup/StepNotifications";
import SetupSuccess from "@/components/features/auth/setup/SetupSuccess";

export default function SetupPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        currency: "USD",
        categories: [] as string[],
        notifications: true
    });
    const router = useRouter();

    const totalSteps = 4;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;

            if (!user) throw new Error("No se encontró una sesión activa.");

            const { error } = await supabase
                .from('users')
                .update({
                    default_currency: formData.currency,
                    onboarding_completed: true,
                })
                .eq('id', user.id);

            if (error) throw error;

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 2500);

        } catch (error: any) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    if (isSuccess) return <SetupSuccess />;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-xl p-8 flex flex-col min-h-[600px] animate-fade-in relative overflow-hidden">

                {/* Header con Progreso */}
                <header className="mb-8">
                    <div className={`flex justify-between items-center mb-4 transition-opacity duration-500 ${step === 1 ? 'opacity-0' : 'opacity-100'}`}>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paso {step - 1} de {totalSteps - 1}</span>
                        <div className="flex gap-1.5">
                            {[2, 3, 4].map(i => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
                            ))}
                        </div>
                    </div>
                </header>

                <main className="flex-1 relative flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {step === 1 && <StepWelcome />}
                            {step === 2 && <StepCurrency value={formData.currency} onChange={(c: string) => setFormData({ ...formData, currency: c })} />}
                            {step === 3 && <StepCategories selected={formData.categories} onChange={(cat: string[]) => setFormData({ ...formData, categories: cat })} />}
                            {step === 4 && <StepNotifications enabled={formData.notifications} onChange={(n: boolean) => setFormData({ ...formData, notifications: n })} />}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Footer con Navegación */}
                <footer className="mt-8 flex gap-4 pt-4 border-t border-border/50">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className="p-4 rounded-2xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <button
                        onClick={step === totalSteps ? handleComplete : nextStep}
                        disabled={isLoading}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <>
                                {step === 1 ? "Comenzar Configuración" : step === totalSteps ? "Finalizar" : "Siguiente"}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
}