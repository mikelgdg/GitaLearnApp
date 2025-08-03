import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { StreakService, StreakMilestone } from '../services/StreakService';
import { HeartService } from '../services/HeartService';

interface StreakScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const StreakScreen: React.FC<StreakScreenProps> = ({ navigation }) => {
  const [streakStats, setStreakStats] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flameAnimation] = useState(new Animated.Value(0));
  const [canMaintain, setCanMaintain] = useState<any>(null);

  useEffect(() => {
    loadStreakData();
    startFlameAnimation();
  }, []);

  const startFlameAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadStreakData = async () => {
    try {
      const [stats, state, maintain] = await Promise.all([
        StreakService.getStreakStats(),
        HeartService.loadGameState(),
        StreakService.canMaintainStreakToday()
      ]);
      
      setStreakStats(stats);
      setGameState(state);
      setCanMaintain(maintain);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyStreakFreeze = async () => {
    try {
      const result = await StreakService.purchaseStreakFreeze(gameState.gems);
      
      if (result.success) {
        // Deducir gemas
        const newGameState = { ...gameState, gems: gameState.gems - result.gemsUsed };
        await HeartService.saveGameState(newGameState);
        setGameState(newGameState);
        
        Alert.alert(
          '🧊 Streak Freeze Activado',
          result.message,
          [{ text: 'OK', onPress: () => loadStreakData() }]
        );
      } else {
        Alert.alert('❌ Error', result.message);
      }
    } catch (error) {
      console.error('Error buying streak freeze:', error);
    }
  };

  const handleRepairStreak = async () => {
    if (!streakStats || streakStats.currentStreak > 0) return;

    Alert.alert(
      '⚡ Reparar Racha',
      `¿Quieres reparar tu racha por 350 gemas? Esto restaurará tu racha anterior pero romperá tu racha perfecta.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reparar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await StreakService.repairStreak(gameState.gems, streakStats.longestStreak);
              
              if (result.success) {
                const newGameState = { ...gameState, gems: gameState.gems - result.gemsUsed };
                await HeartService.saveGameState(newGameState);
                setGameState(newGameState);
                
                Alert.alert(
                  '✅ Racha Reparada',
                  result.message,
                  [{ text: 'OK', onPress: () => loadStreakData() }]
                );
              } else {
                Alert.alert('❌ Error', result.message);
              }
            } catch (error) {
              console.error('Error repairing streak:', error);
            }
          }
        }
      ]
    );
  };

  const renderStreakCounter = () => {
    if (!streakStats) return null;

    const flameScale = flameAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    const flameOpacity = flameAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    return (
      <View style={styles.streakCounterContainer}>
        <LinearGradient
          colors={streakStats.currentStreak > 0 
            ? [DUOLINGO_COLORS.YELLOW.LIGHT, DUOLINGO_COLORS.EFFECTS.STREAK_FIRE] 
            : [DUOLINGO_COLORS.GRAY[300], DUOLINGO_COLORS.GRAY[400]]
          }
          style={styles.streakCounterGradient}
        >
          <Animated.View
            style={[
              styles.flameContainer,
              {
                transform: [{ scale: flameScale }],
                opacity: flameOpacity,
              },
            ]}
          >
            <Ionicons
              name="flame"
              size={60}
              color={streakStats.currentStreak > 0 ? "white" : DUOLINGO_COLORS.GRAY[500]}
            />
          </Animated.View>
          
          <Text style={[
            styles.streakNumber,
            { color: streakStats.currentStreak > 0 ? 'white' : DUOLINGO_COLORS.GRAY[600] }
          ]}>
            {streakStats.currentStreak}
          </Text>
          
          <Text style={[
            styles.streakLabel,
            { color: streakStats.currentStreak > 0 ? 'white' : DUOLINGO_COLORS.GRAY[600] }
          ]}>
            {streakStats.currentStreak === 1 ? 'día seguido' : 'días seguidos'}
          </Text>

          {streakStats.streakFreezeActive && (
            <View style={styles.freezeIndicator}>
              <Ionicons name="snow" size={20} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
              <Text style={styles.freezeText}>Protegido</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderStreakStatus = () => {
    if (!canMaintain || !streakStats) return null;

    if (canMaintain.alreadyDidLessonToday) {
      return (
        <View style={styles.statusContainer}>
          <View style={[styles.statusCard, styles.successCard]}>
            <Ionicons name="checkmark-circle" size={24} color={DUOLINGO_COLORS.GREEN.DEFAULT} />
            <Text style={styles.statusText}>
              ¡Racha mantenida hoy! 🎉
            </Text>
          </View>
        </View>
      );
    }

    if (canMaintain.hasStreakFreeze) {
      return (
        <View style={styles.statusContainer}>
          <View style={[styles.statusCard, styles.freezeCard]}>
            <Ionicons name="snow" size={24} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
            <Text style={styles.statusText}>
              Tu racha está protegida por Streak Freeze
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, styles.warningCard]}>
          <Ionicons name="warning" size={24} color={DUOLINGO_COLORS.ACTION.WARNING} />
          <Text style={styles.statusText}>
            ¡Completa una lección en las próximas {canMaintain.hoursLeft} horas para mantener tu racha!
          </Text>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!streakStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakStats.longestStreak}</Text>
            <Text style={styles.statLabel}>Racha más larga</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakStats.perfectStreak}</Text>
            <Text style={styles.statLabel}>Racha perfecta</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakStats.totalDaysLearned}</Text>
            <Text style={styles.statLabel}>Días aprendidos</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStreakProtection = () => {
    if (!gameState || !streakStats) return null;

    return (
      <View style={styles.protectionContainer}>
        <Text style={styles.sectionTitle}>Protección de Racha</Text>
        
        {/* Streak Freeze */}
        <TouchableOpacity
          style={[
            styles.protectionCard,
            streakStats.streakFreezeActive && styles.protectionCardActive
          ]}
          onPress={handleBuyStreakFreeze}
          disabled={streakStats.streakFreezeActive}
        >
          <View style={styles.protectionHeader}>
            <Ionicons name="snow" size={24} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
            <View style={styles.protectionInfo}>
              <Text style={styles.protectionTitle}>Streak Freeze</Text>
              <Text style={styles.protectionDescription}>
                {streakStats.streakFreezeActive 
                  ? 'Activo - Tu racha está protegida'
                  : 'Protege tu racha por 1 día'
                }
              </Text>
            </View>
            {!streakStats.streakFreezeActive && (
              <View style={styles.priceTag}>
                <Ionicons name="diamond" size={16} color={DUOLINGO_COLORS.BLUE.DEFAULT} />
                <Text style={styles.priceText}>10</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Streak Repair (solo si racha = 0) */}
        {streakStats.currentStreak === 0 && streakStats.longestStreak > 0 && (
          <TouchableOpacity
            style={styles.protectionCard}
            onPress={handleRepairStreak}
          >
            <View style={styles.protectionHeader}>
              <Ionicons name="build" size={24} color={DUOLINGO_COLORS.PURPLE.DEFAULT} />
              <View style={styles.protectionInfo}>
                <Text style={styles.protectionTitle}>Reparar Racha</Text>
                <Text style={styles.protectionDescription}>
                  Restaurar racha a {streakStats.longestStreak} días
                </Text>
              </View>
              <View style={styles.priceTag}>
                <Ionicons name="diamond" size={16} color={DUOLINGO_COLORS.PURPLE.DEFAULT} />
                <Text style={styles.priceText}>350</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderMilestones = () => {
    if (!streakStats) return null;

    return (
      <View style={styles.milestonesContainer}>
        <Text style={styles.sectionTitle}>Logros de Racha</Text>
        
        {/* Next Milestone */}
        {streakStats.nextMilestone && (
          <View style={styles.nextMilestoneCard}>
            <View style={styles.milestoneHeader}>
              <Ionicons 
                name={streakStats.nextMilestone.icon as any} 
                size={20} 
                color={streakStats.nextMilestone.color} 
              />
              <Text style={styles.milestoneTitle}>
                Siguiente: {streakStats.nextMilestone.days} días
              </Text>
            </View>
            <View style={styles.milestoneProgress}>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(streakStats.currentStreak / streakStats.nextMilestone.days) * 100}%`,
                      backgroundColor: streakStats.nextMilestone.color
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {streakStats.currentStreak}/{streakStats.nextMilestone.days}
              </Text>
            </View>
          </View>
        )}

        {/* Achieved Milestones */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievedScroll}>
          {streakStats.achievedMilestones.map((milestone: StreakMilestone) => (
            <View key={milestone.days} style={styles.achievedMilestone}>
              <View style={[styles.milestoneIcon, { backgroundColor: milestone.color }]}>
                <Ionicons name={milestone.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.milestoneDays}>{milestone.days}</Text>
              <Text style={styles.milestoneLabel}>días</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando racha...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[DUOLINGO_COLORS.EFFECTS.STREAK_FIRE, DUOLINGO_COLORS.YELLOW.LIGHT]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Racha</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStreakCounter()}
        {renderStreakStatus()}
        {renderStats()}
        {renderStreakProtection()}
        {renderMilestones()}
      </ScrollView>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  streakCounterContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  streakCounterGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: screenWidth - 40,
    position: 'relative',
  },
  flameContainer: {
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  freezeIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  freezeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  successCard: {
    backgroundColor: DUOLINGO_COLORS.GREEN.LIGHT,
  },
  freezeCard: {
    backgroundColor: DUOLINGO_COLORS.BLUE.LIGHT,
  },
  warningCard: {
    backgroundColor: DUOLINGO_COLORS.ACTION.WARNING + '20', // 20% opacity
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: DUOLINGO_COLORS.GRAY[800],
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[800],
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[800],
  },
  statLabel: {
    fontSize: 12,
    color: DUOLINGO_COLORS.GRAY[600],
    textAlign: 'center',
    marginTop: 5,
  },
  protectionContainer: {
    marginBottom: 30,
  },
  protectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  protectionCardActive: {
    backgroundColor: DUOLINGO_COLORS.BLUE.LIGHT,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  protectionInfo: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[800],
  },
  protectionDescription: {
    fontSize: 14,
    color: DUOLINGO_COLORS.GRAY[600],
    marginTop: 2,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DUOLINGO_COLORS.GRAY[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[700],
  },
  milestonesContainer: {
    marginBottom: 30,
  },
  nextMilestoneCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[800],
  },
  milestoneProgress: {
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
  achievedScroll: {
    marginTop: 10,
  },
  achievedMilestone: {
    alignItems: 'center',
    marginRight: 15,
    width: 60,
  },
  milestoneIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneDays: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.GRAY[800],
  },
  milestoneLabel: {
    fontSize: 10,
    color: DUOLINGO_COLORS.GRAY[600],
  },
});

export default StreakScreen;
