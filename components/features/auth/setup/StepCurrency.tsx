"use client";
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
            <h2 className="text-2xl font-bold mb-2 text-foreground">Tu Moneda Principal</h2>
            <p className="text-muted-foreground mb-6">Esta será la moneda por defecto para todos tus registros.</p>

            <div className="grid gap-3">
                {currencies.map((curr) => (
                    <button
                        key={curr.code}
                        onClick={() => onChange(curr.code)}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${value === curr.code
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'bg-card border-border hover:bg-muted/50'
                            }`}
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${value === curr.code ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                {curr.symbol}
                            </div>
                            <div>
                                <div className={`font-bold ${value === curr.code ? 'text-primary' : 'text-foreground'}`}>
                                    {curr.code}
                                </div>
                                <div className="text-sm text-muted-foreground">{curr.name}</div>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === curr.code ? 'border-primary' : 'border-muted-foreground/30'
                            }`}>
                            {value === curr.code && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}