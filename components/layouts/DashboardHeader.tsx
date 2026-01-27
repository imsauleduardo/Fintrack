"use client";

import { Bell, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

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

    return (
        <header className="flex justify-between items-center mb-10 pt-4 px-2">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20">
                    {user.avatarLetter}
                </div>
                <div>
                    <h1 className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0">{label || "Mis Movimientos"}</h1>
                    <p className="text-xl font-bold text-foreground">{title || `Hola, ${user.name}`}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push('/dashboard/notificaciones')}
                    className="p-3 bg-muted rounded-2xl border border-border hover:bg-muted/80 active:scale-95 transition-all text-foreground"
                    title="Notificaciones"
                >
                    <Bell className="w-5 h-5" />
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