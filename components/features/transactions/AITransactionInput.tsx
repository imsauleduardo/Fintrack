"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { parseTransactionText } from "@/lib/actions/ai";

export default function AITransactionInput({ onResult }: { onResult: (data: any) => void }) {
    const [text, setText] = useState("");
    const [isParsing, setIsParsing] = useState(false);

    const handleParse = async () => {
        if (!text.trim() || isParsing) return;
        setIsParsing(true);
        try {
            const result = await parseTransactionText(text);
            onResult(result);
            setText("");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Sparkles className="w-5 h-5 text-blue-400 group-focus-within:animate-pulse" />
            </div>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                placeholder="Escribe 'Cena de anoche 45'..."
                className="w-full bg-white/5 border border-white/10 rounded-[32px] py-5 pl-14 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-gray-600"
            />
            <button
                onClick={handleParse}
                disabled={isParsing || !text.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20 disabled:opacity-30 transition-all active:scale-95"
            >
                {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </div>
    );
}