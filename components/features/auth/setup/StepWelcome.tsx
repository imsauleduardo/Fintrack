"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function StepWelcome() {
    return (
        <div className="flex flex-col items-center text-center justify-center min-h-[400px]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-8"
            >
                <Sparkles className="w-10 h-10 text-blue-400" />
            </motion.div>

            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                ¡Hola! Nos alegra verte aquí.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
                Antes de empezar, vamos a personalizar tu experiencia en Fintrack para que sea perfecta para ti.
            </p>

            <div className="mt-12 flex flex-col gap-3 w-full">
                <div className="flex items-center gap-3 text-sm text-gray-500 justify-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    Te tomará menos de 1 minuto
                </div>
            </div>
        </div>
    );
}