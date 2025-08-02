import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LessonScreenProps {
  route: {
    params: {
      lessonId: string;
    };
  };
  navigation: any;
}

const LessonScreen: React.FC<LessonScreenProps> = ({ route, navigation }) => {
  const { lessonId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={30} color="#333" />
        </TouchableOpacity>
        {/* Aquí irá una barra de progreso de la lección */}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Lección {lessonId}</Text>
        <Text style={styles.subtitle}>
          Aquí comenzarán los ejercicios para esta lección.
        </Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => console.log('Iniciar lección')}
        >
          <Text style={styles.startButtonText}>Comenzar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LessonScreen;
