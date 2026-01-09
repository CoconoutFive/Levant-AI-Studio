
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TEXT_STUDIO = 'TEXT_STUDIO',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VOICE_STUDIO = 'VOICE_STUDIO',
  WELLNESS = 'WELLNESS'
}

export interface GenerationResult {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  timestamp: Date;
  prompt: string;
}

export interface VoiceConfig {
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

export interface JournalEntry {
  id: string;
  text: string;
  date: Date;
  mood?: string;
  aiFeedback?: string;
}
