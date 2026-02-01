import Sidebar from "@/components/layouts/Sidebar";
import BottomNav from "@/components/layouts/BottomNav";
import { UserProvider } from "@/components/providers/UserProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
                {/* Navegación Desktop */}
                <Sidebar />

                {/* Contenido Principal - min-w-0 evita que el flex crezca por sus hijos */}
                <main className="flex-1 lg:ml-64 relative pb-20 lg:pb-0 min-w-0 overflow-x-hidden">
                    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fade-in box-border">
                        {children}
                    </div>
                </main>

                {/* Navegación Móvil */}
                <BottomNav />
            </div>
        </UserProvider>
    );
}