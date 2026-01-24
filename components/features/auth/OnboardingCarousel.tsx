'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

const slides = [
    {
        icon: <TrendingUp className="w-12 h-12 text-blue-500" />,
        title: "Control Total",
        description: "Visualiza tus ingresos y gastos en un solo lugar con gráficos dinámicos."
    },
    {
        icon: <Zap className="w-12 h-12 text-purple-500" />,
        title: "IA Inteligente",
        description: "Deja que nuestra IA categorice tus movimientos y te dé consejos de ahorro."
    },
    {
        icon: <ShieldCheck className="w-12 h-12 text-green-500" />,
        title: "Seguridad Bancaria",
        description: "Tus datos están protegidos con cifrado de grado militar y Supabase."
    }
];

export default function OnboardingCarousel() {
    const [current, setCurrent] = useState(0);

    const next = () => {
        if (current < slides.length - 1) setCurrent(current + 1);
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-8 overflow-hidden">
            <div className="flex-1 relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center flex flex-col items-center"
                    >
                        <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                            {slides[current].icon}
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{slides[current].title}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
                            {slides[current].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="pb-12">
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>

                {current === slides.length - 1 ? (
                    <Link
                        href="/auth/register"
                        className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        Empezar ahora <ChevronRight className="w-5 h-5" />
                    </Link>
                ) : (
                    <button
                        onClick={next}
                        className="w-full bg-white/5 hover:bg-white/10 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all"
                    >
                        Siguiente <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}