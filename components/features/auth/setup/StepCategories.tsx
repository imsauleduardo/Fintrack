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
            <h2 className="text-3xl font-bold mb-2">Categorías Favoritas</h2>
            <p className="text-gray-400 mb-8">Selecciona las categorías que más suelas utilizar.</p>

            <div className="grid grid-cols-2 gap-3">
                {baseCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => toggle(cat.id)}
                        className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${selected.includes(cat.id) ? 'bg-purple-600/10 border-purple-500' : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <div className={`p-4 rounded-xl ${selected.includes(cat.id) ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                            {cat.icon}
                        </div>
                        <span className="font-medium">{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}