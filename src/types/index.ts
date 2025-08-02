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
