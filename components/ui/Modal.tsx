"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    titleAction?: React.ReactNode;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, titleAction, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('has-modal-open');
        } else {
            document.body.classList.remove('has-modal-open');
        }
        return () => document.body.classList.remove('has-modal-open');
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border rounded-t-[40px] p-8 pb-12 max-h-[90vh] overflow-y-auto max-w-2xl mx-auto shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                                {titleAction}
                            </div>
                            <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}