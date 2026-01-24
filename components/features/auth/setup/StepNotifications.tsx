"use client";

import { Bell, ShieldCheck, Zap } from "lucide-react";

interface Props {
    enabled: boolean;
    onChange: (val: boolean) => void;
}

export default function StepNotifications({ enabled, onChange }: Props) {
    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold mb-2">Mantente al tanto</h2>
            <p className="text-gray-400 mb-8">Activa las notificaciones para recibir alertas inteligentes de tus gastos.</p>

            <div className="space-y-6 flex-1">
                {/* Beneficios */}
                <div className="space-y-4">
                    {[
                        { icon: <Zap className="text-yellow-400" />, text: "Alertas cuando alcances el 80% de tu presupuesto." },
                        { icon: <ShieldCheck className="text-green-400" />, text: "Recordatorios de seguridad y movimientos sospechosos." },
                        { icon: <Bell className="text-blue-400" />, text: "Resumen mensual de tus ahorros generado por IA." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg">
                                {item.icon}
                            </div>
                            <span className="text-sm text-gray-300">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Toggle Principal */}
                <button
                    onClick={() => onChange(!enabled)}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${enabled ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'
                        }`}
                >
                    <span className="font-bold text-lg">Notificaciones Push</span>
                    <div className={`w-14 h-8 rounded-full relative transition-colors ${enabled ? 'bg-blue-500' : 'bg-white/20'}`}>
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-lg ${enabled ? 'left-7' : 'left-1'}`} />
                    </div>
                </button>
            </div>
        </div>
    );
}