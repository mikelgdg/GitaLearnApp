import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { LessonSummary } from '../types';
import { MOTIVATIONAL_MESSAGES } from '../constants/sections';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { DUOLINGO_TEXT_VARIANTS } from '../constants/DuolingoTypography';
import { AnimatedButton } from './AnimatedButton';
import { ConfettiExplosion } from './ParticleEffects';
import { NeomorphicCard } from './NeomorphicCard';

interface LessonCompletionScreenProps {
  lessonSummary: LessonSummary;
  onContinue: () => void;
  visible: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    mascotContainer: new Animated.Value(0),
  });

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      startAnimations();
      setShowConfetti(true);
      // Ocultar confetti después de 3 segundos
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [visible]);

  const startAnimations = () => {
    // Animación de entrada principal
    Animated.parallel([
      Animated.timing(animatedValues.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValues.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación del área de la mascota
    setTimeout(() => {
      Animated.spring(animatedValues.mascotContainer, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 200);

    // Counters animados con delay escalonado
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
    }, 600);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={ARJU_COLORS.BACKGROUND_SAGE} />
      
      {/* ✨ Confetti Effect */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <ConfettiExplosion 
            trigger={showConfetti}
            particleCount={50}
            colors={[
              ARJU_COLORS.PRIMARY_BLUE,
              ARJU_COLORS.ACCENT_ORANGE,
              ARJU_COLORS.DUOLINGO_GREEN,
              '#FFC800'
            ]}
          />
        </View>
      )}

      <Animated.View
        style={[
          styles.container,
          {
            opacity: animatedValues.opacity,
            transform: [{ scale: animatedValues.scale }],
          },
        ]}
      >
        {/* 🎭 Área para futura mascota */}
        <Animated.View
          style={[
            styles.mascotArea,
            {
              opacity: animatedValues.mascotContainer,
              transform: [
                {
                  translateY: animatedValues.mascotContainer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <NeomorphicCard 
            variant="elevated" 
            style={styles.mascotPlaceholder}
          >
            <View style={styles.mascotContent}>
              <Text style={styles.mascotPlaceholderEmoji}>🎉</Text>
              <Text style={styles.mascotPlaceholderText}>¡Arju te felicita!</Text>
              <Text style={styles.mascotSubText}>(Mascota próximamente)</Text>
            </View>
          </NeomorphicCard>
        </Animated.View>

        {/* 🏆 Header con resultado */}
        <View style={styles.header}>
          <NeomorphicCard variant="elevated" style={styles.resultCard}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✅</Text>
            </View>
            <Text style={styles.completionTitle}>¡Lección Completada!</Text>
            <Text style={styles.completionSubtitle}>
              {getPerformanceLevel() === 'perfect' ? '¡Perfecto!' : 
               getPerformanceLevel() === 'excellent' ? '¡Excelente!' :
               getPerformanceLevel() === 'good' ? '¡Buen trabajo!' : 
               '¡Sigue practicando!'}
            </Text>
          </NeomorphicCard>
        </View>

        {/* 📊 Stats principales */}
        <View style={styles.statsContainer}>
          <StatItem
            icon="⭐"
            label="XP Ganado"
            animatedValue={animatedValues.xpCount}
            color={ARJU_COLORS.PRIMARY_BLUE}
          />
          <StatItem
            icon="💎"
            label="Gemas"
            animatedValue={animatedValues.gemsCount}
            color={ARJU_COLORS.ACCENT_ORANGE}
          />
          <StatItem
            icon="🎯"
            label="Precisión"
            animatedValue={animatedValues.accuracyCount}
            suffix="%"
            color={ARJU_COLORS.DUOLINGO_GREEN}
          />
        </View>

        {/* 🔥 Progreso de Streak */}
        <NeomorphicCard variant="flat" style={styles.streakCard}>
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
        </NeomorphicCard>

        {/* 💭 Frase motivadora */}
        <NeomorphicCard variant="pressed" style={styles.motivationalCard}>
          <Text style={styles.motivationalText}>
            "{getRandomMotivationalMessage()}"
          </Text>
        </NeomorphicCard>

        {/* 🏅 Achievements desbloqueados */}
        {lessonSummary.achievementsUnlocked.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.achievementsTitle}>¡Logros Desbloqueados!</Text>
            {lessonSummary.achievementsUnlocked.map((achievement) => (
              <NeomorphicCard key={achievement.id} variant="elevated" style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
              </NeomorphicCard>
            ))}
          </View>
        )}

        {/* 🚀 Botón continuar */}
        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="Continuar"
            onPress={onContinue}
            variant="success"
            size="large"
            glowing={true}
            style={styles.continueButton}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// 📊 Componente para cada stat item
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
    <NeomorphicCard variant="elevated" style={styles.statCard}>
      <View style={styles.statItem}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statValue, { color }]}>
          {displayValue}{suffix}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </NeomorphicCard>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ARJU_COLORS.BACKGROUND_SAGE,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 40 : 40, // 🔝 Espacio extra para cámara frontal
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10, // Reducido porque SafeAreaView ya da espacio arriba
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  
  // 🎭 Área de mascota
  mascotArea: {
    marginBottom: 20,
    alignItems: 'center',
  },
  mascotPlaceholder: {
    width: screenWidth * 0.7,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotContent: {
    alignItems: 'center',
  },
  mascotPlaceholderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  mascotPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: ARJU_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  mascotSubText: {
    fontSize: 12,
    color: ARJU_COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
  },

  // 🏆 Header
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  resultCard: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  checkmarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ARJU_COLORS.DUOLINGO_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkmark: {
    fontSize: 28,
    color: 'white',
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ARJU_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 5,
  },
  completionSubtitle: {
    fontSize: 16,
    color: ARJU_COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },

  // 📊 Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: ARJU_COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },

  // 🔥 Streak
  streakCard: {
    padding: 15,
    marginBottom: 15,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: ARJU_COLORS.PRIMARY_BLUE,
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
    backgroundColor: ARJU_COLORS.PRIMARY_BLUE,
    borderRadius: 4,
  },

  // 💭 Motivational
  motivationalCard: {
    padding: 20,
    marginBottom: 20,
  },
  motivationalText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: ARJU_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 24,
  },

  // 🏅 Achievements
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ARJU_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
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
    color: ARJU_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: ARJU_COLORS.TEXT_LIGHT,
  },

  // 🚀 Button
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  continueButton: {
    width: '80%',
  },
});
