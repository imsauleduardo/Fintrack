"use client";

import { useState } from "react";
import { Mail, Check, X, Loader2, Calendar, ChevronRight } from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface GmailMessagePickerProps {
    emails: any[];
    onProcess: (selectedIds: string[]) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

export default function GmailMessagePicker({ emails, onProcess, onCancel, isProcessing }: GmailMessagePickerProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === emails.length) setSelectedIds([]);
        else setSelectedIds(emails.map(e => e.id));
    };

    const formatDate = (dateValue: any) => {
        const date = new Date(dateValue);
        if (!isValid(date)) return "Fecha desconocida";
        return format(date, "d MMM", { locale: es });
    };

    return (
        <div className="flex flex-col h-[70vh]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold">Seleccionar Correos</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {emails.length} potenciales detectados
                    </p>
                </div>
                <button
                    onClick={handleSelectAll}
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300"
                >
                    {selectedIds.length === emails.length ? "Desmarcar todo" : "Seleccionar todo"}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {emails.map((email) => {
                    const isSelected = selectedIds.includes(email.id);
                    return (
                        <button
                            key={email.id}
                            onClick={() => toggleSelect(email.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${isSelected
                                ? "bg-blue-600/10 border-blue-500/40"
                                : "bg-white/5 border-white/5 hover:border-white/10"
                                }`}
                        >
                            <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-white/20"
                                }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <p className="text-[13px] font-bold truncate leading-none pt-1">{email.subject}</p>
                                    <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap uppercase">
                                        {formatDate(email.date)}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 line-clamp-1 opacity-60 italic">
                                    {email.snippet}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => onProcess(selectedIds)}
                    disabled={isProcessing || selectedIds.length === 0}
                    className="flex-[2] py-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20 font-bold text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            Procesar {selectedIds.length} correos
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}