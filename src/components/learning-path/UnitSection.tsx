import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Unit, Lesson } from '../../types';
import LessonBubble from './LessonBubble';

interface UnitSectionProps {
  unit: Unit;
  onLessonPress: (lesson: Lesson) => void;
  currentLessonId: string;
}

const UnitSection: React.FC<UnitSectionProps> = ({ unit, onLessonPress, currentLessonId }) => {
  const bubbleSize = 80; // from LessonBubble styles
  const verticalSpacing = 50; // space between bubbles
  const containerPadding = 40; // from bubbleWrapper styles

  return (
    <View style={styles.unitContainer}>
      <View style={styles.unitHeader}>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <Text style={styles.unitDescription}>{unit.description}</Text>
      </View>
      <View style={styles.lessonsContainer}>
        <Svg height={unit.lessons.length * (bubbleSize + verticalSpacing)} width={Dimensions.get('window').width}>
          {unit.lessons.map((lesson, index) => {
            if (index === unit.lessons.length - 1) return null;

            const isEven = index % 2 === 0;
            const startX = isEven ? containerPadding + bubbleSize / 2 : Dimensions.get('window').width - containerPadding - bubbleSize / 2;
            const startY = index * (bubbleSize + verticalSpacing) + bubbleSize;
            
            const nextIsEven = (index + 1) % 2 === 0;
            const endX = nextIsEven ? containerPadding + bubbleSize / 2 : Dimensions.get('window').width - containerPadding - bubbleSize / 2;
            const endY = (index + 1) * (bubbleSize + verticalSpacing);

            return (
              <Line
                key={`line-${lesson.id}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#D0D0D0"
                strokeWidth="2"
                strokeDasharray="5, 5"
              />
            );
          })}
        </Svg>
        <View style={styles.bubblesOverlay}>
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
  bubblesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bubbleWrapper: {
    paddingHorizontal: 40,
    marginBottom: 50, // new vertical spacing
  },
});

export default UnitSection;
