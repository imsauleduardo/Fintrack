"use client";

import { useState } from "react";
import { supabase } from "@/supabase/client";
import { Camera, Loader2, User } from "lucide-react";

export default function AvatarUpload({ url, onUpload, uid }: { url?: string, onUpload: (url: string) => void, uid: string }) {
    const [uploading, setUploading] = useState(false);

    const uploadAvatar = async (event: any) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) throw new Error("Selecciona una imagen.");

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${uid}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            onUpload(data.publicUrl);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-24 h-24 bg-white/5 rounded-full overflow-hidden border-2 border-white/10 flex items-center justify-center">
                    {url ? (
                        <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-10 h-10 text-gray-600" />
                    )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    {uploading ? <Loader2 className="animate-spin" /> : <Camera className="text-white" />}
                    <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                </label>
            </div>
            <span className="text-xs text-gray-500 font-medium tracking-tight uppercase">Foto de perfil</span>
        </div>
    );
}