"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Mic, Camera, FileText, PieChart,
    TrendingUp, TrendingDown, Target, X
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import TransactionForm from '@/components/features/transactions/TransactionForm';
import VoiceRecorder from '@/components/features/transactions/VoiceRecorder';
import ReceiptScanner from '@/components/features/transactions/ReceiptScanner';
import BudgetForm from '@/components/features/budgets/BudgetForm';
import AssetForm from '@/components/features/assets/AssetForm';
import LiabilityForm from '@/components/features/liabilities/LiabilityForm';
import GoalForm from '@/components/features/goals/GoalForm';
import { createTransaction } from '@/lib/actions/transactions';

type ModalType = 'voice' | 'camera' | 'manual' | 'budget' | 'asset' | 'liability' | 'goal' | null;

export default function GlobalQuickActions({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = (type: ModalType) => {
        setActiveModal(type);
        onClose();
    };

    const handleAITranscript = async (text: string) => {
        setIsProcessing(true);
        try {
            // Importación dinámica de la acción de IA
            const { parseTransactionText } = await import('@/lib/actions/ai');

            // 1. Interpretar con Gemini
            const transactionData = await parseTransactionText(text);

            // 2. Guardar en Base de Datos
            await createTransaction(transactionData);

            // 3. Éxito: Limpiar y cerrar
            setActiveModal(null);
            window.dispatchEvent(new Event('refresh-data'));

            // Feedback háptico opcional
            if (window.navigator?.vibrate) window.navigator.vibrate(100);

        } catch (error: any) {
            console.error("Voice Error:", error);
            alert("Error: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualSubmit = async (data: any) => {
        setIsProcessing(true);
        try {
            await createTransaction(data);
            setActiveModal(null);
            window.dispatchEvent(new Event('refresh-data'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const menuOptions = {
        dashboard: [
            { id: 'voice', label: 'Voz', icon: Mic, color: 'bg-blue-500' },
            { id: 'camera', label: 'Cámara', icon: Camera, color: 'bg-indigo-500' },
            { id: 'manual', label: 'Manual', icon: FileText, color: 'bg-emerald-500' },
            { id: 'budget', label: 'Presu.', icon: PieChart, color: 'bg-orange-500' },
        ],
        patrimonio: [
            { id: 'asset', label: 'Activo', icon: TrendingUp, color: 'bg-emerald-500' },
            { id: 'liability', label: 'Pasivo', icon: TrendingDown, color: 'bg-rose-500' },
        ]
    };

    const isPatrimonio = pathname === '/dashboard/patrimonio';
    const currentOptions = isPatrimonio ? menuOptions.patrimonio : menuOptions.dashboard;

    return (
        <>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
                        />

                        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-6">
                            <div className="flex justify-center gap-4">
                                {currentOptions.map((opt, idx) => (
                                    <motion.button
                                        key={opt.id}
                                        initial={{ opacity: 0, y: 40, scale: 0.5 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 40, scale: 0.5 }}
                                        transition={{ type: "spring", delay: idx * 0.05 }}
                                        onClick={() => handleAction(opt.id as ModalType)}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-14 h-14 ${opt.color} rounded-[20px] flex items-center justify-center text-white shadow-xl active:scale-95 transition-all`}>
                                            <opt.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold text-white shadow-sm">{opt.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Modales */}
            <Modal isOpen={activeModal === 'manual'} onClose={() => !isProcessing && setActiveModal(null)} title="Nuevo Movimiento">
                <TransactionForm onSubmit={handleManualSubmit} isLoading={isProcessing} />
            </Modal>

            <Modal isOpen={activeModal === 'voice'} onClose={() => !isProcessing && setActiveModal(null)} title="Registrar por Voz">
                <VoiceRecorder onTranscript={handleAITranscript} isProcessing={isProcessing} />
            </Modal>

            <Modal isOpen={activeModal === 'camera'} onClose={() => !isProcessing && setActiveModal(null)} title="Escanear Recibo">
                <ReceiptScanner onResult={handleAITranscript} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
            </Modal>

            <Modal isOpen={activeModal === 'budget'} onClose={() => setActiveModal(null)} title="Nuevo Presupuesto">
                <BudgetForm onSuccess={() => {
                    setActiveModal(null);
                    window.dispatchEvent(new Event('refresh-data'));
                }} />
            </Modal>

            <Modal isOpen={activeModal === 'asset'} onClose={() => setActiveModal(null)} title="Nuevo Activo">
                <AssetForm onSuccess={() => {
                    setActiveModal(null);
                    window.dispatchEvent(new Event('refresh-data'));
                    window.dispatchEvent(new Event('refresh-patrimonio'));
                }} />
            </Modal>

            <Modal isOpen={activeModal === 'liability'} onClose={() => setActiveModal(null)} title="Nuevo Pasivo">
                <LiabilityForm onSuccess={() => {
                    setActiveModal(null);
                    window.dispatchEvent(new Event('refresh-data'));
                    window.dispatchEvent(new Event('refresh-patrimonio'));
                }} />
            </Modal>

            {/* Modal de Cámara */}
            <Modal
                isOpen={activeModal === 'camera'}
                onClose={() => !isProcessing && setActiveModal(null)}
                title="Escanear Recibo"
            >
                <ReceiptScanner
                    onResult={async (data) => {
                        setIsProcessing(true);
                        try {
                            await createTransaction(data); // Guarda directo en DB
                            setActiveModal(null);
                            window.dispatchEvent(new Event('refresh-data'));
                        } catch (e: any) {
                            alert("Error al guardar: " + e.message);
                        } finally {
                            setIsProcessing(false);
                        }
                    }}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                />
            </Modal>
        </>
    );
}