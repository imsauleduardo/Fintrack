"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Mail, RefreshCw, LogOut, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { getGoogleAuthUrl, disconnectGmail } from "@/lib/actions/gmail";
import { getPotentialEmails, processSelectedEmails } from "@/lib/actions/gmail-sync";
import { supabase } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function EmailSyncSettingsPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ count: number } | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from("gmail_tokens")
                .select("email")
                .eq("user_id", user.id)
                .single();

            if (data) {
                setIsConnected(true);
                setConnectedEmail(data.email);
            } else {
                setIsConnected(false);
                setConnectedEmail("");
            }
        }
        setIsLoading(false);
    };

    const handleConnect = async () => {
        try {
            const url = await getGoogleAuthUrl();
            window.location.href = url;
        } catch (error) {
            alert("Error al conectar con Google");
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("¿Estás seguro de desconectar Gmail? Se detendrán los escaneos automáticos.")) return;
        try {
            await disconnectGmail();
            setIsConnected(false);
            setConnectedEmail("");
        } catch (error) {
            alert("Error al desconectar");
        }
    };

    const handleInitialScan = async () => {
        setIsScanning(true);
        setScanResult(null);
        try {
            // 1. Obtener correos potenciales de los últimos 30 días
            const emails = await getPotentialEmails();

            if (emails.length > 0) {
                // 2. Procesarlos con IA
                const messageIds = emails.map(e => e.id).filter((id): id is string => !!id);
                const result = await processSelectedEmails(messageIds);
                setScanResult(result);

                // Notificar éxito con vibración
                if (window.navigator?.vibrate) window.navigator.vibrate([50, 50, 50]);
            } else {
                setScanResult({ count: 0 });
            }
        } catch (error: any) {
            alert("Error durante el escaneo: " + error.message);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <header className="flex items-center gap-4 mb-10 pt-4">
                <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight">Email Sync</h1>
            </header>

            <div className="max-w-md mx-auto space-y-8">
                {/* Status Card */}
                <div className={`p-8 rounded-[40px] border-2 transition-all ${isConnected ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-dashed border-border'}`}>
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl ${isConnected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            <Mail className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-black">{isConnected ? 'Gmail Conectado' : 'Sin Sincronización'}</h2>
                            <p className="text-sm text-muted-foreground font-medium px-4">
                                {isConnected
                                    ? `Sincronizando movimientos desde ${connectedEmail}`
                                    : 'Conecta tu cuenta para detectar movimientos bancarios automáticamente en tus correos.'}
                            </p>
                        </div>

                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        ) : isConnected ? (
                            <button
                                onClick={handleDisconnect}
                                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Desconectar cuenta
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="w-full bg-primary py-4 rounded-[22px] font-black text-white shadow-xl shadow-primary/20 active:scale-95 transition-all"
                            >
                                Conectar Gmail
                            </button>
                        )}
                    </div>
                </div>

                {/* Scanning Options */}
                <AnimatePresence>
                    {isConnected && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-card border border-border rounded-[32px] p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground/70">Escaneo Inicial</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Analizaremos los correos de los últimos 30 días para buscar registros de gastos o ingresos que hayas podido pasar por alto.
                                    </p>
                                </div>

                                <button
                                    onClick={handleInitialScan}
                                    disabled={isScanning}
                                    className="w-full py-4 bg-muted hover:bg-muted/80 border border-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isScanning ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Analizando bandeja...</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Lanzar Escaneo de 30 días</span>
                                        </>
                                    )}
                                </button>

                                {scanResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border ${scanResult.count > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-muted border-border text-muted-foreground'}`}
                                    >
                                        {scanResult.count > 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        <p className="text-xs font-bold">
                                            {scanResult.count > 0
                                                ? `¡Éxito! Encontré ${scanResult.count} movimientos para revisar.`
                                                : 'No se encontraron movimientos financieros nuevos.'}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => router.push('/dashboard/transactions/pending')}
                                    className="text-primary font-black text-sm border-b-2 border-primary/20 pb-1 hover:border-primary transition-all"
                                >
                                    Ver movimientos por aprobar →
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
