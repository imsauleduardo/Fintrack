'use client';
import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-white">F</span>
                </div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold text-white tracking-widest"
                >
                    FINTRACK
                </motion.h1>
            </motion.div>
        </div>
    );
}