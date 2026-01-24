'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/features/auth/SplashScreen';
import WelcomeScreen from '@/components/features/auth/WelcomeScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 segundos de carga premium

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <WelcomeScreen key="welcome" />
        )}
      </AnimatePresence>
    </main>
  );
}