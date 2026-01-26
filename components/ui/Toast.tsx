import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const config = {
        success: { bg: 'bg-green-500', icon: CheckCircle, border: 'border-green-600' },
        error: { bg: 'bg-red-500', icon: XCircle, border: 'border-red-600' },
        warning: { bg: 'bg-yellow-500', icon: AlertTriangle, border: 'border-yellow-600' },
        info: { bg: 'bg-blue-500', icon: Info, border: 'border-blue-600' },
    };

    const { bg, icon: Icon, border } = config[type];

    // Nota: Usamos clases de utilidad directas aquí porque los toasts suelen necesitar
    // sobresalir sobre el tema base con colores muy vivos y texto blanco siempre.
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-4">
            <motion.div
                initial={{ y: -50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex items-center gap-3 p-4 rounded-xl shadow-lg text-white ${bg} ${border} border border-opacity-20 backdrop-blur-md`}
            >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
};

export default Toast;