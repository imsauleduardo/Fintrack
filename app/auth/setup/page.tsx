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

            // Mostrar pantalla de éxito antes de redirigir
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
        <div className="min-h-screen bg-black text-white p-6 flex flex-col max-w-md mx-auto">
            {/* Header con Progreso */}
            <header className="mb-10 pt-8">
                <div className={`flex justify-between items-center mb-4 transition-opacity duration-500 ${step === 1 ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-sm font-medium text-gray-500">Paso {step - 1} de {totalSteps - 1}</span>
                    <div className="flex gap-1">
                        {[2, 3, 4].map(i => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-blue-500' : 'w-4 bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        {step === 1 && <StepWelcome />}
                        {step === 2 && <StepCurrency value={formData.currency} onChange={(c: string) => setFormData({ ...formData, currency: c })} />}
                        {step === 3 && <StepCategories selected={formData.categories} onChange={(cat: string[]) => setFormData({ ...formData, categories: cat })} />}
                        {step === 4 && <StepNotifications enabled={formData.notifications} onChange={(n: boolean) => setFormData({ ...formData, notifications: n })} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer con Navegación */}
            <footer className="mt-8 pb-10 flex gap-4">
                {step > 1 && (
                    <button onClick={prevStep} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                <button
                    onClick={step === totalSteps ? handleComplete : nextStep}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        <>
                            {step === 1 ? "Comenzar" : step === totalSteps ? "Finalizar" : "Siguiente"}
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
}
