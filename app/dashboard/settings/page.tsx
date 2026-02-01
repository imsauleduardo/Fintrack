"use client";

import { User, Globe, Bell, Mic, Camera, Mail, LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/UserProvider";

export default function SettingsMenuPage() {
    const router = useRouter();

    const handleLogout = async () => {
        const { supabase } = await import('@/supabase/client');
        await supabase.auth.signOut();
        window.location.href = '/auth/login';
    };

    const { currency } = useUser();

    const menuSections = [
        {
            title: "Cuenta",
            items: [
                { icon: User, label: "Perfil", action: () => router.push('/dashboard/profile') },
                { icon: Mail, label: "Sincronización de Email", action: () => router.push('/dashboard/settings/email-sync') },
            ]
        },
        {
            title: "Preferencias Generales",
            items: [
                { icon: Globe, label: `Moneda (${currency})`, action: () => router.push('/dashboard/profile') }, // Redirige a perfil donde se cambia
                { icon: Bell, label: "Notificaciones", action: () => { } },
                { icon: Mic, label: "Permisos de Micrófono", action: () => { } },
                { icon: Camera, label: "Permisos de Cámara", action: () => { } },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <header className="flex items-center gap-4 mb-10 pt-4">
                <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Configuración</h1>
            </header>

            <div className="space-y-10">
                {menuSections.map(section => (
                    <section key={section.title} className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">{section.title}</h2>
                        <div className="bg-card border border-border rounded-[32px] overflow-hidden">
                            {section.items.map((item, idx) => (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    className={`w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-border' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted rounded-xl text-foreground">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <p className="font-bold text-sm">{item.label}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    </section>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full p-5 bg-red-500/10 text-red-500 rounded-[32px] flex items-center justify-center gap-3 font-bold active:scale-95 transition-all border border-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}