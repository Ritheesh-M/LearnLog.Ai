export interface Entry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  mood: string;
  summary: string;
  quality: number;
  coords: { x: number; y: number };
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "🥉 Bronze" | "🥈 Silver" | "🥇 Gold";
  unlocked: boolean;
}

export interface Stats {
  totalEntries: number;
  currentStreak: number;
  searchCount: number;
  badgesUnlocked: number;
  totalBadges: number;
  categoryCounts: Record<string, number>;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  sourceTitle: string;
  sourceId: string;
}

export interface KnowledgeGap {
  topic: string;
  reason: string;
  suggestion: string;
}

export interface Recommendation {
  topic: string;
  why: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface Briefing {
  title: string;
  statusReport: string;
  breakthroughs: string[];
  gapsInChart: string;
  commanderNotes: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  createdAt: string;
}
