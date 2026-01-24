"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    isProcessing: boolean;
}

export default function VoiceRecorder({ onTranscript, isProcessing }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "es-ES";

            recognitionRef.current.onresult = (event: any) => {
                let current = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    current += event.results[i][0].transcript;
                }
                setTranscript(current);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                if (isRecording) setIsRecording(false);
            };
        }
    }, [isRecording]);

    const startRecording = () => {
        if (recognitionRef.current && !isProcessing) {
            setTranscript("");
            setIsRecording(true);
            recognitionRef.current.start();
            if (window.navigator?.vibrate) window.navigator.vibrate(50);
        } else if (!recognitionRef.current) {
            alert("Navegador no compatible.");
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            if (transcript.trim().length > 2) {
                onTranscript(transcript);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 py-4 w-full">
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500 shadow-red-500/40" : "bg-blue-600 shadow-blue-600/20 active:scale-95"
                    } disabled:opacity-50 shadow-xl`}
            >
                {isProcessing ? <Loader2 className="w-12 h-12 animate-spin text-white" /> :
                    isRecording ? <Square className="w-12 h-12 text-white fill-white" /> :
                        <Mic className="w-12 h-12 text-white" />}

                {isRecording && (
                    <motion.div animate={{ scale: [1, 1.8], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full -z-10" />
                )}
            </button>

            <div className="h-12 flex items-center justify-center px-4 w-full text-center">
                <p className="text-sm font-medium text-gray-400 italic line-clamp-2">
                    {isRecording ? (transcript || "Escuchando...") : isProcessing ? "Interpretando con Gemini..." : "Toca para empezar a hablar"}
                </p>
            </div>
        </div>
    );
}