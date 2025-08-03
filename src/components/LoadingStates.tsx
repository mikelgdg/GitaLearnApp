import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';

// 💫 Shimmer skeleton loader
interface ShimmerSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 10,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        styles.skeletonContainer,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.5)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

// 🔄 Spinning loader
interface SpinningLoaderProps {
  size?: number;
  color?: string;
  speed?: number;
}

export const SpinningLoader: React.FC<SpinningLoaderProps> = ({
  size = 30,
  color = DUOLINGO_COLORS.GREEN.DEFAULT,
  speed = 1000,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: speed,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinAnim, speed]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.spinningLoader,
        {
          width: size,
          height: size,
          borderColor: `${color}20`,
          borderTopColor: color,
          transform: [{ rotate }],
        },
      ]}
    />
  );
};

// 📊 Progress dots loader
interface DotsLoaderProps {
  dotCount?: number;
  color?: string;
  size?: number;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  dotCount = 3,
  color = DUOLINGO_COLORS.GREEN.DEFAULT,
  size = 8,
}) => {
  const dots = useRef<Animated.Value[]>([]);

  useEffect(() => {
    dots.current = Array.from({ length: dotCount }, () => new Animated.Value(0.3));

    const animations = dots.current.map((dot, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
  }, [dotCount]);

  return (
    <View style={styles.dotsContainer}>
      {dots.current.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: dot,
            },
          ]}
        />
      ))}
    </View>
  );
};

// 🌊 Wave loader
interface WaveLoaderProps {
  color?: string;
  height?: number;
  width?: number;
}

export const WaveLoader: React.FC<WaveLoaderProps> = ({
  color = DUOLINGO_COLORS.GREEN.DEFAULT,
  height = 40,
  width = 60,
}) => {
  const waves = useRef<Animated.Value[]>([]);

  useEffect(() => {
    waves.current = Array.from({ length: 4 }, () => new Animated.Value(0));

    const animations = waves.current.map((wave, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(wave, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(wave, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.waveContainer, { width, height }]}>
      {waves.current.map((wave, index) => (
        <Animated.View
          key={index}
          style={[
            styles.wavebar,
            {
              backgroundColor: color,
              height: wave.interpolate({
                inputRange: [0, 1],
                outputRange: [4, height],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

// 💎 Pulse loader
interface PulseLoaderProps {
  color?: string;
  size?: number;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  color = DUOLINGO_COLORS.GREEN.DEFAULT,
  size = 50,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.pulseLoader,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
  spinningLoader: {
    borderWidth: 3,
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  wavebar: {
    width: 4,
    borderRadius: 2,
  },
  pulseLoader: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
  },
});
