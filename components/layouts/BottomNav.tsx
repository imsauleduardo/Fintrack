"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    CreditCard,
    Target,
    User,
    Plus
} from 'lucide-react';
import FAB from '@/components/ui/FAB'; // Reutilizamos tu FAB existente pero adaptado

const BottomNav = () => {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-t border-border z-50 px-6 pb-safe">
            <div className="flex justify-between items-center h-full max-w-md mx-auto">
                <NavLink
                    href="/dashboard"
                    icon={Home}
                    isActive={pathname === '/dashboard'}
                    label="Inicio"
                />
                <NavLink
                    href="/dashboard/transactions"
                    icon={CreditCard}
                    isActive={pathname.includes('/transactions')}
                    label="Mvtos"
                />

                {/* Espacio central para el FAB que flota por encima */}
                <div className="w-12 h-12" />

                <NavLink
                    href="/dashboard/goals"
                    icon={Target}
                    isActive={pathname.includes('/goals')}
                    label="Metas"
                />
                <NavLink
                    href="/dashboard/profile"
                    icon={User}
                    isActive={pathname.includes('/profile')}
                    label="Perfil"
                />
            </div>
        </div>
    );
};

const NavLink = ({ href, icon: Icon, isActive, label }: { href: string, icon: any, isActive: boolean, label: string }) => (
    <Link
        href={href}
        className={`flex flex-col items-center justify-center gap-1 w-12 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
    >
        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
        {isActive && (
            <span className="text-[10px] font-bold">{label}</span>
        )}
    </Link>
);

export default BottomNav;