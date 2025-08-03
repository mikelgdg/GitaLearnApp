import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { leaderboardService, LeagueData } from '../services/LeaderboardService';
import { StreakService, StreakData } from '../services/StreakService';
import { Achievement } from '../types';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: 'Usuario123',
    joinDate: '2025',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=user123',
    totalXP: 0,
    currentRank: 1,
    friendsCount: 0,
    followingCount: 0,
    followersCount: 0
  });
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load all profile data in parallel
      const [currentLeagueData, currentStreakData] = await Promise.all([
        leaderboardService.getCurrentLeagueData(),
        StreakService.getStreakData(),
        // Add more data loading as needed
      ]);

      setLeagueData(currentLeagueData);
      setStreakData(currentStreakData);
      
      // Load achievements (mock data for now)
      setAchievements([
        { id: '1', title: 'First Lesson', description: 'Complete your first lesson', icon: '🎓', isUnlocked: true },
        { id: '2', title: 'Week Warrior', description: 'Complete 7 days in a row', icon: '🔥', isUnlocked: true },
        { id: '3', title: 'Scholar', description: 'Reach 1000 XP', icon: '📚', isUnlocked: false }
      ]);

      // Calculate total XP
      setUserProfile(prev => ({
        ...prev,
        totalXP: currentLeagueData.weeklyXP + 5240, // Mock historical XP
        currentRank: currentLeagueData.rank
      }));

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeagueConfig = () => {
    if (!leagueData) return null;
    return leaderboardService.getLeagueConfig(leagueData.league);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DUOLINGO_COLORS.GREEN.DEFAULT} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const leagueConfig = getLeagueConfig();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={DUOLINGO_COLORS.TEXT.SECONDARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={DUOLINGO_COLORS.TEXT.SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatar} />
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.joinText}>Se unió en {userProfile.joinDate}</Text>
          
          {/* XP Display */}
          <View style={styles.xpContainer}>
            <Ionicons name="flash" size={20} color={DUOLINGO_COLORS.YELLOW.DEFAULT} />
            <Text style={styles.xpText}>{userProfile.totalXP.toLocaleString()} XP total</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.followingCount}</Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.followersCount}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
        </View>

        {/* Current League Section */}
        {leagueData && leagueConfig && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liga Actual</Text>
            <View style={[styles.leagueCard, { backgroundColor: leagueConfig.color + '20' }]}>
              <View style={styles.leagueInfo}>
                <Text style={styles.leagueEmoji}>{leagueConfig.icon}</Text>
                <View style={styles.leagueDetails}>
                  <Text style={styles.leagueName}>{leagueConfig.name}</Text>
                  <Text style={styles.leagueRank}>
                    Puesto {leagueData.rank} de {leagueData.totalParticipants}
                  </Text>
                  <Text style={styles.leagueXP}>
                    {leagueData.weeklyXP} XP esta semana
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewLeagueButton}>
                <Text style={styles.viewLeagueText}>Ver Liga</Text>
                <Ionicons name="chevron-forward" size={16} color={DUOLINGO_COLORS.TEXT.SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Streak Section */}
        {streakData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Racha</Text>
            <View style={styles.streakCard}>
              <View style={styles.streakInfo}>
                <View style={styles.streakIcon}>
                  <Ionicons name="flame" size={32} color={DUOLINGO_COLORS.EFFECTS.STREAK_FIRE} />
                </View>
                <View style={styles.streakDetails}>
                  <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
                  <Text style={styles.streakLabel}>día{streakData.currentStreak !== 1 ? 's' : ''} de racha</Text>
                  {streakData.longestStreak > streakData.currentStreak && (
                    <Text style={styles.longestStreak}>
                      Mejor racha: {streakData.longestStreak} días
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logros</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.slice(0, 6).map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementItem,
                  !achievement.isUnlocked && styles.achievementLocked
                ]}
              >
                <Text style={[
                  styles.achievementIcon,
                  !achievement.isUnlocked && styles.achievementIconLocked
                ]}>
                  {achievement.isUnlocked ? achievement.icon : '🔒'}
                </Text>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.isUnlocked && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Friends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Amigos</Text>
            <TouchableOpacity>
              <Ionicons name="person-add" size={20} color={DUOLINGO_COLORS.GREEN.DEFAULT} />
            </TouchableOpacity>
          </View>
          <View style={styles.friendsContainer}>
            {userProfile.friendsCount === 0 ? (
              <View style={styles.noFriendsCard}>
                <Ionicons name="people-outline" size={48} color={DUOLINGO_COLORS.TEXT.TERTIARY} />
                <Text style={styles.noFriendsTitle}>¡Conecta con amigos!</Text>
                <Text style={styles.noFriendsText}>
                  Añade amigos para competir en las ligas y mantenerse motivados
                </Text>
                <TouchableOpacity style={styles.addFriendsButton}>
                  <Text style={styles.addFriendsText}>Buscar amigos</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text>Friends list would go here</Text>
            )}
          </View>
        </View>

        {/* Settings Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="notifications-outline" size={20} color={DUOLINGO_COLORS.TEXT.SECONDARY} />
            <Text style={styles.settingText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={16} color={DUOLINGO_COLORS.TEXT.TERTIARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="lock-closed-outline" size={20} color={DUOLINGO_COLORS.TEXT.SECONDARY} />
            <Text style={styles.settingText}>Privacidad</Text>
            <Ionicons name="chevron-forward" size={16} color={DUOLINGO_COLORS.TEXT.TERTIARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="help-circle-outline" size={20} color={DUOLINGO_COLORS.TEXT.SECONDARY} />
            <Text style={styles.settingText}>Ayuda</Text>
            <Ionicons name="chevron-forward" size={16} color={DUOLINGO_COLORS.TEXT.TERTIARY} />
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  settingsButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  shareButton: {
    padding: 4,
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
    marginBottom: 4,
  },
  joinText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginBottom: 16,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DUOLINGO_COLORS.YELLOW.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: DUOLINGO_COLORS.YELLOW.DARK,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  statLabel: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  viewAllText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.GREEN.DEFAULT,
    fontWeight: '600',
  },
  leagueCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  leagueDetails: {
    flex: 1,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  leagueRank: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 2,
  },
  leagueXP: {
    fontSize: 14,
    color: DUOLINGO_COLORS.YELLOW.DARK,
    fontWeight: '600',
    marginTop: 2,
  },
  viewLeagueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewLeagueText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginRight: 4,
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 16,
  },
  streakDetails: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.EFFECTS.STREAK_FIRE,
  },
  streakLabel: {
    fontSize: 16,
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
    marginTop: 4,
  },
  longestStreak: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 8,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  achievementTitleLocked: {
    color: DUOLINGO_COLORS.TEXT.TERTIARY,
  },
  friendsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  noFriendsCard: {
    alignItems: 'center',
  },
  noFriendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  noFriendsText: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  addFriendsButton: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFriendsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
    marginLeft: 12,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileScreen;
