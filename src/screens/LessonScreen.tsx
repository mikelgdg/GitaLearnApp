import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { audioService } from '../services/AudioService';
import { Exercise, GameState, Verse, ExerciseType, MultipleChoiceOption, LessonSummary } from '../types';
import DuolingoLessonComplete from '../components/DuolingoLessonComplete';

interface LessonScreenProps {
  route: {
    params: {
      lessonId: string;
      chapterNumber: number;
    };
  };
  navigation: any;
}

const LessonScreen: React.FC<LessonScreenProps> = ({ route, navigation }) => {
  const { lessonId, chapterNumber } = route.params;

  // Todos los useState deben ir primero
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  
  // Estados para lesson completion
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [lessonSummary, setLessonSummary] = useState<LessonSummary | null>(null);

  // Luego los Hooks de react-native-reanimated
  const progress = useSharedValue(0);
  const selectedOptionScale = useSharedValue(1);

  // Animated styles que se usan en el render
  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const selectedOptionAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: selectedOptionScale.value }],
    };
  });

  // Finalmente los useEffect
  useEffect(() => {
    loadLessonData();
  }, [lessonId, chapterNumber]);

  useEffect(() => {
    if (exercises.length > 0) {
      progress.value = withTiming((currentExerciseIndex + 1) / exercises.length, { duration: 300 });
    }
  }, [currentExerciseIndex, exercises]);

  const loadLessonData = async () => {
    setIsLoading(true);
    try {
      const [lessonData, gameStateData] = await Promise.all([
        gitaDataService.getLesson(chapterNumber, lessonId),
        gitaDataService.getGameState(),
      ]);

      if (lessonData) {
        const generatedExercises = generateExercises(lessonData.verses);
        setExercises(generatedExercises);
      }
      setGameState(gameStateData);
    } catch (error) {
      console.error("Error loading lesson data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateExercises = (verses: Verse[]): Exercise[] => {
    // For now, only Multiple Choice exercises
    const generated: Exercise[] = verses.map(verse => {
      const incorrectVerses = gitaDataService.getAllVerses()
        .filter(v => v.capitulo !== verse.capitulo || v.verso !== verse.verso)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options: MultipleChoiceOption[] = [
        { id: 'correct', text: verse.traduccion },
        ...incorrectVerses.map((v, i) => ({ id: `incorrect-${i}`, text: v.traduccion }))
      ].sort(() => 0.5 - Math.random());

      return {
        type: ExerciseType.MULTIPLE_CHOICE_TRANSLATION,
        verse,
        question: verse.sanskrit,
        options,
        correctOptionId: 'correct',
        isCorrect: null,
      };
    });
    return generated.sort(() => 0.5 - Math.random()); // Shuffle exercises
  };

  const handleAnswerPress = (optionId: string) => {
    if (isAnswerCorrect !== null) return; // Already answered
    setSelectedAnswerId(optionId);
    selectedOptionScale.value = withSpring(1.05, { damping: 2, stiffness: 300 });
  };

  const handlePlayAudio = async (audioUrl: string) => {
    try {
      await audioService.playVerseAudio(audioUrl);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleCheckPress = () => {
    if (!selectedAnswerId) return;

    const currentExercise = exercises[currentExerciseIndex];
    
    // Verificar que el ejercicio es de tipo que permite verificación
    if (currentExercise.type !== ExerciseType.MULTIPLE_CHOICE_TRANSLATION && 
        currentExercise.type !== ExerciseType.LISTEN_AND_SELECT) {
      return;
    }

    const correct = selectedAnswerId === currentExercise.correctOptionId;
    setIsAnswerCorrect(correct);

    // Contar respuestas correctas
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      audioService.playCorrectSound();
    } else {
      audioService.playIncorrectSound();
    }

    // Update game state
    if (gameState) {
      const newGameState: Partial<GameState> = {};
      if (correct) {
        newGameState.xp = gameState.xp + 10;
      } else {
        newGameState.hearts = Math.max(0, gameState.hearts - 1);
      }
      gitaDataService.saveGameState(newGameState);
      setGameState(prev => ({ ...prev!, ...newGameState }));
    }
  };

  const handleContinuePress = async () => {
    setSelectedAnswerId(null);
    setIsAnswerCorrect(null);
    selectedOptionScale.value = 1;

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Lección terminada - mostrar pantalla de resumen
      await showLessonCompletion();
    }
  };

  const showLessonCompletion = async () => {
    try {
      // Crear resumen de la lección
      const summary = await gitaDataService.createLessonSummary(
        correctAnswers,
        exercises.length,
        correctAnswers === exercises.length // isFirstTryPerfect
      );
      
      // Actualizar game state con rewards
      await gitaDataService.updateGameStateAfterLesson(summary);
      
      setLessonSummary(summary);
      setShowCompletionScreen(true);
    } catch (error) {
      console.error('Error creating lesson summary:', error);
      // Fallback: volver directamente
      navigation.goBack();
    }
  };

  const handleCompletionContinue = () => {
    setShowCompletionScreen(false);
    navigation.goBack();
  };

  const renderExercise = () => {
    if (!exercises.length) return null;
    const exercise = exercises[currentExerciseIndex];

    if (exercise.type === ExerciseType.MULTIPLE_CHOICE_TRANSLATION) {
      return (
        <View>
          <Text style={styles.questionText}>Selecciona la traducción correcta:</Text>
          <Text style={styles.sanskritText}>{exercise.question}</Text>
          <View style={styles.optionsContainer}>
            {exercise.options.map(option => {
              const isSelected = selectedAnswerId === option.id;
              let buttonStyle: any = [styles.optionButton];
              let textStyle: any = [styles.optionText];

              if (isSelected) {
                buttonStyle.push(styles.selectedOptionButton);
              }

              if (isAnswerCorrect !== null) {
                if (option.id === exercise.correctOptionId) {
                  buttonStyle.push(styles.correctOptionButton);
                  textStyle.push(styles.correctOptionText);
                } else if (isSelected) {
                  buttonStyle.push(styles.incorrectOptionButton);
                  textStyle.push(styles.incorrectOptionText);
                }
              }

              return (
                <Animated.View key={option.id} style={selectedAnswerId === option.id ? selectedOptionAnimatedStyle : undefined}>
                  <TouchableOpacity
                    style={buttonStyle}
                    onPress={() => handleAnswerPress(option.id)}
                    disabled={isAnswerCorrect !== null}
                  >
                    <Text style={textStyle}>{option.text}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
      );
    }

    if (exercise.type === ExerciseType.LISTEN_AND_SELECT) {
      return (
        <View>
          <Text style={styles.questionText}>{exercise.question}</Text>
          
          {/* Botón de reproducir audio */}
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => handlePlayAudio(exercise.audioUrl)}
          >
            <Ionicons name="play-circle" size={80} color="#58CC02" />
            <Text style={styles.audioButtonText}>Reproducir Audio</Text>
          </TouchableOpacity>

          <View style={styles.optionsContainer}>
            {exercise.options.map(option => {
              const isSelected = selectedAnswerId === option.id;
              let buttonStyle: any = [styles.optionButton];
              let textStyle: any = [styles.optionText];

              if (isSelected) {
                buttonStyle.push(styles.selectedOptionButton);
              }

              if (isAnswerCorrect !== null) {
                if (option.id === exercise.correctOptionId) {
                  buttonStyle.push(styles.correctOptionButton);
                  textStyle.push(styles.correctOptionText);
                } else if (isSelected) {
                  buttonStyle.push(styles.incorrectOptionButton);
                  textStyle.push(styles.incorrectOptionText);
                }
              }

              return (
                <Animated.View key={option.id} style={selectedAnswerId === option.id ? selectedOptionAnimatedStyle : undefined}>
                  <TouchableOpacity
                    style={buttonStyle}
                    onPress={() => handleAnswerPress(option.id)}
                    disabled={isAnswerCorrect !== null}
                  >
                    <Text style={textStyle}>{option.text}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
      );
    }
    
    return null;
  };

  if (isLoading || !gameState) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF9933" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#777" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
          </View>
          <View style={styles.heartsContainer}>
              <Ionicons name="heart" size={24} color="#FF4B4B" />
              <Text style={styles.heartsText}>{gameState.hearts}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {renderExercise()}
        </View>

        <View style={styles.footer}>
          {isAnswerCorrect === null ? (
            <TouchableOpacity 
              style={[styles.checkButton, !selectedAnswerId && styles.disabledButton]} 
              onPress={handleCheckPress}
              disabled={!selectedAnswerId}
            >
              <Text style={styles.checkButtonText}>COMPROBAR</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.checkButton, isAnswerCorrect ? styles.correctFooter : styles.incorrectFooter]} 
              onPress={handleContinuePress}
            >
              <Text style={styles.checkButtonText}>CONTINUAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Pantalla de Finalización de Lección */}
      {showCompletionScreen && lessonSummary && (
        <DuolingoLessonComplete
          visible={showCompletionScreen}
          stats={{
            correctAnswers: lessonSummary.perfectAnswers,
            totalQuestions: lessonSummary.totalAnswers,
            xpGained: lessonSummary.xpGained,
            streakCount: lessonSummary.streakDays,
            timeSpent: 180, // Valor por defecto
            accuracy: lessonSummary.accuracy,
          }}
          onContinue={handleCompletionContinue}
          lessonTitle={`Lección completada`}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressContainer: {
    flex: 1,
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#58CC02',
    borderRadius: 8,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartsText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4B4B',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sanskritText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    // styles for options container
  },
  audioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    padding: 20,
  },
  audioButtonText: {
    fontSize: 16,
    color: '#58CC02',
    fontWeight: 'bold',
    marginTop: 10,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedOptionButton: {
    borderColor: '#84D8FF',
    backgroundColor: '#E1F5FE',
  },
  correctOptionButton: {
    borderColor: '#58CC02',
    backgroundColor: '#D7FFB8',
  },
  incorrectOptionButton: {
    borderColor: '#FF4B4B',
    backgroundColor: '#FFDFDF',
  },
  optionText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  correctOptionText: {
    color: '#3B8801',
    fontWeight: 'bold',
  },
  incorrectOptionText: {
    color: '#EA2B2B',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkButton: {
    backgroundColor: '#58CC02',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  correctFooter: {
    backgroundColor: '#58CC02',
  },
  incorrectFooter: {
    backgroundColor: '#FF4B4B',
  },
});

export default LessonScreen;
