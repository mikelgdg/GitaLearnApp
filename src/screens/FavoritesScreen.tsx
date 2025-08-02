import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { Verse } from '../types';
import VerseCard from '../components/common/VerseCard';
import { useIsFocused } from '@react-navigation/native';

interface FavoritesScreenProps {
  navigation: any;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const [favoriteVerses, setFavoriteVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const favorites = await gitaDataService.getFavoriteVerses();
      setFavoriteVerses(favorites);
    } catch (error) {
      console.error('Error loading favorite verses:', error);
      Alert.alert('Error', 'No se pudieron cargar los versos favoritos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersePress = (verse: Verse) => {
    navigation.navigate('VerseDetail', { verse });
  };

  const handleRemoveFavorite = async (verseId: string) => {
    await gitaDataService.removeVerseFromFavorites(verseId);
    loadFavorites();
  };

  const renderVerseItem = ({ item: verse }: { item: Verse }) => (
    <TouchableOpacity
      style={styles.verseItem}
      onPress={() => handleVersePress(verse)}
    >
      <VerseCard
        verse={verse}
        showActions={true}
        isFavorite={true}
        onFavoritePress={() => handleRemoveFavorite(`${verse.capitulo}-${verse.verso}`)}
      />
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#CCC" />
      <Text style={styles.emptyText}>Aún no tienes versos favoritos.</Text>
      <Text style={styles.emptySubText}>
        Toca el icono de corazón en un verso para añadirlo aquí.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Versos Favoritos</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteVerses}
          renderItem={renderVerseItem}
          keyExtractor={(verse) => `${verse.capitulo}-${verse.verso}`}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  verseItem: {
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
});
