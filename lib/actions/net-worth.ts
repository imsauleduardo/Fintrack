"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { getAssets } from "./assets";
import { getLiabilities } from "./liabilities";

export async function getNetWorthHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("net_worth_history")
        .select("*")
        .eq("user_id", user.id)
        .order("snapshot_date", { ascending: true })
        .limit(12);

    if (error) throw new Error(error.message);
    return data || [];
}

export async function saveNetWorthSnapshot() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // 1. Calcular totales actuales
    const [assets, liabilities] = await Promise.all([getAssets(), getLiabilities()]);
    const totalAssets = assets.reduce((acc, a) => acc + Number(a.balance), 0);
    const totalLiabs = liabilities.reduce((acc, l) => acc + Number(l.balance), 0);
    const netWorth = totalAssets - totalLiabs;

    // 2. Guardar el snapshot (si ya existe uno hoy, se actualiza)
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
        .from("net_worth_history")
        .upsert({
            user_id: user.id,
            total_assets: totalAssets,
            total_liabilities: totalLiabs,
            net_worth: netWorth,
            snapshot_date: today
        }, {
            onConflict: 'user_id, snapshot_date'
        });

    if (error) throw new Error("Error al guardar snapshot");
    revalidatePath("/dashboard/net-worth");
    return { success: true };
}