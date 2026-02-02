"use client";

import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle, Info, Lightbulb, RefreshCw } from "lucide-react";
import { generateInsights, getLatestInsights } from "@/lib/actions/ai-insights";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
    type: 'warning' | 'success' | 'info' | 'tip';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

export default function InsightsCard() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        const cached = await getLatestInsights();
        if (cached.length > 0) {
            setInsights(cached);
        } else {
            await refreshInsights();
        }
    };

    const refreshInsights = async () => {
        setIsLoading(true);
        try {
            const newInsights = await generateInsights();
            setInsights(newInsights);
            setCurrentIndex(0);
        } catch (error) {
            console.error("Error al generar insights:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'tip': return <Lightbulb className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-orange-50 dark:from-orange-600/10 dark:to-red-600/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-500';
            case 'success': return 'bg-green-50 dark:from-green-600/10 dark:to-emerald-600/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-500';
            case 'tip': return 'bg-purple-50 dark:from-purple-600/10 dark:to-pink-600/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-500';
            default: return 'bg-blue-50 dark:from-blue-600/10 dark:to-cyan-600/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-500';
        }
    };

    if (insights.length === 0 && !isLoading) {
        return null;
    }

    const currentInsight = insights[currentIndex];

    return (
        <div className={`p-6 bg-gradient-to-br ${getColors(currentInsight?.type)} border rounded-[32px] relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 bg-white/10 rounded-xl ${getColors(currentInsight?.type)}`}>
                        {isLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                            </>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Insights de IA</h3>
                        <p className="text-[10px] text-gray-500 font-bold">Powered by Gemini 2.0</p>
                    </div>
                </div>
                <button
                    onClick={refreshInsights}
                    disabled={isLoading}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {currentInsight && (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            {getIcon(currentInsight.type)}
                            <h4 className="font-bold text-foreground">{currentInsight.title}</h4>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed text-justify">{currentInsight.description}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navegación de insights */}
            {insights.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {insights.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}