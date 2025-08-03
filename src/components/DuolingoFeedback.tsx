import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../constants/DuolingoTypography';
import DuolingoButton from './DuolingoButton';

type FeedbackType = 'correct' | 'incorrect' | 'excellent';

interface DuolingoFeedbackProps {
  type: FeedbackType;
  message: string;
  explanation?: string;
  onContinue: () => void;
  onTryAgain?: () => void;
  visible: boolean;
}

const DuolingoFeedback: React.FC<DuolingoFeedbackProps> = ({
  type,
  message,
  explanation,
  onContinue,
  onTryAgain,
  visible,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  // 🎯 Show/Hide animations
  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Icon scale animation with delay
      setTimeout(() => {
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }, 200);
    } else {
      // Reset animations
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
      iconScaleAnim.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim, iconScaleAnim]);

  if (!visible) return null;

  // 🎨 Get styling based on feedback type
  const getFeedbackStyle = () => {
    switch (type) {
      case 'correct':
        return {
          backgroundColor: DUOLINGO_COLORS.GREEN.BACKGROUND,
          borderTopColor: DUOLINGO_COLORS.GREEN.DEFAULT,
          iconColor: DUOLINGO_COLORS.GREEN.DEFAULT,
          textColor: DUOLINGO_COLORS.GREEN.DARK,
        };
      case 'excellent':
        return {
          backgroundColor: DUOLINGO_COLORS.YELLOW.BACKGROUND,
          borderTopColor: DUOLINGO_COLORS.YELLOW.DEFAULT,
          iconColor: DUOLINGO_COLORS.YELLOW.DEFAULT,
          textColor: DUOLINGO_COLORS.YELLOW.DARK,
        };
      case 'incorrect':
        return {
          backgroundColor: DUOLINGO_COLORS.RED.BACKGROUND,
          borderTopColor: DUOLINGO_COLORS.RED.DEFAULT,
          iconColor: DUOLINGO_COLORS.RED.DEFAULT,
          textColor: DUOLINGO_COLORS.RED.DARK,
        };
      default:
        return {
          backgroundColor: DUOLINGO_COLORS.GRAY[100],
          borderTopColor: DUOLINGO_COLORS.GRAY[400],
          iconColor: DUOLINGO_COLORS.GRAY[600],
          textColor: DUOLINGO_COLORS.TEXT.PRIMARY,
        };
    }
  };

  // 🎯 Get icon based on feedback type
  const getIcon = () => {
    switch (type) {
      case 'correct':
        return 'checkmark-circle';
      case 'excellent':
        return 'star';
      case 'incorrect':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const style = getFeedbackStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          borderTopColor: style.borderTopColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Feedback Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: iconScaleAnim }] }
          ]}
        >
          <Ionicons
            name={getIcon()}
            size={32}
            color={style.iconColor}
          />
        </Animated.View>

        {/* Feedback Content */}
        <View style={styles.textContainer}>
          {/* Main Message */}
          <Text style={[styles.message, { color: style.textColor }]}>
            {message}
          </Text>

          {/* Explanation (if provided) */}
          {explanation && (
            <Text style={[styles.explanation, { color: style.textColor }]}>
              {explanation}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {type === 'incorrect' && onTryAgain ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={onTryAgain}>
                <Text style={styles.secondaryButtonText}>Intentar otra vez</Text>
              </TouchableOpacity>
              <View style={styles.buttonSpacer} />
              <DuolingoButton
                variant="primary"
                size="medium"
                onPress={onContinue}
                style={styles.primaryButton}
              >
                Continuar
              </DuolingoButton>
            </View>
          ) : (
            <DuolingoButton
              variant={type === 'correct' || type === 'excellent' ? 'primary' : 'secondary'}
              size="large"
              onPress={onContinue}
              style={styles.fullWidthButton}
            >
              {type === 'incorrect' ? 'Continuar' : '¡Continuar!'}
            </DuolingoButton>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 4,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  message: {
    ...TYPOGRAPHY.H3,
    fontWeight: '700',
    marginBottom: 4,
  },
  explanation: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '500',
    opacity: 0.8,
  },
  buttonContainer: {
    minWidth: 120,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: DUOLINGO_COLORS.GRAY[300],
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
  },
  primaryButton: {
    minWidth: 100,
  },
  fullWidthButton: {
    width: '100%',
  },
  buttonSpacer: {
    height: 4,
  },
});

export default DuolingoFeedback;
