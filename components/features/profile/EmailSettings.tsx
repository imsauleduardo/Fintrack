"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, Unlink, CheckCircle2, Loader2, Clock, Calendar, Sun, AlertCircle } from "lucide-react";
import { getGoogleAuthUrl, disconnectGmail } from "@/lib/actions/gmail";
import { getPotentialEmails, processSelectedEmails } from "@/lib/actions/gmail-sync";
import { supabase } from "@/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function EmailSettings() {
    const router = useRouter();
    // Definir tipo explícito para los intervalos permitidos
    const [status, setStatus] = useState<{
        connected: boolean,
        email?: string,
        interval: number,
        lastSync?: string,
        preferredHour: number | null // Hora en UTC (0-23)
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [initialScanning, setInitialScanning] = useState(false); // Estado exclusivo para scan inicial
    const [scanResult, setScanResult] = useState<{ count: number } | null>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("gmail_tokens")
            .select("email, sync_interval, last_sync_at, preferred_sync_hour")
            .eq("user_id", user.id)
            .single();

        setStatus({
            connected: !!data,
            email: data?.email,
            interval: data?.sync_interval || 24,
            lastSync: data?.last_sync_at,
            preferredHour: data?.preferred_sync_hour
        });
        setLoading(false);
    };

    const handleUpdateInterval = async (val: string) => {
        const interval = parseInt(val);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("gmail_tokens")
            .update({ sync_interval: interval })
            .eq("user_id", user.id);

        setStatus(prev => prev ? { ...prev, interval } : null);
    };

    const handleUpdatePreferredHour = async (val: string) => {
        const localHour = parseInt(val);
        // Convertir hora local a UTC para guardar
        const date = new Date();
        date.setHours(localHour, 0, 0, 0);
        const utcHour = date.getUTCHours();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("gmail_tokens")
            .update({ preferred_sync_hour: utcHour })
            .eq("user_id", user.id);

        setStatus(prev => prev ? { ...prev, preferredHour: utcHour } : null);
    };

    // Helper para convertir UTC (guardado) a hora local (visualización)
    const getLocalHour = (utcHour: number | null) => {
        if (utcHour === null || utcHour === undefined) return 8; // Default 8 AM
        const date = new Date();
        date.setUTCHours(utcHour, 0, 0, 0);
        return date.getHours();
    };

    const handleInitialScan = async () => {
        setInitialScanning(true);
        setScanResult(null);
        try {
            // 1. Obtener correos potenciales de los últimos 30 días (sin flag incremental)
            const emails = await getPotentialEmails();

            if (emails.length > 0) {
                // 2. Procesarlos
                const messageIds = emails.map(e => e.id).filter((id): id is string => !!id);
                const result = await processSelectedEmails(messageIds);
                setScanResult(result);
            } else {
                setScanResult({ count: 0 });
            }
            // Importante: Actualizar estado para que 'lastSync' deje de ser null
            await checkStatus();
        } catch (error: any) {
            alert("Error durante el escaneo inicial: " + error.message);
        } finally {
            setInitialScanning(false);
        }
    };

    const handleManualSync = async () => {
        setActionLoading(true);
        try {
            // 1. Obtener correos potenciales (incremental = true)
            const emails = await getPotentialEmails(undefined, true);

            if (emails.length > 0) {
                const messageIds = emails.map(e => e.id).filter((id): id is string => !!id);
                const result = await processSelectedEmails(messageIds);

                if (result.count > 0) {
                    alert(`¡Éxito! Se encontraron ${result.count} nuevos movimientos.`);
                } else {
                    alert("Se escanearon los correos pero no se detectaron movimientos válidos.");
                }
            } else {
                alert("No se encontraron correos nuevos relevantes desde la última sincronización.");
            }
            await checkStatus();
        } catch (error: any) {
            alert("Error durante la sincronización: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConnect = async () => {
        setActionLoading(true);
        const url = await getGoogleAuthUrl();
        window.location.href = url;
    };

    const handleDisconnect = async () => {
        if (!confirm("¿Desconectar Gmail? Dejarán de sincronizarse tus movimientos automáticamente.")) return;
        setActionLoading(true);
        await disconnectGmail();
        // Limpiamos el estado local inmediatamente
        setStatus({
            connected: false,
            email: undefined,
            interval: 24,
            lastSync: undefined,
            preferredHour: null
        });
        setScanResult(null); // Reset scan result
        setActionLoading(false);
    };

    if (loading) return <Loader2 className="animate-spin mx-auto text-blue-500" />;

    const hasDoneInitialSync = !!status?.lastSync; // Si hay fecha de última sync, ya se hizo al menos una vez (o el inicial)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* SECCIÓN 1: CONEXIÓN & ESTADO */}
            <div className={`p-6 rounded-[32px] border transition-all duration-300 ${status?.connected ? 'bg-white/5 border-white/10' : 'bg-primary/5 border-primary/20'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${status?.connected ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-base">Sincronización Gmail</p>
                            <p className="text-sm text-muted-foreground">
                                {status?.connected ? `Conectado como ${status.email}` : 'Vincula tu cuenta para importar gastos'}
                            </p>
                        </div>
                    </div>
                    {status?.connected && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </div>

                {status?.connected ? (
                    <button
                        onClick={handleDisconnect}
                        disabled={actionLoading}
                        className="w-full py-4 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <Unlink className="w-4 h-4" /> Desconectar Cuenta
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Conectar Gmail
                    </button>
                )}
            </div>

            {/* SECCIÓN 2: ESCANEO INICIAL (Solo si está conectado) */}
            {status?.connected && (
                <div className={`p-6 rounded-[32px] border transition-all duration-300 ${!hasDoneInitialSync ? 'bg-card border-primary/20 shadow-lg shadow-primary/5' : 'bg-white/5 border-white/5 opacity-80'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl ${!hasDoneInitialSync ? 'bg-primary/10 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className={`font-bold text-sm uppercase tracking-widest ${!hasDoneInitialSync ? 'text-foreground' : 'text-muted-foreground'}`}>Escaneo Inicial</h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed relative pl-4 border-l-2 border-primary/30">
                        <span className="font-bold text-foreground">Escaneo rápido:</span> Analizamos tus últimos 250 correos para establecer el punto de partida y activar la detección automática de futuros gastos.
                    </p>

                    <button
                        onClick={handleInitialScan}
                        disabled={hasDoneInitialSync || initialScanning}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all ${hasDoneInitialSync
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                            : 'bg-muted hover:bg-muted/80 border border-border text-foreground active:scale-95'
                            }`}
                    >
                        {initialScanning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analizando bandeja...</span>
                            </>
                        ) : hasDoneInitialSync ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Escaneo Inicial Completado</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                <span>Calibrar y Activar Sincronización</span>
                            </>
                        )}
                    </button>

                    {/* Resultado del escaneo inicial si acaba de ocurrir */}
                    {scanResult && (
                        <div className={`mt-4 flex items-center gap-3 p-4 rounded-2xl border ${scanResult.count > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-muted border-border text-muted-foreground'}`}>
                            {scanResult.count > 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-xs font-bold">
                                {scanResult.count > 0
                                    ? `¡Éxito! Encontré ${scanResult.count} movimientos.`
                                    : 'No se encontraron movimientos nuevos.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* SECCIÓN 3: CONFIGURACIÓN & MANUAL SYNC (Solo si Inicial Completado) */}
            {status?.connected && hasDoneInitialSync && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-300">Rutina de Sincronización</h3>
                        </div>

                        {/* Intervalo */}
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">Frecuencia Automática</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground mr-1">(Plan gratuito: 1 vez/día)</span>
                                <span className="text-xs font-bold text-blue-400">Diariamente</span>
                            </div>
                        </div>

                        {/* Hora Preferida */}
                        {status.interval === 24 && (
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between animate-in fade-in slide-in-from-top-1 opacity-50 cursor-not-allowed">
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-2">
                                    <Sun className="w-3 h-3 text-orange-400" /> Hora Preferida
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Muy pronto</span>
                                    <span className="text-xs font-bold text-orange-400/50">20:00</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={handleManualSync}
                                disabled={actionLoading}
                                className="w-full py-4 bg-muted hover:bg-muted/80 border border-border rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Sincronizando...</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Sincronizar Manualmente Ahora</span>
                                    </>
                                )}
                            </button>
                            {status.lastSync && (
                                <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-widest font-medium">
                                    Último escaneo: {formatDistanceToNow(new Date(status.lastSync), { addSuffix: true, locale: es })}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 4: LINK PENDIENTES */}
                    <div className="flex justify-center pb-8">
                        <button
                            onClick={() => router.push('/dashboard/transactions/pending')}
                            className="text-primary font-black text-sm border-b-2 border-primary/20 pb-1 hover:border-primary transition-all flex items-center gap-2"
                        >
                            Ver movimientos por aprobar
                            <span className="text-lg leading-none">→</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}