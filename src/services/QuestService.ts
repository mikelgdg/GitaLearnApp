import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest, QuestType, DailyQuestSet, WeeklyQuestSet } from '../types';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';

/**
 * 🎯 QuestService - Sistema de Misiones Estilo Duolingo
 * 
 * Funcionalidades principales:
 * - Generar misiones diarias/semanales automáticamente
 * - Tracking de progreso en tiempo real
 * - Sistema de recompensas (XP + Gemas)
 * - Misiones contextuales según progreso del usuario
 */
export class QuestService {
  private static readonly DAILY_QUESTS_KEY = 'GitaLearn_DailyQuests';
  private static readonly WEEKLY_QUESTS_KEY = 'GitaLearn_WeeklyQuests';
  private static readonly QUEST_PROGRESS_KEY = 'GitaLearn_QuestProgress';

  // 📊 Templates de misiones diarias (3 misiones por día)
  private static readonly DAILY_QUEST_TEMPLATES: Omit<Quest, 'id' | 'createdAt' | 'expiresAt' | 'currentProgress' | 'status'>[] = [
    {
      type: 'complete_lessons',
      title: 'Estudioso Dedicado',
      description: 'Completa 3 lecciones',
      targetValue: 3,
      xpReward: 20,
      gemReward: 5,
      frequency: 'daily',
      icon: 'book-outline',
      color: DUOLINGO_COLORS.GREEN.DEFAULT
    },
    {
      type: 'earn_xp',
      title: 'Coleccionista de XP',
      description: 'Gana 50 XP',
      targetValue: 50,
      xpReward: 15,
      gemReward: 5,
      frequency: 'daily',
      icon: 'star-outline',
      color: DUOLINGO_COLORS.YELLOW.DEFAULT
    },
    {
      type: 'perfect_lessons',
      title: 'Perfeccionista',
      description: 'Completa 1 lección sin errores',
      targetValue: 1,
      xpReward: 25,
      gemReward: 10,
      frequency: 'daily',
      icon: 'trophy-outline',
      color: DUOLINGO_COLORS.PURPLE.DEFAULT
    },
    {
      type: 'maintain_streak',
      title: 'Racha Constante',
      description: 'Mantén tu racha de estudio',
      targetValue: 1,
      xpReward: 10,
      gemReward: 3,
      frequency: 'daily',
      icon: 'flame-outline',
      color: DUOLINGO_COLORS.RED.DEFAULT
    },
    {
      type: 'study_minutes',
      title: 'Tiempo de Calidad',
      description: 'Estudia durante 15 minutos',
      targetValue: 15,
      xpReward: 20,
      gemReward: 5,
      frequency: 'daily',
      icon: 'time-outline',
      color: DUOLINGO_COLORS.BLUE.DEFAULT
    },
    {
      type: 'early_bird',
      title: 'Madrugador',
      description: 'Estudia antes de las 10:00 AM',
      targetValue: 1,
      xpReward: 15,
      gemReward: 8,
      frequency: 'daily',
      icon: 'sunny-outline',
      color: DUOLINGO_COLORS.YELLOW.DEFAULT
    }
  ];

  // 📊 Templates de misiones semanales (2 misiones por semana)
  private static readonly WEEKLY_QUEST_TEMPLATES: Omit<Quest, 'id' | 'createdAt' | 'expiresAt' | 'currentProgress' | 'status'>[] = [
    {
      type: 'complete_lessons',
      title: 'Estudiante Constante',
      description: 'Completa 15 lecciones esta semana',
      targetValue: 15,
      xpReward: 100,
      gemReward: 25,
      frequency: 'weekly',
      icon: 'library-outline',
      color: DUOLINGO_COLORS.GREEN.DEFAULT
    },
    {
      type: 'earn_xp',
      title: 'Maestro del XP',
      description: 'Gana 500 XP esta semana',
      targetValue: 500,
      xpReward: 80,
      gemReward: 20,
      frequency: 'weekly',
      icon: 'medal-outline',
      color: DUOLINGO_COLORS.PURPLE.DEFAULT
    },
    {
      type: 'maintain_streak',
      title: 'Racha Semanal',
      description: 'Estudia todos los días de la semana',
      targetValue: 7,
      xpReward: 150,
      gemReward: 30,
      frequency: 'weekly',
      icon: 'flame-outline',
      color: DUOLINGO_COLORS.RED.DEFAULT
    },
    {
      type: 'complete_unit',
      title: 'Completador de Unidades',
      description: 'Completa 1 unidad completa',
      targetValue: 1,
      xpReward: 200,
      gemReward: 50,
      frequency: 'weekly',
      icon: 'checkmark-circle-outline',
      color: DUOLINGO_COLORS.GREEN.LIGHT
    }
  ];

  // 🗓️ Obtener misiones diarias del día actual
  static async getDailyQuests(): Promise<DailyQuestSet> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      const stored = await AsyncStorage.getItem(this.DAILY_QUESTS_KEY);
      if (stored) {
        const dailyQuestSet: DailyQuestSet = JSON.parse(stored);
        
        // Si es el mismo día, devolver misiones existentes
        if (dailyQuestSet.date === today) {
          return dailyQuestSet;
        }
      }
      
      // Generar nuevas misiones diarias
      return await this.generateDailyQuests(today);
    } catch (error) {
      console.error('Error loading daily quests:', error);
      return await this.generateDailyQuests(today);
    }
  }

  // 🗓️ Obtener misiones semanales de la semana actual
  static async getWeeklyQuests(): Promise<WeeklyQuestSet> {
    const weekStart = this.getWeekStart(new Date());
    
    try {
      const stored = await AsyncStorage.getItem(this.WEEKLY_QUESTS_KEY);
      if (stored) {
        const weeklyQuestSet: WeeklyQuestSet = JSON.parse(stored);
        
        // Si es la misma semana, devolver misiones existentes
        if (weeklyQuestSet.weekStart === weekStart) {
          return weeklyQuestSet;
        }
      }
      
      // Generar nuevas misiones semanales
      return await this.generateWeeklyQuests(weekStart);
    } catch (error) {
      console.error('Error loading weekly quests:', error);
      return await this.generateWeeklyQuests(weekStart);
    }
  }

  // 🎯 Generar misiones diarias (3 aleatorias del pool)
  private static async generateDailyQuests(date: string): Promise<DailyQuestSet> {
    // Seleccionar 3 misiones aleatorias de la lista
    const shuffled = [...this.DAILY_QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffled.slice(0, 3);
    
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999); // Expira al final del día
    
    const quests: Quest[] = selectedTemplates.map((template, index) => ({
      ...template,
      id: `daily_${date}_${index}`,
      currentProgress: 0,
      status: 'active' as const,
      createdAt: now,
      expiresAt
    }));

    const dailyQuestSet: DailyQuestSet = {
      date,
      quests,
      allCompleted: false,
      bonusXpEarned: 0
    };

    await AsyncStorage.setItem(this.DAILY_QUESTS_KEY, JSON.stringify(dailyQuestSet));
    return dailyQuestSet;
  }

  // 🎯 Generar misiones semanales (2 del pool)
  private static async generateWeeklyQuests(weekStart: string): Promise<WeeklyQuestSet> {
    const shuffled = [...this.WEEKLY_QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffled.slice(0, 2);
    
    const now = new Date();
    const expiresAt = new Date(weekStart);
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 1 semana
    expiresAt.setHours(23, 59, 59, 999);
    
    const quests: Quest[] = selectedTemplates.map((template, index) => ({
      ...template,
      id: `weekly_${weekStart}_${index}`,
      currentProgress: 0,
      status: 'active' as const,
      createdAt: now,
      expiresAt
    }));

    const weeklyQuestSet: WeeklyQuestSet = {
      weekStart,
      quests,
      allCompleted: false,
      bonusXpEarned: 0
    };

    await AsyncStorage.setItem(this.WEEKLY_QUESTS_KEY, JSON.stringify(weeklyQuestSet));
    return weeklyQuestSet;
  }

  // 📈 Actualizar progreso de una misión específica
  static async updateQuestProgress(questType: QuestType, incrementValue: number = 1): Promise<void> {
    try {
      // Actualizar misiones diarias
      const dailyQuests = await this.getDailyQuests();
      let dailyUpdated = false;
      
      dailyQuests.quests.forEach((quest: Quest) => {
        if (quest.type === questType && quest.status === 'active') {
          quest.currentProgress = Math.min(quest.currentProgress + incrementValue, quest.targetValue);
          if (quest.currentProgress >= quest.targetValue) {
            quest.status = 'completed';
            quest.completedAt = new Date();
          }
          dailyUpdated = true;
        }
      });

      if (dailyUpdated) {
        // Verificar si todas las misiones diarias están completadas
        const allDailyCompleted = dailyQuests.quests.every((q: Quest) => q.status === 'completed');
        if (allDailyCompleted && !dailyQuests.allCompleted) {
          dailyQuests.allCompleted = true;
          dailyQuests.bonusXpEarned = 50; // Bonus por completar todo
        }
        
        await AsyncStorage.setItem(this.DAILY_QUESTS_KEY, JSON.stringify(dailyQuests));
      }

      // Actualizar misiones semanales
      const weeklyQuests = await this.getWeeklyQuests();
      let weeklyUpdated = false;
      
      weeklyQuests.quests.forEach((quest: Quest) => {
        if (quest.type === questType && quest.status === 'active') {
          quest.currentProgress = Math.min(quest.currentProgress + incrementValue, quest.targetValue);
          if (quest.currentProgress >= quest.targetValue) {
            quest.status = 'completed';
            quest.completedAt = new Date();
          }
          weeklyUpdated = true;
        }
      });

      if (weeklyUpdated) {
        // Verificar si todas las misiones semanales están completadas
        const allWeeklyCompleted = weeklyQuests.quests.every((q: Quest) => q.status === 'completed');
        if (allWeeklyCompleted && !weeklyQuests.allCompleted) {
          weeklyQuests.allCompleted = true;
          weeklyQuests.bonusXpEarned = 200; // Bonus por completar todo
        }
        
        await AsyncStorage.setItem(this.WEEKLY_QUESTS_KEY, JSON.stringify(weeklyQuests));
      }

    } catch (error) {
      console.error('Error updating quest progress:', error);
    }
  }

  // 🏆 Obtener recompensas pendientes de todas las misiones completadas
  static async claimCompletedQuestRewards(): Promise<{ xp: number; gems: number }> {
    let totalXp = 0;
    let totalGems = 0;

    try {
      // Recompensas de misiones diarias
      const dailyQuests = await this.getDailyQuests();
      dailyQuests.quests.forEach((quest: Quest) => {
        if (quest.status === 'completed' && !quest.completedAt) {
          totalXp += quest.xpReward;
          totalGems += quest.gemReward;
          quest.completedAt = new Date(); // Marcar como reclamada
        }
      });

      if (dailyQuests.allCompleted && dailyQuests.bonusXpEarned > 0) {
        totalXp += dailyQuests.bonusXpEarned;
        dailyQuests.bonusXpEarned = 0; // Evitar reclamar el bonus múltiples veces
      }

      // Recompensas de misiones semanales
      const weeklyQuests = await this.getWeeklyQuests();
      weeklyQuests.quests.forEach((quest: Quest) => {
        if (quest.status === 'completed' && !quest.completedAt) {
          totalXp += quest.xpReward;
          totalGems += quest.gemReward;
          quest.completedAt = new Date();
        }
      });

      if (weeklyQuests.allCompleted && weeklyQuests.bonusXpEarned > 0) {
        totalXp += weeklyQuests.bonusXpEarned;
        weeklyQuests.bonusXpEarned = 0;
      }

      // Guardar estados actualizados
      await AsyncStorage.setItem(this.DAILY_QUESTS_KEY, JSON.stringify(dailyQuests));
      await AsyncStorage.setItem(this.WEEKLY_QUESTS_KEY, JSON.stringify(weeklyQuests));

    } catch (error) {
      console.error('Error claiming quest rewards:', error);
    }

    return { xp: totalXp, gems: totalGems };
  }

  // 📊 Obtener estadísticas de progreso general
  static async getQuestStats(): Promise<{
    dailyCompletionRate: number;
    weeklyCompletionRate: number;
    totalQuestsCompleted: number;
    currentStreak: number;
  }> {
    try {
      const dailyQuests = await this.getDailyQuests();
      const weeklyQuests = await this.getWeeklyQuests();

      const dailyCompleted = dailyQuests.quests.filter((q: Quest) => q.status === 'completed').length;
      const weeklyCompleted = weeklyQuests.quests.filter((q: Quest) => q.status === 'completed').length;

      return {
        dailyCompletionRate: (dailyCompleted / dailyQuests.quests.length) * 100,
        weeklyCompletionRate: (weeklyCompleted / weeklyQuests.quests.length) * 100,
        totalQuestsCompleted: dailyCompleted + weeklyCompleted,
        currentStreak: 0 // TODO: Implementar lógica de streak
      };
    } catch (error) {
      console.error('Error getting quest stats:', error);
      return {
        dailyCompletionRate: 0,
        weeklyCompletionRate: 0,
        totalQuestsCompleted: 0,
        currentStreak: 0
      };
    }
  }

  // 🗓️ Utility: Obtener inicio de semana (lunes)
  private static getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea inicio
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  // 🔄 Limpiar misiones expiradas (llamar al inicio de la app)
  static async cleanupExpiredQuests(): Promise<void> {
    try {
      const now = new Date();
      
      // Limpiar diarias
      const dailyQuests = await this.getDailyQuests();
      const today = now.toISOString().split('T')[0];
      if (dailyQuests.date !== today) {
        await this.generateDailyQuests(today);
      }

      // Limpiar semanales
      const weeklyQuests = await this.getWeeklyQuests();
      const currentWeekStart = this.getWeekStart(now);
      if (weeklyQuests.weekStart !== currentWeekStart) {
        await this.generateWeeklyQuests(currentWeekStart);
      }

    } catch (error) {
      console.error('Error cleaning up expired quests:', error);
    }
  }
}

// Exportar instancia para usar en la app
export const questService = QuestService;
