"use server";

import { createClient } from "@/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateInsights() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Obtener transacciones del último mes
    const { data: transactions } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("date", { ascending: false });

    if (!transactions || transactions.length === 0) {
        return [{
            type: 'info',
            title: 'Comienza a registrar transacciones',
            description: 'Aún no tienes suficientes datos para generar insights. Registra tus ingresos y gastos para obtener recomendaciones personalizadas.',
            priority: 'low'
        }];
    }

    // Calcular estadísticas
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Agrupar por categoría
    const categoryExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const category = t.categories?.name || 'Sin categoría';
            acc[category] = (acc[category] || 0) + Number(t.amount);
            return acc;
        }, {} as Record<string, number>);

    // CORRECCIÓN DEFINITIVA: Casting explícito para asegurar que TypeScript sepa que son números
    const topCategories = (Object.entries(categoryExpenses) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Generar insights con IA
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Preparar TODAS las variables como strings antes del prompt
    const formattedIncome = String(totalIncome.toLocaleString());
    const formattedExpenses = String(totalExpenses.toLocaleString());
    const balanceValue = totalIncome - totalExpenses;
    const balanceText = String(balanceValue.toLocaleString());

    const topCategoriesText = topCategories.map((item) => {
        const cat = item[0];
        const amount = item[1];
        const amountStr = String(Number(amount).toLocaleString());
        return cat + ': $' + amountStr;
    }).join(', ');

    const transactionCount = String(transactions.length);

    const prompt = 'Eres un asesor financiero experto. Analiza estos datos financieros del último mes y genera 3-5 insights accionables y personalizados en español:\n\n' +
        'Datos:\n' +
        '- Ingresos totales: $' + formattedIncome + '\n' +
        '- Gastos totales: $' + formattedExpenses + '\n' +
        '- Balance: $' + balanceText + '\n' +
        '- Top 5 categorías de gasto: ' + topCategoriesText + '\n' +
        '- Número de transacciones: ' + transactionCount + '\n\n' +
        'Genera insights en formato JSON con esta estructura:\n' +
        '[\n' +
        '  {\n' +
        '    "type": "warning" | "success" | "info" | "tip",\n' +
        '    "title": "Título corto del insight",\n' +
        '    "description": "Descripción detallada y accionable (máximo 2 líneas)",\n' +
        '    "priority": "high" | "medium" | "low"\n' +
        '  }\n' +
        ']\n\n' +
        'Enfócate en:\n' +
        '1. Patrones de gasto preocupantes\n' +
        '2. Oportunidades de ahorro\n' +
        '3. Comparación ingresos vs gastos\n' +
        '4. Recomendaciones específicas basadas en las categorías principales\n' +
        '5. Felicitaciones si hay buenos hábitos\n\n' +
        'Responde SOLO con el JSON, sin texto adicional.';

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Limpiar la respuesta para extraer solo el JSON
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const insights = JSON.parse(jsonMatch[0]);

            // Guardar insights en la base de datos
            await supabase.from("ai_recommendations").insert({
                user_id: user.id,
                recommendations: insights,
                generated_at: new Date().toISOString()
            });

            return insights;
        }
    } catch (error) {
        console.error("Error generando insights:", error);
    }

    // Fallback: insights básicos sin IA
    const insights = [];

    if (totalExpenses > totalIncome) {
        const differenceValue = totalExpenses - totalIncome;
        const difference = String(differenceValue.toLocaleString());
        const topCategory = topCategories[0]?.[0] || 'categorías principales';
        insights.push({
            type: 'warning',
            title: 'Gastos superiores a ingresos',
            description: 'Gastaste $' + difference + ' más de lo que ingresaste este mes. Considera reducir gastos en ' + topCategory + '.',
            priority: 'high'
        });
    } else {
        const savingsValue = totalIncome - totalExpenses;
        const savings = String(savingsValue.toLocaleString());
        insights.push({
            type: 'success',
            title: '¡Excelente balance!',
            description: 'Ahorraste $' + savings + ' este mes. Continúa con estos buenos hábitos financieros.',
            priority: 'high'
        });
    }

    if (topCategories.length > 0) {
        const topCategory = topCategories[0][0];
        const topAmount = topCategories[0][1];

        const percentageValue = (Number(topAmount) / totalExpenses) * 100;
        const percentage = String(percentageValue.toFixed(0));
        const formattedAmount = String(Number(topAmount).toLocaleString());
        insights.push({
            type: 'info',
            title: topCategory + ' es tu mayor gasto',
            description: 'Representa el ' + percentage + '% de tus gastos totales ($' + formattedAmount + '). Evalúa si puedes optimizar en esta categoría.',
            priority: 'medium'
        });
    }

    return insights;
}

export async function getLatestInsights() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("ai_recommendations")
        .select("recommendations")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();

    return data?.recommendations || [];
}