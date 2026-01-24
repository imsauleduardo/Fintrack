"use client";

import { useState } from "react";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/Input";
import { Lock, Loader2, CheckCircle } from "lucide-react";

export default function SecuritySettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isChanged, setIsChanged] = useState(false);

    const handlePasswordChange = async () => {
        if (newPassword.length < 6) return alert("Mínimo 6 caracteres");
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setIsChanged(true);
            setNewPassword("");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
            <h4 className="font-bold">Cambiar Contraseña</h4>
            <div className="relative">
                <Input
                    label="Nueva Contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            {isChanged && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ¡Contraseña actualizada!</p>}
            <button
                onClick={handlePasswordChange}
                disabled={isLoading || !newPassword}
                className="w-full bg-blue-600 py-3 rounded-2xl font-bold flex justify-center gap-2 items-center text-sm disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Actualizar Contraseña"}
            </button>
        </div>
    );
}