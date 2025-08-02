import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ARJU_COLORS } from '../constants/sections';
import { AnimationUtils } from '../utils/animations';

interface AnimatedButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  enableHaptic?: boolean;
  glowing?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  enableHaptic = true,
  glowing = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (glowing) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
    }
  }, [glowing, glowAnim]);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      AnimationUtils.createBounceAnimation(scaleAnim, 0.95).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return [ARJU_COLORS.PRIMARY_BLUE, ARJU_COLORS.DUOLINGO_BLUE];
      case 'secondary':
        return [ARJU_COLORS.ACCENT_ORANGE, '#E55A2B'];
      case 'success':
        return ['#4CAF50', '#2E7D32'];
      case 'danger':
        return ['#F44336', '#C62828'];
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return [ARJU_COLORS.PRIMARY_BLUE, ARJU_COLORS.DUOLINGO_BLUE];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 16, fontSize: 14 };
      case 'medium':
        return { height: 48, paddingHorizontal: 24, fontSize: 16 };
      case 'large':
        return { height: 56, paddingHorizontal: 32, fontSize: 18 };
      default:
        return { height: 48, paddingHorizontal: 24, fontSize: 16 };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();
  const isGhost = variant === 'ghost';

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const ButtonContent = () => (
    <View style={[styles.content, { height: sizeStyles.height }]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text
          style={[
            styles.text,
            { 
              fontSize: sizeStyles.fontSize,
              color: isGhost ? ARJU_COLORS.PRIMARY_BLUE : 'white',
            },
            textStyle,
          ]}
        >
        {loading ? 'Cargando...' : title}
      </Text>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {/* ✨ Glow effect */}
      {glowing && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
              shadowColor: colors[0],
            },
          ]}
        />
      )}

      {/* 🎨 Button body */}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            borderColor: isGhost ? ARJU_COLORS.PRIMARY_BLUE : 'transparent',
            borderWidth: isGhost ? 2 : 0,
          },
        ]}
      >
        {isGhost ? (
          <ButtonContent />
        ) : (
          <LinearGradient
            colors={colors as [string, string]}
            style={[styles.gradient, { height: sizeStyles.height }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ButtonContent />
          </LinearGradient>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 10,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
