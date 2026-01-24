"use client";

import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

const availableIcons = [
    "ShoppingCart", "Car", "Home", "Heart", "Coffee", "Utensils",
    "Smartphone", "Gift", "Music", "Briefcase", "Plane", "Gamepad"
];

export default function IconPicker({ selected, onChange }: { selected: string, onChange: (val: string) => void }) {
    return (
        <div className="grid grid-cols-4 gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
            {availableIcons.map((iconName) => {
                const Icon = (Icons as any)[iconName] as LucideIcon;
                return (
                    <button
                        key={iconName}
                        type="button"
                        onClick={() => onChange(iconName)}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all ${selected === iconName ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-400'
                            }`}
                    >
                        <Icon className="w-6 h-6" />
                    </button>
                );
            })}
        </div>
    );
}