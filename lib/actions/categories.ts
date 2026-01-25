"use server";

import { createClient } from "@/supabase/server";
import { CategoryInput } from "@/lib/validations/category";
import { revalidatePath } from "next/cache";

export async function createCategory(data: CategoryInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No hay sesión activa");

    const { error } = await supabase
        .from('categories')
        .insert({
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type,
            user_id: user.id
        });

    if (error) throw error;
    revalidatePath("/dashboard/categories");
}

export async function updateCategory(id: string, data: CategoryInput) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('categories')
        .update({
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type
        })
        .eq('id', id);

    if (error) throw error;
    revalidatePath("/dashboard/categories");
}

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath("/dashboard/categories");
}