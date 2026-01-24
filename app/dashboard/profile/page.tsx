"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import ProfileForm from "@/components/features/profile/ProfileForm";
import AvatarUpload from "@/components/features/profile/AvatarUpload";
import SecuritySettings from "@/components/features/profile/SecuritySettings";
import Link from "next/link";
import { ChevronLeft, LogOut, Loader2 } from "lucide-react";
import { updateAvatarUrl } from "@/lib/actions/profile";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Mi Perfil</h1>
                </div>
            </header>

            <div className="space-y-10 pb-20">
                <div className="flex justify-center">
                    <AvatarUpload
                        uid={user?.id}
                        url={profile?.avatar_url}
                        onUpload={onUploadComplete}
                    />
                </div>

                <div className="grid gap-12">
                    <section>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 ml-1">
                            Información Personal
                        </h3>
                        <ProfileForm initialData={profile} />
                    </section>

                    <section>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 ml-1">
                            Seguridad
                        </h3>
                        <SecuritySettings />
                    </section>

                    <section className="pt-4">
                        <button
                            onClick={handleSignOut}
                            className="w-full bg-red-500/5 p-5 rounded-3xl border border-red-500/10 flex items-center justify-between hover:bg-red-500/10 group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-red-500">Cerrar Sesión</div>
                                    <div className="text-xs text-red-400/50">Salir de tu cuenta de forma segura</div>
                                </div>
                            </div>
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}