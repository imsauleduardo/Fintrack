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
        name: data.name,
        type: data.type,
        current_value: data.balance,
        description: data.description,
        user_id: user.id,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/assets");
    revalidatePath("/dashboard/patrimonio");
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

    const updateData: any = { ...data };
    if (data.balance !== undefined) {
        updateData.current_value = data.balance;
        delete updateData.balance;
    }

    const { error } = await supabase
        .from("assets")
        .update(updateData)
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
    return assets.reduce((total, asset) => total + Number(asset.current_value || 0), 0);
}