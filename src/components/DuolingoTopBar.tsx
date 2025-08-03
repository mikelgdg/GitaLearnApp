import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameState } from '../types';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import HeartService from '../services/HeartService';
import { audioService } from '../services/AudioService';

interface DuolingoTopBarProps {
  gameState: GameState;
  onGameStateUpdate: (newState: GameState) => void;
  onHeartPress?: () => void;
  onGemPress?: () => void;
  onStreakPress?: () => void;
}

const DuolingoTopBar: React.FC<DuolingoTopBarProps> = ({
  gameState,
  onGameStateUpdate,
  onHeartPress,
  onGemPress,
  onStreakPress,
}) => {
  const [nextHeartTime, setNextHeartTime] = useState<number>(0);
  
  // 🎯 EXACT DUOLINGO ANIMATIONS
  const [heartPulseAnim] = useState(new Animated.Value(1));
  const [gemBounceAnim] = useState(new Animated.Value(1));
  const [streakFlameAnim] = useState(new Animated.Value(1));
  const [heartShakeAnim] = useState(new Animated.Value(0));

  // 💓 Heart pulse animation (when low hearts)
  useEffect(() => {
    if (gameState.hearts <= 1) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(heartPulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(heartPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [gameState.hearts, heartPulseAnim]);

  // 🔥 Streak flame pulse animation
  useEffect(() => {
    const flameAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(streakFlameAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(streakFlameAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    flameAnimation.start();
    return () => flameAnimation.stop();
  }, [streakFlameAnim]);

  // 💎 Gem bounce on press
  const handleGemPress = () => {
    Animated.sequence([
      Animated.timing(gemBounceAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(gemBounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (onGemPress) onGemPress();
  };

  // ❤️ Heart press with shake if no hearts
  const handleHeartPress = () => {
    if (gameState.hearts === 0) {
      // Shake animation for empty hearts
      Animated.sequence([
        Animated.timing(heartShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(heartShakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(heartShakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(heartShakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    if (onHeartPress) onHeartPress();
  };

  // Timer para actualizar hearts y tiempo restante
  useEffect(() => {
    const updateTimer = setInterval(async () => {
      // Actualizar hearts si es necesario
      const updatedState = HeartService.updateHeartsIfNeeded(gameState);
      if (updatedState.hearts !== gameState.hearts) {
        onGameStateUpdate(updatedState);
      }

      // Actualizar tiempo restante para próximo heart
      const timeRemaining = HeartService.getNextHeartTimeMinutes(gameState);
      setNextHeartTime(timeRemaining);
    }, 60000); // Cada minuto

    // Inicial
    const timeRemaining = HeartService.getNextHeartTimeMinutes(gameState);
    setNextHeartTime(timeRemaining);

    return () => clearInterval(updateTimer);
  }, [gameState]);

  // Animación de pulse para hearts bajos
  useEffect(() => {
    if (gameState.hearts <= 1) {
      const pulseAnimation = Animated.sequence([
        Animated.timing(heartPulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      const loop = Animated.loop(pulseAnimation);
      loop.start();

      return () => loop.stop();
    }
  }, [gameState.hearts]);

  const renderHeartSection = () => {
    const heartColor = gameState.hearts <= 1 ? DUOLINGO_COLORS.RED.DEFAULT : DUOLINGO_COLORS.RED.LIGHT;
    const showTimer = gameState.hearts < gameState.maxHearts && nextHeartTime > 0;

    return (
      <TouchableOpacity 
        style={styles.statContainer} 
        onPress={handleHeartPress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.heartContainer,
            { 
              transform: [
                { scale: heartPulseAnim },
                { translateX: heartShakeAnim }
              ] 
            }
          ]}
        >
          <Ionicons name="heart" size={22} color={heartColor} />
          <Text style={[styles.statText, { color: heartColor }]}>
            {gameState.hearts}
          </Text>
        </Animated.View>
        {showTimer && (
          <Text style={styles.timerText}>
            {HeartService.formatTimeUntilNextHeart(nextHeartTime)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hearts Section */}
      {renderHeartSection()}

      {/* Gems Section */}
      <TouchableOpacity 
        style={styles.statContainer} 
        onPress={handleGemPress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.gemContainer,
            { transform: [{ scale: gemBounceAnim }] }
          ]}
        >
          <Ionicons name="diamond" size={20} color={DUOLINGO_COLORS.GREEN.DEFAULT} />
          <Text style={[styles.statText, { color: DUOLINGO_COLORS.GREEN.DEFAULT }]}>
            {gameState.gems}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Streak Section */}
      <TouchableOpacity 
        style={styles.statContainer} 
        onPress={() => {
          audioService.playStreakAchieved();
          onStreakPress?.();
        }}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.streakContainer,
            { transform: [{ scale: streakFlameAnim }] }
          ]}
        >
          <Ionicons name="flame" size={20} color={DUOLINGO_COLORS.YELLOW.DEFAULT} />
          <Text style={[styles.statText, { color: DUOLINGO_COLORS.YELLOW.DEFAULT }]}>
            {gameState.streak}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* XP Section */}
      <View style={styles.xpContainer}>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{gameState.xp}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: DUOLINGO_COLORS.GRAY[200],
    elevation: 2,
    shadowColor: DUOLINGO_COLORS.GRAY[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statContainer: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: DUOLINGO_COLORS.RED.BACKGROUND,
    borderRadius: 15,
    minWidth: 50,
    justifyContent: 'center',
  },
  gemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: DUOLINGO_COLORS.BLUE.BACKGROUND,
    borderRadius: 15,
    minWidth: 50,
    justifyContent: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: DUOLINGO_COLORS.YELLOW.BACKGROUND,
    borderRadius: 15,
    minWidth: 50,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  timerText: {
    fontSize: 10,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 2,
    fontWeight: '500',
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  xpText: {
    color: DUOLINGO_COLORS.TEXT.INVERSE,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DuolingoTopBar;
