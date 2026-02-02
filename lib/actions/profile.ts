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

export async function getUserProfile() {
    const { createClient } = await import("@/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return data;
}

export async function signOut() {
    await supabase.auth.signOut();
}