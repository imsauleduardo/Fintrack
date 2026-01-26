"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { differenceInDays } from "date-fns";

export async function getGoals() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("target_date", { ascending: true });

    if (error) {
        console.error("Error al obtener metas:", error);
        return [];
    }

    const goalsWithProgress = data.map(goal => {
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        const remaining = Number(goal.target_amount) - Number(goal.current_amount);
        const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
        const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
        const monthlyRequired = remaining / monthsRemaining;

        return {
            ...goal,
            type: goal.goal_type, // Mapear goal_type a type para compatibilidad
            progress: Math.min(100, progress),
            remaining,
            daysRemaining,
            monthlyRequired: monthlyRequired > 0 ? monthlyRequired : 0,
            isCompleted: progress >= 100 || goal.is_completed
        };
    });

    return goalsWithProgress;
}

export async function getGoalById(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: goal, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) throw new Error(error.message);

    const { data: contributions } = await supabase
        .from("goal_contributions")
        .select("*")
        .eq("goal_id", id)
        .order("contribution_date", { ascending: false });

    const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
    const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    const monthlyRequired = remaining / monthsRemaining;

    return {
        ...goal,
        type: goal.goal_type,
        progress: Math.min(100, progress),
        remaining,
        daysRemaining,
        monthlyRequired: monthlyRequired > 0 ? monthlyRequired : 0,
        contributions: contributions || [],
        isCompleted: progress >= 100 || goal.is_completed
    };
}

export async function createGoal(data: {
    name: string;
    type: 'savings' | 'investment' | 'debt';
    target_amount: number;
    target_date: string;
    description?: string;
    icon?: string;
    color?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase.from("financial_goals").insert({
        name: data.name,
        goal_type: data.type, // Mapear type a goal_type
        target_amount: data.target_amount,
        target_date: data.target_date,
        description: data.description,
        icon: data.icon,
        color: data.color,
        user_id: user.id,
        current_amount: 0
    });

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/goals");
    return { success: true };
}

export async function updateGoal(id: string, data: {
    name?: string;
    type?: 'savings' | 'investment' | 'debt';
    target_amount?: number;
    target_date?: string;
    description?: string;
    icon?: string;
    color?: string;
    is_completed?: boolean;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const updateData: any = { ...data };
    if (data.type) {
        updateData.goal_type = data.type;
        delete updateData.type;
    }

    const { error } = await supabase
        .from("financial_goals")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/goals");
    return { success: true };
}

export async function deleteGoal(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/goals");
    return { success: true };
}

export async function addContribution(goalId: string, data: {
    amount: number;
    description?: string;
    contribution_date?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: goal } = await supabase
        .from("financial_goals")
        .select("current_amount, target_amount")
        .eq("id", goalId)
        .eq("user_id", user.id)
        .single();

    if (!goal) throw new Error("Meta no encontrada");

    const { error: contributionError } = await supabase
        .from("goal_contributions")
        .insert({
            goal_id: goalId,
            ...data
        });

    if (contributionError) throw new Error(contributionError.message);

    const newAmount = Number(goal.current_amount) + Number(data.amount);
    const isCompleted = newAmount >= Number(goal.target_amount);

    const { error: updateError } = await supabase
        .from("financial_goals")
        .update({
            current_amount: newAmount,
            is_completed: isCompleted
        })
        .eq("id", goalId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath("/dashboard/goals");
    return { success: true, isCompleted };
}

export async function deleteContribution(contributionId: string, goalId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: contribution } = await supabase
        .from("goal_contributions")
        .select("amount")
        .eq("id", contributionId)
        .single();

    if (!contribution) throw new Error("Contribución no encontrada");

    const { error: deleteError } = await supabase
        .from("goal_contributions")
        .delete()
        .eq("id", contributionId);

    if (deleteError) throw new Error(deleteError.message);

    const { data: goal } = await supabase
        .from("financial_goals")
        .select("current_amount, target_amount")
        .eq("id", goalId)
        .single();

    if (goal) {
        const newAmount = Math.max(0, Number(goal.current_amount) - Number(contribution.amount));
        const isCompleted = newAmount >= Number(goal.target_amount);

        await supabase
            .from("financial_goals")
            .update({
                current_amount: newAmount,
                is_completed: isCompleted
            })
            .eq("id", goalId);
    }

    revalidatePath("/dashboard/goals");
    return { success: true };
}