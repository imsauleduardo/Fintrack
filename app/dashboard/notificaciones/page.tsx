"use client";

import { Bell, Sparkles, ChevronLeft, CheckCheck, RefreshCw, Info, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllNotifications, markAllAsRead, markAsRead } from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getAllNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        // Actualizar UI localmente
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        router.refresh(); // Para actualizar el badge del header si es necesario
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        }
        if (notification.action_url) {
            router.push(notification.action_url);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ia_insight': return <Sparkles className="w-5 h-5" />;
            case 'email_sync': return <RefreshCw className="w-5 h-5" />;
            case 'budget_alert': return <AlertTriangle className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'ia_insight': return 'bg-purple-500/10 text-purple-500';
            case 'email_sync': return 'bg-blue-500/10 text-blue-500';
            case 'budget_alert': return 'bg-orange-500/10 text-orange-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <header className="flex items-center justify-between mb-8 pt-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Notificaciones</h1>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                        title="Marcar todas como leídas"
                    >
                        <CheckCheck className="w-6 h-6" />
                    </button>
                )}
            </header>

            <div className="space-y-6">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No tienes notificaciones recientes</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-4 border rounded-[24px] flex gap-4 cursor-pointer transition-all active:scale-98 ${n.is_read ? 'bg-card/50 border-border opacity-70' : 'bg-card border-primary/20 shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColorClass(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`font-bold text-sm truncate ${!n.is_read && 'text-primary'}`}>{n.title}</p>
                                        <span className="text-[10px] text-muted-foreground uppercase font-black shrink-0 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: false, locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                                </div>
                                {!n.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}