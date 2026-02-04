import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { processSelectedEmails, getPotentialEmails } from '@/lib/actions/gmail-sync';
import { sendPushNotification } from '@/lib/actions/push';
import { createNotification } from '@/lib/actions/notifications';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await createClient();

        // 1. Obtener usuarios con Gmail y sus configuraciones
        // Asumimos que la columna 'preferred_sync_hour' existe gracias a la migración
        const { data: users, error } = await supabase
            .from('gmail_tokens')
            .select(`
                user_id,
                email,
                sync_interval,
                last_sync_at,
                preferred_sync_hour,
                users (fcm_token)
            `);

        if (error || !users) {
            console.error("Error fetching users for sync:", error);
            return NextResponse.json({ processed_users: 0 });
        }

        let totalProcessed = 0;
        const currentHour = new Date().getUTCHours(); // Hora actual UTC (0-23)

        for (const entry of users) {
            try {
                // Garantía de Ejecución Diaria: El cron siempre se ejecuta
                // La duplicación se previene mediante el timestamp last_sync_at en getPotentialEmails
                const userId = entry.user_id;
                const fcmToken = (entry.users as any)?.fcm_token;

                // Ejecutar Sincronización
                const emails = await getPotentialEmails(userId);

                if (emails.length > 0) {
                    const messageIds = emails.map(e => e.id).filter((id): id is string => !!id);
                    const result = await processSelectedEmails(messageIds, userId);

                    totalProcessed += result.count;

                    // Si se encontraron nuevos movimientos
                    if (result.count > 0) {
                        const title = "Nuevos movimientos detectados";
                        const body = `Hemos encontrado ${result.count} transacciones nuevas en tu correo ${entry.email}.`;

                        // 1. Crear Notificación In-App
                        await createNotification(
                            userId,
                            title,
                            body,
                            "email_sync",
                            "/dashboard/transactions/pending",
                            { count: result.count, email: entry.email }
                        );

                        // 2. Enviar Push Notification (si tiene token)
                        if (fcmToken) {
                            await sendPushNotification(fcmToken, title, body);
                        }
                    }
                }
            } catch (err) {
                console.error(`Error procesando usuario ${entry.user_id}:`, err);
                continue;
            }
        }

        return NextResponse.json({
            success: true,
            processed_users: users.length,
            total_extracted: totalProcessed,
            time_utc: currentHour
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}