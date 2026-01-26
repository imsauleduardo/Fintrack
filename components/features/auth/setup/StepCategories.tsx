"use client";
import { ShoppingCart, Car, Home, Heart, Coffee, Utensils } from "lucide-react";

const baseCategories = [
    { id: "food", name: "Comida", icon: <Utensils /> },
    { id: "transp", name: "Transporte", icon: <Car /> },
    { id: "home", name: "Vivienda", icon: <Home /> },
    { id: "health", name: "Salud", icon: <Heart /> },
    { id: "coffee", name: "Ocio", icon: <Coffee /> },
    { id: "shop", name: "Compras", icon: <ShoppingCart /> },
];

export default function StepCategories({ selected, onChange }: any) {
    const toggle = (id: string) => {
        if (selected.includes(id)) onChange(selected.filter((s: any) => s !== id));
        else onChange([...selected, id]);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Categorías Favoritas</h2>
            <p className="text-muted-foreground mb-6">Selecciona las categorías que más suelas utilizar.</p>

            <div className="grid grid-cols-2 gap-3">
                {baseCategories.map((cat) => {
                    const isActive = selected.includes(cat.id);
                    return (
                        <button
                            key={cat.id}
                            onClick={() => toggle(cat.id)}
                            className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-200 ${isActive
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'bg-card border-border hover:bg-muted/50'
                                }`}
                        >
                            <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                {cat.icon}
                            </div>
                            <span className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                {cat.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}