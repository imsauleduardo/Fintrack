"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, Unlink, CheckCircle2, Loader2, Clock, Calendar } from "lucide-react";
import { getGoogleAuthUrl, disconnectGmail } from "@/lib/actions/gmail";
import { supabase } from "@/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function EmailSettings() {
    const [status, setStatus] = useState<{ connected: boolean, email?: string, interval: number, lastSync?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("gmail_tokens")
            .select("email, sync_interval, last_sync_at")
            .eq("user_id", user.id)
            .single();

        setStatus({
            connected: !!data,
            email: data?.email,
            interval: data?.sync_interval || 24,
            lastSync: data?.last_sync_at
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

    const handleConnect = async () => {
        setActionLoading(true);
        const url = await getGoogleAuthUrl();
        window.location.href = url;
    };

    const handleDisconnect = async () => {
        if (!confirm("¿Desconectar Gmail? Dejarán de sincronizarse tus movimientos automáticamente.")) return;
        setActionLoading(true);
        await disconnectGmail();
        await checkStatus();
        setActionLoading(false);
    };

    if (loading) return <Loader2 className="animate-spin mx-auto text-blue-500" />;

    return (
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${status?.connected ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Sincronización Gmail</p>
                        <p className="text-xs text-gray-500">
                            {status?.connected ? `Conectado como ${status.email}` : 'No vinculado'}
                        </p>
                    </div>
                </div>
                {status?.connected && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>

            {status?.connected && (
                <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/[0.07] transition-all">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-300">Escaneo automático cada</span>
                        </div>
                        <select
                            value={status.interval}
                            onChange={(e) => handleUpdateInterval(e.target.value)}
                            className="bg-transparent text-xs font-bold text-blue-400 outline-none cursor-pointer p-1"
                        >
                            <option value="1">1 hora</option>
                            <option value="6">6 horas</option>
                            <option value="12">12 horas</option>
                            <option value="24">24 horas</option>
                        </select>
                    </div>

                    {status.lastSync && (
                        <div className="px-4 py-2 flex items-center gap-2 text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                Último escaneo: {formatDistanceToNow(new Date(status.lastSync), { addSuffix: true, locale: es })}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {status?.connected ? (
                <button
                    onClick={handleDisconnect}
                    disabled={actionLoading}
                    className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
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
    );
}