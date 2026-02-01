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
                // Lógica de decisión: ¿Debe sincronizarse ahora?
                let shouldSync = false;

                if (!entry.last_sync_at) {
                    shouldSync = true; // Nunca se ha sincronizado
                } else {
                    const lastSync = new Date(entry.last_sync_at);
                    const hoursSinceLastSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

                    if (entry.sync_interval === 24) {
                        // Modo Diario: Verificar si es la hora preferida (en UTC)
                        // Si preferred_sync_hour es null, fallback a intervalo simple
                        if (entry.preferred_sync_hour !== null && entry.preferred_sync_hour !== undefined) {
                            // Margen de 1 hora para asegurar que se ejecute si el cron se retrasa un poco
                            shouldSync = currentHour === entry.preferred_sync_hour && hoursSinceLastSync >= 20;
                        } else {
                            shouldSync = hoursSinceLastSync >= 24;
                        }
                    } else {
                        // Modos 1h, 6h, 12h: Simplemente verificar intervalo
                        shouldSync = hoursSinceLastSync >= entry.sync_interval;
                    }
                }

                if (!shouldSync) continue; // Saltar usuario

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