import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../../constants/DuolingoTypography';

type LessonStatus = 'locked' | 'unlocked' | 'current' | 'completed' | 'mastery';
type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface DuolingoLessonBubbleProps {
  status: LessonStatus;
  masteryLevel?: MasteryLevel;
  title: string;
  position: { x: number; y: number };
  onPress: () => void;
  showConnectionLine?: boolean;
  isPulsing?: boolean;
}

const DuolingoLessonBubble: React.FC<DuolingoLessonBubbleProps> = ({
  status,
  masteryLevel = 0,
  title,
  position,
  onPress,
  showConnectionLine = false,
  isPulsing = false,
}) => {
  // 🎯 EXACT DUOLINGO ANIMATIONS
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // 💫 Pulse animation for current lesson
  useEffect(() => {
    if (isPulsing && status === 'current') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isPulsing, status, pulseAnim]);

  // ✨ Particle animation for completed lessons
  useEffect(() => {
    if (status === 'completed' || status === 'mastery') {
      const particleAnimations = particleAnims.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(index * 500),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
      });

      Animated.parallel(particleAnimations).start();
      return () => particleAnimations.forEach(anim => anim.stop());
    }
  }, [status, particleAnims]);

  // 🎯 Press animation (EXACT DUOLINGO BEHAVIOR)
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (status !== 'locked') {
      onPress();
    }
  };

  // 🎨 Get bubble styling based on status
  const getBubbleStyle = () => {
    switch (status) {
      case 'locked':
        return {
          backgroundColor: DUOLINGO_COLORS.GRAY[300],
          borderColor: DUOLINGO_COLORS.GRAY[400],
          borderWidth: 3,
        };
      case 'unlocked':
        return {
          backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
          borderColor: DUOLINGO_COLORS.GREEN.DARK,
          borderWidth: 4,
        };
      case 'current':
        return {
          backgroundColor: DUOLINGO_COLORS.GREEN.LIGHT,
          borderColor: DUOLINGO_COLORS.GREEN.DEFAULT,
          borderWidth: 4,
          shadowColor: DUOLINGO_COLORS.GREEN.DEFAULT,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 15,
        };
      case 'completed':
        return {
          backgroundColor: DUOLINGO_COLORS.YELLOW.DEFAULT,
          borderColor: DUOLINGO_COLORS.YELLOW.DARK,
          borderWidth: 4,
        };
      case 'mastery':
        return {
          backgroundColor: DUOLINGO_COLORS.YELLOW.LIGHT,
          borderColor: '#FFD700', // Gold border
          borderWidth: 4,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 12,
        };
      default:
        return {
          backgroundColor: DUOLINGO_COLORS.GRAY[300],
          borderColor: DUOLINGO_COLORS.GRAY[400],
          borderWidth: 3,
        };
    }
  };

  // 🎯 Get icon based on status
  const getIcon = () => {
    switch (status) {
      case 'locked':
        return <Ionicons name="lock-closed" size={24} color={DUOLINGO_COLORS.GRAY[600]} />;
      case 'unlocked':
      case 'current':
        return <Ionicons name="play" size={28} color="white" />;
      case 'completed':
        return <Ionicons name="checkmark" size={32} color="white" />;
      case 'mastery':
        return <Ionicons name="trophy" size={28} color="white" />;
      default:
        return <Ionicons name="lock-closed" size={24} color={DUOLINGO_COLORS.GRAY[600]} />;
    }
  };

  // 👑 Render mastery crowns
  const renderCrowns = () => {
    if (status !== 'mastery' || masteryLevel === 0) return null;

    const crowns = Array.from({ length: masteryLevel }, (_, index) => (
      <Ionicons
        key={index}
        name="crown"
        size={12}
        color="#FFD700"
        style={[
          styles.crown,
          { 
            left: -20 + (index * 8),
            top: -8 + (index % 2) * 4,
          }
        ]}
      />
    ));

    return <View style={styles.crownContainer}>{crowns}</View>;
  };

  // ✨ Render floating particles
  const renderParticles = () => {
    if (status !== 'completed' && status !== 'mastery') return null;

    return particleAnims.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, (index - 1) * 20],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sparkle}>✨</Text>
      </Animated.View>
    ));
  };

  return (
    <View style={[styles.container, { left: position.x, top: position.y }]}>
      {/* Connection Line */}
      {showConnectionLine && (
        <View style={[
          styles.connectionLine,
          { backgroundColor: status === 'locked' ? DUOLINGO_COLORS.GRAY[300] : DUOLINGO_COLORS.GREEN.DEFAULT }
        ]} />
      )}

      {/* Floating Particles */}
      {renderParticles()}

      {/* Main Bubble */}
      <Animated.View
        style={[
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            getBubbleStyle(),
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          disabled={status === 'locked'}
        >
          {getIcon()}
          
          {/* Mastery Crowns */}
          {renderCrowns()}
        </TouchableOpacity>
      </Animated.View>

      {/* Lesson Title */}
      <Text 
        style={[
          styles.title,
          { color: status === 'locked' ? DUOLINGO_COLORS.GRAY[500] : DUOLINGO_COLORS.TEXT.PRIMARY }
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1,
  },
  connectionLine: {
    position: 'absolute',
    width: 4,
    height: 60,
    top: -60,
    left: '50%',
    marginLeft: -2,
    zIndex: 0,
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 80,
  },
  crownContainer: {
    position: 'absolute',
    top: -15,
    left: -25,
    right: -25,
    height: 20,
  },
  crown: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    top: -10,
    left: 25,
  },
  sparkle: {
    fontSize: 16,
  },
});

export default DuolingoLessonBubble;
