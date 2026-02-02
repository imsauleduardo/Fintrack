"use server";

import { google } from "googleapis";
import { getCategories } from "./categories";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getGmailClient(supabase: any, userId: string) {
    const { data: tokenData, error: fetchError } = await supabase
        .from("gmail_tokens")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (fetchError || !tokenData) throw new Error("Gmail no conectado");

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: tokenData.expiry_date,
    });

    oauth2Client.on("tokens", async (tokens) => {
        const updateData: any = {
            access_token: tokens.access_token,
            expiry_date: tokens.expiry_date,
        };
        if (tokens.refresh_token) {
            updateData.refresh_token = tokens.refresh_token;
        }

        await supabase
            .from("gmail_tokens")
            .update(updateData)
            .eq("user_id", userId);
    });

    return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getPotentialEmails(userId?: string, incremental: boolean = false) {
    const supabase = await createClient();
    let targetUserId = userId;

    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");
        targetUserId = user.id;
    }

    const { data: tokenData, error: fetchError } = await supabase
        .from("gmail_tokens")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

    if (fetchError || !tokenData) throw new Error("Gmail no conectado");

    const gmail = await getGmailClient(supabase, targetUserId);

    // 2. Construir query más precisa
    // Si no es incremental (primer escaneo), asegurar 30 días exactos
    let afterTimestamp = Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60);

    if (incremental && tokenData.last_sync_at) {
        const lastSync = new Date(tokenData.last_sync_at).getTime() / 1000;
        // Agregamos un pequeño buffer de 1 minuto para evitar duplicados exactos si hubo latencia
        afterTimestamp = Math.floor(lastSync);
    }

    // Query refinada:
    // - Filtra categoría Personal (primary) y Updates. Excluye Promociones y Social explícitamente.
    // - Keywords positivos fuertes para transacciones.
    // - Keywords negativos para empleo, newsletters, etc.
    const positiveTerms = '("$" OR "€" OR "total" OR "pago" OR "compra" OR "transferencia" OR "sent money" OR "has enviado" OR "recibo" OR "boleta" OR "factura" OR "invoice" OR "yape" OR "plin" OR "bcp" OR "interbank" OR "bbva" OR "scotiabank")';
    const negativeTerms = '(-"unsubscribe" -"darse de baja" -"empleo" -"job" -"linkedin" -"postulación" -"newsletter" -"publicidad" -"promo" -"oferta" -"descuento")';

    // category:primary o category:updates suelen tener las notificaciones transaccionales. category:promotions es lo que queremos evitar.
    const query = `after:${afterTimestamp} ${positiveTerms} ${negativeTerms} -category:promotions -category:social`;

    // 3. Obtener mensajes con paginación
    let allMessages: any[] = [];
    let nextPageToken: string | undefined = undefined;
    const MAX_PAGES = 5; // Seguridad para no loopear infinito (5 * 50 = 250 emails max por tanda)

    let pageCount = 0;
    do {
        const response: any = await gmail.users.messages.list({
            userId: "me",
            q: query,
            maxResults: 50,
            pageToken: nextPageToken
        });

        if (response.data.messages) {
            allMessages = [...allMessages, ...response.data.messages];
        }

        nextPageToken = response.data.nextPageToken;
        pageCount++;

    } while (nextPageToken && pageCount < MAX_PAGES);

    // 4. Actualizar fecha de última sincronización
    await supabase
        .from("gmail_tokens")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("user_id", targetUserId);

    if (allMessages.length === 0) return [];

    // Recuperar detalles de los mensajes (en paralelo con límite de concurrencia si fuera necesario, aquí simple)
    // Limitar a los primeros 50 para detalles si hay demasiados para no saturar, o procesar todos con cuidado.
    // El usuario pidió "todos", pero processSelectedEmails usa Gemini que cuesta/tarda.
    // Vamos a retornar los IDs y basic info, el frontend o el siguiente paso decide cuántos procesar.
    // NOTA: getPotentialEmails retorna basic info.

    const detailedMessages: any[] = [];
    // Procesamos en lotes o limitamos a los 50 más recientes para la vista inicial si son muchos?
    // Mejor devolvemos hasta 100 para asegurar cobertura de 30 días.
    const messagesToFetch = allMessages.slice(0, 100);

    for (const msg of messagesToFetch) {
        try {
            const fullMsg = await gmail.users.messages.get({ userId: "me", id: msg.id!, format: 'minimal' });
            const snippet = fullMsg.data.snippet || "";
            const subject = fullMsg.data.payload?.headers?.find(h => h.name === 'Subject')?.value || "Sin asunto";
            const date = fullMsg.data.internalDate || "";

            detailedMessages.push({
                id: msg.id || "",
                subject,
                snippet,
                date: date ? parseInt(date) : Date.now()
            });
        } catch (e) {
            console.error("Error fetching message details for", msg.id, e);
        }
    }
    return detailedMessages;
}

export async function processSelectedEmails(messageIds: string[], userId?: string) {
    const supabase = await createClient();
    let targetUserId = userId;

    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");
        targetUserId = user.id;
    }

    const gmail = await getGmailClient(supabase, targetUserId);
    const categories = await getCategories();
    const categoriesLabels = categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let count = 0;
    for (const id of messageIds) {
        if (!id) continue;
        const fullMsg = await gmail.users.messages.get({ userId: "me", id });

        let body = fullMsg.data.snippet || "";
        const parts = fullMsg.data.payload?.parts;
        if (parts) {
            const textPart = parts.find(p => p.mimeType === 'text/plain') || parts[0];
            if (textPart?.body?.data) {
                body += " " + Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
        } else if (fullMsg.data.payload?.body?.data) {
            body += " " + Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf-8');
        }

        const internalTime = fullMsg.data.internalDate ? new Date(parseInt(fullMsg.data.internalDate)).toLocaleString('es-PE') : new Date().toLocaleString('es-PE');
        const prompt = `
        Analiza este correo y extrae la información financiera DETALLADA.
        Contenido: "${body.substring(0, 4000)}"
        
        Categorías (Usa el ID exacto):
        ${categoriesLabels}
        
        Referencia de tiempo (Hora del correo): ${internalTime}

        REGLAS PARA LA DESCRIPCIÓN:
        - Debe ser específica: [Nombre del Comercio] - [Detalle del gasto/ingreso].
        - Ejemplo: "Starbucks - Café y Sandwich" o "Netflix - Suscripción Mensual".
        - Evita descripciones genéricas como solo "Pago" o "Compra".

        REGLAS PARA LA FECHA/HORA:
        - Busca la hora exacta del movimiento en el texto.
        - Si no encuentras una hora específica en el texto, usa la hora de referencia del correo.
        - Formato de respuesta para "date": "YYYY-MM-DD HH:mm:ss"
        
        Responde ÚNICAMENTE un JSON:
        { 
          "amount": number, 
          "description": "string", 
          "category_id": "string", 
          "type": "expense" | "income", 
          "date": "YYYY-MM-DD HH:mm:ss", 
          "source_email_id": "${id}" 
        }
        Si no es un movimiento real o es publicidad, responde null.
        `;

        try {
            const result = await model.generateContent(prompt);
            let text = result.response.text();
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();

            const start = text.indexOf('{');
            const end = text.lastIndexOf('}') + 1;

            if (start !== -1) {
                const data = JSON.parse(text.substring(start, end));
                const amount = parseFloat(data.amount);
                if (isNaN(amount) || amount <= 0) continue;

                const emailDateTime = fullMsg.data.internalDate
                    ? new Date(parseInt(fullMsg.data.internalDate)).toISOString().replace('T', ' ').substring(0, 19)
                    : new Date().toISOString().replace('T', ' ').substring(0, 19);

                await supabase.from("pending_transactions").upsert({
                    user_id: targetUserId,
                    ...data,
                    amount: amount,
                    date: data.date || emailDateTime,
                    status: 'pending'
                }, { onConflict: 'source_email_id' });

                count++;
            }
        } catch (e) {
            continue;
        }
    }
    return { count };
}