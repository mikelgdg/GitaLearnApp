import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LineChart, ContributionGraph } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { UserStats, Achievement, Chapter } from '../types';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [studyDates, setStudyDates] = useState<{ date: string; count: number }[]>([]);
  const [versesMemorizedHistory, setVersesMemorizedHistory] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [chapterProgress, setChapterProgress] = useState<(Chapter & { progress: number })[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      const userStats = await gitaDataService.getUserStats();
      setStats(userStats);

      // Datos de ejemplo para los gráficos
      const sampleStudyDates = [
        { date: '2025-07-20', count: 1 },
        { date: '2025-07-21', count: 2 },
        { date: '2025-07-22', count: 3 },
        { date: '2025-07-25', count: 2 },
        { date: '2025-07-30', count: 4 },
        { date: '2025-08-01', count: 1 },
      ];
      setStudyDates(sampleStudyDates);

      const sampleHistory = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [10, 20, 15, 30, 45, 50],
      };
      setVersesMemorizedHistory(sampleHistory);

      const allChapters = await gitaDataService.getAllChapters();
      const progressData = await gitaDataService.getStudyProgress();
      const chapterProgressData = allChapters.map(chapter => {
        const versesInChapter = progressData.filter(p => p.verseId.startsWith(`${chapter.number}-`));
        const progress = (versesInChapter.length / chapter.versesCount) * 100;
        return { ...chapter, progress };
      });
      setChapterProgress(chapterProgressData);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tu progreso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tu Progreso</Text>
          <Text style={styles.headerSubtitle}>Un viaje de mil versos comienza con uno solo.</Text>
        </View>

        {/* Heatmap de Contribuciones */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>🔥 Días de Estudio</Text>
          <ContributionGraph
            values={studyDates}
            endDate={new Date('2025-08-02')}
            numDays={105}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            gutterSize={2}
            squareSize={20}
            tooltipDataAttrs={() => ({})}
          />
        </View>

        {/* Gráfico de Versos Memorizados */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📖 Versos Memorizados</Text>
          <LineChart
            data={{
              labels: versesMemorizedHistory.labels,
              datasets: [{ data: versesMemorizedHistory.data }],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Progreso por Capítulo */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📚 Progreso por Capítulo</Text>
          {chapterProgress.map(chapter => (
            <View key={chapter.number} style={styles.chapterProgressItem}>
              <Text style={styles.chapterTitleText}>{chapter.number}. {chapter.title}</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${chapter.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(chapter.progress)}%</Text>
            </View>
          ))}
        </View>

        {/* Logros */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🏆 Logros Desbloqueados</Text>
          {stats?.achievements && stats.achievements.length > 0 ? (
            stats.achievements.map(achievement => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementTextContainer}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAchievementsText}>Aún no has desbloqueado logros. ¡Sigue estudiando!</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF9933',
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  chartContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chapterProgressItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterTitleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  progressBarContainer: {
    width: 80,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
  achievementItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noAchievementsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});
