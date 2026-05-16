import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function predictDisasterRisk(location: string, type: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        As an emergency response AI, analyze the risk of a ${type} in ${location}.
        Provide a JSON response with the following structure:
        {
          "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "primarySafetyAdvice": "one clear sentence of advice",
          "escapePlan": "one clear sentence for immediate action",
          "suggestedResources": ["item1", "item2"]
        }
        Only return the JSON.
      `,
    });

    const text = response.text?.trim() || "{}";
    
    // Clean JSON from potential markdown blocks
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return {
      riskLevel: "MEDIUM",
      primarySafetyAdvice: "Stay alert and monitor local news.",
      escapePlan: "Locate the nearest high ground or exit as per standard protocol.",
      suggestedResources: ["Water", "First Aid Kit", "Flashlight"]
    };
  }
}
