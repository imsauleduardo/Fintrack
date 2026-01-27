"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function getLiabilities() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("liabilities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error al obtener pasivos:", error);
        return [];
    }

    return data || [];
}

export async function createLiability(data: {
    name: string;
    type: string;
    balance: number;
    interest_rate?: number;
    due_date?: string;
    description?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase.from("liabilities").insert({
        name: data.name,
        type: data.type,
        current_balance: data.balance, // Mapa de balance a current_balance
        interest_rate: data.interest_rate,
        due_date: data.due_date || null, // Manejar fecha vacía
        description: data.description,
        user_id: user.id,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/liabilities");
    return { success: true };
}

export async function updateLiability(id: string, data: {
    name?: string;
    type?: string;
    balance?: number;
    interest_rate?: number;
    due_date?: string;
    description?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const updateData: any = { ...data };
    if (data.balance !== undefined) {
        updateData.current_balance = data.balance;
        delete updateData.balance;
    }

    const { error } = await supabase
        .from("liabilities")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/liabilities");
    return { success: true };
}

export async function deleteLiability(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("liabilities")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/liabilities");
    return { success: true };
}

export async function getTotalLiabilities() {
    const liabilities = await getLiabilities();
    return liabilities.reduce((total, liability) => total + Number(liability.current_balance || 0), 0);
}