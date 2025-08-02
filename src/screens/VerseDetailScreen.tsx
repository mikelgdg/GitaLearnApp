import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VerseCard from '../components/common/VerseCard';
import { gitaDataService } from '../services/GitaDataService';
import { Verse, StudyProgress } from '../types';

interface VerseDetailScreenProps {
  readonly navigation: any;
  readonly route: {
    params: {
      verse: Verse;
    };
  };
}

export default function VerseDetailScreen({ navigation, route }: any) {
  const { verse } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [studyProgress, setStudyProgress] = useState<StudyProgress | null>(null);
  const [showCommentary, setShowCommentary] = useState(false);
  const [allChapterVerses, setAllChapterVerses] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  useEffect(() => {
    loadVerseData();
    loadChapterVerses();
  }, [verse]);

  const loadVerseData = async () => {
    try {
      // Cargar progreso del verso
      const progress = await gitaDataService.getStudyProgress();
      const verseId = gitaDataService.getVerseId(verse);
      const verseProgress = progress.find(p => p.verseId === verseId);
      setStudyProgress(verseProgress || null);

      // Cargar si está en favoritos
      const isFav = await gitaDataService.isVerseFavorite(verseId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error loading verse data:', error);
    }
  };

  const loadChapterVerses = async () => {
    const chapterVerses = await gitaDataService.getVersesByChapter(verse.capitulo);
    setAllChapterVerses(chapterVerses);
    
    const currentIndex = chapterVerses.findIndex(
      v => v.verso === verse.verso
    );
    setCurrentVerseIndex(currentIndex);
  };

  const handleFavoritePress = async () => {
    const verseId = gitaDataService.getVerseId(verse);
    if (isFavorite) {
      await gitaDataService.removeVerseFromFavorites(verseId);
      setIsFavorite(false);
      Alert.alert('Eliminado de favoritos');
    } else {
      await gitaDataService.addVerseToFavorites(verseId);
      setIsFavorite(true);
      Alert.alert('Añadido a favoritos');
    }
  };

  const handleAudioPress = () => {
    // Implementar reproducción de audio en versión futura
    Alert.alert(
      'Audio próximamente',
      'La función de audio estará disponible pronto'
    );
  };

  const handleStudyPress = () => {
    navigation.navigate('MainTabs', {
      screen: 'Study',
      params: {
        mode: 'srs',
        initialVerse: verse,
      },
    });
  };

  const handleShare = async () => {
    try {
      const shareContent = `${verse.sanskrit ? verse.sanskrit + '\n\n' : ''}${verse.transliteracion ? verse.transliteracion + '\n\n' : ''}${verse.traduccion}\n\n— Bhagavad Gītā ${verse.capitulo}.${verse.verso}`;
      
      await Share.share({
        message: shareContent,
        title: `Bhagavad Gītā ${verse.capitulo}.${verse.verso}`,
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const navigateToVerse = (direction: 'prev' | 'next') => {
    let newIndex: number;
    
    if (direction === 'prev' && currentVerseIndex > 0) {
      newIndex = currentVerseIndex - 1;
    } else if (direction === 'next' && currentVerseIndex < allChapterVerses.length - 1) {
      newIndex = currentVerseIndex + 1;
    } else {
      return; // No hay verso anterior/siguiente
    }

    const newVerse = allChapterVerses[newIndex];
    navigation.replace('VerseDetail', { verse: newVerse });
  };

  const getChapterTitle = (chapterNumber: number): string => {
    const titles: Record<number, string> = {
      1: 'Arjuna Viṣāda Yoga',
      2: 'Sāṅkhya Yoga',
      3: 'Karma Yoga',
      4: 'Jñāna Karma Saṃnyāsa Yoga',
      // ... agregar todos los títulos
    };
    return titles[chapterNumber] || `Capítulo ${chapterNumber}`;
  };

  const canNavigatePrev = currentVerseIndex > 0;
  const canNavigateNext = currentVerseIndex < allChapterVerses.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header personalizado */}
      <LinearGradient
        colors={['#FF9933', '#FFCC80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              Capítulo {verse.capitulo}
            </Text>
            <Text style={styles.headerSubtitle}>
              {getChapterTitle(verse.capitulo)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Navegación entre versos */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, !canNavigatePrev && styles.navButtonDisabled]}
            onPress={() => navigateToVerse('prev')}
            disabled={!canNavigatePrev}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={canNavigatePrev ? '#FF9933' : '#CCC'} 
            />
            <Text style={[styles.navText, !canNavigatePrev && styles.navTextDisabled]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <View style={styles.versePosition}>
            <Text style={styles.versePositionText}>
              Verso {verse.verso} de {allChapterVerses.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, !canNavigateNext && styles.navButtonDisabled]}
            onPress={() => navigateToVerse('next')}
            disabled={!canNavigateNext}
          >
            <Text style={[styles.navText, !canNavigateNext && styles.navTextDisabled]}>
              Siguiente
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={canNavigateNext ? '#FF9933' : '#CCC'} 
            />
          </TouchableOpacity>
        </View>

        {/* Card principal del verso */}
        <View style={styles.verseContainer}>
          <VerseCard
            verse={verse}
            showSanskrit={true}
            showTransliteration={true}
            showTranslation={true}
            showCommentary={showCommentary}
            onAudioPress={handleAudioPress}
            onFavoritePress={handleFavoritePress}
            onStudyPress={handleStudyPress}
            isFavorite={isFavorite}
          />
        </View>

        {/* Toggle para comentario */}
        {!!verse.comentario && (
          <View style={styles.commentaryToggle}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowCommentary(!showCommentary)}
            >
              <Ionicons 
                name={showCommentary ? "eye-off" : "eye"} 
                size={20} 
                color="#FF9933" 
              />
              <Text style={styles.toggleText}>
                {showCommentary ? 'Ocultar comentario' : 'Ver comentario'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Información de progreso */}
        {studyProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>📈 Tu progreso con este verso</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{studyProgress.reviewCount}</Text>
                <Text style={styles.progressLabel}>Repasos</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>
                  {Math.round(studyProgress.easeFactor * 100) / 100}
                </Text>
                <Text style={styles.progressLabel}>Facilidad</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{studyProgress.interval}</Text>
                <Text style={styles.progressLabel}>Días</Text>
              </View>
            </View>
            <Text style={styles.nextReviewText}>
              Próximo repaso: {studyProgress.nextReview.toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleStudyPress}
          >
            <Ionicons name="school" size={24} color="white" />
            <Text style={styles.primaryActionText}>Estudiar ahora</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('ChapterDetail', { 
                chapterNumber: verse.capitulo 
              })}
            >
              <Ionicons name="list" size={20} color="#FF9933" />
              <Text style={styles.secondaryActionText}>Ver capítulo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleShare}
            >
              <Ionicons name="share" size={20} color="#FF9933" />
              <Text style={styles.secondaryActionText}>Compartir</Text>
            </TouchableOpacity>
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
  header: {
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  shareButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: 14,
    color: '#FF9933',
    fontWeight: '500',
    marginHorizontal: 4,
  },
  navTextDisabled: {
    color: '#CCC',
  },
  versePosition: {
    alignItems: 'center',
  },
  versePositionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  verseContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  commentaryToggle: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#FF9933',
    fontWeight: '500',
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9933',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  nextReviewText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  primaryAction: {
    backgroundColor: '#FF9933',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryActionText: {
    color: '#FF9933',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
