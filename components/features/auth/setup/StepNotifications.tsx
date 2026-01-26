"use client";
import { Bell, ShieldCheck, Zap } from "lucide-react";

interface Props {
    enabled: boolean;
    onChange: (val: boolean) => void;
}

export default function StepNotifications({ enabled, onChange }: Props) {
    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Mantente al tanto</h2>
            <p className="text-muted-foreground mb-6">Activa las notificaciones para recibir alertas inteligentes de tus gastos.</p>

            <div className="space-y-6 flex-1">
                {/* Beneficios */}
                <div className="space-y-3">
                    {[
                        { icon: <Zap className="text-warning" />, text: "Alertas cuando alcances el 80% de tu presupuesto." },
                        { icon: <ShieldCheck className="text-success" />, text: "Recordatorios de seguridad y movimientos sospechosos." },
                        { icon: <Bell className="text-primary" />, text: "Resumen mensual de tus ahorros generado por IA." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-center bg-muted/50 p-4 rounded-2xl border border-border/50">
                            <div className="w-10 h-10 flex items-center justify-center bg-background rounded-xl shadow-sm">
                                {item.icon}
                            </div>
                            <span className="text-sm text-muted-foreground leading-tight">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Toggle Principal */}
                <button
                    onClick={() => onChange(!enabled)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between mt-auto ${enabled ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                >
                    <div className="text-left">
                        <div className="font-bold text-foreground">Notificaciones Push</div>
                        <div className="text-xs text-muted-foreground">{enabled ? 'Activadas' : 'Desactivadas'}</div>
                    </div>

                    <div className={`w-12 h-7 rounded-full relative transition-colors ${enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${enabled ? 'left-6' : 'left-1'}`} />
                    </div>
                </button>
            </div>
        </div>
    );
}