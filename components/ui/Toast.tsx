"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

export interface ToastProps {
    message: string;
    type: "error" | "success";
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-3xl border shadow-2xl min-w-[320px] max-w-[90vw] ${type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"
                } backdrop-blur-xl`}
        >
            {type === "error" ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-bold flex-1">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-all"><X className="w-4 h-4" /></button>
        </motion.div>
    );
}