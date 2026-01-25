"use server";

import { google } from "googleapis";
import { getCategories } from "./categories";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getGmailClient(supabase: any, userId: string) {
    const { data: tokenData } = await supabase.from("gmail_tokens").select("*").eq("user_id", userId).single();
    if (!tokenData) throw new Error("Gmail no conectado");

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

    return google.gmail({ version: "v1", auth: oauth2Client });
}

// NUEVA FUNCIÓN: Lista correos potenciales de los últimos 30 días
export async function getPotentialEmails() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const gmail = await getGmailClient(supabase, user.id);

    // Query más agresivo buscando símbolos de dinero y palabras clave comunes
    const query = 'after:' + Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60) + ' ("$" OR "€" OR "total" OR "pago" OR "compra" OR "transferencia" OR "sent money" OR "has enviado" OR "recibo" OR "ticket" OR "order" OR "pedido" OR "banco" OR "bank")';

    const response = await gmail.users.messages.list({ userId: "me", q: query, maxResults: 50 });
    if (!response.data.messages) return [];

    const messages = [];
    for (const msg of response.data.messages) {
        const fullMsg = await gmail.users.messages.get({ userId: "me", id: msg.id!, format: 'minimal' });
        const snippet = fullMsg.data.snippet || "";
        const subject = fullMsg.data.payload?.headers?.find(h => h.name === 'Subject')?.value || "Sin asunto";
        // Usamos internalDate (timestamp en ms) en lugar del header Date que es un string variable
        const date = fullMsg.data.internalDate || "";

        messages.push({
            id: msg.id,
            subject,
            snippet,
            date: date ? parseInt(date) : Date.now()
        });
    }
    return messages;
}

// NUEVA FUNCIÓN: Procesa solo los IDs que el usuario marcó
export async function processSelectedEmails(messageIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const gmail = await getGmailClient(supabase, user.id);
    const categories = await getCategories();
    const categoriesLabels = categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let count = 0;
    for (const id of messageIds) {
        const fullMsg = await gmail.users.messages.get({ userId: "me", id });
        const body = fullMsg.data.snippet + " " + (fullMsg.data.payload?.parts?.[0]?.body?.data || ""); // Un poco más de contexto

        const prompt = `
        Extrae datos financieros de este correo: "${body}"
        Categorías:
        ${categoriesLabels}
        Responde ÚNICAMENTE JSON:
        { "amount": "number", "description": "string", "category_id": "string", "type": "expense" | "income", "date": "YYYY-MM-DD", "source_email_id": "${id}" }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        try {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}') + 1;
            if (start !== -1) {
                const data = JSON.parse(text.substring(start, end));
                await supabase.from("pending_transactions").upsert({
                    user_id: user.id,
                    ...data,
                    status: 'pending'
                }, { onConflict: 'source_email_id' });
                count++;
            }
        } catch (e) { continue; }
    }
    return { count };
}