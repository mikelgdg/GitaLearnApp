import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import DuolingoProgressBar from '../components/DuolingoProgressBar';
import DuolingoExerciseCard from '../components/DuolingoExerciseCard';
import DuolingoFeedback from '../components/DuolingoFeedback';
import DuolingoLessonComplete from '../components/DuolingoLessonComplete';
import DuolingoButton from '../components/DuolingoButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ExerciseData {
  id: string;
  type: 'multiple-choice' | 'translation' | 'listening' | 'speaking' | 'matching' | 'fill-blanks' | 'image-selection';
  question: string;
  options: Array<{
    id: string;
    text?: string;
    image?: string;
    audio?: string;
    isCorrect?: boolean;
  }>;
  correctAnswer: string;
  explanation?: string;
  image?: string;
  audio?: string;
}

interface LessonExerciseScreenProps {
  navigation: any;
}

const LessonExerciseScreen: React.FC<LessonExerciseScreenProps> = ({ navigation }) => {

  // 🎯 Sample exercise data - replace with real data service
  const [exercises] = useState<ExerciseData[]>([
    {
      id: 'ex1',
      type: 'multiple-choice',
      question: '¿Cuál es el primer verso del Bhagavad Gita?',
      options: [
        { id: 'a', text: 'dharma-kṣetre kuru-kṣetre', isCorrect: true },
        { id: 'b', text: 'arjuna uvāca', isCorrect: false },
        { id: 'c', text: 'bhagavān uvāca', isCorrect: false },
        { id: 'd', text: 'sañjaya uvāca', isCorrect: false },
      ],
      correctAnswer: 'a',
      explanation: 'El primer verso comienza con "dharma-kṣetre kuru-kṣetre", estableciendo el escenario en el campo de Kurukshetra.',
    },
    {
      id: 'ex2',
      type: 'translation',
      question: 'Traduce: "El alma es eterna"',
      options: [
        { id: 'a', text: 'ātmā nitya', isCorrect: false },
        { id: 'b', text: 'ātmā śāśvata', isCorrect: true },
        { id: 'c', text: 'jīva eterna', isCorrect: false },
        { id: 'd', text: 'brahmā nitya', isCorrect: false },
      ],
      correctAnswer: 'b',
      explanation: 'El término correcto es "ātmā śāśvata" donde śāśvata significa eterno.',
    },
    {
      id: 'ex3',
      type: 'image-selection',
      question: 'Selecciona el símbolo del Om',
      options: [
        { id: 'a', text: '🕉️', isCorrect: true },
        { id: 'b', text: '☸️', isCorrect: false },
        { id: 'c', text: '🔱', isCorrect: false },
        { id: 'd', text: '⚡', isCorrect: false },
      ],
      correctAnswer: 'a',
      explanation: 'Om (🕉️) es el símbolo sagrado más importante en el hinduismo.',
    },
  ]);

  // State management
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | 'excellent'>('correct');
  const [showResult, setShowResult] = useState(false);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hearts, setHearts] = useState(5);

  // Animations
  const exerciseSlideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;

  // 🎯 Get feedback message
  const getFeedbackMessage = () => {
    switch (feedbackType) {
      case 'correct': return '¡Correcto!';
      case 'excellent': return '¡Excelente!';
      case 'incorrect': return 'Incorrecto';
      default: return '¡Correcto!';
    }
  };

  // 🎯 Handle option selection
  const handleSelectOption = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };

  // 🎯 Check answer
  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentExercise.correctAnswer;
    setShowResult(true);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setFeedbackType(correctAnswers === totalExercises - 1 ? 'excellent' : 'correct');
    } else {
      setFeedbackType('incorrect');
      setHearts(prev => Math.max(0, prev - 1));
    }

    // Show feedback after a brief delay
    setTimeout(() => {
      setShowFeedback(true);
    }, 500);
  };

  // 🎯 Continue to next exercise or complete lesson
  const handleContinue = () => {
    setShowFeedback(false);
    setShowResult(false);
    setSelectedOption('');

    if (currentExerciseIndex < totalExercises - 1) {
      // Next exercise
      Animated.sequence([
        Animated.timing(exerciseSlideAnim, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(exerciseSlideAnim, {
          toValue: screenWidth,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(exerciseSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Lesson complete
      setIsLessonComplete(true);
    }
  };

  // 🎯 Try again for incorrect answers
  const handleTryAgain = () => {
    setShowFeedback(false);
    setShowResult(false);
    setSelectedOption('');
  };

  // 🎯 Complete lesson and return to map
  const handleLessonComplete = () => {
    navigation.goBack();
  };

  // Calculate stats for lesson completion
  const lessonStats = {
    correctAnswers,
    totalQuestions: totalExercises,
    xpGained: correctAnswers * 10,
    streakCount: 7,
    timeSpent: 180, // 3 minutes
    accuracy: Math.round((correctAnswers / totalExercises) * 100),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={DUOLINGO_COLORS.BACKGROUND.PRIMARY} />

      {/* Top Bar */}
      <View style={styles.topBarPlaceholder}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={DUOLINGO_COLORS.TEXT.PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.heartsDisplay}>
          <Ionicons name="heart" size={20} color={DUOLINGO_COLORS.RED.DEFAULT} />
          <Text style={styles.heartsText}>{hearts}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <DuolingoProgressBar
          progress={(currentExerciseIndex + 1) / totalExercises}
          totalQuestions={totalExercises}
          currentQuestion={currentExerciseIndex + 1}
          animated={true}
        />
      </View>

      {/* Exercise Content */}
      <Animated.View 
        style={[
          styles.exerciseContainer,
          {
            transform: [{ translateX: exerciseSlideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <DuolingoExerciseCard
          type={currentExercise.type}
          question={currentExercise.question}
          options={currentExercise.options}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          disabled={showResult}
          showResult={showResult}
          correctAnswer={currentExercise.correctAnswer}
          image={currentExercise.image}
          audio={currentExercise.audio}
        />
      </Animated.View>

      {/* Check Button */}
      <View style={styles.buttonContainer}>
        <DuolingoButton
          variant={selectedOption ? 'primary' : 'secondary'}
          size="large"
          onPress={handleCheckAnswer}
          disabled={!selectedOption || showResult}
          style={styles.checkButton}
        >
          {showResult ? 'Continuar' : 'Comprobar'}
        </DuolingoButton>
      </View>

      {/* Feedback */}
      <DuolingoFeedback
        type={feedbackType}
        message={getFeedbackMessage()}
        explanation={feedbackType !== 'correct' ? currentExercise.explanation : undefined}
        onContinue={handleContinue}
        onTryAgain={feedbackType === 'incorrect' ? handleTryAgain : undefined}
        visible={showFeedback}
      />

      {/* Lesson Complete */}
      <DuolingoLessonComplete
        visible={isLessonComplete}
        stats={lessonStats}
        onContinue={handleLessonComplete}
        onReview={() => console.log('Review lesson')}
        onShare={() => console.log('Share results')}
        lessonTitle="Mantras Básicos"
        levelUp={lessonStats.xpGained >= 100}
        newLevel={lessonStats.xpGained >= 100 ? 13 : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
  },
  topBarPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DUOLINGO_COLORS.GRAY[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DUOLINGO_COLORS.RED.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heartsText: {
    fontSize: 16,
    fontWeight: '700',
    color: DUOLINGO_COLORS.RED.DEFAULT,
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exerciseContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  checkButton: {
    width: '100%',
  },
});

export default LessonExerciseScreen;
