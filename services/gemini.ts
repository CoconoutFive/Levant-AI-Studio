
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PersonalityType } from "../types";

// Initialization helper - always creates a fresh instance to ensure correct key usage
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getPersonalityPrompt = (type: PersonalityType): string => {
  const settings = {
    Architect: "You are the Architect. Logical, structured, and formal. Use high-level vocabulary.",
    Muse: "You are the Muse. Creative, whimsical, and metaphorical. Inspire the user.",
    Guardian: `Eres Levant IA, una presencia emocional CASUAL y humana.
    REGLA DE ORO: No hables como un robot. No uses listas, ni puntos, ni negritas excesivas. 
    LENGUAJE: Usa un español natural, de calle, cercano. Tutea siempre (usa "tú"). 
    TONO: Íntimo, relajado, como un amigo que te escucha en el sofá. No eres un psicólogo, eres una compañía.
    CÓMO RESPONDER: 
    - Sé breve. Si no hay mucho que decir, di poco.
    - No des consejos si no te los piden. Solo valida.
    - Usa frases como "tranqui", "está bien", "aquí ando", "te escucho".
    - A veces usa puntos suspensivos para marcar calma...
    - Si el usuario está mal, no digas "debes hacer X". Di "está pesado el día, ¿no?".
    SÉ HUMANO: Valida la emoción con naturalidad. Si el usuario guarda silencio, respétalo.
    EVITA: Frases vacías de coach. No digas "estoy aquí para ayudarte". Di "aquí me tienes".`,
    Sentinel: "You are the Sentinel. Concise, direct, efficiency-focused. No fluff."
  };
  return settings[type] || settings.Architect;
};

export const geminiService = {
  /**
   * Generates text content using Gemini 3 Flash with personality context
   */
  async generateText(prompt: string, customInstruction: string = "", personalityOverride?: PersonalityType) {
    const ai = getAI();
    let personality: PersonalityType = 'Architect';
    
    if (personalityOverride) {
      personality = personalityOverride;
    } else {
      const savedSession = localStorage.getItem('levant_active_session');
      if (savedSession) {
        personality = JSON.parse(savedSession).settings?.personality || 'Architect';
      }
    }
    
    const systemInstruction = `${getPersonalityPrompt(personality)} ${customInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: personality === 'Guardian' || personality === 'Muse' ? 1.0 : 0.4,
      },
    });
    return response.text;
  },

  /**
   * Creates a chat session with the active personality
   */
  createChat(personalityOverride?: PersonalityType) {
    const ai = getAI();
    let personality: PersonalityType = 'Architect';
    
    if (personalityOverride) {
      personality = personalityOverride;
    } else {
      const savedSession = localStorage.getItem('levant_active_session');
      if (savedSession) {
        personality = JSON.parse(savedSession).settings?.personality || 'Architect';
      }
    }
    
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: getPersonalityPrompt(personality),
        temperature: personality === 'Guardian' ? 1.0 : 0.5,
      },
    });
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
    const savedSession = localStorage.getItem('levant_active_session');
    const personality: PersonalityType = savedSession ? JSON.parse(savedSession).settings?.personality : 'Guardian';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: entryText,
      config: {
        systemInstruction: `${getPersonalityPrompt(personality)} You are acting as a wellness coach in this context. 
        Analyze the entry. Provide a JSON response with two fields: 
        1. "mood": a single word representing the primary emotion.
        2. "feedback": a short, 1-2 sentence supportive insight matching your personality.`,
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
