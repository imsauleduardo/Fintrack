import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { processSelectedEmails, getPotentialEmails } from '@/lib/actions/gmail-sync';
import { sendPushNotification } from '@/lib/actions/push';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await createClient();

        // 1. Obtener usuarios con Gmail y su token FCM
        const { data: users, error } = await supabase
            .from('gmail_tokens')
            .select(`
                user_id,
                users (fcm_token)
            `);

        if (error || !users) return NextResponse.json({ processed_users: 0 });

        let totalProcessed = 0;

        for (const entry of users) {
            try {
                const userId = entry.user_id;
                const fcmToken = (entry.users as any)?.fcm_token;

                const emails = await getPotentialEmails(userId);

                if (emails.length > 0) {
                    const messageIds = emails.map(e => e.id).filter((id): id is string => !!id);
                    const result = await processSelectedEmails(messageIds, userId);

                    totalProcessed += result.count;

                    // Si se encontraron nuevos movimientos, enviar Push
                    if (result.count > 0 && fcmToken) {
                        await sendPushNotification(
                            fcmToken,
                            "Nuevos movimientos detectados",
                            `He encontrado ${result.count} transacciones en tu email para revisar.`
                        );
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
            total_extracted: totalProcessed
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}