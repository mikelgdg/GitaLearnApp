import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../constants/DuolingoTypography';

interface DuolingoButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const DuolingoButton: React.FC<DuolingoButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  // 🎯 EXACT DUOLINGO BUTTON ANIMATIONS
  const handlePressIn = () => {
    Animated.parallel([
      // Slight scale down (como Duolingo)
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      // Shadow effect reduction
      Animated.timing(shadowAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      // Bounce back
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      // Shadow back
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: DUOLINGO_COLORS.GREEN.DEFAULT,
          border: DUOLINGO_COLORS.GREEN.DARK,
          text: DUOLINGO_COLORS.TEXT.INVERSE,
        };
      case 'secondary':
        return {
          background: DUOLINGO_COLORS.BLUE.DEFAULT,
          border: DUOLINGO_COLORS.BLUE.DARK,
          text: DUOLINGO_COLORS.TEXT.INVERSE,
        };
      case 'danger':
        return {
          background: DUOLINGO_COLORS.RED.DEFAULT,
          border: DUOLINGO_COLORS.RED.DARK,
          text: DUOLINGO_COLORS.TEXT.INVERSE,
        };
      case 'success':
        return {
          background: DUOLINGO_COLORS.YELLOW.DEFAULT,
          border: DUOLINGO_COLORS.YELLOW.DARK,
          text: DUOLINGO_COLORS.TEXT.PRIMARY,
        };
      default:
        return {
          background: DUOLINGO_COLORS.GREEN.DEFAULT,
          border: DUOLINGO_COLORS.GREEN.DARK,
          text: DUOLINGO_COLORS.TEXT.INVERSE,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          minHeight: 48,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          minHeight: 56,
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: disabled ? DUOLINGO_COLORS.GRAY[300] : colors.background,
            borderBottomColor: disabled ? DUOLINGO_COLORS.GRAY[400] : colors.border,
            ...sizeStyles,
          },
          style,
        ]}
        onPress={disabled ? undefined : onPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text
          style={[
            styles.buttonText,
            TYPOGRAPHY.BUTTON_LARGE,
            {
              color: disabled ? DUOLINGO_COLORS.GRAY[500] : colors.text,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    // 🎨 EXACT DUOLINGO BUTTON STYLING
    borderRadius: 12,
    borderBottomWidth: 4, // Characteristic Duolingo shadow
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default DuolingoButton;
