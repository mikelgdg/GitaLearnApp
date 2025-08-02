import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ChaptersScreen from '../screens/ChaptersScreen';
import ChapterDetailScreen from '../screens/ChapterDetailScreen';
import VerseDetailScreen from '../screens/VerseDetailScreen';

import StudyScreen from '../screens/StudyScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getTabBarIcon = (routeName: string, focused: boolean) => {
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
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return iconName;
};

// Navegador de tabs
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabBarIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9933',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Chapters" 
        component={ChaptersScreen}
        options={{ tabBarLabel: 'Capítulos' }}
      />
      <Tab.Screen 
        name="Study" 
        component={StudyScreen as React.FC<any>}
        options={{ tabBarLabel: 'Estudiar' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progreso' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favoritos' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
}

// Navegador principal con Stack
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
        />
        <Stack.Screen 
          name="VerseDetail" 
          component={VerseDetailScreen}
        />
        <Stack.Screen 
          name="ChapterDetail" 
          component={ChapterDetailScreen as React.FC<any>}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
