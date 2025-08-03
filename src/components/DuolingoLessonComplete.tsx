import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../constants/DuolingoTypography';
import DuolingoButton from './DuolingoButton';
import DuolingoProgressBar from './DuolingoProgressBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LessonStats {
  correctAnswers: number;
  totalQuestions: number;
  xpGained: number;
  streakCount: number;
  timeSpent: number; // en segundos
  accuracy: number; // porcentaje
}

interface DuolingoLessonCompleteProps {
  visible: boolean;
  stats: LessonStats;
  onContinue: () => void;
  onReview?: () => void;
  onShare?: () => void;
  lessonTitle?: string;
  levelUp?: boolean;
  newLevel?: number;
}

const DuolingoLessonComplete: React.FC<DuolingoLessonCompleteProps> = ({
  visible,
  stats,
  onContinue,
  onReview,
  onShare,
  lessonTitle = 'Lección completada',
  levelUp = false,
  newLevel,
}) => {
  // 🎯 Animations
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const xpCountAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // � State for animated values
  const [animatedXP, setAnimatedXP] = React.useState(0);

  // �🎨 Show/Hide animations
  useEffect(() => {
    if (visible) {
      showLessonComplete();
    } else {
      hideLessonComplete();
    }
  }, [visible]);

  const showLessonComplete = () => {
    // Screen slide up
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Celebration animation with delay
    setTimeout(() => {
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }, 300);

    // XP count up animation
    setTimeout(() => {
      const listener = xpCountAnim.addListener(({ value }) => {
        setAnimatedXP(Math.floor(value));
      });
      
      Animated.timing(xpCountAnim, {
        toValue: stats.xpGained,
        duration: 1500,
        useNativeDriver: false,
      }).start(() => {
        xpCountAnim.removeListener(listener);
      });
    }, 600);

    // Progress bar animation
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: stats.accuracy / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, 800);
  };

  const hideLessonComplete = () => {
    slideAnim.setValue(screenHeight);
    fadeAnim.setValue(0);
    celebrationScale.setValue(0);
    xpCountAnim.setValue(0);
    progressAnim.setValue(0);
    setAnimatedXP(0);
  };

  if (!visible) return null;

  // 🎯 Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Background Celebration */}
      <View style={styles.celebrationBackground}>
        {/* Confetti effect would go here */}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Celebration Icon */}
        <Animated.View
          style={[
            styles.celebrationContainer,
            { transform: [{ scale: celebrationScale }] }
          ]}
        >
          <View style={styles.celebrationIcon}>
            <Ionicons
              name={levelUp ? "trophy" : "checkmark-circle"}
              size={80}
              color={levelUp ? DUOLINGO_COLORS.YELLOW.DEFAULT : DUOLINGO_COLORS.GREEN.DEFAULT}
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>
          {levelUp ? `¡Nivel ${newLevel}!` : '¡Lección completada!'}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {levelUp ? '¡Has subido de nivel!' : lessonTitle}
        </Text>

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          {/* XP Gained */}
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: DUOLINGO_COLORS.YELLOW.BACKGROUND }]}>
              <Ionicons name="flash" size={24} color={DUOLINGO_COLORS.YELLOW.DEFAULT} />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statValue}>
                {animatedXP} XP
              </Text>
              <Text style={styles.statLabel}>ganados</Text>
            </View>
          </View>

          {/* Accuracy */}
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: DUOLINGO_COLORS.GREEN.BACKGROUND }]}>
              <Ionicons name="radio-button-on" size={24} color={DUOLINGO_COLORS.GREEN.DEFAULT} />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.accuracy}%</Text>
              <Text style={styles.statLabel}>precisión</Text>
            </View>
          </View>

          {/* Streak */}
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: DUOLINGO_COLORS.RED.BACKGROUND }]}>
              <Ionicons name="flame" size={24} color={DUOLINGO_COLORS.RED.DEFAULT} />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.streakCount}</Text>
              <Text style={styles.statLabel}>racha</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: DUOLINGO_COLORS.BLUE.BACKGROUND }]}>
              <Ionicons name="time" size={24} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statValue}>{formatTime(stats.timeSpent)}</Text>
              <Text style={styles.statLabel}>tiempo</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            {stats.correctAnswers} de {stats.totalQuestions} correctas
          </Text>
          <DuolingoProgressBar
            progress={stats.accuracy / 100}
            totalQuestions={stats.totalQuestions}
            currentQuestion={stats.correctAnswers}
            animated={true}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Secondary Actions */}
          {(onReview || onShare) && (
            <View style={styles.secondaryActions}>
              {onReview && (
                <TouchableOpacity style={styles.secondaryButton} onPress={onReview}>
                  <Ionicons name="eye" size={20} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
                  <Text style={styles.secondaryButtonText}>Revisar</Text>
                </TouchableOpacity>
              )}
              {onShare && (
                <TouchableOpacity style={styles.secondaryButton} onPress={onShare}>
                  <Ionicons name="share" size={20} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
                  <Text style={styles.secondaryButtonText}>Compartir</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Continue Button */}
          <DuolingoButton
            variant="primary"
            size="large"
            onPress={onContinue}
            style={styles.continueButton}
          >
            Continuar
          </DuolingoButton>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
    zIndex: 1000,
  },
  celebrationBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(88, 204, 2, 0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  celebrationContainer: {
    marginBottom: 32,
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DUOLINGO_COLORS.GREEN.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    ...TYPOGRAPHY.H1,
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.H3,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.SECONDARY,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    ...TYPOGRAPHY.H3,
    fontWeight: '700',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  statLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textTransform: 'uppercase',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressLabel: {
    ...TYPOGRAPHY.BODY,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: DUOLINGO_COLORS.BLUE.DEFAULT,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    color: DUOLINGO_COLORS.BLUE.DEFAULT,
    marginLeft: 6,
  },
  continueButton: {
    width: '100%',
  },
});

export default DuolingoLessonComplete;
