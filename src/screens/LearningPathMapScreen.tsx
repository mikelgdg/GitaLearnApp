import React, { useState, useEffect } from 'react';
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
import { ARJU_COLORS } from '../constants/sections';
import { gitaDataService } from '../services/GitaDataService';

interface LearningPathMapScreenProps {
  navigation: any;
}

interface PathNode {
  id: string;
  type: 'lesson' | 'checkpoint' | 'section_header';
  position: { x: number; y: number };
  data: any;
  status: 'locked' | 'unlocked' | 'completed' | 'mastered';
  connections: string[];
}

interface LearningPathMap {
  nodes: PathNode[];
  currentNode: string;
  sections: any[];
  totalProgress: number;
}

interface LearningPathMapScreenProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LearningPathMapScreen: React.FC<LearningPathMapScreenProps> = ({ navigation }) => {
  const [pathMap, setPathMap] = useState<LearningPathMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    loadPathMap();
  }, []);

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
    if (node.status === 'locked') return;

    switch (node.type) {
      case 'lesson':
        navigation.navigate('LessonScreen', {
          lessonId: node.data.lessonId,
          unitId: node.data.unitId,
        });
        break;
      case 'checkpoint':
        navigation.navigate('CheckpointScreen', {
          checkpointId: node.data.checkpointId,
          unitId: node.data.unitId,
        });
        break;
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
    const data = node.data as any; // SectionHeaderData
    
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
            <Ionicons name={data.icon} size={32} color={data.color} />
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
    const data = node.data as any; // LessonPathData
    const bubbleSize = 70;
    
    const getBubbleStyle = () => {
      switch (node.status) {
        case 'locked':
          return styles.bubbleLocked;
        case 'unlocked':
          return styles.bubbleUnlocked;
        case 'completed':
          return styles.bubbleCompleted;
        case 'mastered':
          return styles.bubbleMastered;
        default:
          return styles.bubbleLocked;
      }
    };

    const getBubbleIcon = () => {
      if (node.status === 'locked') return 'lock-closed';
      if (data.isBonus) return 'diamond';
      return 'book';
    };

    return (
      <TouchableOpacity
        key={node.id}
        style={[
          styles.lessonBubble,
          getBubbleStyle(),
          {
            left: xPosition - bubbleSize / 2,
            top: node.position.y,
            width: bubbleSize,
            height: bubbleSize,
          }
        ]}
        onPress={() => handleNodePress(node)}
        disabled={node.status === 'locked'}
      >
        <Ionicons 
          name={getBubbleIcon()} 
          size={24} 
          color={node.status === 'locked' ? ARJU_COLORS.TEXT_LIGHT : 'white'} 
        />
        
        {/* Mastery Stars */}
        {data.masteryLevel > 0 && node.status !== 'locked' && (
          <View style={styles.masteryStars}>
            {[...Array(data.masteryLevel)].map((_, i) => (
              <Ionicons key={i} name="star" size={8} color="#FFD700" />
            ))}
          </View>
        )}

        {/* Lesson Number */}
        <Text style={[
          styles.lessonNumber,
          { color: node.status === 'locked' ? ARJU_COLORS.TEXT_LIGHT : 'white' }
        ]}>
          {data.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCheckpointBubble = (node: PathNode, xPosition: number) => {
    const data = node.data as any; // CheckpointPathData
    const bubbleSize = 90;

    const getCheckpointColor = () => {
      switch (data.difficulty) {
        case 'easy': return ARJU_COLORS.DUOLINGO_GREEN;
        case 'medium': return ARJU_COLORS.ACCENT_ORANGE;
        case 'hard': return '#FF4B4B';
        default: return ARJU_COLORS.DUOLINGO_BLUE;
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
          color={node.status === 'locked' ? ARJU_COLORS.TEXT_LIGHT : 'white'} 
        />
        <Text style={[
          styles.checkpointTitle,
          { color: node.status === 'locked' ? ARJU_COLORS.TEXT_LIGHT : 'white' }
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
      <LinearGradient
        colors={[ARJU_COLORS.BACKGROUND_SAGE, '#F0F8E8']}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: ARJU_COLORS.TEXT_LIGHT,
    marginTop: 4,
  },
  sectionProgress: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ARJU_COLORS.TEXT_DARK,
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
    backgroundColor: ARJU_COLORS.DUOLINGO_BLUE,
    borderWidth: 3,
    borderColor: '#0FA0CE',
  },
  bubbleCompleted: {
    backgroundColor: ARJU_COLORS.DUOLINGO_GREEN,
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
    backgroundColor: ARJU_COLORS.TEXT_LIGHT + '40',
    borderRadius: 2,
  },

  // Bottom Padding
  bottomPadding: {
    height: 200,
  },
});

export default LearningPathMapScreen;
