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
        .order("date", { ascending: false })
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

export async function approveSelectedTransactions(ids: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // 1. Obtener los datos de los seleccionados
    const { data: pendings } = await supabase
        .from("pending_transactions")
        .select("*")
        .in("id", ids);

    if (!pendings) return { count: 0 };

    // 2. Crear las transacciones reales
    for (const p of pendings) {
        await createTransaction({
            amount: p.amount,
            description: p.description,
            category_id: p.category_id,
            date: p.date || new Date().toISOString().split('T')[0],
            type: p.type || 'expense',
            payment_method: "Email Sync"
        });
    }

    // 3. Marcar como aprobadas
    await supabase
        .from("pending_transactions")
        .update({ status: "approved" })
        .in("id", ids);

    return { count: pendings.length };
}

export async function approveAllPendingTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: pendings } = await supabase
        .from("pending_transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending");

    if (!pendings) return { count: 0 };

    return await approveSelectedTransactions(pendings.map(p => p.id));
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

export async function rejectSelectedTransactions(ids: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "rejected" })
        .in("id", ids)
        .eq("user_id", user.id);

    if (error) throw new Error("Error al rechazar transacciones seleccionadas");

    return { count: ids.length };
}