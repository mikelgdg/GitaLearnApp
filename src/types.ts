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
  dailyReminder: boolean;
  theme: 'light' | 'dark';
}

// --- Duolingo-style Gamification Types ---

export interface Lesson {
  id: string; // e.g., "1-1" for Chapter 1, Lesson 1
  chapterNumber: number;
  lessonNumber: number;
  title: string;
  verses: Verse[];
  totalVerses: number;
  status: 'locked' | 'unlocked' | 'completed';
  masteryLevel: number; // 0-5 stars
}

export interface Unit {
  chapterNumber: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface LearningPath {
  units: Unit[];
  lastUnlockedLesson: {
    chapterNumber: number;
    lessonNumber: number;
  };
}

export interface GameState {
  xp: number;
  hearts: number;
  gems: number;
  streak: number;
  lastSessionDate: string | null; // ISO string
  streakFreezeActive: boolean;
}

// --- Exercise Types ---

export enum ExerciseType {
  MULTIPLE_CHOICE_TRANSLATION = 'MULTIPLE_CHOICE_TRANSLATION',
  COMPLETE_THE_VERSE = 'COMPLETE_THE_VERSE',
  MATCH_THE_WORDS = 'MATCH_THE_WORDS',
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface BaseExercise {
  verse: Verse;
  isCorrect: boolean | null; // null when not answered yet
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: ExerciseType.MULTIPLE_CHOICE_TRANSLATION;
  question: string; // e.g., "What is the meaning of this verse?"
  options: MultipleChoiceOption[];
  correctOptionId: string;
}

export interface CompleteTheVerseExercise extends BaseExercise {
  type: ExerciseType.COMPLETE_THE_VERSE;
  question: string; // The verse with a blank
  answer: string; // The word that fills the blank
}

// A union type for all possible exercises
export type Exercise = MultipleChoiceExercise | CompleteTheVerseExercise;
