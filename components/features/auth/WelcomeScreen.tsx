'use client';
import Link from 'next/link';

export default function WelcomeScreen() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-8">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Bienvenido a Fintrack</h1>
                <p className="text-gray-400 max-w-xs">
                    La forma más inteligente de gestionar tus finanzas con el poder de la IA.
                </p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
                <Link
                    href="/auth/onboarding"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-center transition-all"
                >
                    Empezar ahora
                </Link>
                <Link
                    href="/auth/login"
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-2xl text-center border border-white/10 transition-all"
                >
                    Ya tengo cuenta
                </Link>
            </div>
        </div>
    );
}