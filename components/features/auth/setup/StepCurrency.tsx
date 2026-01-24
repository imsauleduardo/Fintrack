"use client";

import { DollarSign, Landmark } from "lucide-react";

interface Props {
    value: string;
    onChange: (val: string) => void;
}

const currencies = [
    { code: "USD", symbol: "$", name: "Dólar Estadounidense" },
    { code: "MXN", symbol: "$", name: "Peso Mexicano" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "PEN", symbol: "S/", name: "Sol Peruano" },
];

export default function StepCurrency({ value, onChange }: Props) {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-2">Tu Moneda Principal</h2>
            <p className="text-gray-400 mb-8">Esta será la moneda por defecto para todos tus registros.</p>

            <div className="grid gap-3">
                {currencies.map((curr) => (
                    <button
                        key={curr.code}
                        onClick={() => onChange(curr.code)}
                        className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${value === curr.code ? 'bg-blue-600/10 border-blue-500' : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-blue-400">
                                {curr.symbol}
                            </div>
                            <div>
                                <div className="font-bold">{curr.code}</div>
                                <div className="text-sm text-gray-500">{curr.name}</div>
                            </div>
                        </div>
                        {value === curr.code && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
                    </button>
                ))}
            </div>
        </div>
    );
}