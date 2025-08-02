import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Verse, 
  StudyProgress, 
  StudySession, 
  UserStats, 
  Achievement, 
  Chapter, 
  AppSettings, 
  LearningPath, 
  Lesson, 
  GameState, 
  Unit, 
  LeaderboardEntry,
  Exercise,
  ExerciseType,
  MultipleChoiceExercise,
  ListenAndSelectExercise,
  MultipleChoiceOption,
  Section,
  NewUnit,
  LessonSummary
} from '../types';
import versesData from '../../assets/data/verses.json';
import { SECTIONS, FOUNDATION_UNITS, ACTION_UNITS } from '../constants/sections';
import { GemEarningService } from './GemEarningService';

// Constantes para almacenamiento local
const STORAGE_KEYS = {
  STUDY_PROGRESS: 'study_progress',
  USER_STATS: 'user_stats',
  STUDY_SESSIONS: 'study_sessions',
  ACHIEVEMENTS: 'achievements',
  SETTINGS: 'app_settings',
  FAVORITE_VERSES: 'favorite_verses',
  GAME_STATE: 'game_state',
  SECTIONS_PROGRESS: 'sections_progress',
  UNITS_PROGRESS: 'units_progress',
  CHECKPOINT_RESULTS: 'checkpoint_results',
};

class GitaDataService {
  private readonly verses: Verse[] = versesData as Verse[];
  
  // ==================== VERSES ====================
  
  /**
   * Obtiene todos los versos
   */
  getAllVerses(): Verse[] {
    return this.verses;
  }
  
  /**
   * Obtiene versos de un capítulo específico
   */
  async getVersesByChapter(chapterNumber: number): Promise<Verse[]> {
    return this.verses.filter(verse => verse.capitulo === chapterNumber);
  }
  
  /**
   * Obtiene un verso específico
   */
  getVerse(chapterNumber: number, verseNumber: number): Verse | undefined {
    return this.verses.find(
      verse => verse.capitulo === chapterNumber && verse.verso === verseNumber
    );
  }
  
  /**
   * Obtiene un verso aleatorio
   */
  getRandomVerse(): Verse {
    const randomIndex = Math.floor(Math.random() * this.verses.length);
    return this.verses[randomIndex];
  }
  
  /**
   * Obtiene los números de capítulos únicos
   */
  getChapterNumbers(): number[] {
    const chapters = [...new Set(this.verses.map(verse => verse.capitulo))];
    return chapters.sort((a, b) => a - b);
  }
  
  /**
   * Genera ID único para un verso
   */
  getVerseId(verse: Verse): string {
    return `${verse.capitulo}-${verse.verso}`;
  }

  async getLesson(chapterNumber: number, lessonId: string): Promise<Lesson | null> {
    const learningPath = await this.getLearningPath();
    const unit = learningPath.units.find((u: Unit) => u.chapterNumber === chapterNumber);
    if (!unit) {
      console.error(`Unit with chapter number ${chapterNumber} not found.`);
      return null;
    }
    const lesson = unit.lessons.find((l: Lesson) => l.id === lessonId);
    if (!lesson) {
      console.error(`Lesson with id ${lessonId} in chapter ${chapterNumber} not found.`);
      return null;
    }
    return lesson;
  }

  /**
   * Takes a verse and returns a version of its text with some words replaced by blanks.
   * @param verse The verse to process.
   * @param difficulty A number between 0.2 (easier) and 0.8 (harder) to control how many words are hidden.
   * @returns The verse text with hidden words.
   */
  getVerseWithHiddenWords(verse: Verse, difficulty: number = 0.4): string {
    const text = verse.transliteracion || verse.sanskrit;
    const words = text.split(' ');
    if (words.length < 3) {
      return text; // Not enough words to hide anything meaningful
    }

    const wordsToHideCount = Math.floor(words.length * difficulty);
    const hiddenIndices = new Set<number>();

    while (hiddenIndices.size < wordsToHideCount) {
      const randomIndex = Math.floor(Math.random() * words.length);
      hiddenIndices.add(randomIndex);
    }

    return words
      .map((word, index) => (hiddenIndices.has(index) ? '______' : word))
      .join(' ');
  }

  // ==================== FAVORITES ====================

  async getFavoriteVerseIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_VERSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorite verse IDs:', error);
      return [];
    }
  }

  async getFavoriteVerses(): Promise<Verse[]> {
    const favoriteIds = await this.getFavoriteVerseIds();
    return this.verses.filter(verse => favoriteIds.includes(this.getVerseId(verse)));
  }

  async addVerseToFavorites(verseId: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteVerseIds();
      if (!favorites.includes(verseId)) {
        const updatedFavorites = [...favorites, verseId];
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_VERSES, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error adding verse to favorites:', error);
    }
  }

  async removeVerseFromFavorites(verseId: string): Promise<void> {
    try {
      let favorites = await this.getFavoriteVerseIds();
      if (favorites.includes(verseId)) {
        favorites = favorites.filter(id => id !== verseId);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_VERSES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error removing verse from favorites:', error);
    }
  }

  async isVerseFavorite(verseId: string): Promise<boolean> {
    const favorites = await this.getFavoriteVerseIds();
    return favorites.includes(verseId);
  }
  
  // ==================== STUDY PROGRESS ====================
  
  /**
   * Obtiene el progreso de estudio de todos los versos
   */
  async getStudyProgress(): Promise<StudyProgress[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_PROGRESS);
      if (data) {
        const progress = JSON.parse(data);
        // Convertir strings de fecha de vuelta a Date objects
        return progress.map((p: any) => ({
          ...p,
          lastReviewed: new Date(p.lastReviewed),
          nextReview: new Date(p.nextReview),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting study progress:', error);
      return [];
    }
  }
  
  /**
   * Guarda el progreso de estudio de un verso
   */
  async saveVerseProgress(verse: Verse, difficulty: StudyProgress['difficulty']): Promise<void> {
    try {
      const verseId = this.getVerseId(verse);
      const currentProgress = await this.getStudyProgress();
      const existingProgress = currentProgress.find(p => p.verseId === verseId);
      
      let newProgress: StudyProgress;
      
      if (existingProgress) {
        // Actualizar progreso existente usando algoritmo SM-2
        newProgress = this.calculateNextReview(existingProgress, difficulty);
      } else {
        // Crear nuevo progreso
        newProgress = {
          verseId,
          difficulty,
          lastReviewed: new Date(),
          nextReview: this.calculateInitialNextReview(difficulty),
          reviewCount: 1,
          interval: this.getInitialInterval(difficulty),
          easeFactor: 2.5,
        };
      }
      
      // Actualizar la lista de progreso
      const updatedProgress = currentProgress.filter(p => p.verseId !== verseId);
      updatedProgress.push(newProgress);
      
      await AsyncStorage.setItem(STORAGE_KEYS.STUDY_PROGRESS, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error saving verse progress:', error);
    }
  }
  
  /**
   * Implementación del algoritmo SM-2 para repetición espaciada
   */
  private calculateNextReview(progress: StudyProgress, difficulty: StudyProgress['difficulty']): StudyProgress {
    let newEaseFactor = progress.easeFactor;
    let newInterval = progress.interval;
    
    switch (difficulty) {
      case 'again':
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
        newInterval = 1;
        break;
      case 'hard':
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
        newInterval = Math.max(1, Math.round(newInterval * 1.2));
        break;
      case 'good':
        newInterval = Math.round(newInterval * newEaseFactor);
        break;
      case 'easy':
        newEaseFactor = newEaseFactor + 0.15;
        newInterval = Math.round(newInterval * newEaseFactor * 1.3);
        break;
    }
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    
    return {
      ...progress,
      difficulty,
      lastReviewed: new Date(),
      nextReview,
      reviewCount: progress.reviewCount + 1,
      interval: newInterval,
      easeFactor: newEaseFactor,
    };
  }
  
  private calculateInitialNextReview(difficulty: StudyProgress['difficulty']): Date {
    const nextReview = new Date();
    const days = this.getInitialInterval(difficulty);
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview;
  }
  
  private getInitialInterval(difficulty: StudyProgress['difficulty']): number {
    switch (difficulty) {
      case 'again': return 1;
      case 'hard': return 2;
      case 'good': return 4;
      case 'easy': return 7;
      default: return 4;
    }
  }
  
  /**
   * Obtiene versos pendientes de revisión
   */
  async getVersesForReview(): Promise<Verse[]> {
    try {
      const progress = await this.getStudyProgress();
      const now = new Date();
      
      const versesForReview = progress
        .filter(p => p.nextReview <= now)
        .map(p => {
          const [chapter, verse] = p.verseId.split('-').map(Number);
          return this.getVerse(chapter, verse);
        })
        .filter(verse => verse !== undefined) as Verse[];
      
      return versesForReview;
    } catch (error) {
      console.error('Error getting verses for review:', error);
      return [];
    }
  }
  
  /**
   * Obtiene el verso del día (basado en SRS o aleatorio)
   */
  async getVerseOfTheDay(): Promise<Verse> {
    const versesForReview = await this.getVersesForReview();
    
    if (versesForReview.length > 0) {
      // Si hay versos para revisar, devolver uno aleatorio de esos
      const randomIndex = Math.floor(Math.random() * versesForReview.length);
      return versesForReview[randomIndex];
    } else {
      // Si no hay versos para revisar, devolver uno aleatorio
      return this.getRandomVerse();
    }
  }
  
  // ==================== USER STATS ====================
  
  /**
   * Obtiene las estadísticas del usuario
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (data) {
        const stats = JSON.parse(data);
        return {
          ...stats,
          lastStudyDate: new Date(stats.lastStudyDate),
        };
      }
      
      // Estadísticas por defecto
      return {
        totalVersesMemorized: 0,
        totalStudyTime: 0,
        streakDays: 0,
        lastStudyDate: new Date(),
        favoriteChapters: [],
        achievements: [],
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalVersesMemorized: 0,
        totalStudyTime: 0,
        streakDays: 0,
        lastStudyDate: new Date(),
        favoriteChapters: [],
        achievements: [],
      };
    }
  }
  
  /**
   * Actualiza las estadísticas del usuario
   */
  async updateUserStats(updates: Partial<UserStats>): Promise<void> {
    try {
      const currentStats = await this.getUserStats();
      const updatedStats = { ...currentStats, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }
  
  /**
   * Registra una sesión de estudio
   */
  async recordStudySession(session: Omit<StudySession, 'id'>): Promise<void> {
    try {
      const sessionWithId: StudySession = {
        ...session,
        id: Date.now().toString(),
      };
      
      const sessions = await this.getStudySessions();
      sessions.push(sessionWithId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
      
      // Actualizar estadísticas del usuario
      const stats = await this.getUserStats();
      await this.updateUserStats({
        totalStudyTime: stats.totalStudyTime + session.duration,
        lastStudyDate: session.date,
        // Calcular racha de días (simplificado)
        streakDays: this.calculateStreak(stats.lastStudyDate, session.date, stats.streakDays),
      });
    } catch (error) {
      console.error('Error recording study session:', error);
    }
  }
  
  private calculateStreak(lastDate: Date, currentDate: Date, currentStreak: number): number {
    const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      return currentStreak + 1;
    } else if (dayDiff === 0) {
      return currentStreak;
    } else {
      return 1; // Reiniciar racha
    }
  }
  
  /**
   * Obtiene las sesiones de estudio
   */
  async getStudySessions(): Promise<StudySession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      if (data) {
        const sessions = JSON.parse(data);
        return sessions.map((s: any) => ({
          ...s,
          date: new Date(s.date),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting study sessions:', error);
      return [];
    }
  }
  
  // ==================== ACHIEVEMENTS ====================
  
  /**
   * Verifica y desbloquea logros
   */
  async checkAndUnlockAchievements(): Promise<Achievement[]> {
    try {
      const stats = await this.getUserStats();
      const progress = await this.getStudyProgress();
      const unlockedAchievements: Achievement[] = [];
      
      // Definir logros posibles
      const possibleAchievements: Achievement[] = [
        {
          id: 'first_verse',
          title: 'Primer Verso',
          description: 'Memoriza tu primer verso del Gītā',
          icon: '📖',
          isUnlocked: progress.length >= 1,
        },
        {
          id: 'chapter_two_master',
          title: 'Maestro del Capítulo 2',
          description: 'Memoriza 10 versos del Capítulo 2',
          icon: '🏆',
          isUnlocked: progress.filter(p => p.verseId.startsWith('2-')).length >= 10,
        },
        {
          id: 'week_streak',
          title: 'Semana Sagrada',
          description: 'Estudia durante 7 días consecutivos',
          icon: '🔥',
          isUnlocked: stats.streakDays >= 7,
        },
        {
          id: 'fifty_verses',
          title: 'Medio Centenar',
          description: 'Memoriza 50 versos',
          icon: '⭐',
          isUnlocked: progress.length >= 50,
        },
      ];
      
      // Verificar cuáles están desbloqueados pero no registrados
      for (const achievement of possibleAchievements) {
        if (achievement.isUnlocked && !stats.achievements.some(a => a.id === achievement.id)) {
          const unlockedAchievement = {
            ...achievement,
            unlockedDate: new Date(),
          };
          unlockedAchievements.push(unlockedAchievement);
        }
      }
      
      // Actualizar estadísticas con nuevos logros
      if (unlockedAchievements.length > 0) {
        await this.updateUserStats({
          achievements: [...stats.achievements, ...unlockedAchievements],
        });
      }
      
      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // ==================== CHAPTER METHODS ====================
  
  /**
   * Obtiene información de un capítulo específico
   */
  async getChapter(chapterNumber: number): Promise<Chapter> {
    // Por ahora retornamos datos de ejemplo
    const chapters = [
      { number: 1, title: 'Arjuna Visada Yoga', versesCount: 47, description: 'El lamento de Arjuna ante la perspectiva de la batalla' },
      { number: 2, title: 'Sankhya Yoga', versesCount: 72, description: 'El conocimiento trascendental y la naturaleza del alma' },
      { number: 3, title: 'Karma Yoga', versesCount: 43, description: 'El yoga de la acción desinteresada' },
      { number: 4, title: 'Jnana Karma Sannyasa Yoga', versesCount: 42, description: 'El conocimiento trascendental y la renuncia' },
      { number: 5, title: 'Karma Sannyasa Yoga', versesCount: 29, description: 'El yoga de la renuncia a la acción' },
      { number: 6, title: 'Dhyana Yoga', versesCount: 47, description: 'El yoga de la meditación' },
      { number: 7, title: 'Jnana Vijnana Yoga', versesCount: 30, description: 'El conocimiento del Absoluto' },
      { number: 8, title: 'Aksara Brahma Yoga', versesCount: 28, description: 'El Brahman imperecedero' },
      { number: 9, title: 'Raja Vidya Raja Guhya Yoga', versesCount: 34, description: 'El conocimiento real más confidencial' },
      { number: 10, title: 'Vibhuti Yoga', versesCount: 42, description: 'Las opulencias del Absoluto' },
      { number: 11, title: 'Visvarupa Darshana Yoga', versesCount: 55, description: 'La forma universal' },
      { number: 12, title: 'Bhakti Yoga', versesCount: 20, description: 'El yoga de la devoción' },
      { number: 13, title: 'Ksetra Ksetrajna Vibhaga Yoga', versesCount: 35, description: 'La naturaleza, el disfrutador y la conciencia' },
      { number: 14, title: 'Gunatraya Vibhaga Yoga', versesCount: 27, description: 'Las tres modalidades de la naturaleza material' },
      { number: 15, title: 'Purusottama Yoga', versesCount: 20, description: 'El yoga de la Persona Suprema' },
      { number: 16, 'title': 'Daivasura Sampad Vibhaga Yoga', versesCount: 24, description: 'Naturalezas divinas y demoníacas' },
      { number: 17, 'title': 'Sraddhatraya Vibhaga Yoga', versesCount: 28, description: 'Las divisiones de la fe' },
      { number: 18, 'title': 'Moksa Sannyasa Yoga', versesCount: 78, description: 'La perfección de la renuncia' },
    ];
    
    const chapter = chapters.find(c => c.number === chapterNumber);
    return chapter || { number: chapterNumber, title: 'Desconocido', versesCount: 0, description: '' };
  }

  async getAllChapters(): Promise<Chapter[]> {
    // Esta información podría venir de un archivo JSON separado en el futuro
    return [
      { number: 1, title: 'Arjuna Visada Yoga', versesCount: 47, description: 'El lamento de Arjuna' },
      { number: 2, title: 'Sankhya Yoga', versesCount: 72, description: 'Conocimiento trascendental' },
      { number: 3, title: 'Karma Yoga', versesCount: 43, description: 'El yoga de la acción' },
      { number: 4, title: 'Jnana Karma Sannyasa Yoga', versesCount: 42, description: 'Conocimiento y renuncia' },
      { number: 5, title: 'Karma Sannyasa Yoga', versesCount: 29, description: 'Renuncia a la acción' },
      { number: 6, title: 'Dhyana Yoga', versesCount: 47, description: 'El yoga de la meditación' },
      { number: 7, title: 'Jnana Vijnana Yoga', versesCount: 30, description: 'Conocimiento del Absoluto' },
      { number: 8, title: 'Aksara Brahma Yoga', versesCount: 28, description: 'El Brahman imperecedero' },
      { number: 9, title: 'Raja Vidya Raja Guhya Yoga', versesCount: 34, description: 'El conocimiento más confidencial' },
      { number: 10, title: 'Vibhuti Yoga', versesCount: 42, description: 'Las opulencias del Absoluto' },
      { number: 11, title: 'Visvarupa Darshana Yoga', versesCount: 55, description: 'La forma universal' },
      { number: 12, title: 'Bhakti Yoga', versesCount: 20, description: 'El yoga de la devoción' },
      { number: 13, title: 'Ksetra Ksetrajna Vibhaga Yoga', versesCount: 35, description: 'Naturaleza y conciencia' },
      { number: 14, title: 'Gunatraya Vibhaga Yoga', versesCount: 27, description: 'Las tres modalidades' },
      { number: 15, title: 'Purusottama Yoga', versesCount: 20, description: 'El yoga de la Persona Suprema' },
      { number: 16, 'title': 'Daivasura Sampad Vibhaga Yoga', versesCount: 24, description: 'Naturalezas divinas y demoníacas' },
      { number: 17, 'title': 'Sraddhatraya Vibhaga Yoga', versesCount: 28, description: 'Las divisiones de la fe' },
      { number: 18, 'title': 'Moksa Sannyasa Yoga', versesCount: 78, description: 'La perfección de la renuncia' },
    ];
  }

  // ==================== LEARNING PATH (DUOLINGO STYLE) ====================

  async getLearningPath(): Promise<LearningPath> {
    const chapters = await this.getAllChapters();
    const progress = await this.getStudyProgress();
    const versesPerLesson = 5; // Configurable

    let lastUnlockedLesson = { chapterNumber: 1, lessonNumber: 1 };
    let previousLessonCompleted = true;

    const units = chapters.map(chapter => {
      const lessons: Lesson[] = [];
      for (let i = 0; i < chapter.versesCount; i += versesPerLesson) {
        const lessonNumber = Math.floor(i / versesPerLesson) + 1;
        const lessonVerses = this.verses.filter(v => v.capitulo === chapter.number && v.verso > i && v.verso <= i + versesPerLesson);
        
        const completedVersesInLesson = lessonVerses.filter(v => 
          progress.some(p => p.verseId === this.getVerseId(v) && p.reviewCount > 0)
        ).length;

        const isCompleted = completedVersesInLesson === lessonVerses.length;
        const masteryLevel = isCompleted ? Math.min(5, Math.floor(completedVersesInLesson / lessonVerses.length * 5)) : 0;

        let status: 'locked' | 'unlocked' | 'completed' = 'locked';
        if (previousLessonCompleted) {
          status = 'unlocked';
          lastUnlockedLesson = { chapterNumber: chapter.number, lessonNumber };
        }
        if (isCompleted) {
          status = 'completed';
        }
        
        previousLessonCompleted = isCompleted;

        lessons.push({
          id: `${chapter.number}-${lessonNumber}`,
          chapterNumber: chapter.number,
          lessonNumber,
          title: `Lección ${lessonNumber}`,
          verses: lessonVerses,
          totalVerses: lessonVerses.length,
          status,
          masteryLevel,
        });
      }
      return {
        chapterNumber: chapter.number,
        title: chapter.title,
        description: chapter.description,
        lessons,
      };
    });

    return {
      units,
      lastUnlockedLesson,
    };
  }

  // ==================== GAME STATE ====================

  async getGameState(): Promise<GameState> {
    const defaultState: GameState = {
      xp: 0,
      hearts: 5,
      gems: 100,
      streak: 0,
      lastSessionDate: null,
      streakFreezeActive: false,
      heartsLastRefill: new Date().toISOString(),
    };
    try {
      const data = await AsyncStorage.getItem('game_state');
      const savedState = data ? JSON.parse(data) : {};
      
      let state: GameState = { ...defaultState, ...savedState };

      // Heart refill logic
      if (state.hearts < 5) {
        const now = new Date();
        const lastRefill = new Date(state.heartsLastRefill || now);
        const diffHours = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);
        
        const heartsToRefill = Math.floor(diffHours / 4); // 1 heart every 4 hours

        if (heartsToRefill > 0) {
          const newHearts = Math.min(5, state.hearts + heartsToRefill);
          state.hearts = newHearts;
          if (newHearts === 5) {
            state.heartsLastRefill = now.toISOString();
          } else {
            // Adjust last refill time to account for the partial hour
            const newRefillTime = new Date(lastRefill.getTime() + heartsToRefill * 4 * 60 * 60 * 1000);
            state.heartsLastRefill = newRefillTime.toISOString();
          }
          await this.saveGameState(state);
        }
      }

      return state;
    } catch (error) {
      console.error('Error getting game state:', error);
      return defaultState;
    }
  }

  async saveGameState(newState: Partial<GameState>): Promise<void> {
    try {
      const currentState = await this.getGameState();
      
      // If hearts are being reduced and were previously full, start the refill timer
      if (newState.hearts && newState.hearts < currentState.hearts && currentState.hearts === 5) {
        newState.heartsLastRefill = new Date().toISOString();
      }

      const updatedState = { ...currentState, ...newState };
      await AsyncStorage.setItem('game_state', JSON.stringify(updatedState));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }
  
  getLeaderboardData(): LeaderboardEntry[] {
    // Simulación de datos de leaderboard
    const users: LeaderboardEntry[] = [
      { id: 'user-1', username: 'KrishnaFan', xp: 4500, avatarUrl: 'https://i.pravatar.cc/150?u=user-1' },
      { id: 'user-2', username: 'ArjunaDevotee', xp: 4210, avatarUrl: 'https://i.pravatar.cc/150?u=user-2' },
      { id: 'user-3', username: 'GitaLearner', xp: 3980, avatarUrl: 'https://i.pravatar.cc/150?u=user-3' },
      { id: 'user-current', username: 'Tú', xp: 3850, avatarUrl: 'https://i.pravatar.cc/150?u=user-current', isCurrentUser: true },
      { id: 'user-5', username: 'SanskritScholar', xp: 3700, avatarUrl: 'https://i.pravatar.cc/150?u=user-5' },
      { id: 'user-6', username: 'YogaMaster', xp: 3450, avatarUrl: 'https://i.pravatar.cc/150?u=user-6' },
      { id: 'user-7', username: 'VedantaStudent', xp: 3200, avatarUrl: 'https://i.pravatar.cc/150?u=user-7' },
      { id: 'user-8', username: 'BhaktiHeart', xp: 2950, avatarUrl: 'https://i.pravatar.cc/150?u=user-8' },
      { id: 'user-9', username: 'DharmaChaser', xp: 2700, avatarUrl: 'https://i.pravatar.cc/150?u=user-9' },
      { id: 'user-10', username: 'KarmaWarrior', xp: 2500, avatarUrl: 'https://i.pravatar.cc/150?u=user-10' },
      { id: 'user-11', username: 'MokshaSeeker', xp: 2250, avatarUrl: 'https://i.pravatar.cc/150?u=user-11' },
      { id: 'user-12', username: 'AtmaExplorer', xp: 2000, avatarUrl: 'https://i.pravatar.cc/150?u=user-12' },
      { id: 'user-13', username: 'PranaFlow', xp: 1800, avatarUrl: 'https://i.pravatar.cc/150?u=user-13' },
      { id: 'user-14', username: 'JnanaPath', xp: 1600, avatarUrl: 'https://i.pravatar.cc/150?u=user-14' },
      { id: 'user-15', username: 'OMShanti', xp: 1400, avatarUrl: 'https://i.pravatar.cc/150?u=user-15' },
    ];

    // Ordenar por XP descendente
    return users.sort((a, b) => b.xp - a.xp);
  }

  // ==================== SETTINGS ====================
  
  async getAppSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      // Ajustes por defecto
      return {
        dailyReminder: false,
        theme: 'light',
      };
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {
        dailyReminder: false,
        theme: 'light',
      };
    }
  }

  async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  // ==================== DATA MANAGEMENT ====================

  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // ==================== EXERCISES ====================

  async getExercisesForLesson(chapterNumber: number, lessonId: string): Promise<Exercise[]> {
    const lesson = await this.getLesson(chapterNumber, lessonId);
    if (!lesson || lesson.verses.length === 0) {
      return [];
    }

    const exercises: Exercise[] = [];

    // Crear ejercicios para cada verso de la lección
    for (const verse of lesson.verses) {
      const exerciseType = this._getRandomExerciseType(verse);
      let exercise: Exercise | null = null;

      switch (exerciseType) {
        case ExerciseType.MULTIPLE_CHOICE_TRANSLATION:
          exercise = this._createMultipleChoiceExercise(verse);
          break;
        case ExerciseType.LISTEN_AND_SELECT:
          exercise = this._createListenExercise(verse);
          break;
        // Otros tipos de ejercicios se pueden añadir aquí
      }

      if (exercise) {
        exercises.push(exercise);
      }
    }

    // Mezclar los ejercicios para que no siempre aparezcan en el mismo orden
    return this._shuffleArray(exercises);
  }

  // ==================== NEW PRIORITY 1: SECTIONS & UNITS ====================

  /**
   * Obtiene todas las secciones con su progreso actual
   */
  async getSections(): Promise<Section[]> {
    try {
      const progress = await this.getStudyProgress();
      const sectionsData = [...SECTIONS];

      return sectionsData.map(section => {
        const sectionProgress = this.calculateSectionProgress(section, progress);
        return {
          ...section,
          progress: sectionProgress,
          status: this.calculateSectionStatus(section, sectionProgress)
        };
      });
    } catch (error) {
      console.error('Error getting sections:', error);
      return SECTIONS;
    }
  }

  /**
   * Obtiene las units de una sección específica
   */
  async getUnitsForSection(sectionId: string): Promise<NewUnit[]> {
    try {
      const progress = await this.getStudyProgress();
      let units: NewUnit[] = [];

      switch (sectionId) {
        case 'foundations':
          units = [...FOUNDATION_UNITS];
          break;
        case 'action':
          units = [...ACTION_UNITS];
          break;
        // Añadir más secciones aquí según se vayan creando
        default:
          return [];
      }

      return units.map(unit => {
        const completionPercentage = this.calculateUnitProgress(unit, progress);
        return {
          ...unit,
          completionPercentage,
          status: this.calculateUnitStatus(unit, completionPercentage)
        };
      });
    } catch (error) {
      console.error('Error getting units for section:', error);
      return [];
    }
  }

  /**
   * Crea un resumen de lección completo con gemas y achievements
   */
  async createLessonSummary(
    correctAnswers: number,
    totalAnswers: number,
    isFirstTryPerfect: boolean = false
  ): Promise<LessonSummary> {
    try {
      const gameState = await this.getGameState();
      const currentStreak = gameState.streak;
      
      // Verificar si se completó una unidad
      const isUnitComplete = await this.checkIfUnitCompleted(correctAnswers, totalAnswers);
      
      // Verificar achievements desbloqueados
      const newAchievements = GemEarningService.checkForNewAchievements(
        Math.round((correctAnswers / totalAnswers) * 100),
        currentStreak,
        gameState.xp,
        isFirstTryPerfect
      );

      // Crear el resumen usando el servicio de gemas
      return GemEarningService.createLessonSummary(
        correctAnswers,
        totalAnswers,
        isFirstTryPerfect,
        isUnitComplete,
        currentStreak,
        newAchievements
      );
    } catch (error) {
      console.error('Error creating lesson summary:', error);
      // Retornar resumen por defecto en caso de error
      return {
        xpGained: correctAnswers * 10,
        gemsEarned: 10,
        accuracy: Math.round((correctAnswers / totalAnswers) * 100),
        perfectAnswers: correctAnswers,
        totalAnswers,
        streakDays: 1,
        masteryStarsGained: correctAnswers === totalAnswers ? 5 : 3,
        achievementsUnlocked: [],
        motivationalMessage: '¡Buen trabajo! Sigue así.',
      };
    }
  }

  /**
   * Actualiza el estado del juego después de completar una lección
   */
  async updateGameStateAfterLesson(lessonSummary: LessonSummary): Promise<void> {
    try {
      const currentState = await this.getGameState();
      const updatedState = GemEarningService.updateGameStateWithRewards(currentState, lessonSummary);
      await this.saveGameState(updatedState);
    } catch (error) {
      console.error('Error updating game state after lesson:', error);
    }
  }

  // ==================== HELPER METHODS ====================

  private calculateSectionProgress(section: Section, progress: StudyProgress[]): number {
    const sectionVerses = this.verses.filter(v => section.chapters.includes(v.capitulo));
    const completedVerses = sectionVerses.filter(v => 
      progress.some(p => p.verseId === this.getVerseId(v) && p.reviewCount > 0)
    );
    
    return sectionVerses.length > 0 ? Math.round((completedVerses.length / sectionVerses.length) * 100) : 0;
  }

  private calculateSectionStatus(section: Section, progress: number): 'locked' | 'unlocked' | 'completed' {
    if (progress >= 100) return 'completed';
    if (section.unlockRequirement === 'available_from_start') return 'unlocked';
    // Aquí se añadiría la lógica para verificar requisitos de desbloqueo
    return progress > 0 ? 'unlocked' : 'locked';
  }

  private calculateUnitProgress(unit: NewUnit, progress: StudyProgress[]): number {
    const unitVerses = unit.verses;
    const completedVerses = unitVerses.filter((verseId: string) => 
      progress.some(p => p.verseId === verseId && p.reviewCount > 0)
    );
    
    return unitVerses.length > 0 ? Math.round((completedVerses.length / unitVerses.length) * 100) : 0;
  }

  private calculateUnitStatus(unit: NewUnit, progress: number): 'locked' | 'unlocked' | 'completed' {
    if (progress >= 100) return 'completed';
    if (unit.unlockRequirement === 'available_from_start') return 'unlocked';
    // Aquí se añadiría la lógica para verificar requisitos de desbloqueo
    return progress > 0 ? 'unlocked' : 'locked';
  }

  private async checkIfUnitCompleted(correctAnswers: number, totalAnswers: number): Promise<boolean> {
    // Determinar si se completó una unidad basado en el rendimiento
    return correctAnswers === totalAnswers;
  }

  private _createListenExercise(verse: Verse): ListenAndSelectExercise {
    const options: MultipleChoiceOption[] = [];
    const correctOptionId = `verse-${verse.capitulo}-${verse.verso}`;

    // Añadir la opción correcta
    options.push({ id: correctOptionId, text: verse.transliteracion });

    // Añadir 3 opciones incorrectas de otros versos
    const wrongVerses = this._shuffleArray(this.verses.filter(v => v.sanskrit !== verse.sanskrit)).slice(0, 3);
    wrongVerses.forEach(v => {
      options.push({ id: `verse-${v.capitulo}-${v.verso}`, text: v.transliteracion });
    });

    // Generar URL de audio (en implementación real, esto vendría de la base de datos)
    const audioUrl = (verse as any).audioUrl || `https://gitalearn-audio.com/chapters/${verse.capitulo}/verse-${verse.verso}.mp3`;

    return {
      verse,
      type: ExerciseType.LISTEN_AND_SELECT,
      question: 'Escucha el audio y elige la transliteración correcta',
      audioUrl,
      options: this._shuffleArray(options),
      correctOptionId,
      isCorrect: null,
    };
  }

  private _createMultipleChoiceExercise(verse: Verse): MultipleChoiceExercise {
    const options: MultipleChoiceOption[] = [];
    const correctOptionId = this.getVerseId(verse);

    // Añadir la opción correcta
    options.push({ id: correctOptionId, text: verse.sanskrit });

    // Añadir 3 opciones incorrectas
    const wrongVerses = this._shuffleArray(this.verses.filter(v => v.sanskrit !== verse.sanskrit)).slice(0, 3);
    wrongVerses.forEach(v => {
      options.push({ id: this.getVerseId(v), text: v.sanskrit });
    });

    return {
      verse,
      type: ExerciseType.MULTIPLE_CHOICE_TRANSLATION,
      question: 'Selecciona la traducción correcta del verso',
      options: this._shuffleArray(options),
      correctOptionId,
      isCorrect: null,
    };
  }

  private _generateTranslationOptions(verse: Verse): MultipleChoiceOption[] {
    const options: MultipleChoiceOption[] = [];
    const correctOptionId = this.getVerseId(verse);

    // Añadir la opción correcta
    options.push({ id: correctOptionId, text: verse.sanskrit });

    // Añadir 3 opciones incorrectas
    const wrongVerses = this._shuffleArray(this.verses.filter(v => v.sanskrit !== verse.sanskrit)).slice(0, 3);
    wrongVerses.forEach(v => {
      options.push({ id: this.getVerseId(v), text: v.sanskrit });
    });

    return this._shuffleArray(options);
  }

  private _shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private _getRandomExerciseType(verse: Verse): ExerciseType {
    const availableTypes: ExerciseType[] = [];

    // Verificar si el verso tiene audio disponible
    if ((verse as any).audioUrl || verse.capitulo <= 2) { // Por ahora, simular que los primeros 2 capítulos tienen audio
      availableTypes.push(ExerciseType.LISTEN_AND_SELECT);
    }
    
    // Siempre añadir opción múltiple como opción por defecto
    availableTypes.push(ExerciseType.MULTIPLE_CHOICE_TRANSLATION);

    // Podríamos añadir más lógicas aquí, por ejemplo, si el verso es corto, añadir "Completar el verso"
    // Por ahora, elegimos aleatoriamente entre los tipos disponibles.
    
    const randomIndex = Math.floor(Math.random() * availableTypes.length);
    return availableTypes[randomIndex];
  }

  // --- AsyncStorage Management ---
  async _clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

// Singleton instance
export const gitaDataService = new GitaDataService();
