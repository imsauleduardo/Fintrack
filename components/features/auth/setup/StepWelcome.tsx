"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function StepWelcome() {
    return (
        <div className="flex flex-col items-center text-center justify-center h-full">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-[32px] flex items-center justify-center mb-8 shadow-inner"
            >
                <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4 text-foreground">
                ¡Hola! Nos alegra verte aquí.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xs mx-auto">
                Antes de empezar, vamos a personalizar tu experiencia en Fintrack para que sea perfecta para ti.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Te tomará menos de 1 minuto
            </div>
        </div>
    );
}