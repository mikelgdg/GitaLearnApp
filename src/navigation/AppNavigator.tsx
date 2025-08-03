import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import ChaptersScreen from '../screens/ChaptersScreen';
import ChapterDetailScreen from '../screens/ChapterDetailScreen';
import VerseDetailScreen from '../screens/VerseDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LessonScreen from '../screens/LessonScreen';
import LearningPathMapScreen from '../screens/LearningPathMapScreen';
import ShopScreen from '../screens/ShopScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import QuestsScreen from '../screens/QuestsScreen';
import StreakScreen from '../screens/StreakScreen';

// ✨ Importar custom tab bar
import DuolingoTabBar from '../components/DuolingoTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getTabBarIcon = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
  let iconName: keyof typeof Ionicons.glyphMap;

  switch (routeName) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Chapters':
      iconName = focused ? 'library' : 'library-outline';
      break;
    case 'Study':
      iconName = focused ? 'school' : 'school-outline';
      break;
    case 'Progress':
      iconName = focused ? 'stats-chart' : 'stats-chart-outline';
      break;
    case 'Favorites':
      iconName = focused ? 'heart' : 'heart-outline';
      break;
    case 'Shop':
      iconName = focused ? 'cart' : 'cart-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    case 'Leaderboard':
      iconName = focused ? 'trophy' : 'trophy-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return iconName;
};

// ✨ Navegador de tabs con DuolingoTabBar (EXACTO COMO DUOLINGO)
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <DuolingoTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 🏠 LEARN - Pantalla principal como Duolingo (mapa de lecciones) */}
      <Tab.Screen 
        name="Learn" 
        component={LearningPathMapScreen}
        options={{ tabBarLabel: 'APRENDER' }}
      />
      {/* 📖 STORIES - Contenido adicional (capítulos) */}
      <Tab.Screen 
        name="Stories" 
        component={ChaptersScreen}
        options={{ tabBarLabel: 'HISTORIAS' }}
      />
      {/* 🏆 LEADERBOARDS - Competición */}
      <Tab.Screen 
        name="Leaderboards" 
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'LIGAS' }}
      />
      {/* 💎 SHOP - Tienda de poder-ups */}
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{ tabBarLabel: 'TIENDA' }}
      />
      {/* 👤 PROFILE - Configuración y progreso */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'PERFIL' }}
      />
    </Tab.Navigator>
  );
}

// Navegador principal con Stack y transiciones laterales smooth
function AppStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        // ✨ Transiciones laterales smooth como Duolingo
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="ChapterDetail" 
        component={ChapterDetailScreen as React.FC<any>}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen 
        name="VerseDetail" 
        component={VerseDetailScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen 
        name="Lesson" 
        component={LessonScreen as React.FC<any>}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen 
        name="LearningPath" 
        component={LearningPathMapScreen as React.FC<any>}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen 
        name="Quests" 
        component={QuestsScreen as React.FC<any>}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen 
        name="Streak" 
        component={StreakScreen as React.FC<any>}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen as React.FC<any>}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}
