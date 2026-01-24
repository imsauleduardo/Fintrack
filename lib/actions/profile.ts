"use server";

import { supabase } from "@/supabase/client";
import { revalidatePath } from "next/cache";

export async function updateAvatarUrl(userId: string, url: string) {
    const { error } = await supabase
        .from('users')
        .update({ avatar_url: url })
        .eq('id', userId);

    if (error) throw error;

    // Esto limpia la caché para que la foto nueva se vea de inmediato
    revalidatePath("/dashboard/profile");
}

export async function signOut() {
    await supabase.auth.signOut();
}