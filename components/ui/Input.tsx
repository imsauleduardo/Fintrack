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
                <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">
                    {label}
                </label>
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        {...props}
                        ref={ref}
                        className={`
                            w-full 
                            bg-input 
                            border 
                            ${error ? "border-danger focus:ring-danger/20" : "border-border focus:ring-primary/20"} 
                            rounded-2xl 
                            py-4 
                            ${icon ? "pl-12" : "px-4"} 
                            pr-4 
                            text-foreground 
                            placeholder:text-muted-foreground 
                            focus:outline-none 
                            focus:ring-2 
                            focus:border-primary 
                            transition-all
                        `}
                    />
                </div>
                {error && <p className="text-danger text-xs mt-1.5 ml-1">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";