"use client";

import { Bell, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnreadNotifications } from "@/lib/actions/notifications";

interface DashboardHeaderProps {
    user: {
        name: string;
        avatarLetter: string;
    };
    title?: string;
    label?: string;
}

export default function DashboardHeader({ user, title, label }: DashboardHeaderProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const unread = await getUnreadNotifications();
                setUnreadCount(unread.length);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <header className="flex justify-between items-center mb-10 pt-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <h1 className="text-2xl font-black text-foreground truncate">{title || label || "Resumen"}</h1>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push('/dashboard/notificaciones')}
                    className="p-3 bg-muted rounded-2xl border border-border hover:bg-muted/80 active:scale-95 transition-all text-foreground relative"
                    title="Notificaciones"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-muted" />
                    )}
                </button>
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="p-3 bg-muted rounded-2xl border border-border hover:bg-muted/80 active:scale-95 transition-all text-foreground"
                    title="Configuración"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}