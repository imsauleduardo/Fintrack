"use server";

import { createClient } from "@/supabase/server";
import { TransactionInput } from "@/lib/validations/transaction";
import { revalidatePath } from "next/cache";

export async function createTransaction(data: TransactionInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No hay sesión activa");

    const { error } = await supabase
        .from('transactions')
        .insert({
            amount: Number(data.amount),
            description: data.description,
            category_id: data.category_id,
            date: data.date,
            type: data.type,
            payment_method: data.payment_method,
            user_id: user.id
        });

    if (error) throw error;
    revalidatePath("/dashboard");
}

export async function updateTransaction(id: string, data: TransactionInput) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('transactions')
        .update({
            amount: Number(data.amount),
            description: data.description,
            category_id: data.category_id,
            date: data.date,
            type: data.type,
            payment_method: data.payment_method,
        })
        .eq('id', id);

    if (error) throw error;
    revalidatePath("/dashboard");
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath("/dashboard");
}

export async function getTransactions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            category:categories(name, icon, color)
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}