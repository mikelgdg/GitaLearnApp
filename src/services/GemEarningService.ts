import { LessonSummary, GameState, Achievement } from '../types';
import { GEM_EARNING_RATES, MOTIVATIONAL_MESSAGES } from '../constants/sections';

export class GemEarningService {
  
  /**
   * Calcula las gemas ganadas por completar una lección
   */
  static calculateLessonGems(
    accuracy: number,
    isFirstTryPerfect: boolean,
    isUnitComplete: boolean
  ): number {
    let gems = GEM_EARNING_RATES.lessonComplete; // 10 gemas base
    
    if (accuracy === 100) {
      gems += GEM_EARNING_RATES.perfectLesson; // +15 gemas por lección perfecta
    }
    
    if (isFirstTryPerfect) {
      gems += GEM_EARNING_RATES.firstTryPerfect; // +20 gemas por primera vez perfecto
    }
    
    if (isUnitComplete) {
      gems += GEM_EARNING_RATES.unitComplete; // +50 gemas por completar unidad
    }
    
    return gems;
  }
  
  /**
   * Calcula las gemas ganadas por pasar un checkpoint
   */
  static calculateCheckpointPassGems(): number {
    return GEM_EARNING_RATES.checkpointPass; // 100 gemas
  }
  
  /**
   * Calcula las gemas ganadas por fallar un checkpoint
   */
  static calculateCheckpointFailGems(): number {
    return 0; // Sin gemas por fallar
  }
  
  /**
   * Calcula las gemas ganadas por streak diario/semanal
   */
  static calculateStreakGems(streakDays: number): number {
    if (streakDays % 7 === 0 && streakDays > 0) {
      return GEM_EARNING_RATES.weeklyStreak; // 25 gemas por semana
    }
    return GEM_EARNING_RATES.dailyStreak; // 5 gemas diarias
  }
  
  /**
   * Calcula las gemas ganadas por desbloquear un achievement
   */
  static calculateAchievementGems(achievement: Achievement): number {
    // Gemas variables según la dificultad del achievement
    const baseGems = GEM_EARNING_RATES.achievementUnlock;
    
    // Achievements especiales dan más gemas
    if (achievement.id.includes('perfect_week')) return 100;
    if (achievement.id.includes('perfect_month')) return 200;
    if (achievement.id.includes('complete_chapter')) return 75;
    if (achievement.id.includes('streak_30')) return 150;
    
    return baseGems; // 15 gemas por defecto
  }
  
  /**
   * Crea un resumen completo de la lección con gemas y XP
   */
  static createLessonSummary(
    correctAnswers: number,
    totalAnswers: number,
    isFirstTryPerfect: boolean,
    isUnitComplete: boolean,
    currentStreak: number,
    achievementsUnlocked: Achievement[] = []
  ): LessonSummary {
    const accuracy = Math.round((correctAnswers / totalAnswers) * 100);
    
    // Calcular XP ganado (10 por respuesta correcta)
    const xpGained = correctAnswers * 10;
    
    // Calcular gemas ganadas
    let gemsEarned = this.calculateLessonGems(accuracy, isFirstTryPerfect, isUnitComplete);
    
    // Añadir gemas por achievements
    achievementsUnlocked.forEach(achievement => {
      gemsEarned += this.calculateAchievementGems(achievement);
    });
    
    // Añadir gemas por streak
    gemsEarned += this.calculateStreakGems(currentStreak);
    
    // Calcular maestría (estrellas ganadas)
    let masteryStarsGained = 0;
    if (accuracy >= 100) masteryStarsGained = 5;
    else if (accuracy >= 90) masteryStarsGained = 4;
    else if (accuracy >= 80) masteryStarsGained = 3;
    else if (accuracy >= 70) masteryStarsGained = 2;
    else if (accuracy >= 60) masteryStarsGained = 1;
    
    return {
      xpGained,
      gemsEarned,
      accuracy,
      perfectAnswers: correctAnswers,
      totalAnswers,
      streakDays: currentStreak,
      masteryStarsGained,
      achievementsUnlocked,
      motivationalMessage: this.getMotivationalMessage(accuracy),
      nextLessonUnlocked: isUnitComplete ? 'next_unit_unlocked' : undefined,
    };
  }
  
  /**
   * Obtiene un mensaje motivador basado en el rendimiento
   */
  private static getMotivationalMessage(accuracy: number): string {
    let level: keyof typeof MOTIVATIONAL_MESSAGES;
    
    if (accuracy === 100) level = 'perfect';
    else if (accuracy >= 85) level = 'excellent';
    else if (accuracy >= 70) level = 'good';
    else level = 'needs_improvement';
    
    const messages = MOTIVATIONAL_MESSAGES[level];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  /**
   * Actualiza el GameState con las nuevas gemas y XP
   */
  static updateGameStateWithRewards(
    currentState: GameState,
    lessonSummary: LessonSummary
  ): GameState {
    return {
      ...currentState,
      xp: currentState.xp + lessonSummary.xpGained,
      gems: currentState.gems + lessonSummary.gemsEarned,
      streak: lessonSummary.streakDays,
      lastCompletedDate: new Date().toISOString(),
    };
  }
  
  /**
   * Verifica si se desbloqueó algún nuevo achievement
   */
  static checkForNewAchievements(
    accuracy: number,
    currentStreak: number,
    totalXP: number,
    isFirstPerfect: boolean
  ): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    // Perfect lesson achievement
    if (accuracy === 100 && isFirstPerfect) {
      newAchievements.push({
        id: 'first_perfect_lesson',
        title: '¡Perfección Inicial!',
        description: 'Completaste tu primera lección perfecta',
        icon: '🌟',
        isUnlocked: true,
        unlockedDate: new Date(),
      });
    }
    
    // Streak achievements
    if (currentStreak === 7) {
      newAchievements.push({
        id: 'streak_week',
        title: '¡Semana Perfecta!',
        description: '7 días consecutivos estudiando',
        icon: '🔥',
        isUnlocked: true,
        unlockedDate: new Date(),
      });
    }
    
    if (currentStreak === 30) {
      newAchievements.push({
        id: 'streak_month',
        title: '¡Mes de Dedicación!',
        description: '30 días consecutivos estudiando',
        icon: '🏆',
        isUnlocked: true,
        unlockedDate: new Date(),
      });
    }
    
    // XP milestones
    if (totalXP >= 1000) {
      newAchievements.push({
        id: 'xp_1000',
        title: '¡Sabio en Formación!',
        description: 'Alcanzaste 1,000 XP',
        icon: '📚',
        isUnlocked: true,
        unlockedDate: new Date(),
      });
    }
    
    return newAchievements;
  }
}

export default GemEarningService;
