"use client";

import { useState, useRef } from "react";
import { Camera, RefreshCcw, Loader2, Check, X } from "lucide-react";
import { parseReceiptImage } from "@/lib/actions/ai";

interface ReceiptScannerProps {
    onResult: (data: any) => void;
    isProcessing: boolean;
    setIsProcessing: (val: boolean) => void;
}

export default function ReceiptScanner({ onResult, isProcessing, setIsProcessing }: ReceiptScannerProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleProcess = async () => {
        if (!preview) return;
        setIsProcessing(true);
        try {
            const result = await parseReceiptImage(preview);
            onResult(result);
            setPreview(null);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full">
            <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" capture="environment" className="hidden" />

            {!preview ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 py-6 bg-blue-600/10 border border-dashed border-blue-500/30 rounded-3xl text-blue-400 hover:bg-blue-600/20 transition-all font-bold"
                >
                    <Camera className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-widest">Escanear Recibo</span>
                </button>
            ) : (
                <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] bg-black group">
                    <img src={preview} alt="Ticket" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreview(null)} disabled={isProcessing} className="p-4 bg-white/10 rounded-2xl hover:bg-red-500/20 text-white"><X className="w-6 h-6" /></button>
                        <button onClick={handleProcess} disabled={isProcessing} className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/40">
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                        </button>
                    </div>
                    {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Escaneando...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}