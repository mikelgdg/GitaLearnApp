import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';

interface NeomorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'pressed' | 'flat';
  intensity?: 'subtle' | 'medium' | 'strong';
  borderRadius?: number;
  backgroundColor?: string;
}

export const NeomorphicCard: React.FC<NeomorphicCardProps> = ({
  children,
  style,
  variant = 'elevated',
  intensity = 'medium',
  borderRadius = 20,
  backgroundColor = DUOLINGO_COLORS.BACKGROUND.PRIMARY,
}) => {
  const getShadowIntensity = () => {
    switch (intensity) {
      case 'subtle':
        return { distance: 2, blur: 4, opacity: 0.1 };
      case 'medium':
        return { distance: 4, blur: 8, opacity: 0.15 };
      case 'strong':
        return { distance: 6, blur: 12, opacity: 0.2 };
      default:
        return { distance: 4, blur: 8, opacity: 0.15 };
    }
  };

  const shadow = getShadowIntensity();

  const getElevatedStyle = (): ViewStyle => ({
    backgroundColor,
    borderRadius,
    // Sombra exterior oscura (abajo-derecha)
    shadowColor: '#000000',
    shadowOffset: {
      width: shadow.distance,
      height: shadow.distance,
    },
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.blur,
    elevation: Platform.OS === 'android' ? shadow.distance * 2 : 0,
  });

  const getPressedStyle = (): ViewStyle => ({
    backgroundColor: darkenColor(backgroundColor, 0.05),
    borderRadius,
    // Sombra interior simulada con border
    borderWidth: 1,
    borderColor: darkenColor(backgroundColor, 0.1),
    // Sombra más sutil
    shadowColor: '#000000',
    shadowOffset: {
      width: shadow.distance * 0.5,
      height: shadow.distance * 0.5,
    },
    shadowOpacity: shadow.opacity * 0.5,
    shadowRadius: shadow.blur * 0.5,
    elevation: Platform.OS === 'android' ? shadow.distance : 0,
  });

  const getFlatStyle = (): ViewStyle => ({
    backgroundColor,
    borderRadius,
    borderWidth: 1,
    borderColor: lightenColor(backgroundColor, 0.1),
  });

  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return getElevatedStyle();
      case 'pressed':
        return getPressedStyle();
      case 'flat':
        return getFlatStyle();
      default:
        return getElevatedStyle();
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {/* ✨ Highlight superior izquierdo (solo para elevated) */}
      {variant === 'elevated' && (
        <View
          style={[
            styles.highlight,
            {
              borderRadius: borderRadius - 1,
              backgroundColor: lightenColor(backgroundColor, 0.05),
            },
          ]}
        />
      )}
      
      {/* 📦 Contenido */}
      <View style={[styles.content, { borderRadius: borderRadius - 1 }]}>
        {children}
      </View>
    </View>
  );
};

// 🎨 Utilidades de color
const lightenColor = (color: string, amount: number): string => {
  // Simplificado - en producción usaríamos una librería como chroma.js
  const opacity = Math.min(1, amount);
  return `rgba(255, 255, 255, ${opacity})`;
};

const darkenColor = (color: string, amount: number): string => {
  // Simplificado - en producción usaríamos una librería como chroma.js
  const opacity = Math.min(1, amount);
  return `rgba(0, 0, 0, ${opacity})`;
};

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: '50%',
    bottom: '50%',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
