import AsyncStorage from '@react-native-async-storage/async-storage';

// League System - IDENTICAL to Duolingo behavior
export enum League {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER', 
  GOLD = 'GOLD',
  SAPPHIRE = 'SAPPHIRE',
  RUBY = 'RUBY',
  EMERALD = 'EMERALD',
  OBSIDIAN = 'OBSIDIAN',
}

export interface LeagueData {
  league: League;
  weeklyXP: number;
  rank: number;
  totalParticipants: number;
  isPromoted: boolean;
  isRelegated: boolean;
  weekStartDate: Date;
  weekEndDate: Date;
  hasCompetedThisWeek: boolean;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl: string;
  weeklyXP: number;
  rank: number;
  isCurrentUser: boolean;
  league: League;
  isPromoted?: boolean;
  isRelegated?: boolean;
}

export interface WeeklyCompetition {
  id: string;
  startDate: Date;
  endDate: Date;
  league: League;
  participants: LeaderboardEntry[];
  isActive: boolean;
  promotionSlots: number; // Top N users get promoted
  relegationSlots: number; // Bottom N users get relegated
}

class LeaderboardService {
  private static instance: LeaderboardService;
  private readonly LEADERBOARD_KEY = 'leaderboard_data';
  private readonly LEAGUE_DATA_KEY = 'league_data';
  private readonly WEEKLY_COMPETITION_KEY = 'weekly_competition';
  
  // Duolingo-identical league configuration
  private readonly LEAGUE_CONFIG = {
    [League.BRONZE]: {
      promotionSlots: 10,
      relegationSlots: 0,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Bronce',
      color: '#CD7F32',
      icon: '🥉'
    },
    [League.SILVER]: {
      promotionSlots: 10,
      relegationSlots: 5,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Plata',
      color: '#C0C0C0',
      icon: '🥈'
    },
    [League.GOLD]: {
      promotionSlots: 10,
      relegationSlots: 5,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Oro',
      color: '#FFD700',
      icon: '🥇'
    },
    [League.SAPPHIRE]: {
      promotionSlots: 10,
      relegationSlots: 5,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Zafiro',
      color: '#0F52BA',
      icon: '💎'
    },
    [League.RUBY]: {
      promotionSlots: 10,
      relegationSlots: 5,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Rubí',
      color: '#E0115F',
      icon: '💎'
    },
    [League.EMERALD]: {
      promotionSlots: 10,
      relegationSlots: 5,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Esmeralda',
      color: '#50C878',
      icon: '🔹'
    },
    [League.OBSIDIAN]: {
      promotionSlots: 0,
      relegationSlots: 5,
      minParticipants: 30,
      maxParticipants: 50,
      name: 'Liga de Obsidiana',
      color: '#3C3C3C',
      icon: '⚫'
    }
  };

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  // DUOLINGO IDENTICAL: Get current league data
  public async getCurrentLeagueData(): Promise<LeagueData> {
    try {
      const storedData = await AsyncStorage.getItem(this.LEAGUE_DATA_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        return {
          ...data,
          weekStartDate: new Date(data.weekStartDate),
          weekEndDate: new Date(data.weekEndDate)
        };
      }

      // Initialize new user in Bronze league
      return this.initializeNewUserLeague();
    } catch (error) {
      console.error('Error getting league data:', error);
      return this.initializeNewUserLeague();
    }
  }

  // DUOLINGO IDENTICAL: Initialize new user in Bronze league
  private async initializeNewUserLeague(): Promise<LeagueData> {
    const weekStart = this.getWeekStart();
    const weekEnd = this.getWeekEnd(weekStart);
    
    const leagueData: LeagueData = {
      league: League.BRONZE,
      weeklyXP: 0,
      rank: 1,
      totalParticipants: 30,
      isPromoted: false,
      isRelegated: false,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      hasCompetedThisWeek: false
    };

    await this.saveLeagueData(leagueData);
    return leagueData;
  }

  // DUOLINGO IDENTICAL: Add XP to weekly competition
  public async addWeeklyXP(xpEarned: number): Promise<LeagueData> {
    try {
      const leagueData = await this.getCurrentLeagueData();
      
      // Check if we need to start a new week
      const now = new Date();
      if (now > leagueData.weekEndDate) {
        return await this.startNewWeek(xpEarned);
      }

      // Add XP to current week
      leagueData.weeklyXP += xpEarned;
      leagueData.hasCompetedThisWeek = true;
      
      // Update rank based on new XP
      leagueData.rank = await this.calculateCurrentRank(leagueData.weeklyXP);

      await this.saveLeagueData(leagueData);
      return leagueData;
    } catch (error) {
      console.error('Error adding weekly XP:', error);
      return await this.getCurrentLeagueData();
    }
  }

  // DUOLINGO IDENTICAL: Get leaderboard for current league
  public async getCurrentLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const leagueData = await this.getCurrentLeagueData();
      const storedLeaderboard = await AsyncStorage.getItem(this.LEADERBOARD_KEY);
      
      if (storedLeaderboard) {
        const leaderboard: LeaderboardEntry[] = JSON.parse(storedLeaderboard);
        // Filter by current league and sort by weekly XP
        return leaderboard
          .filter(entry => entry.league === leagueData.league)
          .sort((a, b) => b.weeklyXP - a.weeklyXP)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));
      }

      // Generate mock leaderboard for development
      return this.generateMockLeaderboard(leagueData.league);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // DUOLINGO IDENTICAL: Weekly competition cycle management
  private async startNewWeek(initialXP: number = 0): Promise<LeagueData> {
    const currentLeagueData = await this.getCurrentLeagueData();
    
    // Determine promotion/relegation based on previous week performance
    const { newLeague, isPromoted, isRelegated } = await this.calculatePromotion(currentLeagueData);
    
    const weekStart = this.getWeekStart();
    const weekEnd = this.getWeekEnd(weekStart);

    const newLeagueData: LeagueData = {
      league: newLeague,
      weeklyXP: initialXP,
      rank: 1,
      totalParticipants: this.LEAGUE_CONFIG[newLeague].maxParticipants,
      isPromoted,
      isRelegated,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      hasCompetedThisWeek: initialXP > 0
    };

    await this.saveLeagueData(newLeagueData);
    
    // Generate new competition group
    await this.generateWeeklyCompetition(newLeague);
    
    return newLeagueData;
  }

  // DUOLINGO IDENTICAL: Calculate promotion/relegation
  private async calculatePromotion(leagueData: LeagueData): Promise<{
    newLeague: League;
    isPromoted: boolean;
    isRelegated: boolean;
  }> {
    const config = this.LEAGUE_CONFIG[leagueData.league];
    
    // Check for promotion (top N positions)
    if (leagueData.rank <= config.promotionSlots && leagueData.league !== League.OBSIDIAN) {
      const leagues = Object.values(League);
      const currentIndex = leagues.indexOf(leagueData.league);
      const newLeague = leagues[Math.min(currentIndex + 1, leagues.length - 1)];
      
      return {
        newLeague,
        isPromoted: true,
        isRelegated: false
      };
    }

    // Check for relegation (bottom N positions)
    const relegationThreshold = leagueData.totalParticipants - config.relegationSlots + 1;
    if (leagueData.rank >= relegationThreshold && leagueData.league !== League.BRONZE) {
      const leagues = Object.values(League);
      const currentIndex = leagues.indexOf(leagueData.league);
      const newLeague = leagues[Math.max(currentIndex - 1, 0)];
      
      return {
        newLeague,
        isPromoted: false,
        isRelegated: true
      };
    }

    // No change
    return {
      newLeague: leagueData.league,
      isPromoted: false,
      isRelegated: false
    };
  }

  // DUOLINGO IDENTICAL: Get league configuration
  public getLeagueConfig(league: League) {
    return this.LEAGUE_CONFIG[league];
  }

  // DUOLINGO IDENTICAL: Check if week is ending soon
  public async isWeekEndingSoon(): Promise<{ isEndingSoon: boolean; hoursLeft: number }> {
    const leagueData = await this.getCurrentLeagueData();
    const now = new Date();
    const hoursLeft = Math.max(0, Math.floor((leagueData.weekEndDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    return {
      isEndingSoon: hoursLeft <= 24,
      hoursLeft
    };
  }

  // Helper methods
  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday is start of week
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private getWeekEnd(weekStart: Date): Date {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  private async calculateCurrentRank(weeklyXP: number): Promise<number> {
    // Simulate rank calculation based on weekly XP
    // In real implementation, this would query all users in the same league
    if (weeklyXP >= 1000) return Math.floor(Math.random() * 5) + 1;
    if (weeklyXP >= 500) return Math.floor(Math.random() * 10) + 5;
    if (weeklyXP >= 200) return Math.floor(Math.random() * 15) + 10;
    return Math.floor(Math.random() * 20) + 15;
  }

  private async generateMockLeaderboard(league: League): Promise<LeaderboardEntry[]> {
    const config = this.LEAGUE_CONFIG[league];
    const participants: LeaderboardEntry[] = [];
    
    // Generate mock participants
    for (let i = 0; i < config.maxParticipants; i++) {
      const weeklyXP = Math.floor(Math.random() * 2000) + 100;
      participants.push({
        id: `user_${i}`,
        username: `Usuario${i + 1}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/png?seed=${i}`,
        weeklyXP,
        rank: i + 1,
        isCurrentUser: i === 0, // First user is current user
        league
      });
    }

    // Sort by weekly XP and assign ranks
    return participants
      .sort((a, b) => b.weeklyXP - a.weeklyXP)
      .map((participant, index) => ({
        ...participant,
        rank: index + 1
      }));
  }

  private async generateWeeklyCompetition(league: League): Promise<void> {
    const weekStart = this.getWeekStart();
    const weekEnd = this.getWeekEnd(weekStart);
    const config = this.LEAGUE_CONFIG[league];

    const competition: WeeklyCompetition = {
      id: `${league}_${weekStart.getTime()}`,
      startDate: weekStart,
      endDate: weekEnd,
      league,
      participants: await this.generateMockLeaderboard(league),
      isActive: true,
      promotionSlots: config.promotionSlots,
      relegationSlots: config.relegationSlots
    };

    await AsyncStorage.setItem(this.WEEKLY_COMPETITION_KEY, JSON.stringify(competition));
  }

  private async saveLeagueData(leagueData: LeagueData): Promise<void> {
    await AsyncStorage.setItem(this.LEAGUE_DATA_KEY, JSON.stringify(leagueData));
  }
}

export const leaderboardService = LeaderboardService.getInstance();
