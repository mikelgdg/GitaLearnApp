import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaderboardService, League, LeaderboardEntry, LeagueData } from '../services/LeaderboardService';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';

const LeaderboardScreen = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekEndInfo, setWeekEndInfo] = useState<{ isEndingSoon: boolean; hoursLeft: number }>({
    isEndingSoon: false,
    hoursLeft: 0
  });

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Load league data and leaderboard in parallel
      const [currentLeagueData, currentLeaderboard, weekEndData] = await Promise.all([
        leaderboardService.getCurrentLeagueData(),
        leaderboardService.getCurrentLeaderboard(),
        leaderboardService.isWeekEndingSoon()
      ]);

      setLeagueData(currentLeagueData);
      setLeaderboardData(currentLeaderboard);
      setWeekEndInfo(weekEndData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeagueConfig = (league: League) => {
    return leaderboardService.getLeagueConfig(league);
  };

  const getPromotionZoneColor = (rank: number) => {
    if (!leagueData) return 'transparent';
    
    const config = getLeagueConfig(leagueData.league);
    
    if (rank <= config.promotionSlots) {
      return DUOLINGO_COLORS.GREEN.LIGHT; // Promotion zone
    }
    
    const relegationStart = leagueData.totalParticipants - config.relegationSlots + 1;
    if (rank >= relegationStart) {
      return DUOLINGO_COLORS.RED.LIGHT; // Relegation zone
    }
    
    return 'transparent'; // Safe zone
  };

  const getRankIcon = (rank: number) => {
    if (!leagueData) return null;
    
    const config = getLeagueConfig(leagueData.league);
    
    if (rank <= config.promotionSlots && leagueData.league !== League.OBSIDIAN) {
      return <Ionicons name="arrow-up" size={16} color={DUOLINGO_COLORS.GREEN.DEFAULT} />;
    }
    
    const relegationStart = leagueData.totalParticipants - config.relegationSlots + 1;
    if (rank >= relegationStart && leagueData.league !== League.BRONZE) {
      return <Ionicons name="arrow-down" size={16} color={DUOLINGO_COLORS.RED.DEFAULT} />;
    }
    
    return null;
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry, index: number }) => (
    <View style={[
      styles.userRow, 
      item.isCurrentUser && styles.currentUserRow,
      { backgroundColor: getPromotionZoneColor(item.rank) }
    ]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, item.rank <= 3 && styles.topRank]}>{item.rank}</Text>
        {getRankIcon(item.rank)}
      </View>
      
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      
      <View style={styles.userInfo}>
        <Text style={[styles.username, item.isCurrentUser && styles.currentUsername]}>
          {item.username}
        </Text>
        {item.isCurrentUser && <Text style={styles.youText}>Tú</Text>}
      </View>
      
      <View style={styles.xpContainer}>
        <Text style={[styles.xp, item.isCurrentUser && styles.currentUserXP]}>
          {item.weeklyXP}
        </Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DUOLINGO_COLORS.GREEN.DEFAULT} />
          <Text style={styles.loadingText}>Cargando liga...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!leagueData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar la liga</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLeaderboardData}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config = getLeagueConfig(leagueData.league);
  const currentUser = leaderboardData.find(user => user.isCurrentUser);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with league info */}
      <View style={[styles.header, { backgroundColor: config.color + '20' }]}>
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueEmoji}>{config.icon}</Text>
          <View>
            <Text style={styles.leagueName}>{config.name}</Text>
            <Text style={styles.weekInfo}>
              {weekEndInfo.isEndingSoon 
                ? `¡${weekEndInfo.hoursLeft}h restantes!`
                : 'Competencia semanal'
              }
            </Text>
          </View>
        </View>
        
        {weekEndInfo.isEndingSoon && (
          <View style={styles.urgencyBadge}>
            <Ionicons name="time" size={16} color={DUOLINGO_COLORS.RED.DEFAULT} />
            <Text style={styles.urgencyText}>¡Último día!</Text>
          </View>
        )}
      </View>

      {/* Promotion/Relegation zones info */}
      <View style={styles.zonesInfo}>
        <View style={styles.zoneItem}>
          <View style={[styles.zoneIndicator, { backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT }]} />
          <Text style={styles.zoneText}>Top {config.promotionSlots} suben de liga</Text>
        </View>
        {config.relegationSlots > 0 && (
          <View style={styles.zoneItem}>
            <View style={[styles.zoneIndicator, { backgroundColor: DUOLINGO_COLORS.RED.DEFAULT }]} />
            <Text style={styles.zoneText}>Últimos {config.relegationSlots} bajan de liga</Text>
          </View>
        )}
      </View>

      {/* Leaderboard */}
      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Current user footer */}
      {currentUser && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerMainText}>
              Estás en el puesto {currentUser.rank} de {leagueData.totalParticipants}
            </Text>
            {(() => {
              if (currentUser.rank <= config.promotionSlots) {
                return (
                  <Text style={styles.promotionText}>
                    ¡Vas a subir de liga! 🎉
                  </Text>
                );
              } else if (currentUser.rank >= leagueData.totalParticipants - config.relegationSlots + 1) {
                return (
                  <Text style={styles.relegationText}>
                    ¡Cuidado! Puedes bajar de liga
                  </Text>
                );
              } else {
                return (
                  <Text style={styles.safeText}>
                    Te mantienes en {config.name}
                  </Text>
                );
              }
            })()}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DUOLINGO_COLORS.GRAY[200],
  },
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  leagueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  weekInfo: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 2,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DUOLINGO_COLORS.RED.LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    color: DUOLINGO_COLORS.RED.DEFAULT,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  zonesInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: DUOLINGO_COLORS.GRAY[200],
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  zoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  zoneText: {
    fontSize: 12,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
  },
  list: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: DUOLINGO_COLORS.GRAY[200],
  },
  currentUserRow: {
    borderLeftWidth: 4,
    borderLeftColor: DUOLINGO_COLORS.GREEN.DEFAULT,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginRight: 4,
  },
  topRank: {
    color: DUOLINGO_COLORS.YELLOW.DEFAULT,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  currentUsername: {
    color: DUOLINGO_COLORS.GREEN.DEFAULT,
  },
  youText: {
    fontSize: 12,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 2,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.YELLOW.DEFAULT,
  },
  currentUserXP: {
    color: DUOLINGO_COLORS.GREEN.DEFAULT,
  },
  xpLabel: {
    fontSize: 12,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: DUOLINGO_COLORS.GRAY[200],
    padding: 16,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerMainText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
  },
  promotionText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.GREEN.DEFAULT,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  relegationText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.RED.DEFAULT,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  safeText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;
