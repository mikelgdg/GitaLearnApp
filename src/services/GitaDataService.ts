import AsyncStorage from '@react-native-async-storage/async-storage';
import { Verse, StudyProgress, StudySession, UserStats, Achievement, Chapter, AppSettings } from '../types';
import versesData from '../../assets/data/verses.json';

// Constantes para almacenamiento local
const STORAGE_KEYS = {
  STUDY_PROGRESS: 'study_progress',
  USER_STATS: 'user_stats',
  STUDY_SESSIONS: 'study_sessions',
  ACHIEVEMENTS: 'achievements',
  SETTINGS: 'app_settings',
  FAVORITE_VERSES: 'favorite_verses',
};

class GitaDataService {
  private verses: Verse[] = versesData as Verse[];
  
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
      { number: 16, title: 'Daivasura Sampad Vibhaga Yoga', versesCount: 24, description: 'Naturalezas divinas y demoníacas' },
      { number: 17, title: 'Sraddhatraya Vibhaga Yoga', versesCount: 28, description: 'Las divisiones de la fe' },
      { number: 18, title: 'Moksa Sannyasa Yoga', versesCount: 78, description: 'La conclusión: la perfección de la renuncia y la entrega' },
    ];
    
    return chapters.find(ch => ch.number === chapterNumber) || chapters[0];
  }

  /**
   * Obtiene todos los capítulos
   */
  async getAllChapters(): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    for (let i = 1; i <= 18; i++) {
      chapters.push(await this.getChapter(i));
    }
    return chapters;
  }

  // ==================== APP SETTINGS ====================

  async getAppSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      // Ajustes por defecto
      return {
        versesPerSession: 20,
        dailyReminder: false,
        theme: 'light',
      };
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {
        versesPerSession: 20,
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
}

// Singleton instance
export const gitaDataService = new GitaDataService();
