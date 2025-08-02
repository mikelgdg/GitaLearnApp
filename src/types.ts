export interface Verse {
  capitulo: number;
  verso: number;
  sanskrit: string;
  transliteracion: string;
  traduccion: string;
  comentario?: string;
  audioUrl?: string; // URL for verse pronunciation
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

// --- PRIORITY 1: NEW STRUCTURE TYPES ---

export interface Section {
  id: string;
  title: string;
  description: string;
  chapters: number[];
  unlockRequirement: string;
  color: string;
  icon: string;
  status: 'locked' | 'unlocked' | 'completed';
  progress: number; // 0-100 percentage
}

export interface NewUnit {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  verses: string[]; // Array de verse IDs
  checkpointRequired: boolean;
  unlockRequirement: string;
  status: 'locked' | 'unlocked' | 'completed';
  completionPercentage: number; // 0-100
}

export interface CheckpointExam {
  unitId: string;
  questions: CheckpointQuestion[];
  passingScore: number; // 80%
  maxAttempts: number; // 3
  gemsReward: number; // 100
  unlockReward: string; // next unit ID
}

export interface CheckpointQuestion {
  type: 'multiple_choice' | 'audio' | 'fill_blank' | 'match_meaning';
  verseId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number; // 1-2 points each
}

export interface CheckpointResult {
  score: number; // 0-100
  passed: boolean;
  attemptsUsed: number;
  weakVerses: string[]; // verseIds that need review
}

// --- LESSON COMPLETION SCREEN ---

export interface LessonSummary {
  xpGained: number;
  gemsEarned: number;
  accuracy: number; // 0-100
  perfectAnswers: number;
  totalAnswers: number;
  streakDays: number;
  masteryStarsGained: number;
  achievementsUnlocked: Achievement[];
  motivationalMessage: string;
  nextLessonUnlocked?: string;
}

// --- GEMS SYSTEM ---

export interface GemEarning {
  lessonComplete: number; // 10
  perfectLesson: number; // 15
  firstTryPerfect: number; // 20
  unitComplete: number; // 50
  checkpointPass: number; // 100
  dailyStreak: number; // 5
  weeklyStreak: number; // 25
  achievementUnlock: number; // 15-100
  leaderboardRank: number; // 25
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  effect: string;
  category: 'hearts' | 'boosts' | 'cosmetics' | 'utils';
}

export interface GameState {
  xp: number;
  gems: number;
  hearts: number; // Max 5, starts at 5
  maxHearts: number; // Always 5
  streak: number;
  lastCompletedDate: string | null;
  heartsLastRefill: string | null;
  heartRefillTimeMinutes: number; // 30 minutes per heart
  lastHeartLoss: string | null; // When last heart was lost
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  avatarUrl: string;
  isCurrentUser?: boolean;
}

// --- Exercise Types ---

export enum ExerciseType {
  MULTIPLE_CHOICE_TRANSLATION = 'MULTIPLE_CHOICE_TRANSLATION',
  COMPLETE_THE_VERSE = 'COMPLETE_THE_VERSE',
  MATCH_THE_WORDS = 'MATCH_THE_WORDS',
  LISTEN_AND_SELECT = 'LISTEN_AND_SELECT', // Audio exercise
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

export interface ListenAndSelectExercise extends BaseExercise {
  type: ExerciseType.LISTEN_AND_SELECT;
  question: string; // Instructions like "Listen and select the correct translation"
  audioUrl: string; // URL to the verse audio
  options: MultipleChoiceOption[];
  correctOptionId: string;
}

// A union type for all possible exercises
export type Exercise = MultipleChoiceExercise | CompleteTheVerseExercise | ListenAndSelectExercise;

// --- MAPA VISUAL TYPES ---

export interface PathNode {
  id: string;
  type: 'lesson' | 'checkpoint' | 'section_header';
  position: {
    x: number;
    y: number;
  };
  data: LessonPathData | CheckpointPathData | SectionHeaderData;
  status: 'locked' | 'unlocked' | 'completed' | 'mastered';
  connections: string[]; // IDs of connected nodes
}

export interface LessonPathData {
  lessonId: string;
  unitId: string;
  sectionId: string;
  title: string;
  masteryLevel: number; // 0-5 stars
  isBonus?: boolean;
}

export interface CheckpointPathData {
  checkpointId: string;
  unitId: string;
  sectionId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gemsReward: number;
}

export interface SectionHeaderData {
  sectionId: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  progress: number; // 0-100
}

export interface LearningPathMap {
  nodes: PathNode[];
  currentNode: string; // ID of current/next lesson
  sections: Section[];
  totalProgress: number; // 0-100 overall progress
}

// --- ARJU MASCOT TYPES ---

export type ArjuMood = 
  | 'neutral'     // Estado base, escuchando
  | 'happy'       // Respuesta correcta, celebración  
  | 'encouraging' // Animando después de error
  | 'wise'        // Explicando conceptos profundos
  | 'meditative'  // Momentos de reflexión
  | 'excited'     // Nuevo logro desbloqueado
  | 'compassionate' // Consolando tras dificultades
  | 'determined'  // Preparando para desafíos
  | 'enlightened'; // Momentos de realización espiritual

export interface ArjuState {
  mood: ArjuMood;
  message?: string;
  animation?: 'bounce' | 'glow' | 'float' | 'pulse';
}
