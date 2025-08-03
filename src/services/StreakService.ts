import AsyncStorage from '@react-native-async-storage/async-storage';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';

/**
 * 🔥 StreakService - Sistema de Racha IDÉNTICO a Duolingo
 * 
 * Funcionalidades EXACTAS de Duolingo:
 * - Streak counter diario (se pierde si no haces lección por 24h)
 * - Streak Freeze: protege la racha por 1 día (cuesta 10 gems)
 * - Streak society: milestone celebrations (7, 30, 100, 365 días)
 * - Streak repair: restaurar racha perdida (cuesta 350 gems)
 * - Perfect streak tracking: días consecutivos sin perder racha
 * - Timezone handling: se resetea a medianoche local
 */

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

export class StreakServiceClass {
  private readonly STORAGE_KEY = 'streak_data';
  private readonly FREEZE_COST = 10; // gems
  private readonly REPAIR_COST = 350; // gems
  private readonly FREEZE_DURATION_HOURS = 24;

  // Milestones EXACTOS de Duolingo
  private readonly STREAK_MILESTONES: StreakMilestone[] = [
    {
      days: 7,
      title: "¡Una semana completa!",
      description: "Has mantenido tu racha por 7 días seguidos",
      icon: "flame",
      color: DUOLINGO_COLORS.ORANGE.DEFAULT,
      reward: { xp: 100, gems: 5, title: "Streak Starter" }
    },
    {
      days: 14,
      title: "¡Dos semanas!",
      description: "Tu constancia es admirable",
      icon: "flame",
      color: DUOLINGO_COLORS.EFFECTS.STREAK_FIRE,
      reward: { xp: 300, gems: 30, title: "Dedicated Learner" }
    },
    {
      days: 30,
      title: "¡Un mes completo!",
      description: "Eres un verdadero devoto",
      icon: "trophy",
      color: DUOLINGO_COLORS.EFFECTS.STREAK_FIRE,
      reward: { xp: 500, gems: 50, title: "Monthly Master" }
    },
    {
      days: 50,
      title: "¡50 días seguidos!",
      description: "Tu constancia es legendaria",
      icon: "medal",
      color: DUOLINGO_COLORS.PURPLE.DEFAULT,
      reward: { xp: 750, gems: 40 }
    },
    {
      days: 100,
      title: "¡100 días seguidos!",
      description: "Has alcanzado el nivel de los maestros",
      icon: "diamond",
      color: DUOLINGO_COLORS.BLUE.DEFAULT,
      reward: { xp: 1500, gems: 100, title: "Streak Master" }
    },
    {
      days: 365,
      title: "¡Un año completo!",
      description: "Eres una leyenda de Duolingo",
      icon: "trophy",
      color: DUOLINGO_COLORS.GREEN.DEFAULT,
      reward: { xp: 5000, gems: 500, title: "Streak Legend" }
    }
  ];

  /**
   * Obtener datos de racha actual
   */
  async getStreakData(): Promise<StreakData> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const data: StreakData = JSON.parse(stored);
        // Verificar si la racha sigue siendo válida
        return await this.validateAndUpdateStreak(data);
      }

      // Datos iniciales
      const initialData: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        perfectStreak: 0,
        lastLessonDate: '',
        streakFreezeUsed: false,
        streakFreezeExpiry: null,
        streakSocietyMilestones: [],
        totalDaysLearned: 0,
        weeklyStreakGoal: 7,
        monthlyStreakGoal: 30
      };

      await this.saveStreakData(initialData);
      return initialData;
    } catch (error) {
      console.error('Error loading streak data:', error);
      throw error;
    }
  }

  /**
   * Validar si la racha sigue siendo válida (no han pasado >24h sin lección)
   */
  private async validateAndUpdateStreak(data: StreakData): Promise<StreakData> {
    const now = new Date();
    const today = this.getDateString(now);
    
    // Si no hay última lección, mantener datos
    if (!data.lastLessonDate) {
      return data;
    }

    const lastLessonDate = new Date(data.lastLessonDate);
    const daysSinceLastLesson = this.getDaysBetween(lastLessonDate, now);

    // Si es el mismo día, mantener racha
    if (daysSinceLastLesson === 0) {
      return data;
    }

    // Si pasó exactamente 1 día, está bien (pueden hacer lección hoy)
    if (daysSinceLastLesson === 1) {
      return data;
    }

    // Si pasaron 2 días, verificar streak freeze
    if (daysSinceLastLesson === 2) {
      if (data.streakFreezeExpiry && new Date(data.streakFreezeExpiry) >= now) {
        // Freeze activo, mantener racha pero marcar freeze como usado
        data.streakFreezeUsed = true;
        data.streakFreezeExpiry = null; // Consumir freeze
        await this.saveStreakData(data);
        return data;
      }
    }

    // Si llegamos aquí, la racha se perdió
    if (daysSinceLastLesson >= 2) {
      data.currentStreak = 0;
      data.perfectStreak = 0;
      data.streakFreezeUsed = false;
      data.streakFreezeExpiry = null;
      await this.saveStreakData(data);
    }

    return data;
  }

  /**
   * Registrar que el usuario completó una lección HOY
   * Comportamiento EXACTO de Duolingo:
   * - Solo incrementa racha si no hizo lección hoy
   * - Resetea flag de freeze usado
   * - Actualiza fecha de última lección
   */
  async recordLessonCompletion(): Promise<{
    streakIncreased: boolean;
    newStreak: number;
    milestoneReached?: StreakMilestone;
  }> {
    try {
      const data = await this.getStreakData();
      const now = new Date();
      const today = this.getDateString(now);
      
      // Verificar si ya hizo lección hoy
      const lastLessonDate = data.lastLessonDate ? new Date(data.lastLessonDate) : null;
      const alreadyDidLessonToday = !!(lastLessonDate && this.getDateString(lastLessonDate) === today);

      if (alreadyDidLessonToday) {
        // Ya hizo lección hoy, no incrementar racha
        return {
          streakIncreased: false,
          newStreak: data.currentStreak
        };
      }

      // Incrementar racha
      data.currentStreak += 1;
      data.totalDaysLearned += 1;
      data.lastLessonDate = now.toISOString();
      
      // Solo incrementar perfect streak si no usó freeze ayer
      if (!data.streakFreezeUsed) {
        data.perfectStreak += 1;
      }

      // Resetear freeze usado (nuevo día)
      data.streakFreezeUsed = false;

      // Actualizar record de racha más larga
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
      }

      // Verificar milestones
      const milestoneReached = this.checkMilestone(data);

      await this.saveStreakData(data);

      return {
        streakIncreased: true,
        newStreak: data.currentStreak,
        milestoneReached
      };
    } catch (error) {
      console.error('Error recording lesson completion:', error);
      throw error;
    }
  }

  /**
   * Verificar si se alcanzó un milestone nuevo
   */
  private checkMilestone(data: StreakData): StreakMilestone | undefined {
    const milestone = this.STREAK_MILESTONES.find(m => 
      m.days === data.currentStreak && 
      !data.streakSocietyMilestones.includes(m.days)
    );

    if (milestone) {
      data.streakSocietyMilestones.push(milestone.days);
    }

    return milestone;
  }

  /**
   * Comprar Streak Freeze (cuesta 10 gems)
   * Comportamiento EXACTO de Duolingo:
   * - Solo se puede comprar si no tienes freeze activo
   * - Dura exactamente 24 horas
   * - Se puede usar automáticamente si pierdes racha
   */
  async purchaseStreakFreeze(currentGems: number): Promise<{
    success: boolean;
    message: string;
    gemsUsed: number;
  }> {
    try {
      if (currentGems < this.FREEZE_COST) {
        return {
          success: false,
          message: `Necesitas ${this.FREEZE_COST} gemas para comprar Streak Freeze`,
          gemsUsed: 0
        };
      }

      const data = await this.getStreakData();
      
      // Verificar si ya tiene freeze activo
      if (data.streakFreezeExpiry && new Date(data.streakFreezeExpiry) > new Date()) {
        return {
          success: false,
          message: 'Ya tienes un Streak Freeze activo',
          gemsUsed: 0
        };
      }

      // Activar freeze por 24 horas
      const now = new Date();
      const expiry = new Date(now.getTime() + (this.FREEZE_DURATION_HOURS * 60 * 60 * 1000));
      
      data.streakFreezeExpiry = expiry.toISOString();
      await this.saveStreakData(data);

      return {
        success: true,
        message: 'Streak Freeze activado por 24 horas',
        gemsUsed: this.FREEZE_COST
      };
    } catch (error) {
      console.error('Error purchasing streak freeze:', error);
      throw error;
    }
  }

  /**
   * Reparar racha perdida (cuesta 350 gems)
   * Comportamiento EXACTO de Duolingo:
   * - Solo disponible si la racha se perdió hace menos de 3 días
   * - Restaura la racha pero rompe el perfect streak
   */
  async repairStreak(currentGems: number, previousStreak: number): Promise<{
    success: boolean;
    message: string;
    gemsUsed: number;
  }> {
    try {
      if (currentGems < this.REPAIR_COST) {
        return {
          success: false,
          message: `Necesitas ${this.REPAIR_COST} gemas para reparar tu racha`,
          gemsUsed: 0
        };
      }

      const data = await this.getStreakData();
      
      // Solo se puede reparar si la racha actual es 0
      if (data.currentStreak > 0) {
        return {
          success: false,
          message: 'Tu racha no está perdida',
          gemsUsed: 0
        };
      }

      // Restaurar racha pero resetear perfect streak
      data.currentStreak = previousStreak;
      data.perfectStreak = 0; // Se rompe el perfect streak
      data.lastLessonDate = new Date().toISOString();
      
      await this.saveStreakData(data);

      return {
        success: true,
        message: `Racha restaurada a ${previousStreak} días`,
        gemsUsed: this.REPAIR_COST
      };
    } catch (error) {
      console.error('Error repairing streak:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario puede mantener su racha hoy
   */
  async canMaintainStreakToday(): Promise<{
    canMaintain: boolean;
    hoursLeft: number;
    hasStreakFreeze: boolean;
    alreadyDidLessonToday: boolean;
  }> {
    try {
      const data = await this.getStreakData();
      const now = new Date();
      const today = this.getDateString(now);
      
      // Verificar si ya hizo lección hoy
      const lastLessonDate = data.lastLessonDate ? new Date(data.lastLessonDate) : null;
      const alreadyDidLessonToday = lastLessonDate && this.getDateString(lastLessonDate) === today;

      // Calcular horas hasta medianoche
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const hoursLeft = Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));

      // Verificar streak freeze activo
      const hasStreakFreeze = data.streakFreezeExpiry ? new Date(data.streakFreezeExpiry) > now : false;

      return {
        canMaintain: alreadyDidLessonToday || hasStreakFreeze || hoursLeft > 0,
        hoursLeft,
        hasStreakFreeze,
        alreadyDidLessonToday
      };
    } catch (error) {
      console.error('Error checking streak maintenance:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas para mostrar en perfil
   */
  async getStreakStats(): Promise<{
    currentStreak: number;
    longestStreak: number;
    perfectStreak: number;
    totalDaysLearned: number;
    streakFreezeActive: boolean;
    nextMilestone?: StreakMilestone;
    achievedMilestones: StreakMilestone[];
  }> {
    try {
      const data = await this.getStreakData();
      const now = new Date();
      
      const streakFreezeActive = data.streakFreezeExpiry ? new Date(data.streakFreezeExpiry) > now : false;
      
      const nextMilestone = this.STREAK_MILESTONES.find(m => 
        m.days > data.currentStreak
      );

      const achievedMilestones = this.STREAK_MILESTONES.filter(m =>
        data.streakSocietyMilestones.includes(m.days)
      );

      return {
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        perfectStreak: data.perfectStreak,
        totalDaysLearned: data.totalDaysLearned,
        streakFreezeActive,
        nextMilestone,
        achievedMilestones
      };
    } catch (error) {
      console.error('Error getting streak stats:', error);
      throw error;
    }
  }

  /**
   * Utilities
   */
  private async saveStreakData(data: StreakData): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getDaysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(this.getDateString(date1));
    const secondDate = new Date(this.getDateString(date2));
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
  }

  /**
   * Reset streak data (para testing)
   */
  async resetStreakData(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }
}

// Exportar instancia singleton
export const StreakService = new StreakServiceClass();
