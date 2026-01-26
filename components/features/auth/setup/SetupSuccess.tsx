"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SetupSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-500/30"
                >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold mb-4 text-foreground"
                >
                    ¡Todo listo!
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground text-lg"
                >
                    Estamos preparando tu dashboard personalizado...
                </motion.p>
            </div>
        </div>
    );
}