import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types';

export class HeartService {
  private static readonly GAME_STATE_KEY = 'GitaLearn_GameState';
  private static readonly HEART_REFILL_MINUTES = 30;
  private static readonly MAX_HEARTS = 5;

  // Obtener estado inicial por defecto
  static getDefaultGameState(): GameState {
    return {
      xp: 0,
      gems: 0,
      hearts: this.MAX_HEARTS, // ✅ Empezar con 5 hearts
      maxHearts: this.MAX_HEARTS,
      streak: 0,
      lastCompletedDate: null,
      heartsLastRefill: new Date().toISOString(),
      heartRefillTimeMinutes: this.HEART_REFILL_MINUTES,
      lastHeartLoss: null,
    };
  }

  // Cargar estado del juego
  static async loadGameState(): Promise<GameState> {
    try {
      const stored = await AsyncStorage.getItem(this.GAME_STATE_KEY);
      if (stored) {
        const gameState = JSON.parse(stored) as GameState;
        // Verificar hearts refill automático
        return this.updateHeartsIfNeeded(gameState);
      }
      // Primera vez - crear estado inicial
      const defaultState = this.getDefaultGameState();
      await this.saveGameState(defaultState);
      return defaultState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return this.getDefaultGameState();
    }
  }

  // Guardar estado del juego
  static async saveGameState(gameState: GameState): Promise<void> {
    try {
      await AsyncStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }

  // Actualizar hearts si ha pasado tiempo suficiente
  static updateHeartsIfNeeded(gameState: GameState): GameState {
    if (gameState.hearts >= gameState.maxHearts) {
      return gameState; // Ya tiene hearts completos
    }

    const now = new Date();
    const lastRefill = gameState.heartsLastRefill 
      ? new Date(gameState.heartsLastRefill) 
      : now;

    const minutesPassed = Math.floor((now.getTime() - lastRefill.getTime()) / (1000 * 60));
    const heartsToAdd = Math.floor(minutesPassed / this.HEART_REFILL_MINUTES);

    if (heartsToAdd > 0) {
      const newHearts = Math.min(
        gameState.hearts + heartsToAdd, 
        gameState.maxHearts
      );
      
      return {
        ...gameState,
        hearts: newHearts,
        heartsLastRefill: new Date(
          lastRefill.getTime() + (heartsToAdd * this.HEART_REFILL_MINUTES * 60 * 1000)
        ).toISOString(),
      };
    }

    return gameState;
  }

  // Perder un heart
  static async loseHeart(gameState: GameState): Promise<GameState> {
    const newGameState = {
      ...gameState,
      hearts: Math.max(0, gameState.hearts - 1),
      lastHeartLoss: new Date().toISOString(),
      heartsLastRefill: gameState.hearts === gameState.maxHearts 
        ? new Date().toISOString() // Empezar timer si tenía hearts completos
        : gameState.heartsLastRefill,
    };

    await this.saveGameState(newGameState);
    return newGameState;
  }

  // Ganar hearts (shop, etc)
  static async gainHearts(gameState: GameState, amount: number): Promise<GameState> {
    const newGameState = {
      ...gameState,
      hearts: Math.min(gameState.hearts + amount, gameState.maxHearts),
    };

    await this.saveGameState(newGameState);
    return newGameState;
  }

  // Calcular tiempo restante para próximo heart
  static getNextHeartTimeMinutes(gameState: GameState): number {
    if (gameState.hearts >= gameState.maxHearts) {
      return 0; // Hearts completos
    }

    const now = new Date();
    const lastRefill = gameState.heartsLastRefill 
      ? new Date(gameState.heartsLastRefill) 
      : now;

    const minutesPassed = Math.floor((now.getTime() - lastRefill.getTime()) / (1000 * 60));
    const minutesUntilNext = this.HEART_REFILL_MINUTES - (minutesPassed % this.HEART_REFILL_MINUTES);
    
    return minutesUntilNext;
  }

  // Formatear tiempo restante para display
  static formatTimeUntilNextHeart(minutes: number): string {
    if (minutes <= 0) return 'Ready!';
    
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}m`;
  }
}

export default HeartService;
