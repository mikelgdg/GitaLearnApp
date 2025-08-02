import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gitaDataService } from '../services/GitaDataService';
import { GameState } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const HEART_REFILL_COST = 350;

const ShopScreen = ({ navigation }: { navigation: any }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadGameState = async () => {
    const state = await gitaDataService.getGameState();
    setGameState(state);
  };

  useFocusEffect(
    useCallback(() => {
      loadGameState();
    }, [])
  );

  const handleBuyHeartRefill = async () => {
    if (!gameState) return;

    if (gameState.gems < HEART_REFILL_COST) {
      Alert.alert("Gemas insuficientes", "No tienes suficientes gemas para comprar una recarga de corazones.");
      return;
    }

    if (gameState.hearts === 5) {
      Alert.alert("Corazones llenos", "Ya tienes el máximo de corazones.");
      return;
    }

    setIsLoading(true);
    try {
      const newGems = gameState.gems - HEART_REFILL_COST;
      const newHearts = 5;

      await gitaDataService.saveGameState({
        gems: newGems,
        hearts: newHearts,
      });

      setGameState(prev => prev ? { ...prev, gems: newGems, hearts: newHearts } : null);
      Alert.alert("¡Compra exitosa!", "Tus corazones han sido recargados.");
    } catch (error) {
      console.error("Error buying heart refill:", error);
      Alert.alert("Error", "No se pudo completar la compra.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tienda</Text>
        <View style={styles.gemContainer}>
          <Ionicons name="diamond" size={20} color="#2196F3" />
          <Text style={styles.gemText}>{gameState?.gems ?? '...'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.shopItem}>
          <View style={styles.itemIconContainer}>
            <Ionicons name="heart" size={40} color="#FF4B4B" />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>Recarga de Corazones</Text>
            <Text style={styles.itemDescription}>Recarga tus corazones al máximo para seguir aprendiendo.</Text>
          </View>
          <TouchableOpacity 
            style={[styles.buyButton, (gameState?.gems ?? 0) < HEART_REFILL_COST && styles.disabledButton]} 
            onPress={handleBuyHeartRefill}
            disabled={isLoading || (gameState?.gems ?? 0) < HEART_REFILL_COST}
          >
            {isLoading ? <ActivityIndicator color="white" /> : (
              <View style={styles.buyButtonContent}>
                <Ionicons name="diamond" size={16} color="white" />
                <Text style={styles.buyButtonText}>{HEART_REFILL_COST}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  gemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  gemText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00796b',
  },
  content: {
    padding: 20,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemIconContainer: {
    marginRight: 20,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  buyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default ShopScreen;
