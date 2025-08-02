import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LessonSummary } from '../types';
import { DUOLINGO_COLORS, MOTIVATIONAL_MESSAGES } from '../constants/sections';

interface LessonCompletionScreenProps {
  lessonSummary: LessonSummary;
  onContinue: () => void;
  visible: boolean;
}

export default function LessonCompletionScreen({
  lessonSummary,
  onContinue,
  visible,
}: LessonCompletionScreenProps) {
  const [animatedValues] = useState({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.8),
    xpCount: new Animated.Value(0),
    gemsCount: new Animated.Value(0),
    accuracyCount: new Animated.Value(0),
    confetti: new Animated.Value(0),
  });

  useEffect(() => {
    if (visible) {
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(animatedValues.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValues.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de confetti
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValues.confetti, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.confetti, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Counters animados con delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(animatedValues.xpCount, {
          toValue: lessonSummary.xpGained,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues.gemsCount, {
          toValue: lessonSummary.gemsEarned,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues.accuracyCount, {
          toValue: lessonSummary.accuracy,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    }, 500);
  };

  const getPerformanceLevel = () => {
    if (lessonSummary.accuracy === 100) return 'perfect';
    if (lessonSummary.accuracy >= 85) return 'excellent';
    if (lessonSummary.accuracy >= 70) return 'good';
    return 'needs_improvement';
  };

  const getRandomMotivationalMessage = () => {
    const level = getPerformanceLevel();
    const messages = MOTIVATIONAL_MESSAGES[level];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animatedValues.opacity,
          transform: [{ scale: animatedValues.scale }],
        },
      ]}
    >
      {/* Confetti Background */}
      <ConfettiBackground animatedValue={animatedValues.confetti} />

      {/* Header con checkmark */}
      <View style={styles.header}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✅</Text>
        </View>
        <Text style={styles.completionTitle}>¡Lección Completada!</Text>
      </View>

      {/* Stats principales */}
      <View style={styles.statsContainer}>
        <StatItem
          icon="⭐"
          label="XP Ganado"
          animatedValue={animatedValues.xpCount}
          color={DUOLINGO_COLORS.XP}
        />
        <StatItem
          icon="💎"
          label="Gemas"
          animatedValue={animatedValues.gemsCount}
          color={DUOLINGO_COLORS.GEMS}
        />
        <StatItem
          icon="🎯"
          label="Precisión"
          animatedValue={animatedValues.accuracyCount}
          suffix="%"
          color={DUOLINGO_COLORS.SUCCESS}
        />
      </View>

      {/* Progreso de Streak */}
      <View style={styles.streakContainer}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>
          {lessonSummary.streakDays} días consecutivos
        </Text>
        <View style={styles.streakProgress}>
          <View
            style={[
              styles.streakProgressFill,
              { width: `${Math.min(100, (lessonSummary.streakDays / 7) * 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Frase motivadora */}
      <View style={styles.motivationalContainer}>
        <Text style={styles.motivationalText}>
          {getRandomMotivationalMessage()}
        </Text>
      </View>

      {/* Achievements desbloqueados */}
      {lessonSummary.achievementsUnlocked.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>¡Logros Desbloqueados!</Text>
          {lessonSummary.achievementsUnlocked.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Botón continuar */}
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Componente para cada stat item
const StatItem: React.FC<{
  icon: string;
  label: string;
  animatedValue: Animated.Value;
  suffix?: string;
  color: string;
}> = ({ icon, label, animatedValue, suffix = '', color }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>
        {displayValue}{suffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// Componente para confetti animado
const ConfettiBackground: React.FC<{ animatedValue: Animated.Value }> = ({
  animatedValue,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const confettiPieces = Array.from({ length: 15 }, (_, i) => i);

  return (
    <View style={styles.confettiContainer}>
      {confettiPieces.map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.confettiPiece,
            {
              left: Math.random() * screenWidth,
              backgroundColor: [
                DUOLINGO_COLORS.SUCCESS,
                DUOLINGO_COLORS.GEMS,
                DUOLINGO_COLORS.XP,
                DUOLINGO_COLORS.WARNING,
              ][Math.floor(Math.random() * 4)],
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 600],
                  }),
                },
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DUOLINGO_COLORS.SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: 'white',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  streakIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: DUOLINGO_COLORS.STREAK,
    marginBottom: 12,
  },
  streakProgress: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: DUOLINGO_COLORS.STREAK,
    borderRadius: 4,
  },
  motivationalContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  motivationalText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: DUOLINGO_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  achievementsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DUOLINGO_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT_SECONDARY,
  },
  continueButton: {
    backgroundColor: DUOLINGO_COLORS.SUCCESS,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});
