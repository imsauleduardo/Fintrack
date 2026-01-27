"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Target, PieChart, Plus, LucideIcon } from 'lucide-react';
import GlobalQuickActions from './GlobalQuickActions';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
    href: string;
    icon: LucideIcon;
    label: string;
    isFAB?: false;
}

interface FABItem {
    isFAB: true;
}

type BottomNavItem = NavItem | FABItem;

const BottomNav = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const items: BottomNavItem[] = [
        { href: "/dashboard", icon: Home, label: "Inicio" },
        { href: "/dashboard/patrimonio", icon: Wallet, label: "Patrimonio" },
        { isFAB: true },
        { href: "/dashboard/goals", icon: Target, label: "Metas" },
        { href: "/dashboard/analisis", icon: PieChart, label: "Análisis" },
    ];

    const handleFABClick = () => {
        setIsMenuOpen(true);
    };

    return (
        <>
            <div className={`lg:hidden fixed bottom-6 left-6 right-6 h-20 rounded-[32px] px-8 transition-all bottom-nav ${isMenuOpen
                ? 'z-[80] bg-transparent border-transparent backdrop-blur-none shadow-none'
                : 'z-50 bg-card/90 backdrop-blur-2xl border border-border/50 shadow-2xl'
                }`}>
                <div className={`flex items-center h-full ${isMenuOpen ? 'justify-center' : 'justify-between'}`}>
                    {items.map((item, idx) => {
                        if (item.isFAB) {
                            return (
                                <motion.button
                                    key="fab-button"
                                    onClick={isMenuOpen ? () => setIsMenuOpen(false) : handleFABClick}
                                    animate={{
                                        rotate: isMenuOpen ? 135 : 0,
                                        backgroundColor: isMenuOpen ? '#ffffff' : '#1D4ED8',
                                        scale: isMenuOpen ? 1.1 : 1
                                    }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg -mt-2 active:scale-90 transition-shadow ${isMenuOpen ? 'z-[90] shadow-white/50' : 'z-10 shadow-primary/20'
                                        }`}
                                >
                                    {isMenuOpen ? (
                                        <motion.div
                                            initial={{ opacity: 0, rotate: -135 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <Plus className="w-8 h-8 text-primary" />
                                        </motion.div>
                                    ) : (
                                        <Plus className="w-8 h-8 text-white" />
                                    )}
                                </motion.button>
                            );
                        }

                        // Ocultar otros items cuando el menú está abierto
                        if (isMenuOpen) return null;

                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                                <span className={`text-[10px] font-bold transition-all ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <GlobalQuickActions
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
};

export default BottomNav;