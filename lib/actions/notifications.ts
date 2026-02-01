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
