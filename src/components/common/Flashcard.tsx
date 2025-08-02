import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Verse } from '../../types';

interface FlashcardProps {
  verse: Verse;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ verse, isFlipped, onFlip }: FlashcardProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const flipCard = () => {
    Animated.timing(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      duration: 600,
      useNativeDriver: true,
    }).start();
    onFlip();
  };

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity onPress={flipCard} style={styles.container}>
      <Animated.View style={[styles.card, styles.front, frontAnimatedStyle]}>
        <Text style={styles.cardTitle}>Traducción</Text>
        <Text style={styles.cardText}>{verse.traduccion}</Text>
        <Text style={styles.cardHint}>Toca para ver el sánscrito</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
        <Text style={styles.cardTitle}>Sánscrito</Text>
        <Text style={[styles.cardText, styles.sanskritText]}>{verse.sanskrit}</Text>
        <Text style={styles.cardText}>{verse.transliteracion}</Text>
        <Text style={styles.cardHint}>Toca para volver a la traducción</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    marginVertical: 20,
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
});
