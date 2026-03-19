import { GoogleGenAI, Type } from "@google/genai";
import { SERVERS } from "../constants";
import { AIRecommendation } from "../types";

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI | null => {
  if (client) return client;
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    client = new GoogleGenAI({ apiKey });
    return client;
  }
  return null;
};

export const getSmartRoutingRecommendation = async (query: string): Promise<AIRecommendation | null> => {
  const ai = getClient();
  if (!ai) {
    console.warn("Gemini API key not found. Skipping smart routing.");
    return null;
  }

  // Construct context about available servers
  const serversContext = SERVERS.map(s => 
    `${s.id}: ${s.city}, ${s.country} (Tags: ${s.tags.join(', ')})`
  ).join('\n');

  const prompt = `
    You are an expert Network Optimization AI for HoloVPN.
    The user wants to connect to a VPN server. 
    Based on their request: "${query}", recommend the best server from the list below.
    
    Available Servers:
    ${serversContext}
    
    Consider latency (proximity), content restrictions (e.g., BBC needs UK, Anime needs Japan), and privacy laws.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            serverId: { type: Type.STRING, description: "The ID of the recommended server" },
            reason: { type: Type.STRING, description: "Short, technical explanation for the choice (max 15 words)" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-1" }
          },
          required: ["serverId", "reason", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AIRecommendation;
  } catch (error) {
    console.error("Gemini routing error:", error);
    return null;
  }
};

export const getSecurityBriefing = async (city: string, country: string): Promise<{ threatLevel: string; briefing: string } | null> => {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `
    Generate a short, cyberpunk-themed security status report for a VPN user connecting to ${city}, ${country}.
    
    Output requirements:
    1. "threatLevel": one of "LOW", "MODERATE", "CRITICAL".
    2. "briefing": A 1-2 sentence tech-noir style description of potential cyber risks in that region (e.g., surveillance nodes, corporate tracking, botnets).
    
    Keep it immersive and cool.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: { type: Type.STRING },
            briefing: { type: Type.STRING }
          },
          required: ["threatLevel", "briefing"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as { threatLevel: string; briefing: string };
  } catch (error) {
    console.error("Gemini security briefing error:", error);
    return null;
  }
};
