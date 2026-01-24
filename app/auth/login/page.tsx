import AuthLayout from "@/components/features/auth/AuthLayout";
import LoginForm from "@/components/features/auth/LoginForm";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Bienvenido de nuevo"
            subtitle="Ingresa tus credenciales para acceder a tus finanzas inteligentes."
        >
            <Suspense fallback={<div className="text-center py-10 text-gray-400">Cargando formulario...</div>}>
                <LoginForm />
            </Suspense>

            <p className="text-center text-gray-400 mt-8">
                ¿No tienes cuenta?{" "}
                <Link href="/auth/register" className="text-blue-400 font-semibold hover:underline">
                    Regístrate gratis
                </Link>
            </p>
        </AuthLayout>
    );
}