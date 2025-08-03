import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import DuolingoLessonBubble from '../components/DuolingoLessonBubble';
import { audioService } from '../services/AudioService';
import { FloatingBubbles, StarParticles, ConfettiExplosion } from '../components/ParticleEffects';
import { gitaDataService } from '../services/GitaDataService';
import { 
  PathNode, 
  LearningPathMap, 
  LessonPathData, 
  CheckpointPathData, 
  SectionHeaderData 
} from '../types';

interface LearningPathMapScreenProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LearningPathMapScreen: React.FC<LearningPathMapScreenProps> = ({ navigation }) => {
  const [pathMap, setPathMap] = useState<LearningPathMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));
  // ✨ Estados para animaciones y efectos
  const [bubbleAnimations] = useState(new Map<string, Animated.Value>());
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadPathMap();
  }, []);

  // ✨ Inicializar animaciones para burbujas desbloqueadas
  useEffect(() => {
    if (pathMap) {
      pathMap.nodes.forEach(node => {
        if ((node.status === 'unlocked' || node.status === 'completed') && !bubbleAnimations.has(node.id)) {
          const animValue = new Animated.Value(1);
          bubbleAnimations.set(node.id, animValue);
          
          // Animación bounce continua
          const bounceAnimation = Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1.05,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]);
          
          Animated.loop(bounceAnimation).start();
        }
      });
    }
  }, [pathMap]);

  const loadPathMap = async () => {
    setIsLoading(true);
    try {
      // Generate path map from sections and units
      const pathData = await gitaDataService.generateLearningPathMap();
      setPathMap(pathData);
    } catch (error) {
      console.error('Error loading path map:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodePress = (node: PathNode) => {
    if (node.status === 'locked') {
      // ✨ Sonido para nodo bloqueado
      audioService.playIncorrectSound();
      return;
    }

    // ✨ Sonido de tap en burbuja
    audioService.playBubbleTap();

    switch (node.type) {
      case 'lesson': {
        const lessonData = node.data as LessonPathData;
        navigation.navigate('LessonScreen', {
          lessonId: lessonData.lessonId,
          unitId: lessonData.unitId,
        });
        break;
      }
      case 'checkpoint': {
        const checkpointData = node.data as CheckpointPathData;
        // ✨ Sonido especial para checkpoint
        audioService.playCheckpointUnlocked();
        navigation.navigate('CheckpointScreen', {
          checkpointId: checkpointData.checkpointId,
          unitId: checkpointData.unitId,
        });
        break;
      }
      case 'section_header':
        // Maybe show section info modal
        break;
    }
  };

  const renderNode = (node: PathNode, index: number) => {
    const isEven = index % 2 === 0;
    const xPosition = isEven ? screenWidth * 0.25 : screenWidth * 0.75;
    
    switch (node.type) {
      case 'section_header':
        return renderSectionHeader(node, xPosition);
      case 'lesson':
        return renderLessonBubble(node, xPosition);
      case 'checkpoint':
        return renderCheckpointBubble(node, xPosition);
      default:
        return null;
    }
  };

  const renderSectionHeader = (node: PathNode, xPosition: number) => {
    const data = node.data as SectionHeaderData;
    
    return (
      <View
        key={node.id}
        style={[
          styles.sectionHeader,
          { 
            left: screenWidth * 0.1,
            width: screenWidth * 0.8,
            top: node.position.y,
          }
        ]}
      >
        <LinearGradient
          colors={[data.color + '20', data.color + '10']}
          style={styles.sectionHeaderGradient}
        >
          <View style={styles.sectionHeaderContent}>
            <Ionicons name={data.icon as any} size={32} color={data.color} />
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: data.color }]}>
                {data.title}
              </Text>
              <Text style={styles.sectionDescription}>{data.description}</Text>
            </View>
            <View style={styles.sectionProgress}>
              <Text style={styles.progressText}>{Math.round(data.progress)}%</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${data.progress}%`,
                      backgroundColor: data.color 
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

    const renderLessonBubble = (node: PathNode, xPosition: number) => {
    const data = node.data as LessonPathData;
    
    // 🎯 Convert node status to DuolingoLessonBubble status
    const getLessonStatus = () => {
      switch (node.status) {
        case 'locked': return 'locked';
        case 'unlocked': return 'unlocked';
        case 'completed': return 'completed';
        case 'mastered': return 'mastery';
        default: return 'locked';
      }
    };

    // 🎯 Get mastery level for completed lessons
    const getMasteryLevel = (): 0 | 1 | 2 | 3 | 4 | 5 => {
      if (node.status === 'mastered') return 5;
      if (node.status === 'completed') return Math.floor(Math.random() * 4) + 1 as 1 | 2 | 3 | 4;
      return 0;
    };

    // 🎯 Position for DuolingoLessonBubble
    const position = {
      x: xPosition / screenWidth, // Convert to percentage
      y: node.position.y / screenHeight
    };

    return (
      <View
        key={node.id}
        style={{
          position: 'absolute',
          left: xPosition - 40, // Center the 80px bubble
          top: node.position.y - 40,
        }}
      >
        <DuolingoLessonBubble
          status={getLessonStatus()}
          masteryLevel={getMasteryLevel()}
          title={data.title}
          position={position}
          onPress={() => handleNodePress(node)}
          isPulsing={node.status === 'unlocked'}
        />
      </View>
    );
  };

  const renderCheckpointBubble = (node: PathNode, xPosition: number) => {
    const data = node.data as CheckpointPathData;
    const bubbleSize = 90;

    const getCheckpointColor = () => {
      switch (data.difficulty) {
        case 'easy': return DUOLINGO_COLORS.GREEN.DEFAULT;
        case 'medium': return DUOLINGO_COLORS.YELLOW.DEFAULT;
        case 'hard': return '#FF4B4B';
        default: return DUOLINGO_COLORS.BLUE.DEFAULT;
      }
    };

    return (
      <TouchableOpacity
        key={node.id}
        style={[
          styles.checkpointBubble,
          {
            left: xPosition - bubbleSize / 2,
            top: node.position.y,
            width: bubbleSize,
            height: bubbleSize,
            backgroundColor: node.status === 'locked' ? '#E0E0E0' : getCheckpointColor(),
          }
        ]}
        onPress={() => handleNodePress(node)}
        disabled={node.status === 'locked'}
      >
        <Ionicons 
          name="trophy" 
          size={32} 
          color={node.status === 'locked' ? DUOLINGO_COLORS.TEXT.SECONDARY : 'white'} 
        />
        <Text style={[
          styles.checkpointTitle,
          { color: node.status === 'locked' ? DUOLINGO_COLORS.TEXT.SECONDARY : 'white' }
        ]}>
          CHECKPOINT
        </Text>
        
        {/* Gems Reward */}
        {node.status !== 'locked' && (
          <View style={styles.gemsReward}>
            <Ionicons name="diamond" size={12} color="#BD5CFF" />
            <Text style={styles.gemsText}>{data.gemsReward}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderConnectionLines = () => {
    if (!pathMap) return null;

    return pathMap.nodes.map((node, index) => {
      if (index === pathMap.nodes.length - 1) return null;
      
      const nextNode = pathMap.nodes[index + 1];
      const startY = node.position.y + 70; // Height of bubble
      const endY = nextNode.position.y;
      const lineHeight = endY - startY;

      return (
        <View
          key={`line-${node.id}`}
          style={[
            styles.connectionLine,
            {
              left: screenWidth * 0.5 - 2,
              top: startY,
              height: lineHeight,
            }
          ]}
        />
      );
    });
  };

  if (isLoading || !pathMap) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your learning path...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✨ Espacio para cámara frontal integrada */}
      <View style={styles.notchSafeArea} />
      
      {/* 🫧 Burbujas flotantes de fondo */}
      <FloatingBubbles 
        bubbleCount={6} 
        colors={[
          'rgba(74, 144, 226, 0.1)', 
          'rgba(255, 107, 53, 0.1)', 
          'rgba(255, 255, 255, 0.15)'
        ]}
        speed={15000}
      />
      
      {/* ✨ Estrellas parpadeantes */}
      <StarParticles starCount={12} twinkleSpeed={3000} />
      
      <LinearGradient
        colors={[DUOLINGO_COLORS.BACKGROUND.PRIMARY, '#F0F8E8']}
        style={styles.background}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <View style={styles.pathContainer}>
            {/* Connection Lines */}
            {renderConnectionLines()}
            
            {/* Path Nodes */}
            {pathMap.nodes.map((node, index) => renderNode(node, index))}
            
            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>
      </LinearGradient>
      
      {/* 🎉 Sistema de confetti para celebraciones */}
      <ConfettiExplosion 
        trigger={showConfetti}
        particleCount={25}
        duration={2500}
        onComplete={() => setShowConfetti(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notchSafeArea: {
    height: 44, // Espacio para cámaras frontales integradas
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  pathContainer: {
    paddingTop: 100,
    paddingBottom: 100,
    position: 'relative',
    minHeight: screenHeight * 3, // Allow for long scrolling path
  },
  
  // Section Header Styles
  sectionHeader: {
    position: 'absolute',
    marginBottom: 40,
  },
  sectionHeaderGradient: {
    borderRadius: 16,
    padding: 20,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    flex: 1,
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    marginTop: 4,
  },
  sectionProgress: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DUOLINGO_COLORS.TEXT.PRIMARY,
  },
  progressBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },

  // Lesson Bubble Styles
  lessonBubble: {
    position: 'absolute',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bubbleLocked: {
    backgroundColor: '#E0E0E0',
    borderWidth: 3,
    borderColor: '#CCCCCC',
  },
  bubbleUnlocked: {
    backgroundColor: DUOLINGO_COLORS.BLUE.DEFAULT,
    borderWidth: 3,
    borderColor: '#0FA0CE',
  },
  bubbleCompleted: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    borderWidth: 3,
    borderColor: '#46A302',
  },
  bubbleMastered: {
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#E6C200',
  },
  lessonNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  masteryStars: {
    position: 'absolute',
    top: -8,
    flexDirection: 'row',
  },

  // Checkpoint Bubble Styles
  checkpointBubble: {
    position: 'absolute',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  checkpointTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  gemsReward: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gemsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#BD5CFF',
    marginLeft: 2,
  },

  // Connection Lines
  connectionLine: {
    position: 'absolute',
    width: 4,
    backgroundColor: DUOLINGO_COLORS.TEXT.SECONDARY + '40',
    borderRadius: 2,
  },

  // Bottom Padding
  bottomPadding: {
    height: 200,
  },
});

export default LearningPathMapScreen;
