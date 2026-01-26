"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/features/auth/SplashScreen';
import WelcomeScreen from '@/components/features/auth/WelcomeScreen';

export default function LandingClient() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Simulamos carga inicial
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {showSplash ? (
                <SplashScreen key="splash" />
            ) : (
                <WelcomeScreen key="welcome" />
            )}
        </AnimatePresence>
    );
}