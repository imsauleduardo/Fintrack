"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push("/dashboard");
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="p-6 bg-white/5 rounded-full inline-block">
          <WifiOff className="w-16 h-16 text-gray-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black">Sin Conexión</h1>
          <p className="text-gray-400">
            No pudimos conectarnos a internet. Algunas funciones pueden no estar disponibles.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Reintentar
        </button>

        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-gray-600">
            Tip: Algunas funciones de Fintrack funcionan sin conexión gracias a PWA.
          </p>
        </div>
      </div>
    </div>
  );
}