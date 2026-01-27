"use server";

import { createClient } from "@/supabase/server";
import { TransactionInput } from "@/lib/validations/transaction";
import { revalidatePath } from "next/cache";
import { checkBudgetAlerts } from "./budgets";

export async function createTransaction(data: TransactionInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const validated = data;

    const { error } = await supabase.from("transactions").insert({
        ...validated,
        user_id: user.id
    });

    if (error) throw new Error(error.message);

    // ✨ NUEVO: Verificar alertas de presupuesto después de crear la transacción
    if (validated.type === 'expense') {
        await checkBudgetAlerts(validated.category_id);
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateTransaction(id: string, data: Partial<TransactionInput>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    // Verificar alertas si se modificó un gasto
    if (data.type === 'expense' || data.category_id) {
        await checkBudgetAlerts(data.category_id);
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard");
    return { success: true };
}

export async function getTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("transactions")
        .select("*, category:categories(name, icon, color)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    console.log("UserID:", user.id);
    console.log("Transactions found:", data?.length);
    console.log("First transaction:", data?.[0]);
    if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
    return data;
}