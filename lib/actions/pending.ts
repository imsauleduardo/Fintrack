"use server";

import { createClient } from "@/supabase/server";
import { createTransaction } from "./transactions";

export async function getPendingTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("pending_transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    return data || [];
}

export async function approvePendingTransaction(id: string, data: any) {
    const supabase = await createClient();

    // 1. Crear la transacción real
    await createTransaction(data);

    // 2. Marcar como aprobada en la tabla de pendientes
    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "approved" })
        .eq("id", id);

    if (error) throw new Error("Error al aprobar");
    return { success: true };
}

export async function rejectPendingTransaction(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "rejected" })
        .eq("id", id);

    if (error) throw new Error("Error al rechazar");
    return { success: true };
}