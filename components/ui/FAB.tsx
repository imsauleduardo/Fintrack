"use client";

import { useState } from "react";
import { Plus, Mic, Camera, TrendingUp, TrendingDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FABProps {
    onAction: (action: "income" | "expense" | "scan" | "voice") => void;
}

const actions = [
    { id: "income", icon: TrendingUp, label: "Ingreso", color: "bg-green-600" },
    { id: "expense", icon: TrendingDown, label: "Gasto", color: "bg-red-500" },
    { id: "scan", icon: Camera, label: "Escanear", color: "bg-purple-600" },
    { id: "voice", icon: Mic, label: "Voz", color: "bg-blue-600" },
];

export default function FAB({ onAction }: FABProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleAction = (id: any) => {
        onAction(id);
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-40">
            {/* Opciones del menú radial (en vertical para móvil) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col items-end gap-3 mb-2">
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                    {action.label}
                                </span>
                                <button
                                    onClick={() => handleAction(action.id)}
                                    className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all`}
                                >
                                    <action.icon className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Botón Principal */}
            <motion.button
                onClick={toggleMenu}
                animate={{ rotate: isOpen ? 45 : 0 }}
                className={`w-16 h-16 ${isOpen ? 'bg-white/10 text-white' : 'bg-blue-600 text-white'} rounded-full flex items-center justify-center shadow-2xl transition-all border border-white/10`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            </motion.button>

            {/* Backdrop para cerrar al tocar fuera */}
            {isOpen && (
                <div
                    className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}