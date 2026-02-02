"use server";

import { createClient } from "@/supabase/server";
import { TransactionInput } from "@/lib/validations/transaction";
import { revalidatePath } from "next/cache";
import { checkBudgetAlerts } from "./budgets";
import { checkOnboardingSuggestions } from "./notifications";

async function syncAccountBalance(supabase: any, type: 'expense' | 'income', amount: number, assetId?: string, liabilityId?: string, reverse = false) {
    const factor = reverse ? -1 : 1;

    if (assetId) {
        // Assets: Expense decreases balance, Income increases balance
        const adjustment = (type === 'expense' ? -amount : amount) * factor;
        const { data: asset } = await supabase.from("assets").select("current_value").eq("id", assetId).single();
        if (asset) {
            await supabase.from("assets").update({
                current_value: Number(asset.current_value) + adjustment
            }).eq("id", assetId);
        }
    } else if (liabilityId) {
        // Liabilities: Expense increases debt, Income decreases debt
        const adjustment = (type === 'expense' ? amount : -amount) * factor;
        const { data: liability } = await supabase.from("liabilities").select("current_balance").eq("id", liabilityId).single();
        if (liability) {
            await supabase.from("liabilities").update({
                current_balance: Number(liability.current_balance) + adjustment
            }).eq("id", liabilityId);
        }
    }
}

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

    // ✨ BALANCE SYNC
    if (validated.asset_id || validated.liability_id) {
        await syncAccountBalance(supabase, validated.type, Number(validated.amount), validated.asset_id, validated.liability_id);
    }

    // ✨ NUEVO: Verificar alertas de presupuesto después de crear la transacción
    if (validated.type === 'expense') {
        await checkBudgetAlerts(validated.category_id);
    }

    // ✨ ONBOARDING SYNC
    await checkOnboardingSuggestions();

    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateTransaction(id: string, data: Partial<TransactionInput>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Fetch old transaction before update to reverse effects
    const { data: oldTx } = await supabase.from("transactions").select("*").eq("id", id).single();

    const { error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    // Re-fetch or use oldTx + data merging to get the new state
    if (oldTx && (oldTx.asset_id || oldTx.liability_id || data.asset_id || data.liability_id)) {
        // Reverse old
        if (oldTx.asset_id || oldTx.liability_id) {
            await syncAccountBalance(supabase, oldTx.type, Number(oldTx.amount), oldTx.asset_id, oldTx.liability_id, true);
        }
        // Apply new (fetch again to be sure of data)
        const { data: newTx } = await supabase.from("transactions").select("*").eq("id", id).single();
        if (newTx && (newTx.asset_id || newTx.liability_id)) {
            await syncAccountBalance(supabase, newTx.type, Number(newTx.amount), newTx.asset_id, newTx.liability_id);
        }
    }

    // Verificar alertas si se modificó un gasto
    if (data.type === 'expense' || data.category_id || oldTx?.type === 'expense') {
        const catId = data.category_id || oldTx?.category_id;
        await checkBudgetAlerts(catId);
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Fetch transaction before deleting to reverse balance
    const { data: tx } = await supabase.from("transactions").select("*").eq("id", id).single();

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    if (tx && (tx.asset_id || tx.liability_id)) {
        await syncAccountBalance(supabase, tx.type, Number(tx.amount), tx.asset_id, tx.liability_id, true);
    }
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