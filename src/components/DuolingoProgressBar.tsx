import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../constants/DuolingoTypography';

interface DuolingoProgressBarProps {
  progress: number; // 0 to 1
  totalQuestions: number;
  currentQuestion: number;
  animated?: boolean;
  showNumbers?: boolean;
}

const DuolingoProgressBar: React.FC<DuolingoProgressBarProps> = ({
  progress,
  totalQuestions,
  currentQuestion,
  animated = true,
  showNumbers = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 🎯 Animate progress changes
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated, progressAnim]);

  // ✨ Pulse animation when progress increases
  useEffect(() => {
    if (progress > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentQuestion, pulseAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Progress Numbers */}
      {showNumbers && (
        <Text style={styles.progressText}>
          {currentQuestion} de {totalQuestions}
        </Text>
      )}

      {/* Progress Bar Container */}
      <Animated.View 
        style={[
          styles.progressBarContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        {/* Background Track */}
        <View style={styles.progressTrack} />
        
        {/* Progress Fill */}
        <Animated.View
          style={[
            styles.progressFill,
            { width: progressWidth }
          ]}
        >
          {/* Gradient Effect */}
          <View style={styles.progressGradient} />
          
          {/* Shine Effect */}
          <View style={styles.progressShine} />
        </Animated.View>

        {/* Progress Segments (visual indicators) */}
        <View style={styles.segmentsContainer}>
          {Array.from({ length: totalQuestions - 1 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                { left: `${((index + 1) / totalQuestions) * 100}%` }
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressText: {
    ...TYPOGRAPHY.CAPTION,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 16,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DUOLINGO_COLORS.GRAY[200],
    borderRadius: 8,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  progressShine: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 6,
  },
  segmentsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  segment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
    marginLeft: -1,
  },
});

export default DuolingoProgressBar;
