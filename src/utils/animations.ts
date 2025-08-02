import { Animated, Easing } from 'react-native';

export class AnimationUtils {
  // 🎯 Bounce animation para botones
  static createBounceAnimation(animatedValue: Animated.Value, scale: number = 0.95) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: scale,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]);
  }

  // ✨ Pulse animation para elementos importantes
  static createPulseAnimation(animatedValue: Animated.Value, minScale: number = 0.95, maxScale: number = 1.05) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxScale,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minScale,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // 🌊 Fade in con delay escalonado
  static createStaggeredFadeIn(
    animatedValues: Animated.Value[],
    staggerDelay: number = 100,
    duration: number = 300
  ) {
    return Animated.stagger(
      staggerDelay,
      animatedValues.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
  }

  // 🔄 Shake animation para errores
  static createShakeAnimation(animatedValue: Animated.Value, intensity: number = 10) {
    return Animated.sequence([
      Animated.timing(animatedValue, { toValue: intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]);
  }

  // 💫 Confetti burst para celebraciones
  static createConfettiBurst(animatedValues: Animated.Value[]) {
    return Animated.parallel(
      animatedValues.map((value, index) =>
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.timing(value, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    );
  }

  // 📈 Progress bar fill animation
  static createProgressFillAnimation(animatedValue: Animated.Value, toValue: number) {
    return Animated.timing(animatedValue, {
      toValue,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width no soporta native driver
    });
  }

  // 🎪 Slide in from bottom
  static createSlideInFromBottom(animatedValue: Animated.Value, fromValue: number = 100) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }

  // 💎 Shimmer loading effect
  static createShimmerAnimation(animatedValue: Animated.Value) {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  }
}

// 🎨 Preset de colores para efectos
export const ANIMATION_COLORS = {
  SHIMMER_LIGHT: 'rgba(255, 255, 255, 0.3)',
  SHIMMER_DARK: 'rgba(255, 255, 255, 0.1)',
  CONFETTI: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  GLOW: 'rgba(255, 255, 255, 0.8)',
};
