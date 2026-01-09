
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TEXT_STUDIO = 'TEXT_STUDIO',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VOICE_STUDIO = 'VOICE_STUDIO',
  WELLNESS = 'WELLNESS',
  CHAT = 'CHAT',
  FORUM = 'FORUM',
  PROFILE = 'PROFILE'
}

export type PersonalityType = 'Architect' | 'Muse' | 'Guardian' | 'Sentinel';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  settings?: any;
  journalEntries?: JournalEntry[];
  createdAt: Date;
}

export interface ForumComment {
  id: string;
  authorName: string;
  text: string;
  date: Date;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'Creative' | 'Logic' | 'Support' | 'Prompt Share';
  date: Date;
  likes: number;
  comments: ForumComment[];
  aiSummary?: string;
}

export interface GenerationResult {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  timestamp: Date;
  prompt: string;
}

export interface VoiceConfig {
  voiceName: 'Kore' | 'Puck' | 'Tristan' | 'Fenrir' | 'Zephyr';
}

export interface JournalEntry {
  id: string;
  text: string;
  date: Date;
  mood?: string;
  aiFeedback?: string;
}
