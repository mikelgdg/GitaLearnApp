import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { Verse, StudyProgress } from '../types';

export default function StudyScreen({ navigation, route }: any) {
  const [versesToReview, setVersesToReview] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadVerses();
    setSessionStartTime(new Date());
  }, []);

  const loadVerses = async () => {
    try {
      setIsLoading(true);
      const verses = await gitaDataService.getVersesForReview();
      if (verses.length === 0) {
        const randomVerses = await Promise.all(
          Array.from({ length: 5 }, () => gitaDataService.getRandomVerse())
        );
        setVersesToReview(randomVerses);
      } else {
        setVersesToReview(verses);
      }
    } catch (error) {
      console.error("Error loading verses for review:", error);
      Alert.alert("Error", "No se pudieron cargar los versos para estudiar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluation = async (difficulty: StudyProgress['difficulty']) => {
    if (currentVerseIndex >= versesToReview.length) return;

    const verse = versesToReview[currentVerseIndex];
    await gitaDataService.saveVerseProgress(verse, difficulty);

    if (currentVerseIndex < versesToReview.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
      handleFlip(); // Reset flip animation
    } else {
      const endTime = new Date();
      const duration = sessionStartTime ? (endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60) : 0;
      
      await gitaDataService.recordStudySession({
        date: new Date(),
        versesStudied: versesToReview.map(v => gitaDataService.getVerseId(v)),
        duration: Math.round(duration),
        correctAnswers: versesToReview.length, 
        totalQuestions: versesToReview.length,
      });

      Alert.alert(
        "¡Felicidades!",
        "Has completado tu sesión de estudio.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.timing(animatedValue, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
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
        <TouchableOpacity onPress={handleFlip} style={styles.flashcardTouchable}>
          <Animated.View style={[styles.card, styles.front, frontAnimatedStyle]}>
            <Text style={styles.cardTitle}>Traducción</Text>
            <Text style={styles.cardText}>{currentVerse.traduccion}</Text>
            <Text style={styles.cardHint}>Toca para ver el sánscrito</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
            <Text style={styles.cardTitle}>Sánscrito</Text>
            <Text style={[styles.cardText, styles.sanskritText]}>{currentVerse.sanskrit}</Text>
            <Text style={styles.cardText}>{currentVerse.transliteracion}</Text>
            <Text style={styles.cardHint}>Toca para volver a la traducción</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isFlipped && (
        <View style={styles.evaluationContainer}>
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
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'space-between',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#333',
  },
  goBackButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF9933',
    borderRadius: 10,
    alignSelf: 'center',
  },
  goBackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
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
    height: 300,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  front: {
    backgroundColor: 'white',
  },
  back: {
    backgroundColor: '#FFF8E1',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9933',
    marginBottom: 15,
  },
  cardText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 26,
  },
  sanskritText: {
    fontSize: 22,
    marginBottom: 10,
  },
  cardHint: {
    position: 'absolute',
    bottom: 15,
    fontSize: 12,
    color: '#999',
  },
  evaluationContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  evaluationTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  evalButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  evalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  againButton: { backgroundColor: '#FF6B6B' },
  hardButton: { backgroundColor: '#FF9933' },
  goodButton: { backgroundColor: '#4ECDC4' },
  easyButton: { backgroundColor: '#57C4E5' },
});
