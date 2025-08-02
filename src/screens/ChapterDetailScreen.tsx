import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { Verse, Chapter } from '../types';
import VerseCard from '../components/common/VerseCard';

interface ChapterDetailScreenProps {
  readonly route: {
    readonly params: {
      readonly chapterNumber: number;
    };
  };
  readonly navigation: any;
}

export default function ChapterDetailScreen({ route, navigation }: ChapterDetailScreenProps) {
  const { chapterNumber } = route.params;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChapterData();
  }, [chapterNumber]);

  const loadChapterData = async () => {
    try {
      setIsLoading(true);
      const [chapterData, versesData] = await Promise.all([
        gitaDataService.getChapter(chapterNumber),
        gitaDataService.getVersesByChapter(chapterNumber),
      ]);
      
      setChapter(chapterData);
      setVerses(versesData);
    } catch (error) {
      console.error('Error loading chapter data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChapterData();
    setRefreshing(false);
  };

  const handleVersePress = (verse: Verse) => {
    navigation.navigate('VerseDetail', { verse });
  };

  const renderVerseItem = ({ item: verse }: { item: Verse }) => (
    <TouchableOpacity
      style={styles.verseItem}
      onPress={() => handleVersePress(verse)}
    >
      <VerseCard
        verse={verse}
        showActions={false}
      />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#FF9933', '#FFFFFF', '#138808']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.chapterNumber}>Capítulo {chapterNumber}</Text>
            <Text style={styles.chapterTitle}>
              {chapter?.title || 'Cargando...'}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      {chapter && (
        <View style={styles.chapterInfoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="book" size={20} color="#FF9933" />
            <Text style={styles.infoText}>
              {chapter.versesCount} versos
            </Text>
          </View>
          
          <Text style={styles.chapterDescription}>
            {chapter.description}
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando capítulo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={verses}
        renderItem={renderVerseItem}
        keyExtractor={(verse) => `${verse.capitulo}-${verse.verso}`}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

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
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  titleContainer: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    fontWeight: '500',
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  chapterInfoContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  chapterDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  verseItem: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
});
