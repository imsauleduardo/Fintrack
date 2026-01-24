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
        Eres un asistente financiero. Extrae la info de: "${text}"
        Categorías:
        ${categoriesLabels}
        Hoy es ${new Date().toISOString().split('T')[0]}.
        Responde ÚNICAMENTE un JSON:
        { "amount": "string", "description": "string", "category_id": "string", "type": "expense" | "income", "date": "YYYY-MM-DD" }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}') + 1;
        return JSON.parse(responseText.substring(start, end));
    } catch (error) {
        throw new Error("No pude interpretar el texto.");
    }
}

export async function parseReceiptImage(base64Image: string) {
    try {
        const categories = await getCategories();
        const categoriesLabels = categories.map(c => `- ${c.name} (ID: ${c.id}, Tipo: ${c.type})`).join("\n");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Extraer solo la data base64 (quitando el prefijo de data:image/...)
        const base64Data = base64Image.split(",")[1];

        const prompt = `
        Analiza esta imagen de un recibo. Extrae: monto total, nombre del comercio y fecha.
        Categorías disponibles:
        ${categoriesLabels}

        Hoy es ${new Date().toISOString().split('T')[0]}.

        Responde ÚNICAMENTE un JSON puro:
        {
          "amount": "string (solo números)",
          "description": "string (nombre del comercio)",
          "category_id": "string (ID de la categoría que mejor encaje)",
          "type": "expense",
          "date": "YYYY-MM-DD"
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
        console.error("Error OCR:", error);
        throw new Error("Error al analizar la imagen. Prueba con una foto más clara.");
    }
}