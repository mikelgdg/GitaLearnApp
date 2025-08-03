import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../constants/DuolingoTypography';

const { width: screenWidth } = Dimensions.get('window');

type ExerciseType = 
  | 'multiple-choice'
  | 'translation'
  | 'listening'
  | 'speaking'
  | 'matching'
  | 'fill-blanks'
  | 'image-selection';

interface ExerciseOption {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
  isCorrect?: boolean;
}

interface DuolingoExerciseCardProps {
  type: ExerciseType;
  question: string;
  options?: ExerciseOption[];
  selectedOption?: string;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  correctAnswer?: string;
  image?: string;
  audio?: string;
}

const DuolingoExerciseCard: React.FC<DuolingoExerciseCardProps> = ({
  type,
  question,
  options = [],
  selectedOption,
  onSelectOption,
  disabled = false,
  showResult = false,
  correctAnswer,
  image,
  audio,
}) => {
  const cardAnimations = useRef(
    options.map(() => new Animated.Value(1))
  ).current;
  const [pressedOption, setPressedOption] = useState<string | null>(null);

  // 🎯 Handle option press animations
  const handleOptionPress = (optionId: string) => {
    if (disabled) return;

    setPressedOption(optionId);
    
    // Scale animation
    const optionIndex = options.findIndex(opt => opt.id === optionId);
    if (optionIndex !== -1) {
      Animated.sequence([
        Animated.timing(cardAnimations[optionIndex], {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnimations[optionIndex], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setTimeout(() => {
      onSelectOption(optionId);
      setPressedOption(null);
    }, 100);
  };

  // 🎨 Get option styling based on state
  const getOptionStyle = (option: ExerciseOption, index: number) => {
    const isSelected = selectedOption === option.id;
    const isPressing = pressedOption === option.id;
    
    let backgroundColor: string = DUOLINGO_COLORS.BACKGROUND.PRIMARY;
    let borderColor: string = DUOLINGO_COLORS.GRAY[300];
    let borderWidth = 2;
    let textColor: string = DUOLINGO_COLORS.TEXT.PRIMARY;

    if (showResult) {
      if (option.isCorrect || option.id === correctAnswer) {
        backgroundColor = DUOLINGO_COLORS.GREEN.BACKGROUND;
        borderColor = DUOLINGO_COLORS.GREEN.DEFAULT;
        textColor = DUOLINGO_COLORS.GREEN.DARK;
        borderWidth = 3;
      } else if (isSelected && !option.isCorrect) {
        backgroundColor = DUOLINGO_COLORS.RED.BACKGROUND;
        borderColor = DUOLINGO_COLORS.RED.DEFAULT;
        textColor = DUOLINGO_COLORS.RED.DARK;
        borderWidth = 3;
      }
    } else if (isSelected) {
      backgroundColor = DUOLINGO_COLORS.BLUE.BACKGROUND;
      borderColor = DUOLINGO_COLORS.BLUE.DEFAULT;
      textColor = DUOLINGO_COLORS.BLUE.DARK;
      borderWidth = 3;
    } else if (isPressing) {
      backgroundColor = DUOLINGO_COLORS.GRAY[100];
      borderColor = DUOLINGO_COLORS.GRAY[400];
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      textColor,
    };
  };

  // 🎯 Render option content based on type
  const renderOptionContent = (option: ExerciseOption) => {
    if (option.image) {
      return (
        <View style={styles.imageOptionContent}>
          <Image source={{ uri: option.image }} style={styles.optionImage} />
          {option.text && (
            <Text style={[styles.optionText, { color: getOptionStyle(option, 0).textColor }]}>
              {option.text}
            </Text>
          )}
        </View>
      );
    }

    if (option.audio) {
      return (
        <View style={styles.audioOptionContent}>
          <Ionicons 
            name="volume-high" 
            size={24} 
            color={getOptionStyle(option, 0).textColor} 
          />
          {option.text && (
            <Text style={[styles.optionText, { color: getOptionStyle(option, 0).textColor }]}>
              {option.text}
            </Text>
          )}
        </View>
      );
    }

    return (
      <Text style={[styles.optionText, { color: getOptionStyle(option, 0).textColor }]}>
        {option.text}
      </Text>
    );
  };

  // 🎯 Get exercise icon
  const getExerciseIcon = () => {
    switch (type) {
      case 'listening':
        return 'volume-high';
      case 'speaking':
        return 'mic';
      case 'translation':
        return 'language';
      case 'matching':
        return 'link';
      case 'fill-blanks':
        return 'create';
      case 'image-selection':
        return 'image';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getExerciseIcon()}
            size={24}
            color={DUOLINGO_COLORS.BLUE.DEFAULT}
          />
        </View>
        <Text style={styles.exerciseType}>
          {type === 'multiple-choice' && 'Elige la respuesta correcta'}
          {type === 'translation' && 'Traduce esta oración'}
          {type === 'listening' && 'Escucha y selecciona'}
          {type === 'speaking' && 'Di esta oración'}
          {type === 'matching' && 'Conecta las parejas'}
          {type === 'fill-blanks' && 'Completa la oración'}
          {type === 'image-selection' && 'Selecciona la imagen correcta'}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        {image && (
          <Image source={{ uri: image }} style={styles.questionImage} />
        )}
        <Text style={styles.question}>{question}</Text>
        {audio && (
          <TouchableOpacity style={styles.audioButton}>
            <Ionicons name="volume-high" size={32} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
          </TouchableOpacity>
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const optionStyle = getOptionStyle(option, index);
          return (
            <Animated.View
              key={option.id}
              style={[
                { transform: [{ scale: cardAnimations[index] }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.option,
                  {
                    backgroundColor: optionStyle.backgroundColor,
                    borderColor: optionStyle.borderColor,
                    borderWidth: optionStyle.borderWidth,
                  },
                ]}
                onPress={() => handleOptionPress(option.id)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                {renderOptionContent(option)}
                
                {/* Result Icon */}
                {showResult && (
                  <View style={styles.resultIcon}>
                    {(option.isCorrect || option.id === correctAnswer) ? (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={DUOLINGO_COLORS.GREEN.DEFAULT} 
                      />
                    ) : selectedOption === option.id ? (
                      <Ionicons 
                        name="close-circle" 
                        size={24} 
                        color={DUOLINGO_COLORS.RED.DEFAULT} 
                      />
                    ) : null}
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DUOLINGO_COLORS.BLUE.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseType: {
    ...TYPOGRAPHY.BODY,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    fontWeight: '600',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  questionImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.4,
    borderRadius: 12,
    marginBottom: 16,
  },
  question: {
    ...TYPOGRAPHY.H2,
    textAlign: 'center',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
    lineHeight: 32,
    marginBottom: 16,
  },
  audioButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DUOLINGO_COLORS.BLUE.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    ...TYPOGRAPHY.H3,
    fontWeight: '600',
    flex: 1,
  },
  imageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  audioOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  resultIcon: {
    marginLeft: 12,
  },
});

export default DuolingoExerciseCard;
