import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { gitaDataService } from '../services/GitaDataService';
import { LearningPath, Lesson, GameState } from '../types';
import UnitSection from '../components/learning-path/UnitSection';
import DuolingoTopBar from '../components/DuolingoTopBar';
import WeeklyGoalWidget from '../components/WeeklyGoalWidget';
import HeartService from '../services/HeartService';
import { audioService } from '../services/AudioService';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedButton } from '../components/AnimatedButton';
import { NeomorphicCard } from '../components/NeomorphicCard';
import { FloatingBubbles, StarParticles } from '../components/ParticleEffects';

interface HomeScreenProps {
  readonly navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      // ✅ Usar HeartService para obtener GameState con hearts correctos
      const [path, state] = await Promise.all([
        gitaDataService.getLearningPath(),
        HeartService.loadGameState(), // Usar HeartService en lugar de gitaDataService
      ]);
      setLearningPath(path);
      setGameState(state);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'No se pudo cargar tu ruta de aprendizaje.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameStateUpdate = (newState: GameState) => {
    setGameState(newState);
    HeartService.saveGameState(newState);
  };

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.status === 'locked') {
      Alert.alert('Lección bloqueada', 'Completa las lecciones anteriores para desbloquear esta.');
      return;
    }

    if (gameState && gameState.hearts <= 0) {
      Alert.alert(
        '¡Sin corazones!',
        'Has agotado todos tus corazones. Practica lecciones anteriores para recuperarlos o espera a que se recarguen.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    
    navigation.navigate('Lesson', { 
      lessonId: lesson.id,
      chapterNumber: lesson.chapterNumber 
    });
  };
  
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* ✨ Botón animado para acceder al mapa visual */}
      <AnimatedButton
        title="Ver Mapa de Aprendizaje"
        onPress={() => {
          audioService.playBubbleTap();
          navigation.navigate('LearningPath');
        }}
        variant="primary"
        size="large"
        icon={<Ionicons name="map" size={24} color="white" />}
        glowing={true}
        style={styles.mapButton}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Construyendo tu camino...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✨ Espacio extra para cámara frontal integrada */}
      <View style={styles.notchSafeArea} />
      
      {/* 🫧 Partículas de fondo */}
      <FloatingBubbles 
        bubbleCount={4} 
        colors={['rgba(74, 144, 226, 0.08)', 'rgba(255, 107, 53, 0.08)']}
        speed={20000}
      />
      <StarParticles starCount={8} twinkleSpeed={4000} />
      
      {/* ✨ TopBar Duolingo con Hearts, Gems, Streak, XP */}
      {gameState && (
        <DuolingoTopBar 
          gameState={gameState}
          onGameStateUpdate={handleGameStateUpdate}
          onHeartPress={() => Alert.alert('Hearts', 'Shop de hearts próximamente!')}
          onGemPress={() => Alert.alert('Gems', 'Shop de gems próximamente!')}
          onStreakPress={() => Alert.alert('Streak', `¡${gameState.streak} días seguidos! 🔥`)}
        />
      )}

      {/* ✨ Weekly Goal Widget */}
      {gameState && (
        <WeeklyGoalWidget
          currentXP={gameState.xp}
          weeklyGoal={300} // Meta semanal de 300 XP
          streakDays={gameState.streak}
          onPress={() => Alert.alert('Meta Semanal', '¡Sigue practicando para alcanzar tu meta!')}
        />
      )}
      
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.pathContainer}
      >
        {learningPath?.units.map((unit: any) => (
          <UnitSection
            key={unit.chapterNumber}
            unit={unit}
            onLessonPress={handleLessonPress}
            currentLessonId={`${learningPath.lastUnlockedLesson.chapterNumber}-${learningPath.lastUnlockedLesson.lessonNumber}`}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  // ✨ Espacio para cámara frontal integrada
  notchSafeArea: {
    height: 20, // Espacio extra para la cámara frontal
    backgroundColor: 'white',
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
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  mapButton: {
    backgroundColor: '#1CB0F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  pathContainer: {
    paddingTop: 20,
    paddingBottom: 50,
  },
});
