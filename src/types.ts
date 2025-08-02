export interface Verse {
  capitulo: number;
  verso: number;
  sanskrit: string;
  transliteracion: string;
  traduccion: string;
  comentario?: string;
}

export interface StudyProgress {
  verseId: string;
  difficulty: 'again' | 'hard' | 'good' | 'easy';
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  interval: number; // in days
  easeFactor: number;
}

export interface StudySession {
  id: string;
  date: Date;
  duration: number; // in seconds
  versesReviewed: number;
  correctAnswers: number;
}

export interface UserStats {
  totalVersesMemorized: number;
  totalStudyTime: number; // in seconds
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
  isUnlocked: boolean;
  unlockedDate?: Date;
}

export interface Chapter {
  number: number;
  title: string;
  versesCount: number;
  description: string;
}

export interface AppSettings {
  versesPerSession: 10 | 20 | 30;
  dailyReminder: boolean;
  theme: 'light' | 'dark';
}
