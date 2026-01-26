"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";
import { sendBudgetAlert } from "@/lib/notifications/push";

export async function getBudgetsWithProgress() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: budgets, error } = await supabase
        .from("budgets")
        .select("*, categories(name, icon, color)")
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
        const period = budget.period || 'monthly';
        let start: string, end: string;

        // Calcular rango según el período
        const now = new Date();
        switch (period) {
            case 'daily':
                start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
                break;
            case 'weekly':
                const dayOfWeek = now.getDay();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - dayOfWeek);
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                start = startOfWeek.toISOString();
                end = endOfWeek.toISOString();
                break;
            case 'yearly':
                start = new Date(now.getFullYear(), 0, 1).toISOString();
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
                break;
            case 'monthly':
            default:
                start = startOfMonth(now).toISOString();
                end = endOfMonth(now).toISOString();
                break;
        }

        let query = supabase
            .from("transactions")
            .select("amount")
            .eq("user_id", user.id)
            .eq("type", "expense")
            .gte("date", start)
            .lte("date", end);

        if (budget.category_id) {
            query = query.eq("category_id", budget.category_id);
        }

        const { data: txs } = await query;
        const spent = txs?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

        return {
            ...budget,
            spent,
            progress: (spent / Number(budget.amount)) * 100,
            remaining: Math.max(0, Number(budget.amount) - spent)
        };
    }));

    return budgetsWithProgress;
}

// ✨ NUEVO: Obtener un presupuesto individual con su progreso
export async function getBudgetById(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: budget, error } = await supabase
        .from("budgets")
        .select("*, categories(name, icon, color)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) throw new Error(error.message);

    // Calcular progreso
    const start = startOfMonth(new Date()).toISOString();
    const end = endOfMonth(new Date()).toISOString();

    let query = supabase
        .from("transactions")
        .select("amount, description, date, categories(name, icon, color)")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", start)
        .lte("date", end);

    if (budget.category_id) {
        query = query.eq("category_id", budget.category_id);
    }

    const { data: txs } = await query;
    const spent = txs?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    return {
        ...budget,
        spent,
        progress: (spent / Number(budget.amount)) * 100,
        remaining: Math.max(0, Number(budget.amount) - spent),
        transactions: txs || []
    };
}

export async function createBudget(data: { amount: number; category_id?: string; period?: string; alert_at_percentage?: number }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase.from("budgets").insert({
        ...data,
        user_id: user.id
    });

    if (error) throw new Error("Ya existe un presupuesto para esta categoría este mes.");
    revalidatePath("/dashboard/budgets");
    return { success: true };
}

// ✨ NUEVO: Actualizar un presupuesto existente
export async function updateBudget(id: string, data: { amount?: number; alert_at_percentage?: number }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("budgets")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/budgets");
    return { success: true };
}

export async function deleteBudget(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/budgets");
    return { success: true };
}

export async function checkBudgetAlerts(categoryId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const budgets = await getBudgetsWithProgress();
    for (const budget of budgets) {
        if (categoryId && budget.category_id !== categoryId) continue;
        const progress = budget.progress;
        const threshold = budget.alert_at_percentage || 80;
        const budgetName = budget.categories?.name || 'Gasto Global';
        // Alerta al alcanzar el umbral configurado
        if (progress >= threshold && progress < 100) {
            const message = `Has consumido el ${progress.toFixed(0)}% de tu presupuesto "${budgetName}"`;
            console.log(`⚠️ ${message}`);

            // Enviar notificación push
            await sendBudgetAlert(user.id, message, progress, budget.id);
        }
        // Alerta al 100%
        if (progress >= 100) {
            const exceeded = budget.spent - budget.amount;
            const message = `Has excedido tu presupuesto "${budgetName}" en $${exceeded.toLocaleString()}`;
            console.log(`🚨 ${message}`);

            // Enviar notificación push
            await sendBudgetAlert(user.id, message, progress, budget.id);
        }
    }
}