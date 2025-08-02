import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Unit, Lesson } from '../../types';
import LessonBubble from './LessonBubble';

interface UnitSectionProps {
  unit: Unit;
  onLessonPress: (lesson: Lesson) => void;
  currentLessonId: string;
}

const UnitSection: React.FC<UnitSectionProps> = ({ unit, onLessonPress, currentLessonId }) => {
  return (
    <View style={styles.unitContainer}>
      <View style={styles.unitHeader}>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <Text style={styles.unitDescription}>{unit.description}</Text>
      </View>
      <View style={styles.lessonsContainer}>
        {unit.lessons.map((lesson, index) => (
          <View key={lesson.id} style={[styles.bubbleWrapper, { alignItems: index % 2 === 0 ? 'flex-start' : 'flex-end' }]}>
            <LessonBubble
              lesson={lesson}
              onPress={() => onLessonPress(lesson)}
              isCurrent={lesson.id === currentLessonId}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  unitContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  unitHeader: {
    backgroundColor: '#FF9933',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  unitTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  unitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  lessonsContainer: {
    position: 'relative',
  },
  bubbleWrapper: {
    paddingHorizontal: 40,
  },
});

export default UnitSection;
