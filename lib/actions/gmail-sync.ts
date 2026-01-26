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

export async function getPotentialEmails(userId?: string) {
    const supabase = await createClient();
    let targetUserId = userId;

    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");
        targetUserId = user.id;
    }

    const gmail = await getGmailClient(supabase, targetUserId);

    // Marcamos el intento de escaneo en la base de datos
    await supabase
        .from("gmail_tokens")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("user_id", targetUserId);

    const query = 'after:' + Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60) + ' ("$" OR "€" OR "total" OR "pago" OR "compra" OR "transferencia" OR "sent money" OR "has enviado" OR "recibo" OR "ticket" OR "order" OR "pedido" OR "banco" OR "bank")';

    const response = await gmail.users.messages.list({ userId: "me", q: query, maxResults: 50 });
    if (!response.data.messages) return [];

    const messages = [];
    for (const msg of response.data.messages) {
        const fullMsg = await gmail.users.messages.get({ userId: "me", id: msg.id!, format: 'minimal' });
        const snippet = fullMsg.data.snippet || "";
        const subject = fullMsg.data.payload?.headers?.find(h => h.name === 'Subject')?.value || "Sin asunto";
        const date = fullMsg.data.internalDate || "";

        messages.push({
            id: msg.id || "",
            subject,
            snippet,
            date: date ? parseInt(date) : Date.now()
        });
    }
    return messages;
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

        const prompt = `
        Analiza este correo y extrae la información financiera.
        Contenido: "${body.substring(0, 3000)}"
        
        Categorías (Usa el ID exacto):
        ${categoriesLabels}
        
        Responde ÚNICAMENTE un JSON:
        { 
          "amount": number, 
          "description": "string", 
          "category_id": "string", 
          "type": "expense" | "income", 
          "date": "YYYY-MM-DD", 
          "source_email_id": "${id}" 
        }
        Si no es un movimiento real, responde null.
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

                const emailDate = fullMsg.data.internalDate ? new Date(parseInt(fullMsg.data.internalDate)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

                await supabase.from("pending_transactions").upsert({
                    user_id: targetUserId,
                    ...data,
                    amount: amount,
                    date: data.date || emailDate,
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