import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { Verse, StudyProgress } from '../types';

interface StudyScreenProps {
  readonly navigation: any;
  readonly route: {
    params: {
      mode: 'srs' | 'browse' | 'recitation';
    };
  };
}

const { width } = Dimensions.get('window');

export default function StudyScreen({ navigation, route }: StudyScreenProps) {
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [versesToStudy, setVersesToStudy] = useState<Verse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    startTime: Date.now(),
  });
  
  const flipAnimation = new Animated.Value(0);
  const { mode } = route.params;

  useEffect(() => {
    loadStudyVerses();
  }, [mode]);

  const loadStudyVerses = async () => {
    try {
      setIsLoading(true);
      let verses: Verse[];

      switch (mode) {
        case 'srs':
          verses = await gitaDataService.getVersesForReview();
          if (verses.length === 0) {
            // Si no hay versos para revisar, añadir algunos aleatorios
            const allVerses = gitaDataService.getAllVerses();
            verses = allVerses.slice(0, 5); // Tomar los primeros 5 como ejemplo
          }
          break;
        case 'browse':
          verses = gitaDataService.getAllVerses().slice(0, 10);
          break;
        case 'recitation':
          verses = gitaDataService.getVersesByChapter(2); // Capítulo 2 por defecto
          break;
        default:
          verses = [];
      }

      setVersesToStudy(verses);
      if (verses.length > 0) {
        setCurrentVerse(verses[0]);
      }
    } catch (error) {
      console.error('Error loading study verses:', error);
      Alert.alert('Error', 'No se pudieron cargar los versos para estudiar');
    } finally {
      setIsLoading(false);
    }
  };

  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAnswer(!showAnswer);
    });
  };

  const handleDifficultySelection = async (difficulty: StudyProgress['difficulty']) => {
    if (!currentVerse) return;

    try {
      await gitaDataService.saveVerseProgress(currentVerse, difficulty);
      
      // Actualizar estadísticas de la sesión
      const isCorrect = difficulty === 'good' || difficulty === 'easy';
      setSessionStats(prev => ({
        ...prev,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
      }));

      nextVerse();
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Error', 'No se pudo guardar el progreso');
    }
  };

  const nextVerse = () => {
    if (currentIndex < versesToStudy.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentVerse(versesToStudy[nextIndex]);
      setShowAnswer(false);
      flipAnimation.setValue(0);
    } else {
      // Sesión completada
      completeSession();
    }
  };

  const completeSession = async () => {
    const endTime = Date.now();
    const duration = Math.round((endTime - sessionStats.startTime) / 60000); // minutos

    try {
      await gitaDataService.recordStudySession({
        date: new Date(),
        versesStudied: versesToStudy.map(v => `${v.capitulo}-${v.verso}`),
        correctAnswers: sessionStats.correct,
        totalQuestions: sessionStats.total,
        duration,
      });

      Alert.alert(
        '¡Sesión completada!',
        `Has estudiado ${sessionStats.total} versos en ${duration} minutos.\n` +
        `Precisión: ${Math.round((sessionStats.correct / sessionStats.total) * 100)}%`,
        [
          { text: 'Continuar estudiando', onPress: () => loadStudyVerses() },
          { text: 'Volver al inicio', onPress: () => navigation.navigate('Home') },
        ]
      );
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'again': return '#FF6B6B';
      case 'hard': return '#FFA726';
      case 'good': return '#66BB6A';
      case 'easy': return '#4CAF50';
      default: return '#E0E0E0';
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'again': return 'Repetir';
      case 'hard': return 'Difícil';
      case 'good': return 'Bien';
      case 'easy': return 'Fácil';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparando sesión de estudio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (versesToStudy.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.emptyTitle}>¡Excelente trabajo!</Text>
          <Text style={styles.emptyText}>
            No tienes versos pendientes de revisión por ahora.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Chapters')}
          >
            <Text style={styles.emptyButtonText}>Explorar capítulos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentVerse) return null;

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {versesToStudy.length}
        </Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            ✅ {sessionStats.correct}/{sessionStats.total}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar,
            { width: `${((currentIndex + 1) / versesToStudy.length) * 100}%` }
          ]}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.flashcard}
          onPress={flipCard}
          activeOpacity={0.8}
        >
          {/* Front of card */}
          <Animated.View 
            style={[
              styles.cardSide,
              styles.cardFront,
              { opacity: frontOpacity }
            ]}
          >
            <Text style={styles.questionText}>
              ¿Qué dice el verso {currentVerse.capitulo}.{currentVerse.verso}?
            </Text>
            <View style={styles.hintContainer}>
              {currentVerse.sanskrit && (
                <Text style={styles.sanskritHint} numberOfLines={2}>
                  {currentVerse.sanskrit}
                </Text>
              )}
              {currentVerse.transliteracion && (
                <Text style={styles.transliterationHint} numberOfLines={2}>
                  {currentVerse.transliteracion}
                </Text>
              )}
            </View>
            <View style={styles.tapHint}>
              <Ionicons name="finger-print" size={24} color="#999" />
              <Text style={styles.tapText}>Toca para ver la respuesta</Text>
            </View>
          </Animated.View>

          {/* Back of card */}
          <Animated.View 
            style={[
              styles.cardSide,
              styles.cardBack,
              { opacity: backOpacity }
            ]}
          >
            <Text style={styles.verseReference}>
              Bhagavad Gītā {currentVerse.capitulo}.{currentVerse.verso}
            </Text>
            {currentVerse.sanskrit && (
              <Text style={styles.sanskritText}>{currentVerse.sanskrit}</Text>
            )}
            {currentVerse.transliteracion && (
              <Text style={styles.transliterationText}>{currentVerse.transliteracion}</Text>
            )}
            <Text style={styles.translationText}>{currentVerse.traduccion}</Text>
            {currentVerse.comentario && (
              <Text style={styles.commentaryText}>{currentVerse.comentario}</Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Answer Buttons */}
      {showAnswer && (
        <View style={styles.buttonContainer}>
          <Text style={styles.difficultyPrompt}>¿Qué tal lo recordaste?</Text>
          <View style={styles.difficultyButtons}>
            {(['again', 'hard', 'good', 'easy'] as const).map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: getDifficultyColor(difficulty) }
                ]}
                onPress={() => handleDifficultySelection(difficulty)}
              >
                <Text style={styles.difficultyButtonText}>
                  {getDifficultyLabel(difficulty)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Skip Button */}
      {!showAnswer && (
        <View style={styles.skipContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={nextVerse}
          >
            <Text style={styles.skipButtonText}>Saltar</Text>
            <Ionicons name="arrow-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF9933',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  flashcard: {
    height: 400,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: 30,
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  cardFront: {
    alignItems: 'center',
  },
  cardBack: {
    justifyContent: 'flex-start',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  sanskritHint: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  transliterationHint: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
  },
  tapHint: {
    alignItems: 'center',
  },
  tapText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  verseReference: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9933',
    marginBottom: 20,
    textAlign: 'center',
  },
  sanskritText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
    lineHeight: 30,
    textAlign: 'center',
  },
  transliterationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  translationText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    textAlign: 'left',
  },
  commentaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 15,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  difficultyPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  skipContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
});
