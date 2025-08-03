import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { Quest, DailyQuestSet, WeeklyQuestSet } from '../types';
import { questService } from '../services/QuestService';
import { HeartService } from '../services/HeartService';

interface QuestsScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const QuestsScreen: React.FC<QuestsScreenProps> = ({ navigation }) => {
  const [dailyQuests, setDailyQuests] = useState<DailyQuestSet | null>(null);
  const [weeklyQuests, setWeeklyQuests] = useState<WeeklyQuestSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedValues] = useState(new Map<string, Animated.Value>());

  useEffect(() => {
    loadQuests();
    
    // Cleanup expired quests on mount
    questService.cleanupExpiredQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const [daily, weekly] = await Promise.all([
        questService.getDailyQuests(),
        questService.getWeeklyQuests()
      ]);
      
      setDailyQuests(daily);
      setWeeklyQuests(weekly);
      
      // Initialize animations for each quest
      [...daily.quests, ...weekly.quests].forEach(quest => {
        if (!animatedValues.has(quest.id)) {
          animatedValues.set(quest.id, new Animated.Value(0));
        }
      });
      
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuests();
    setRefreshing(false);
  };

  const claimRewards = async () => {
    try {
      const rewards = await questService.claimCompletedQuestRewards();
      
      if (rewards.xp > 0 || rewards.gems > 0) {
        // Add rewards to game state
        const gameState = await HeartService.loadGameState();
        gameState.xp += rewards.xp;
        gameState.gems += rewards.gems;
        await HeartService.saveGameState(gameState);
        
        // Show celebration
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        // Reload quests to update UI
        await loadQuests();
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const getProgressPercentage = (quest: Quest): number => {
    return Math.min((quest.currentProgress / quest.targetValue) * 100, 100);
  };

  const getTimeUntilExpiration = (expiresAt: Date): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const renderQuestCard = (quest: Quest, isWeekly: boolean = false) => {
    const progressPercentage = getProgressPercentage(quest);
    const isCompleted = quest.status === 'completed';

    return (
      <TouchableOpacity
        key={quest.id}
        style={[
          styles.questCard,
          isCompleted && styles.completedQuestCard,
          isWeekly && styles.weeklyQuestCard
        ]}
        onPress={() => {
          if (isCompleted) {
            claimRewards();
          }
        }}
        disabled={!isCompleted}
      >
        <LinearGradient
          colors={isCompleted 
            ? [DUOLINGO_COLORS.GREEN.LIGHT, DUOLINGO_COLORS.GREEN.DEFAULT]
            : ['#ffffff', '#f8f9fa']
          }
          style={styles.questCardGradient}
        >
          {/* Quest Icon and Type Badge */}
          <View style={styles.questHeader}>
            <View style={[styles.questIcon, { backgroundColor: quest.color }]}>
              <Ionicons name={quest.icon as any} size={24} color="white" />
            </View>
            <View style={styles.questBadge}>
              <Text style={styles.questBadgeText}>
                {isWeekly ? 'SEMANAL' : 'DIARIA'}
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={DUOLINGO_COLORS.GREEN.DEFAULT} />
              </View>
            )}
          </View>

          {/* Quest Content */}
          <View style={styles.questContent}>
            <Text style={[styles.questTitle, isCompleted && styles.completedText]}>
              {quest.title}
            </Text>
            <Text style={[styles.questDescription, isCompleted && styles.completedText]}>
              {quest.description}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: isCompleted 
                        ? DUOLINGO_COLORS.GREEN.DEFAULT 
                        : quest.color
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {quest.currentProgress}/{quest.targetValue}
              </Text>
            </View>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <View style={styles.reward}>
                <Ionicons name="star" size={16} color={DUOLINGO_COLORS.YELLOW.DEFAULT} />
                <Text style={styles.rewardText}>+{quest.xpReward} XP</Text>
              </View>
              <View style={styles.reward}>
                <Ionicons name="diamond" size={16} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
                <Text style={styles.rewardText}>+{quest.gemReward}</Text>
              </View>
            </View>

            {/* Time remaining */}
            {!isCompleted && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color={DUOLINGO_COLORS.GRAY[500]} />
                <Text style={styles.timeText}>
                  {getTimeUntilExpiration(quest.expiresAt)}
                </Text>
              </View>
            )}
          </View>

          {/* Claim button for completed quests */}
          {isCompleted && !quest.completedAt && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={claimRewards}
            >
              <Text style={styles.claimButtonText}>¡RECLAMAR!</Text>
              <Ionicons name="gift" size={20} color="white" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderDailySection = () => {
    if (!dailyQuests) return null;

    const completedCount = dailyQuests.quests.filter((q: Quest) => q.status === 'completed').length;
    const allCompleted = dailyQuests.allCompleted;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sunny" size={24} color={DUOLINGO_COLORS.YELLOW.DEFAULT} />
          <Text style={styles.sectionTitle}>Misiones Diarias</Text>
          <View style={styles.progressChip}>
            <Text style={styles.progressChipText}>
              {completedCount}/{dailyQuests.quests.length}
            </Text>
          </View>
        </View>

        {allCompleted && (
          <View style={styles.bonusContainer}>
            <LinearGradient
              colors={[DUOLINGO_COLORS.YELLOW.LIGHT, DUOLINGO_COLORS.YELLOW.DEFAULT]}
              style={styles.bonusCard}
            >
              <Ionicons name="star" size={20} color="white" />
              <Text style={styles.bonusText}>
                ¡Bonus diario completado! +50 XP
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </LinearGradient>
          </View>
        )}

        {dailyQuests.quests.map((quest: Quest) => renderQuestCard(quest, false))}
      </View>
    );
  };

  const renderWeeklySection = () => {
    if (!weeklyQuests) return null;

    const completedCount = weeklyQuests.quests.filter((q: Quest) => q.status === 'completed').length;
    const allCompleted = weeklyQuests.allCompleted;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={24} color={DUOLINGO_COLORS.PURPLE.DEFAULT} />
          <Text style={styles.sectionTitle}>Misiones Semanales</Text>
          <View style={[styles.progressChip, styles.weeklyChip]}>
            <Text style={styles.progressChipText}>
              {completedCount}/{weeklyQuests.quests.length}
            </Text>
          </View>
        </View>

        {allCompleted && (
          <View style={styles.bonusContainer}>
            <LinearGradient
              colors={[DUOLINGO_COLORS.PURPLE.LIGHT, DUOLINGO_COLORS.PURPLE.DEFAULT]}
              style={styles.bonusCard}
            >
              <Ionicons name="trophy" size={20} color="white" />
              <Text style={styles.bonusText}>
                ¡Bonus semanal completado! +200 XP
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </LinearGradient>
          </View>
        )}

        {weeklyQuests.quests.map((quest: Quest) => renderQuestCard(quest, true))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando misiones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[DUOLINGO_COLORS.BLUE.DEFAULT, DUOLINGO_COLORS.BLUE.LIGHT]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Misiones</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderDailySection()}
        {renderWeeklySection()}
      </ScrollView>

      {/* Celebration Effects */}
      {showConfetti && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationText}>¡Misiones completadas! 🎉</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    fontSize: 16,
    color: DUOLINGO_COLORS.GRAY[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[700],
    flex: 1,
  },
  progressChip: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weeklyChip: {
    backgroundColor: DUOLINGO_COLORS.PURPLE.DEFAULT,
  },
  progressChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  bonusContainer: {
    marginBottom: 15,
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  bonusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  questCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedQuestCard: {
    opacity: 0.9,
  },
  weeklyQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: DUOLINGO_COLORS.PURPLE.DEFAULT,
  },
  questCardGradient: {
    padding: 20,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questBadge: {
    backgroundColor: DUOLINGO_COLORS.GRAY[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[700],
  },
  completedBadge: {
    marginLeft: 'auto',
  },
  questContent: {
    gap: 10,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[800],
  },
  questDescription: {
    fontSize: 14,
    color: DUOLINGO_COLORS.GRAY[600],
  },
  completedText: {
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: DUOLINGO_COLORS.GRAY[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[600],
    minWidth: 40,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[600],
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 12,
    color: DUOLINGO_COLORS.GRAY[500],
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
    gap: 8,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  celebrationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    padding: 15,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default QuestsScreen;
