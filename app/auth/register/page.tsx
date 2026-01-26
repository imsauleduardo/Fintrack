import RegisterForm from "@/components/features/auth/RegisterForm";
import Link from "next/link";
import { Suspense } from "react";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            {/* Contenedor Principal (Card Effect) */}
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in">

                {/* Header con Branding */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 mb-2">
                        <span className="text-white text-2xl font-bold">F</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Crea tu cuenta
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Gestiona tus finanzas con IA.
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <Suspense fallback={
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }>
                    <RegisterForm />
                </Suspense>

                {/* Footer Links & Legal */}
                <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            href="/auth/login"
                            className="font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
            {/* Footer Legal (Opcional, sutil) */}
            <div className="absolute bottom-6 text-center w-full text-xs text-muted-foreground opacity-50">
                &copy; {new Date().getFullYear()} Fintrack. Todos los derechos reservados.
            </div>
        </div>
    );
}