import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';

interface ChaptersScreenProps {
  readonly navigation?: any;
}

interface ChapterInfo {
  number: number;
  title: string;
  versesCount: number;
  description: string;
  versesMasterized: number;
}

export default function ChaptersScreen({ navigation }: ChaptersScreenProps) {
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      setIsLoading(true);
      const chapterNumbers = gitaDataService.getChapterNumbers();
      const progress = await gitaDataService.getStudyProgress();
      
      const chaptersData: ChapterInfo[] = chapterNumbers.map(number => {
        const verses = gitaDataService.getVersesByChapter(number);
        const masterizedVerses = progress.filter(p => p.verseId.startsWith(`${number}-`));
        
        return {
          number,
          title: getChapterTitle(number),
          versesCount: verses.length,
          description: getChapterDescription(number),
          versesMasterized: masterizedVerses.length,
        };
      });
      
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChapterTitle = (chapterNumber: number): string => {
    const titles: Record<number, string> = {
      1: 'Arjuna Viṣāda Yoga',
      2: 'Sāṅkhya Yoga',
      3: 'Karma Yoga',
      4: 'Jñāna Karma Saṃnyāsa Yoga',
      5: 'Karma Saṃnyāsa Yoga',
      6: 'Ātma-saṃyama Yoga',
      7: 'Parameśvara Yoga',
      8: 'Akṣara Brahma Yoga',
      9: 'Rāja-vidyā Rāja-guhya Yoga',
      10: 'Vibhūti Yoga',
      11: 'Viśvarūpa Darśana Yoga',
      12: 'Bhakti Yoga',
      13: 'Kṣetra-kṣetrajña Vibhāga Yoga',
      14: 'Guṇa-traya Vibhāga Yoga',
      15: 'Puruṣottama Yoga',
      16: 'Daivāsura Sampad Vibhāga Yoga',
      17: 'Śraddhā-traya Vibhāga Yoga',
      18: 'Mokṣa Saṃnyāsa Yoga',
    };
    return titles[chapterNumber] || `Capítulo ${chapterNumber}`;
  };

  const getChapterDescription = (chapterNumber: number): string => {
    const descriptions: Record<number, string> = {
      1: 'La angustia de Arjuna',
      2: 'El yoga de la sabiduría discriminativa',
      3: 'El yoga de la acción',
      4: 'El yoga de la sabiduría divina',
      5: 'El yoga de la renuncia a la acción',
      6: 'El yoga de la meditación',
      7: 'El yoga del conocimiento y la realización',
      8: 'El yoga del Brahman imperecedero',
      9: 'El yoga del conocimiento real y secreto',
      10: 'El yoga de las manifestaciones divinas',
      11: 'El yoga de la forma universal',
      12: 'El yoga de la devoción',
      13: 'El yoga de la distinción entre campo y conocedor',
      14: 'El yoga de las tres guṇas',
      15: 'El yoga del Ser Supremo',
      16: 'El yoga de las naturalezas divina y demoníaca',
      17: 'El yoga de los tres tipos de fe',
      18: 'El yoga de la liberación por la renuncia',
    };
    return descriptions[chapterNumber] || `Descripción del capítulo ${chapterNumber}`;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage === 0) return '#E0E0E0';
    if (percentage < 25) return '#FF6B6B';
    if (percentage < 50) return '#FFA726';
    if (percentage < 75) return '#66BB6A';
    return '#4CAF50';
  };

  const renderChapterItem = ({ item }: { item: ChapterInfo }) => {
    const progressPercentage = item.versesCount > 0 
      ? Math.round((item.versesMasterized / item.versesCount) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.chapterCard}
        onPress={() => navigation?.navigate?.('ChapterDetail', { chapterNumber: item.number })}
      >
        <View style={styles.chapterHeader}>
          <View style={styles.chapterNumberContainer}>
            <Text style={styles.chapterNumber}>{item.number}</Text>
          </View>
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.chapterDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>

        <View style={styles.chapterStats}>
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.versesCount} versos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.versesMasterized} memorizados</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: getProgressColor(progressPercentage),
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}%</Text>
        </View>

        {progressPercentage === 100 && (
          <View style={styles.completedBadge}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.completedText}>¡Completado!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando capítulos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bhagavad Gītā</Text>
        <Text style={styles.headerSubtitle}>18 Capítulos</Text>
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderChapterItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  chapterCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chapterNumberContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chapterNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  chapterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8DC',
    borderRadius: 20,
    alignSelf: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9933',
    marginLeft: 5,
  },
});
