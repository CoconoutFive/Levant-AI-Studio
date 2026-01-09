
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialization helper - always creates a fresh instance to ensure correct key usage
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates text content using Gemini 3 Flash
   */
  async generateText(prompt: string, systemInstruction: string = "You are a creative assistant.") {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  },

  /**
   * Generates an image using Gemini 2.5 Flash Image
   */
  async generateImage(prompt: string, aspectRatio: "1:1" | "4:3" | "16:9" = "1:1") {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: { aspectRatio },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  },

  /**
   * Generates audio from text using Gemini 2.5 Flash TTS
   */
  async generateSpeech(text: string, voiceName: string = 'Kore') {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return base64Audio;
  },

  /**
   * Analyzes a journal entry to provide supportive feedback and mood detection
   */
  async analyzeJournalEntry(entryText: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: entryText,
      config: {
        systemInstruction: `You are an empathetic wellness coach. Analyze the user's journal entry. 
        Provide a JSON response with two fields: 
        1. "mood": a single word representing the primary emotion.
        2. "feedback": a short, 1-2 sentence supportive insight.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ['mood', 'feedback']
        }
      }
    });
    
    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return { mood: 'Reflective', feedback: 'Thank you for sharing your thoughts.' };
    }
  }
};
