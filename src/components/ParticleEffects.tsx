import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ANIMATION_COLORS } from '../utils/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

interface ConfettiExplosionProps {
  trigger: boolean;
  particleCount?: number;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({
  trigger,
  particleCount = 20,
  duration = 2000,
  colors = ANIMATION_COLORS.CONFETTI,
  onComplete,
}) => {
  const particles = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    // Crear partículas iniciales
    particles.current = Array.from({ length: particleCount }, (_, index) => ({
      id: index,
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT / 2),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: colors[index % colors.length],
    }));
  }, [particleCount, colors]);

  useEffect(() => {
    if (trigger) {
      explode();
    }
  }, [trigger]);

  const explode = () => {
    const animations = particles.current.map((particle, index) => {
      // Posición aleatoria de destino
      const randomX = Math.random() * SCREEN_WIDTH;
      const randomY = Math.random() * SCREEN_HEIGHT * 0.6; // Solo arriba
      const randomRotation = Math.random() * 720; // 2 vueltas completas
      
      return Animated.sequence([
        // Aparecer
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        // Explotar hacia fuera
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: randomX,
            duration: duration * 0.7,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: randomY,
            duration: duration * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: randomRotation,
            duration: duration * 0.7,
            useNativeDriver: true,
          }),
        ]),
        // Caer con gravedad
        Animated.timing(particle.y, {
          toValue: SCREEN_HEIGHT + 100,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
        // Desaparecer
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      // Reset particles
      particles.current.forEach(particle => {
        particle.x.setValue(SCREEN_WIDTH / 2);
        particle.y.setValue(SCREEN_HEIGHT / 2);
        particle.rotation.setValue(0);
        particle.scale.setValue(0);
      });
      onComplete?.();
    });
  };

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { rotate: particle.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// 🫧 Componente de burbujas flotantes de fondo
interface FloatingBubblesProps {
  bubbleCount?: number;
  colors?: string[];
  speed?: number;
}

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({
  bubbleCount = 8,
  colors = ['rgba(255, 255, 255, 0.1)', 'rgba(74, 144, 226, 0.1)', 'rgba(255, 107, 53, 0.1)'],
  speed = 10000,
}) => {
  const bubbles = useRef<Animated.Value[]>([]);

  useEffect(() => {
    bubbles.current = Array.from({ length: bubbleCount }, () => new Animated.Value(0));
    
    const animations = bubbles.current.map((bubble, index) => {
      const delay = (index * speed) / bubbleCount;
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(bubble, {
            toValue: 1,
            duration: speed,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
  }, [bubbleCount, speed]);

  return (
    <View style={styles.bubblesContainer} pointerEvents="none">
      {bubbles.current.map((bubble, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bubble,
            {
              backgroundColor: colors[index % colors.length],
              left: Math.random() * SCREEN_WIDTH,
              transform: [
                {
                  translateY: bubble.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT + 100, -100],
                  }),
                },
                {
                  scale: bubble.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
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

// ✨ Partículas estrella de fondo
interface StarParticlesProps {
  starCount?: number;
  twinkleSpeed?: number;
}

export const StarParticles: React.FC<StarParticlesProps> = ({
  starCount = 15,
  twinkleSpeed = 2000,
}) => {
  const stars = useRef<Animated.Value[]>([]);

  useEffect(() => {
    stars.current = Array.from({ length: starCount }, () => new Animated.Value(0));
    
    const animations = stars.current.map((star, index) => {
      const delay = (index * twinkleSpeed) / starCount;
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(star, {
            toValue: 1,
            duration: twinkleSpeed / 2,
            useNativeDriver: true,
          }),
          Animated.timing(star, {
            toValue: 0,
            duration: twinkleSpeed / 2,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
  }, [starCount, twinkleSpeed]);

  return (
    <View style={styles.starsContainer} pointerEvents="none">
      {stars.current.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              top: Math.random() * SCREEN_HEIGHT * 0.7,
              left: Math.random() * SCREEN_WIDTH,
              opacity: star,
            },
          ]}
        >
          <View style={styles.starShape} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bubblesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  bubble: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  star: {
    position: 'absolute',
    width: 6,
    height: 6,
  },
  starShape: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
});
