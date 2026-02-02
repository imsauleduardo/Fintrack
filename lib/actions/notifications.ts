"use server";

import { createClient } from "@/supabase/server";

export async function getUnreadNotifications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("in_app_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(20);

    return data || [];
}

export async function getAllNotifications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("in_app_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    return data || [];
}

export async function markAsRead(notificationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from("in_app_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);
}

export async function markAllAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from("in_app_notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);
}

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    actionUrl?: string,
    metadata?: any
) {
    const supabase = await createClient();
    await supabase.from("in_app_notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        metadata,
    });
}

export async function checkOnboardingSuggestions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
        { count: assetCount },
        { count: budgetCount },
        { count: goalCount },
        { data: existingNotifs }
    ] = await Promise.all([
        supabase.from("assets").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("budgets").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("financial_goals").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("in_app_notifications")
            .select("type")
            .eq("user_id", user.id)
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const existingTypes = new Set(existingNotifs?.map(n => n.type) || []);

    // 1. Asset Suggestion
    if (assetCount === 0 && !existingTypes.has('onboarding_asset')) {
        await createNotification(
            user.id,
            "💡 Vincula tu primera cuenta",
            "Para un seguimiento automático del patrimonio, registra tus cuentas de ahorro o tarjetas.",
            "onboarding_asset",
            "/dashboard/patrimonio"
        );
    }

    // 2. Budget Suggestion
    if (budgetCount === 0 && !existingTypes.has('onboarding_budget')) {
        await createNotification(
            user.id,
            "🎯 Controla tus gastos",
            "Crea un presupuesto para tus categorías más usadas y mantén tus finanzas bajo control.",
            "onboarding_budget",
            "/dashboard/budgets"
        );
    }

    // 3. Goal Suggestion
    if (goalCount === 0 && !existingTypes.has('onboarding_goal')) {
        await createNotification(
            user.id,
            "🚀 Define una meta",
            "¿Ahorras para un viaje o una inversión? Crea una meta y observa tu progreso.",
            "onboarding_goal",
            "/dashboard/goals"
        );
    }
}
