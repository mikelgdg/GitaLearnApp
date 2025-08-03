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
import { DUOLINGO_TEXT_VARIANTS } from '../constants/DuolingoTypography';
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
  const [heartPulseAnim] = useState(new Animated.Value(1));

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
    const heartColor = gameState.hearts <= 1 ? '#FF4757' : '#FF6B35';
    const showTimer = gameState.hearts < gameState.maxHearts && nextHeartTime > 0;

    return (
      <TouchableOpacity 
        style={styles.statContainer} 
        onPress={() => {
          audioService.playBubbleTap();
          if (gameState.hearts <= 0) {
            audioService.playHeartLoss();
          }
          onHeartPress?.();
        }}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.heartContainer,
            { transform: [{ scale: heartPulseAnim }] }
          ]}
        >
          <Ionicons name="heart" size={20} color={heartColor} />
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
        onPress={() => {
          audioService.playGemEarned();
          onGemPress?.();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.gemContainer}>
          <Ionicons name="diamond" size={18} color="#58CC02" />
          <Text style={[styles.statText, { color: '#58CC02' }]}>
            {gameState.gems}
          </Text>
        </View>
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
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={18} color="#FF9500" />
          <Text style={[styles.statText, { color: '#FF9500' }]}>
            {gameState.streak}
          </Text>
        </View>
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
