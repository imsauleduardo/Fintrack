"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAssets() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error al obtener activos:", error);
        return [];
    }

    return data || [];
}

export async function createAsset(data: {
    name: string;
    type: string;
    balance: number;
    description?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase.from("assets").insert({
        ...data,
        user_id: user.id,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/assets");
    return { success: true };
}

export async function updateAsset(id: string, data: {
    name?: string;
    type?: string;
    balance?: number;
    description?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("assets")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/assets");
    return { success: true };
}

export async function deleteAsset(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/assets");
    return { success: true };
}

export async function getTotalAssets() {
    const assets = await getAssets();
    return assets.reduce((total, asset) => total + Number(asset.balance || 0), 0);
}