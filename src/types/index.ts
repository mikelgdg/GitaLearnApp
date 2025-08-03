// Tipos principales para la aplicación del Bhagavad Gītā

export interface Verse {
  capitulo: number;
  verso: number;
  sanskrit: string;
  transliteracion: string;
  traduccion: string;
  comentario: string;
}

export interface StudyProgress {
  verseId: string; // formato: "capitulo-verso" ej: "2-20"
  difficulty: 'again' | 'hard' | 'good' | 'easy';
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  interval: number; // días hasta la próxima revisión
  easeFactor: number; // factor de facilidad para el algoritmo SM-2
}

export interface StudySession {
  id: string;
  date: Date;
  versesStudied: string[];
  correctAnswers: number;
  totalQuestions: number;
  duration: number; // en minutos
}

export interface UserStats {
  totalVersesMemorized: number;
  totalStudyTime: number; // en minutos
  streakDays: number;
  lastStudyDate: Date;
  favoriteChapters: number[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate?: Date;
  isUnlocked: boolean;
}

// --- STREAK SYSTEM TYPES ---
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  perfectStreak: number; // Días consecutivos sin usar freeze/repair
  lastLessonDate: string; // ISO date string
  streakFreezeUsed: boolean; // Si usó freeze hoy
  streakFreezeExpiry: string | null; // Cuándo expira el freeze
  streakSocietyMilestones: number[]; // [7, 30, 100, 365] alcanzados
  totalDaysLearned: number; // Total días que hizo al menos 1 lección
  weeklyStreakGoal: number; // Meta semanal (default 7)
  monthlyStreakGoal: number; // Meta mensual (default 30)
}

export interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  reward: {
    xp: number;
    gems: number;
    title?: string; // "Streak Society Member" etc.
  };
}

export interface Chapter {
  number: number;
  title: string;
  versesCount: number;
  description: string;
}

export interface StudyMode {
  id: 'srs' | 'browse' | 'recitation' | 'meditation';
  title: string;
  description: string;
  icon: string;
}

export interface FlashCard {
  verse: Verse;
  showTranslation: boolean;
  showSanskrit: boolean;
  showTransliteration: boolean;
  showCommentary: boolean;
}

export interface AppSettings {
  language: 'es' | 'en';
  theme: 'light' | 'dark';
  dailyGoal: number; // versos por día
  notificationsEnabled: boolean;
  reminderTime: string; // formato "HH:MM"
  audioEnabled: boolean;
  studyMode: 'translation' | 'sanskrit' | 'both';
}

// 🎯 Quest System Types (Duolingo-style)
export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  gemReward: number;
  frequency: 'daily' | 'weekly';
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  icon: string; // Ionicons name
  color: string; // Duolingo color
}

export type QuestType = 
  | 'complete_lessons'     // Completar X lecciones
  | 'earn_xp'             // Ganar X XP
  | 'maintain_streak'     // Mantener racha X días
  | 'perfect_lessons'     // Completar X lecciones perfectas
  | 'study_minutes'       // Estudiar X minutos
  | 'complete_unit'       // Completar una unidad completa
  | 'early_bird'          // Estudiar antes de las 10 AM
  | 'night_owl'           // Estudiar después de las 8 PM
  | 'weekend_warrior';    // Estudiar en fin de semana

export interface QuestProgress {
  questId: string;
  progress: number;
  lastUpdated: Date;
}

export interface DailyQuestSet {
  date: string; // YYYY-MM-DD
  quests: Quest[];
  allCompleted: boolean;
  bonusXpEarned: number;
}

export interface WeeklyQuestSet {
  weekStart: string; // YYYY-MM-DD (Monday)
  quests: Quest[];
  allCompleted: boolean;
  bonusXpEarned: number;
}

// Tipos para navegación
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Chapters: undefined;
  ChapterDetail: { chapterNumber: number };
  VerseDetail: { verse: Verse };
  Study: { mode: StudyMode['id'] };
  Progress: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Chapters: undefined;
  Study: { mode: StudyMode['id'] };
  Progress: undefined;
  Settings: undefined;
};

// --- LEAGUE SYSTEM TYPES (DUOLINGO IDENTICAL) ---
export enum League {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  SAPPHIRE = 'SAPPHIRE',
  RUBY = 'RUBY',
  EMERALD = 'EMERALD',
  OBSIDIAN = 'OBSIDIAN',
}

export interface LeagueData {
  league: League;
  weeklyXP: number;
  rank: number;
  totalParticipants: number;
  isPromoted: boolean;
  isRelegated: boolean;
  weekStartDate: Date;
  weekEndDate: Date;
  hasCompetedThisWeek: boolean;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl: string;
  weeklyXP: number;
  rank: number;
  isCurrentUser: boolean;
  league: League;
  isPromoted?: boolean;
  isRelegated?: boolean;
  xp?: number; // For backward compatibility
}

export interface WeeklyCompetition {
  id: string;
  startDate: Date;
  endDate: Date;
  league: League;
  participants: LeaderboardEntry[];
  isActive: boolean;
  promotionSlots: number;
  relegationSlots: number;
}
