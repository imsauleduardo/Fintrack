"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import ProfileForm from "@/components/features/profile/ProfileForm";
import AvatarUpload from "@/components/features/profile/AvatarUpload";
import SecuritySettings from "@/components/features/profile/SecuritySettings";
import EmailSettings from "@/components/features/profile/EmailSettings";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Loader2, Shield, Mail, User } from "lucide-react";
import { updateAvatarUrl } from "@/lib/actions/profile";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const onUploadComplete = async (url: string) => {
        if (!user) return;
        await updateAvatarUrl(user.id, url);
        setProfile({ ...profile, avatar_url: url });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/auth/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Cabecera / Navegación */}
            <header className="px-6 pt-6 pb-2 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-card border border-border rounded-2xl hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Mi Perfil</h1>
            </header>

            <div className="max-w-md mx-auto px-6 space-y-8 mt-6">
                {/* Cabecera de Usuario */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <AvatarUpload
                        uid={user?.id}
                        url={profile?.avatar_url}
                        onUpload={onUploadComplete}
                    />
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{profile?.full_name || "Usuario"}</h2>
                        <p className="text-muted-foreground font-medium">{user?.email}</p>
                    </div>
                </div>

                {/* Secciones de Configuración */}
                <div className="space-y-6">
                    {/* Información Personal */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <User className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Información Personal
                            </h3>
                        </div>
                        <div className="bg-card border border-border rounded-[24px] p-1 shadow-sm">
                            <ProfileForm initialData={profile} />
                        </div>
                    </section>

                    {/* Sincronización */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Mail className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Sincronización
                            </h3>
                        </div>
                        <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
                            <EmailSettings />
                        </div>
                    </section>

                    {/* Seguridad */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Shield className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Seguridad
                            </h3>
                        </div>
                        <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm">
                            <SecuritySettings />
                        </div>
                    </section>

                    {/* Cerrar Sesión */}
                    <button
                        onClick={handleSignOut}
                        className="w-full bg-red-50 text-red-600 font-bold p-5 rounded-[24px] border border-red-100 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-red-100"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>

                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
}