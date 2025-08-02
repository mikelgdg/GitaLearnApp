import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { Verse, StudyProgress } from '../types';

type StudyMode = 'srs' | 'fill-in-the-blank';

export default function StudyScreen({ navigation, route }: any) {
  const [versesToReview, setVersesToReview] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('srs');
  const [hiddenVerseText, setHiddenVerseText] = useState('');
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mode = route.params?.mode || 'srs';
    setStudyMode(mode);
    loadVerses(mode);
    setSessionStartTime(new Date());
  }, [route.params?.mode]);

  const loadVerses = async (mode: StudyMode) => {
    try {
      setIsLoading(true);
      let verses: Verse[];
      if (mode === 'fill-in-the-blank') {
        verses = await Promise.all(
          Array.from({ length: 10 }, () => gitaDataService.getRandomVerse())
        );
      } else {
        const versesFromSrs = await gitaDataService.getVersesForReview();
        if (versesFromSrs.length === 0) {
          verses = await Promise.all(
            Array.from({ length: 5 }, () => gitaDataService.getRandomVerse())
          );
        } else {
          verses = versesFromSrs;
        }
      }
      setVersesToReview(verses);
      if (verses.length > 0 && mode === 'fill-in-the-blank') {
        setHiddenVerseText(gitaDataService.getVerseWithHiddenWords(verses[0]));
      }
    } catch (error) {
      console.error("Error loading verses:", error);
      Alert.alert("Error", "No se pudieron cargar los versos para estudiar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluation = async (difficulty: StudyProgress['difficulty']) => {
    if (currentVerseIndex >= versesToReview.length) return;

    const verse = versesToReview[currentVerseIndex];
    if (studyMode === 'srs') {
        await gitaDataService.saveVerseProgress(verse, difficulty);
    }

    goToNextVerse();
  };

  const goToNextVerse = () => {
    if (currentVerseIndex < versesToReview.length - 1) {
      const nextIndex = currentVerseIndex + 1;
      setCurrentVerseIndex(nextIndex);
      if (studyMode === 'fill-in-the-blank' && versesToReview[nextIndex]) {
        setHiddenVerseText(gitaDataService.getVerseWithHiddenWords(versesToReview[nextIndex]));
      }
      handleFlip(true); // Reset flip animation to show front
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    const endTime = new Date();
    const duration = sessionStartTime ? (endTime.getTime() - sessionStartTime.getTime()) / 1000 : 0;
    
    if (studyMode === 'srs') {
        await gitaDataService.recordStudySession({
          date: new Date(),
          versesStudied: versesToReview.map(v => gitaDataService.getVerseId(v)),
          duration: Math.round(duration),
          correctAnswers: versesToReview.length, 
          totalQuestions: versesToReview.length,
        });
    }

    Alert.alert(
      "¡Felicidades!",
      "Has completado tu sesión de estudio.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const handleFlip = (forceReset = false) => {
    if (forceReset) {
      animatedValue.setValue(0);
      setIsFlipped(false);
      return;
    }
    const toValue = isFlipped ? 0 : 180;
    Animated.timing(animatedValue, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
        setIsFlipped(!isFlipped);
    });
  };

  if (isLoading) {
    return <SafeAreaView style={styles.container}><Text style={styles.loadingText}>Cargando versos...</Text></SafeAreaView>;
  }

  if (versesToReview.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.infoText}>¡Excelente! No tienes versos para repasar hoy.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentVerse = versesToReview[currentVerseIndex];
  const progress = (currentVerseIndex + 1) / versesToReview.length;

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const renderCardContent = () => {
    if (studyMode === 'fill-in-the-blank') {
      return (
        <>
          <Animated.View style={[styles.card, styles.front, frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}>
            <Text style={styles.cardTitle}>Completa el verso</Text>
            <Text style={styles.cardText}>{hiddenVerseText}</Text>
            <Text style={styles.cardHint}>Toca para ver la respuesta</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.back, backAnimatedStyle, { backfaceVisibility: 'hidden' }]}>
            <Text style={styles.cardTitle}>Respuesta</Text>
            <Text style={[styles.cardText, styles.sanskritText]}>{currentVerse.transliteracion || currentVerse.sanskrit}</Text>
            <Text style={styles.cardHint}>Toca para volver</Text>
          </Animated.View>
        </>
      );
    }

    // SRS mode
    return (
      <>
        <Animated.View style={[styles.card, styles.front, frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}>
          <Text style={styles.cardTitle}>Traducción</Text>
          <Text style={styles.cardText}>{currentVerse.traduccion}</Text>
          <Text style={styles.cardHint}>Toca para ver el sánscrito</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.back, backAnimatedStyle, { backfaceVisibility: 'hidden' }]}>
          <Text style={styles.cardTitle}>Sánscrito</Text>
          <Text style={[styles.cardText, styles.sanskritText]}>{currentVerse.sanskrit}</Text>
          <Text style={styles.cardText}>{currentVerse.transliteracion}</Text>
          <Text style={styles.cardHint}>Toca para volver a la traducción</Text>
        </Animated.View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={30} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentVerseIndex + 1}/{versesToReview.length}</Text>
      </View>

      <View style={styles.flashcardContainer}>
        <TouchableOpacity onPress={() => handleFlip()} style={styles.flashcardTouchable}>
          {renderCardContent()}
        </TouchableOpacity>
      </View>

      {isFlipped && (
        <View style={styles.evaluationContainer}>
           {studyMode === 'srs' ? (
            <>
              <Text style={styles.evaluationTitle}>¿Cómo de bien lo recordabas?</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={[styles.evalButton, styles.againButton]} onPress={() => handleEvaluation('again')}>
                  <Text style={styles.evalButtonText}>Otra vez</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.evalButton, styles.hardButton]} onPress={() => handleEvaluation('hard')}>
                  <Text style={styles.evalButtonText}>Difícil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.evalButton, styles.goodButton]} onPress={() => handleEvaluation('good')}>
                  <Text style={styles.evalButtonText}>Bien</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.evalButton, styles.easyButton]} onPress={() => handleEvaluation('easy')}>
                  <Text style={styles.evalButtonText}>Fácil</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity style={[styles.evalButton, styles.goodButton, styles.nextButton]} onPress={goToNextVerse}>
              <Text style={styles.evalButtonText}>Siguiente</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginHorizontal: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
  },
  flashcardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flashcardTouchable: {
    width: '100%',
    height: '80%',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  front: {
    position: 'absolute',
    top: 0,
  },
  back: {
    position: 'absolute',
    top: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    position: 'absolute',
    top: 20,
  },
  cardText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#333',
    lineHeight: 32,
  },
  sanskritText: {
    fontFamily: 'sans-serif', // Specify a font that supports Devanagari if needed
  },
  cardHint: {
    fontSize: 14,
    color: '#aaa',
    position: 'absolute',
    bottom: 20,
    fontStyle: 'italic',
  },
  evaluationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  evaluationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  evalButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  againButton: {
    backgroundColor: '#f44336',
  },
  hardButton: {
    backgroundColor: '#FF9800',
  },
  goodButton: {
    backgroundColor: '#4CAF50',
  },
  easyButton: {
    backgroundColor: '#2196F3',
  },
  nextButton: {
    width: '80%',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  goBackButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
