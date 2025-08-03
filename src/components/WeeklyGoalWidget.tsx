import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';

interface WeeklyGoalWidgetProps {
  currentXP: number;
  weeklyGoal: number;
  streakDays: number;
  onPress?: () => void;
}

const WeeklyGoalWidget: React.FC<WeeklyGoalWidgetProps> = ({
  currentXP,
  weeklyGoal,
  streakDays,
  onPress,
}) => {
  const [progressAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const progressPercentage = Math.min((currentXP / weeklyGoal) * 100, 100);
  const isCompleted = currentXP >= weeklyGoal;

  useEffect(() => {
    // Animar progreso
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Pulse animation si está completado
    if (isCompleted) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
      Animated.loop(pulse).start();
    }
  }, [currentXP, weeklyGoal, isCompleted]);

  const getDayOfWeek = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[new Date().getDay()];
  };

  const getMotivationalMessage = () => {
    if (isCompleted) {
      return '¡Meta semanal completada! 🎉';
    }
    if (progressPercentage >= 80) {
      return '¡Casi lo logras! 💪';
    }
    if (progressPercentage >= 50) {
      return '¡Vas por buen camino! 📈';
    }
    return '¡Comienza tu práctica diaria! ✨';
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            isCompleted 
              ? ['#58CC02', '#46A302'] 
              : [DUOLINGO_COLORS.BACKGROUND.PRIMARY, '#F0F8E8']
          }
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons 
                name="flame" 
                size={20} 
                color={isCompleted ? 'white' : DUOLINGO_COLORS.YELLOW.DEFAULT} 
              />
              <Text style={[
                styles.dayText,
                { color: isCompleted ? 'white' : DUOLINGO_COLORS.TEXT.PRIMARY }
              ]}>
                {getDayOfWeek()}
              </Text>
              <Text style={[
                styles.streakText,
                { color: isCompleted ? 'white' : DUOLINGO_COLORS.TEXT.SECONDARY }
              ]}>
                {streakDays} días
              </Text>
            </View>
            
            <View style={styles.headerRight}>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#58CC02" />
                </View>
              )}
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={[
              styles.goalText,
              { color: isCompleted ? 'white' : DUOLINGO_COLORS.TEXT.PRIMARY }
            ]}>
              Meta Semanal
            </Text>
            
            <View style={styles.xpContainer}>
              <Text style={[
                styles.currentXP,
                { color: isCompleted ? 'white' : DUOLINGO_COLORS.BLUE.DEFAULT }
              ]}>
                {currentXP}
              </Text>
              <Text style={[
                styles.goalXP,
                { color: isCompleted ? 'rgba(255,255,255,0.8)' : DUOLINGO_COLORS.TEXT.SECONDARY }
              ]}>
                / {weeklyGoal} XP
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBarBackground,
                { backgroundColor: isCompleted ? 'rgba(255,255,255,0.3)' : '#E5E5E5' }
              ]}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                      backgroundColor: isCompleted ? 'white' : DUOLINGO_COLORS.BLUE.DEFAULT,
                    }
                  ]}
                />
              </View>
              <Text style={[
                styles.percentageText,
                { color: isCompleted ? 'white' : DUOLINGO_COLORS.TEXT.SECONDARY }
              ]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>

            {/* Motivational Message */}
            <Text style={[
              styles.motivationText,
              { color: isCompleted ? 'rgba(255,255,255,0.9)' : DUOLINGO_COLORS.TEXT.SECONDARY }
            ]}>
              {getMotivationalMessage()}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  streakText: {
    fontSize: 12,
    marginLeft: 8,
  },
  headerRight: {
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  progressSection: {
    alignItems: 'flex-start',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentXP: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  goalXP: {
    fontSize: 16,
    marginLeft: 4,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    textAlign: 'right',
  },
  motivationText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default WeeklyGoalWidget;
