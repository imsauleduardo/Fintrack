"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    isProcessing: boolean;
}

export default function VoiceRecorder({ onTranscript, isProcessing }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef("");
    // Bandera de seguridad para evitar múltiples inicios
    const isStartedRef = useRef(false);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "es-ES";

            recognitionRef.current.onresult = (event: any) => {
                let fullTranscript = "";
                for (let i = 0; i < event.results.length; i++) {
                    fullTranscript += event.results[i][0].transcript;
                }
                setTranscript(fullTranscript);
                transcriptRef.current = fullTranscript;
            };

            recognitionRef.current.onerror = (event: any) => {
                // Manejo silencioso del error "no-speech"
                if (event.error === 'no-speech') {
                    console.warn("No se detectó voz del usuario.");
                } else {
                    console.error("Speech recognition error:", event.error);
                }
                stopRecording();
            };

            recognitionRef.current.onend = () => {
                isStartedRef.current = false;
                setIsRecording(false);
            };
        }
    }, []);

    const startRecording = () => {
        // Validación de seguridad para Error 01
        if (recognitionRef.current && !isProcessing && !isStartedRef.current) {
            try {
                setTranscript("");
                transcriptRef.current = "";
                setIsRecording(true);
                isStartedRef.current = true;
                recognitionRef.current.start();
                if (window.navigator?.vibrate) window.navigator.vibrate(50);
            } catch (e) {
                console.error("Error al iniciar reconocimiento:", e);
                isStartedRef.current = false;
                setIsRecording(false);
            }
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isStartedRef.current) {
            recognitionRef.current.stop();
            isStartedRef.current = false;
            setIsRecording(false);

            setTimeout(() => {
                const finalResult = transcriptRef.current.trim();
                if (finalResult.length > 2) {
                    onTranscript(finalResult);
                }
            }, 300);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 py-10 w-full overflow-hidden">
            <div className="relative">
                {isRecording && (
                    <>
                        <motion.div animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-primary/30 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 bg-primary/20 rounded-full" />
                    </>
                )}

                <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                    disabled={isProcessing}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all z-10 shadow-2xl ${isRecording
                            ? "bg-primary scale-110 shadow-primary/40 ring-8 ring-primary/20"
                            : "bg-white border-2 border-primary/10 text-primary hover:bg-muted active:scale-90"
                        } disabled:opacity-50`}
                >
                    {isProcessing ? (
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    ) : (
                        <Mic className={`w-14 h-14 ${isRecording ? "text-white" : "text-primary"}`} />
                    )}
                </button>
            </div>

            <div className="space-y-4 px-6 text-center w-full max-sm:max-w-xs">
                <p className={`text-sm font-black tracking-widest transition-colors uppercase ${isRecording ? 'text-primary' : 'text-gray-400'}`}>
                    {isRecording ? "Escuchando..." : isProcessing ? "Procesando IA..." : "Mantén presionado"}
                </p>

                <div className="min-h-[100px] p-5 bg-muted/40 rounded-[32px] border border-border/50 flex items-center justify-center shadow-inner">
                    <p className="text-sm text-foreground font-medium italic opacity-90 leading-relaxed line-clamp-4">
                        {transcript || "Ej: 'Gasté 25 dólares en restaurante con tarjeta'"}
                    </p>
                </div>
            </div>
        </div>
    );
}