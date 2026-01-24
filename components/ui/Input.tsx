"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                    {label}
                </label>
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {icon}
                        </div>
                    )}
                    <input
                        {...props}
                        ref={ref}
                        className={`w-full bg-white/5 border ${error ? "border-red-500/50" : "border-white/10"
                            } rounded-2xl py-4 ${icon ? "pl-12" : "px-4"} pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    />
                </div>
                {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";