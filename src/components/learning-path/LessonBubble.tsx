import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '../../types';

interface LessonBubbleProps {
  lesson: Lesson;
  onPress: () => void;
  isCurrent: boolean;
}

const LessonBubble: React.FC<LessonBubbleProps> = ({ lesson, onPress, isCurrent }) => {
  const getBubbleStyle = () => {
    switch (lesson.status) {
      case 'locked':
        return styles.lockedBubble;
      case 'completed':
        return styles.completedBubble;
      case 'unlocked':
      default:
        return isCurrent ? styles.currentBubble : styles.unlockedBubble;
    }
  };

  const getIconColor = () => {
    return lesson.status === 'locked' ? '#A0A0A0' : 'white';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={lesson.status === 'locked'}
      style={[styles.bubbleContainer, getBubbleStyle()]}
    >
      <Ionicons name="school" size={32} color={getIconColor()} />
      {lesson.masteryLevel > 0 && (
        <View style={styles.starContainer}>
          <Text style={styles.starText}>{lesson.masteryLevel} ⭐</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  lockedBubble: {
    backgroundColor: '#E0E0E0',
  },
  unlockedBubble: {
    backgroundColor: '#B0B0B0', // A neutral color for unlocked but not current
  },
  currentBubble: {
    backgroundColor: '#2196F3', // Blue for the current lesson to tackle
    transform: [{ scale: 1.1 }],
    shadowColor: '#2196F3',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  completedBubble: {
    backgroundColor: '#FFC107', // Gold for completed
  },
  starContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  starText: {
    color: 'white',
    fontSize: 12,
  },
});

export default LessonBubble;
