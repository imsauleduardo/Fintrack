import AuthLayout from "@/components/features/auth/AuthLayout";
import RegisterForm from "@/components/features/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <AuthLayout title="Crea tu cuenta" subtitle="Gestiona tus finanzas con IA.">
            <RegisterForm />
            <p className="text-center text-gray-400 mt-6">
                ¿Ya tienes cuenta? <Link href="/auth/login" className="text-blue-400">Inicia sesión</Link>
            </p>
        </AuthLayout>
    );
}