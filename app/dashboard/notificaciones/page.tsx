"use client";

import { Bell, Sparkles, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
    const router = useRouter();

    const notifications = [
        { id: 1, title: "Límite de presupuesto", message: "Has alcanzado el 80% de tu presupuesto en Comida.", time: "Hace 2h", type: "alert" },
        { id: 2, title: "Sugerencia de ahorro", message: "Si reduces tus gastos en suscripciones un 10%, podrías completar tu meta 'Viaje' un mes antes.", time: "Hoy", type: "ia" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <header className="flex items-center gap-4 mb-8 pt-4">
                <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Notificaciones</h1>
            </header>

            <div className="space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sugerencias de Gemini</h2>
                    </div>
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-[32px] space-y-4">
                        <p className="text-sm">Analizando tus movimientos recientes, he notado un incremento del 15% en gastos hormiga. ¿Quieres revisar cómo optimizarlos?</p>
                        <button className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm">Ver Análisis Detallado</button>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">Recientes</h2>
                    <div className="space-y-3">
                        {notifications.map(n => (
                            <div key={n.id} className="p-4 bg-card border border-border rounded-[24px] flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.type === 'ia' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {n.type === 'ia' ? <Sparkles className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm">{n.title}</p>
                                        <span className="text-[10px] text-muted-foreground uppercase font-black">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}