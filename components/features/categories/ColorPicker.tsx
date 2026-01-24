"use client";

const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
    "#d946ef", "#f43f5e", "#71717a", "#4ade80"
];

export default function ColorPicker({ selected, onChange }: { selected: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    style={{ backgroundColor: color }}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selected === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                />
            ))}
        </div>
    );
}