"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CreditCard,
    PieChart,
    Target,
    User,
    LogOut,
    Wallet
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Resumen', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Transacciones', icon: CreditCard, href: '/dashboard/transactions' },
        { name: 'Presupuestos', icon: Wallet, href: '/dashboard/budgets' },
        { name: 'Metas', icon: Target, href: '/dashboard/goals' },
        { name: 'Reportes', icon: PieChart, href: '/dashboard/reports' },
        { name: 'Perfil', icon: User, href: '/dashboard/profile' },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-card z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    F
                </div>
                <span className="text-xl font-bold tracking-tight">Fintrack</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-blue-500/20'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <button
                    onClick={async () => {
                        const { supabase } = await import('@/supabase/client');
                        await supabase.auth.signOut();
                        window.location.href = '/auth/login';
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;