import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gitaDataService } from '../services/GitaDataService';
import { LeaderboardEntry } from '../types';
import { Ionicons } from '@expo/vector-icons';

const LeaderboardScreen = () => {
  const leaderboardData = gitaDataService.getLeaderboardData();
  const currentUser = gitaDataService.getLeaderboardData().find(user => user.isCurrentUser);

  const renderItem = ({ item, index }: { item: LeaderboardEntry, index: number }) => (
    <View style={[styles.userRow, item.isCurrentUser && styles.currentUserRow]}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.xp}>{item.xp} XP</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={32} color="#FFD700" />
        <Text style={styles.title}>Liga de Bronce</Text>
      </View>
      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      {currentUser && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¡Sigue así! Estás en el puesto {leaderboardData.findIndex(u => u.id === currentUser.id) + 1} de la liga.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currentUserRow: {
    backgroundColor: '#E0F7FA',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    color: '#333',
  },
  xp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9933',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LeaderboardScreen;
