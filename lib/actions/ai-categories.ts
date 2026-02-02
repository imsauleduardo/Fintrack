"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateCategoryDescription(name: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Genera un objeto JSON con dos campos:
    1. "description": Una descripción corta (máximo 120 caracteres) para una categoría financiera llamada "${name}".
    2. "icon": Un solo emoji que represente mejor esta categoría.
    
    Ejemplo para 'Viajes': { "description": "Vuelos, hospedaje y turismo.", "icon": "✈️" }
    
    Responde ÚNICAMENTE el JSON.`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text) as { description: string, icon: string };
    } catch (e) {
        console.error("Error generating AI category content:", e);
        return { description: "Descripción no disponible.", icon: "🏷️" };
    }
}
