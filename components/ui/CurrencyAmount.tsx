"use client";
import React from 'react';

interface CurrencyAmountProps {
    amount: number;
    currency?: string;
    className?: string;
    colored?: boolean; // Si true, usa verde/rojo. Si false, usa color neutro.
    showSign?: boolean; // Si true, fuerza mostrar + o -
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

import { useUser } from '@/components/providers/UserProvider';

const CurrencyAmount = ({
    amount,
    currency,
    className = '',
    colored = true,
    showSign = true,
    size = 'md'
}: CurrencyAmountProps) => {
    const { currencySymbol } = useUser();
    const finalCurrency = currency || currencySymbol;

    const isNegative = amount < 0;
    const isZero = amount === 0;
    const absAmount = Math.abs(amount);

    // Determinamos el color basado en el PRD
    let colorClass = 'text-foreground'; // Neutro por defecto

    if (colored && !isZero) {
        colorClass = isNegative ? 'text-red-500' : 'text-green-500';
    }

    // Determinamos el tamaño
    const sizeClasses = {
        sm: 'text-xs',      // 12px
        md: 'text-sm',      // 14px (default en tablas/listas)
        lg: 'text-base',    // 16px
        xl: 'text-lg',      // 18px (destacados menores)
        '2xl': 'text-xl',   // 20px
        '3xl': 'text-2xl',  // 24px (balance)
        '4xl': 'text-3xl',  // 30px (hero)
        '5xl': 'text-5xl',
        '6xl': 'text-6xl'
    };

    // Formateo de número con separador de miles
    // TODO: Usar locale basado en la moneda si fuera necesario, por ahora es-MX va bien para formato latino
    const formattedNumber = new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(absAmount);

    const sign = showSign && !isZero ? (isNegative ? '-' : '+') : '';

    return (
        <span
            className={`font-semibold tabular-nums tracking-tight ${colorClass} ${sizeClasses[size]} ${className}`}
        >
            {sign}{finalCurrency}{formattedNumber}
        </span>
    );
};

export default CurrencyAmount;