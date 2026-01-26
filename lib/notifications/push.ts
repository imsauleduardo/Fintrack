"use server";

import { messaging } from "@/lib/firebase/admin";
import { createClient } from "@/supabase/server";

export async function sendBudgetAlert(userId: string, message: string, progress: number, budgetId: string) {
    try {
        const supabase = await createClient();

        // Obtener el token FCM del usuario desde la base de datos
        const { data: user } = await supabase
            .from('users')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (!user?.fcm_token) {
            console.log(`Usuario ${userId} no tiene token FCM registrado`);
            return;
        }

        // Enviar notificación push
        await messaging.send({
            token: user.fcm_token,
            notification: {
                title: '💰 Alerta de Presupuesto',
                body: message,
            },
            data: {
                type: 'budget_alert',
                progress: progress.toString(),
                budgetId: budgetId,
                url: `/dashboard/budgets/${budgetId}`
            },
            webpush: {
                fcmOptions: {
                    link: `/dashboard/budgets/${budgetId}`
                }
            }
        });

        console.log(`✅ Notificación enviada a ${userId}: ${message}`);
    } catch (error) {
        console.error('Error al enviar notificación push:', error);
    }
}