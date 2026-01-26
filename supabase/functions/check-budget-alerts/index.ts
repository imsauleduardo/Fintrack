// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Budget {
    id: string;
    user_id: string;
    category_id: string | null;
    amount: number;
    period: string;
    alert_at_percentage: number;
    categories?: { name: string };
    users?: { fcm_token: string | null };
}

serve(async (req: Request) => {
    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Obtener todos los presupuestos activos con sus usuarios y categorías
        const { data: budgets, error } = await supabaseClient
            .from("budgets")
            .select("*, users(fcm_token), categories(name)");

        if (error) {
            throw new Error(`Error al obtener presupuestos: ${error.message}`);
        }

        let alertsSent = 0;

        // Verificar cada presupuesto y enviar alertas si es necesario
        for (const budget of (budgets as Budget[]) || []) {
            // Calcular el gasto actual del período
            const { data: transactions } = await supabaseClient
                .from("transactions")
                .select("amount")
                .eq("user_id", budget.user_id)
                .eq("type", "expense");

            const spent = transactions?.reduce(
                (acc, t) => acc + Number(t.amount),
                0
            ) || 0;

            const progress = (spent / budget.amount) * 100;
            const threshold = budget.alert_at_percentage || 80;

            // Verificar si debe enviar alerta
            if (progress >= threshold) {
                const budgetName = budget.categories?.name || "Gasto Global";
                const message =
                    progress >= 100
                        ? `Has excedido tu presupuesto "${budgetName}" en $${(spent - budget.amount).toFixed(2)}`
                        : `Has consumido el ${progress.toFixed(0)}% de tu presupuesto "${budgetName}"`;

                console.log(`📱 Alerta para usuario ${budget.user_id}: ${message}`);

                // Aquí podrías integrar con Firebase Cloud Messaging
                // Por ahora solo registramos en logs
                alertsSent++;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                budgetsChecked: budgets?.length || 0,
                alertsSent,
                timestamp: new Date().toISOString(),
            }),
            {
                headers: { "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error en check-budget-alerts:", error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Error desconocido",
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
});