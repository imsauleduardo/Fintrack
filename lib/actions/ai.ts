"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCategories } from "./categories";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseTransactionText(text: string) {
    if (!text || text.trim().length < 2) {
        throw new Error("El texto es demasiado corto.");
    }

    try {
        const categories = await getCategories();
        const categoriesLabels = categories.map(c => `- ${c.name} (ID: ${c.id}, Tipo: ${c.type})`).join("\n");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Eres un asistente financiero experto. Tu tarea es extraer información estructurada de este texto: "${text}"
        
        Categorías disponibles (usa ÚNICAMENTE estos IDs):
        ${categoriesLabels}

        Métodos de pago válidos: Efectivo, Tarjeta, Transferencia.
        Fecha de hoy: ${new Date().toISOString().split('T')[0]}.

        Reglas de interpretación:
        1. Si menciona "gasté", "pagué", "compré" es tipo "expense". Si menciona "gané", "recibí", "depósito" es "income".
        2. Si no menciona fecha, usa la de hoy.
        3. El monto debe ser un string numérico puro.
        4. Si no especifica método de pago, usa "Efectivo" por defecto.

        Responde ÚNICAMENTE un JSON puro con esta estructura:
        { 
          "amount": "string", 
          "description": "string", 
          "category_id": "string", 
          "type": "expense" | "income", 
          "date": "YYYY-MM-DD HH:mm:ss",
          "payment_method": "Efectivo" | "Tarjeta" | "Transferencia"
        }
        Si no hay hora clara, usa HH:mm:ss de la hora actual.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}') + 1;
        return JSON.parse(responseText.substring(start, end));
    } catch (error) {
        console.error("AI Parser Error:", error);
        throw new Error("No pude interpretar el texto. Intenta ser más claro (ej: 'Gasté 50 en comida con tarjeta')");
    }
}

// ... Mantener el resto de la función parseReceiptImage igual
export async function parseReceiptImage(base64Image: string) {
    try {
        const categories = await getCategories();
        const categoriesLabels = categories.map(c => `- ${c.name} (ID: ${c.id}, Tipo: ${c.type})`).join("\n");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const base64Data = base64Image.split(",")[1];

        const prompt = `
        Analiza esta imagen de un recibo financiero. Extrae con precisión:
        1. Monto total (solo números).
        2. Nombre del comercio o descripción breve.
        3. Fecha del recibo (YYYY-MM-DD).
        
        Categorías disponibles (selecciona el ID más adecuado):
        ${categoriesLabels}

        Hoy es ${new Date().toISOString().split('T')[0]}.

        Responde ÚNICAMENTE un JSON puro:
        {
          "amount": "string",
          "description": "string",
          "category_id": "string",
          "type": "expense",
          "date": "YYYY-MM-DD HH:mm:ss",
          "payment_method": "Efectivo"
        }
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
        ]);

        const responseText = result.response.text();
        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}') + 1;
        return JSON.parse(responseText.substring(start, end));
    } catch (error) {
        console.error("Error OCR Gemini:", error);
        throw new Error("No pude leer el recibo. Asegúrate de que la foto sea clara y tenga buena luz.");
    }
}