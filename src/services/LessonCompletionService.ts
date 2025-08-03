/**
 * 🎯 LessonCompletionService - Sistema de Integración Estilo Duolingo
 * 
 * COMPORTAMIENTO IDÉNTICO A DUOLINGO:
 * Este servicio maneja la secuencia EXACTA de eventos cuando se completa una lección,
 * asegurando que todos los sistemas se actualicen en el orden correcto.
 * 
 * ORDEN DE OPERACIONES (como Duolingo):
 * 1. Registrar lección completada en Streak
 * 2. Actualizar progreso de Quests
 * 3. Calcular recompensas (XP, gemas, achievements)
 * 4. Actualizar GameState
 * 5. Verificar milestones y logros especiales
 */

import { StreakService } from './StreakService';
import { questService } from './QuestService';
import { leaderboardService } from './LeaderboardService';
import { GemEarningService } from './GemEarningService';
import { LessonSummary, GameState } from '../types';

export class LessonCompletionService {
  
  /**
   * Procesa la finalización de una lección con comportamiento IDÉNTICO a Duolingo
   */
  static async processLessonCompletion(
    correctAnswers: number,
    totalAnswers: number,
    isFirstTryPerfect: boolean = false,
    xpGained: number = 0
  ): Promise<LessonSummary> {
    
    console.log('🎯 Processing lesson completion (Duolingo-style)...', {
      correctAnswers,
      totalAnswers,
      accuracy: Math.round((correctAnswers / totalAnswers) * 100),
      isFirstTryPerfect
    });

    try {
      // 1. 🔥 STREAK: Registrar lección completada PRIMERO (como Duolingo)
      const streakResult = await StreakService.recordLessonCompletion();
      console.log('✅ Streak updated:', streakResult);

      // 2. 🎯 QUESTS: Actualizar progreso de misiones
      const accuracy = Math.round((correctAnswers / totalAnswers) * 100);
      
      // Quest: Completar lecciones
      await questService.updateQuestProgress('complete_lessons', 1);
      
      // Quest: Ganar XP (calcular XP base primero)
      const baseXp = correctAnswers * 10;
      await questService.updateQuestProgress('earn_xp', baseXp);
      
      // Quest: Lecciones perfectas
      if (accuracy === 100) {
        await questService.updateQuestProgress('perfect_lessons', 1);
      }
      
      // Quest: Mantener streak (solo si incrementó)
      if (streakResult.streakIncreased) {
        await questService.updateQuestProgress('maintain_streak', 1);
        await questService.updateQuestProgress('daily_goal', 1);
      }
      
      console.log('✅ Quests updated');

      // 3. 🏆 LEAGUE: Actualizar XP semanal en liga (como Duolingo)
      await leaderboardService.addWeeklyXP(baseXp);
      console.log('✅ League XP updated');

      // 4. 💎 RECOMPENSAS: Calcular gemas y achievements
      const streakData = await StreakService.getStreakData();
      const currentStreak = streakData.currentStreak;
      
      // Verificar achievements desbloqueados
      const newAchievements = GemEarningService.checkForNewAchievements(
        accuracy,
        currentStreak,
        0, // El XP total se obtendrá del GameState
        isFirstTryPerfect
      );

      // 5. 📊 CREAR RESUMEN: Como Duolingo
      const lessonSummary: LessonSummary = {
        xpGained: baseXp,
        gemsEarned: this.calculateGemsEarned(accuracy, isFirstTryPerfect, currentStreak),
        accuracy,
        perfectAnswers: correctAnswers,
        totalAnswers,
        streakDays: currentStreak,
        masteryStarsGained: accuracy === 100 ? 5 : Math.max(1, Math.floor(accuracy / 20)),
        achievementsUnlocked: newAchievements,
        motivationalMessage: this.getMotivationalMessage(accuracy, streakResult.streakIncreased),
        nextLessonUnlocked: undefined // Se puede agregar lógica de unlock
      };

      console.log('✅ Lesson summary created:', lessonSummary);
      
      return lessonSummary;

    } catch (error) {
      console.error('❌ Error processing lesson completion:', error);
      
      // Fallback seguro (como Duolingo)
      return {
        xpGained: correctAnswers * 10,
        gemsEarned: 10,
        accuracy: Math.round((correctAnswers / totalAnswers) * 100),
        perfectAnswers: correctAnswers,
        totalAnswers,
        streakDays: 1,
        masteryStarsGained: correctAnswers === totalAnswers ? 5 : 3,
        achievementsUnlocked: [],
        motivationalMessage: '¡Buen trabajo! Sigue así.'
      };
    }
  }

  /**
   * Calcula gemas ganadas con lógica IDÉNTICA a Duolingo
   */
  private static calculateGemsEarned(
    accuracy: number, 
    isFirstTryPerfect: boolean, 
    currentStreak: number
  ): number {
    let gems = 10; // Base por completar lección

    // Bonus por accuracy (como Duolingo)
    if (accuracy === 100) {
      gems += 15; // Perfección
    } else if (accuracy >= 80) {
      gems += 5; // Buen trabajo
    }

    // Bonus por first try perfect
    if (isFirstTryPerfect) {
      gems += 10;
    }

    // Bonus por streak (como Duolingo)
    if (currentStreak >= 7) {
      gems += 5; // Streak semanal
    }
    if (currentStreak >= 30) {
      gems += 10; // Streak mensual
    }

    return gems;
  }

  /**
   * Mensajes motivacionales estilo Duolingo
   */
  private static getMotivationalMessage(accuracy: number, streakIncreased: boolean): string {
    if (accuracy === 100) {
      const perfectMessages = [
        '¡Perfecto! Eres imparable.',
        '¡Increíble! Dominas esto.',
        '¡Flawless! Sigue así.',
        '¡Excelente! Krishna estaría orgulloso.'
      ];
      return perfectMessages[Math.floor(Math.random() * perfectMessages.length)];
    }

    if (streakIncreased) {
      const streakMessages = [
        '¡Tu racha sigue creciendo!',
        '¡Constancia que inspira!',
        '¡Un día más de sabiduría!',
        '¡Tu dedicación da frutos!'
      ];
      return streakMessages[Math.floor(Math.random() * streakMessages.length)];
    }

    if (accuracy >= 80) {
      const goodMessages = [
        '¡Buen trabajo! Vas por buen camino.',
        '¡Progreso sólido! Sigue adelante.',
        '¡Cada paso cuenta! Continúa.',
        '¡La práctica hace al maestro!'
      ];
      return goodMessages[Math.floor(Math.random() * goodMessages.length)];
    }

    const encouragementMessages = [
      '¡No te rindas! Cada error es aprendizaje.',
      '¡Sigue intentando! La maestría lleva tiempo.',
      '¡Perseverancia! Eres más fuerte de lo que crees.',
      '¡El conocimiento llega con la práctica!'
    ];
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  }

  /**
   * Actualiza el GameState con la integración completa
   */
  static async updateGameStateWithIntegration(
    currentState: GameState, 
    lessonSummary: LessonSummary
  ): Promise<GameState> {
    
    // Actualizar datos básicos
    const updatedState = GemEarningService.updateGameStateWithRewards(currentState, lessonSummary);
    
    // Obtener datos actualizados del streak
    const streakData = await StreakService.getStreakData();
    updatedState.streak = streakData.currentStreak;
    updatedState.lastCompletedDate = new Date().toISOString();
    
    console.log('✅ GameState updated with integration:', {
      xp: updatedState.xp,
      gems: updatedState.gems,
      streak: updatedState.streak,
      hearts: updatedState.hearts
    });

    return updatedState;
  }

  /**
   * Obtener estadísticas completas post-lección (como pantalla de resultados Duolingo)
   */
  static async getPostLessonStats(): Promise<{
    totalXpToday: number;
    totalGemsToday: number;
    currentStreak: number;
    questsCompleted: number;
    nextMilestone?: string;
  }> {
    try {
      const streakData = await StreakService.getStreakData();
      const questStats = await questService.getQuestStats();
      
      return {
        totalXpToday: 0, // Se implementará con tracking diario
        totalGemsToday: 0, // Se implementará con tracking diario
        currentStreak: streakData.currentStreak,
        questsCompleted: questStats.totalQuestsCompleted,
        nextMilestone: this.getNextMilestone(streakData.currentStreak)
      };
    } catch (error) {
      console.error('Error getting post-lesson stats:', error);
      return {
        totalXpToday: 0,
        totalGemsToday: 0,
        currentStreak: 1,
        questsCompleted: 0
      };
    }
  }

  /**
   * Obtener próximo milestone de streak
   */
  private static getNextMilestone(currentStreak: number): string | undefined {
    const milestones = [7, 14, 30, 50, 100, 365];
    const nextMilestone = milestones.find(m => m > currentStreak);
    
    if (nextMilestone) {
      const daysLeft = nextMilestone - currentStreak;
      return `${daysLeft} días para ${nextMilestone} días seguidos`;
    }
    
    return undefined;
  }
}

export default LessonCompletionService;
