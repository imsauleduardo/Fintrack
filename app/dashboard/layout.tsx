import Sidebar from "@/components/layouts/Sidebar";
import BottomNav from "@/components/layouts/BottomNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Navegación Desktop */}
            <Sidebar />

            {/* Contenido Principal */}
            <main className="flex-1 lg:ml-64 relative pb-20 lg:pb-0">
                <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Navegación Móvil */}
            <BottomNav />
        </div>
    );
}