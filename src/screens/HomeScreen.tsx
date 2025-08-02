import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { Verse, UserStats } from '../types';

interface HomeScreenProps {
  readonly navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [verseOfTheDay, setVerseOfTheDay] = useState<Verse | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [versesForReview, setVersesForReview] = useState<Verse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const [verse, stats, reviewVerses] = await Promise.all([
        gitaDataService.getVerseOfTheDay(),
        gitaDataService.getUserStats(),
        gitaDataService.getVersesForReview(),
      ]);
      
      setVerseOfTheDay(verse);
      setUserStats(stats);
      setVersesForReview(reviewVerses);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 18) return '☀️ Buenas tardes';
    return '🌙 Buenas noches';
  };

  const formatVerseId = (verse: Verse) => `${verse.capitulo}.${verse.verso}`;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with greeting */}
        <LinearGradient
          colors={['#FF9933', '#FFFFFF', '#138808']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.appTitle}>GitaLearn</Text>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#FF9933" />
            <Text style={styles.statNumber}>{userStats?.totalVersesMemorized || 0}</Text>
            <Text style={styles.statLabel}>Versos memorizados</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{userStats?.streakDays || 0}</Text>
            <Text style={styles.statLabel}>Días seguidos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#4ECDC4" />
            <Text style={styles.statNumber}>{Math.floor((userStats?.totalStudyTime || 0) / 60)}</Text>
            <Text style={styles.statLabel}>Horas estudiadas</Text>
          </View>
        </View>

        {/* Verse of the Day */}
        {verseOfTheDay && (
          <View style={styles.verseOfDayContainer}>
            <Text style={styles.sectionTitle}>📖 Verso del día</Text>
            <TouchableOpacity
              style={styles.verseCard}
              onPress={() => navigation?.navigate?.('VerseDetail', { verse: verseOfTheDay })}
            >
              <View style={styles.verseHeader}>
                <Text style={styles.verseReference}>
                  Bhagavad Gītā {formatVerseId(verseOfTheDay)}
                </Text>
              </View>
              {!!verseOfTheDay.sanskrit && (
                <Text style={styles.sanskritText}>{verseOfTheDay.sanskrit}</Text>
              )}
              {!!verseOfTheDay.transliteracion && (
                <Text style={styles.transliterationText}>{verseOfTheDay.transliteracion}</Text>
              )}
              <Text style={styles.translationText} numberOfLines={3}>
                {verseOfTheDay.traduccion}
              </Text>
              <View style={styles.readMoreContainer}>
                <Text style={styles.readMoreText}>Toca para leer completo</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>🚀 Acciones rápidas</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => navigation?.navigate?.('Study', { mode: 'srs' })}
          >
            <Ionicons name="school" size={28} color="white" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Repasar ahora</Text>
              <Text style={styles.actionSubtitle}>
                {versesForReview.length > 0 
                  ? `${versesForReview.length} versos pendientes`
                  : 'Empieza tu práctica diaria'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.fillInBlankAction]}
            onPress={() => navigation?.navigate?.('Study', { mode: 'fill-in-the-blank' })}
          >
            <Ionicons name="create" size={24} color="white" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Completar el verso</Text>
              <Text style={styles.actionSubtitle}>
                Pon a prueba tu memoria
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation?.navigate?.('Chapters')}
            >
              <Ionicons name="library" size={24} color="#FF9933" />
              <Text style={styles.secondaryActionText}>Explorar capítulos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation?.navigate?.('Progress')}
            >
              <Ionicons name="stats-chart" size={24} color="#4ECDC4" />
              <Text style={styles.secondaryActionText}>Ver progreso</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Achievements */}
        {userStats?.achievements && userStats.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>🏆 Logros recientes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userStats.achievements.slice(-3).map((achievement, index) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDesc} numberOfLines={2}>
                    {achievement.description}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Study Reminder */}
        <View style={styles.reminderContainer}>
          <View style={styles.reminderCard}>
            <Ionicons name="notifications" size={24} color="#FF9933" />
            <View style={styles.reminderTextContainer}>
              <Text style={styles.reminderTitle}>Mantén tu práctica constante</Text>
              <Text style={styles.reminderText}>
                La repetición espaciada funciona mejor con práctica diaria. 
                ¡Dedica solo 10 minutos al día para mejores resultados!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 90,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  verseOfDayContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  verseCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseHeader: {
    marginBottom: 15,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9933',
  },
  sanskritText: {
    fontSize: 18,
    fontFamily: 'System',
    color: '#333',
    marginBottom: 8,
    lineHeight: 26,
  },
  transliterationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  translationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionButton: {
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#FF9933',
    marginBottom: 15,
  },
  fillInBlankAction: {
    backgroundColor: '#2196F3',
    marginBottom: 15,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    backgroundColor: 'white',
    flex: 0.48,
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    textAlign: 'center',
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reminderContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  reminderCard: {
    backgroundColor: '#FFF5E6',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  reminderText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
