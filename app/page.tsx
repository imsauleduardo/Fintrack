import type { Metadata } from 'next';
import LandingClient from '@/components/features/auth/LandingClient';

export const metadata: Metadata = {
  title: "Fintrack | Tu Libertad Financiera",
  description: "Toma el control de tus finanzas personales con inteligencia artificial. Gestiona presupuestos, metas y gastos en una sola app.",
  openGraph: {
    title: "Fintrack - Finanzas Inteligentes",
    description: "La herramienta definitiva para el seguimiento de gastos y metas financieras.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <LandingClient />
    </main>
  );
}