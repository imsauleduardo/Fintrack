"use client";

import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, Check, X, Sparkles } from "lucide-react";
import { parseReceiptImage } from "@/lib/actions/ai";
import { motion } from "framer-motion"; // <-- IMPORTACIÓN CORREGIDA

interface ReceiptScannerProps {
    onResult: (data: any) => void;
    isProcessing: boolean;
    setIsProcessing: (val: boolean) => void;
}

export default function ReceiptScanner({ onResult, isProcessing, setIsProcessing }: ReceiptScannerProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

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
        <div className="w-full space-y-6 py-4">
            {/* Inputs Ocultos: La magia está en el atributo 'capture' */}
            <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFile}
                accept="image/*"
                capture="environment" // Esto activa la cámara trasera en móviles
                className="hidden"
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFile}
                accept="image/*"
                className="hidden"
            />

            {!preview ? (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-4 p-8 bg-primary/5 border-2 border-dashed border-primary/20 rounded-[32px] text-primary hover:bg-primary/10 transition-all group"
                    >
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-active:scale-90 transition-transform">
                            <Camera className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Tomar Foto</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-4 p-8 bg-muted/50 border-2 border-dashed border-border rounded-[32px] text-muted-foreground hover:bg-muted transition-all group"
                    >
                        <div className="w-14 h-14 bg-white border border-border rounded-2xl flex items-center justify-center text-gray-400 shadow-sm group-active:scale-90 transition-transform">
                            <ImageIcon className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Subir Ticket</span>
                    </button>
                </div>
            ) : (
                <div className="relative rounded-[40px] overflow-hidden border-4 border-white shadow-2xl aspect-[3/4] bg-black group mx-auto max-w-sm">
                    <img src={preview} alt="Vista previa" className="w-full h-full object-cover opacity-80" />

                    <div className="absolute inset-x-0 bottom-8 flex justify-center gap-6 px-8">
                        <button
                            onClick={() => setPreview(null)}
                            disabled={isProcessing}
                            className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-red-500/40 transition-all"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={handleProcess}
                            disabled={isProcessing}
                            className="flex-1 h-16 bg-primary rounded-[24px] flex items-center justify-center gap-3 text-white font-bold shadow-xl shadow-primary/40 active:scale-95 transition-all"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-blue-200" />
                                    <span>Analizar Recibo</span>
                                </>
                            )}
                        </button>
                    </div>

                    {isProcessing && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-4">
                            <motion.div
                                animate={{ y: [-20, 20, -20] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full h-1 bg-primary shadow-[0_0_20px_rgba(29,78,216,0.8)] z-20"
                            />
                            <p className="text-sm font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">Escaneando con IA...</p>
                        </div>
                    )}
                </div>
            )}

            <p className="text-[10px] text-center text-muted-foreground font-medium px-10">
                La IA identificará comercio, monto y categoría automáticamente.
            </p>
        </div>
    );
}