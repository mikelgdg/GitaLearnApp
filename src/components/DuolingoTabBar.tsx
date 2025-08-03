import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { DUOLINGO_TEXT_VARIANTS } from '../constants/DuolingoTypography';

interface DuolingoTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const DuolingoTabBar: React.FC<DuolingoTabBarProps> = ({ state, descriptors, navigation }) => {
  const [animations] = useState(
    state.routes.map(() => new Animated.Value(1))
  );

  const getTabIcon = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'Learn':
        return focused ? 'home' : 'home-outline';
      case 'Lessons':
        return focused ? 'book' : 'book-outline';
      case 'Leaderboard':
        return focused ? 'trophy' : 'trophy-outline';
      case 'Quests':
        return focused ? 'flag' : 'flag-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'home-outline';
    }
  };

  const getTabLabel = (routeName: string): string => {
    switch (routeName) {
      case 'Learn': return 'APRENDER';
      case 'Lessons': return 'LECCIONES';
      case 'Leaderboard': return 'LIGAS';
      case 'Quests': return 'MISIONES';
      case 'Profile': return 'PERFIL';
      default: return routeName.toUpperCase();
    }
  };

  const handleTabPress = (index: number, routeName: string) => {
    // ✨ Animación bounce al presionar tab
    Animated.sequence([
      Animated.timing(animations[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.container}>
      {/* ✨ Shadow superior suave */}
      <View style={styles.shadowContainer} />
      
      <View style={styles.tabContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          return (
            <Animated.View
              key={route.key}
              style={[
                styles.tab,
                { transform: [{ scale: animations[index] }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive
                ]}
                onPress={() => handleTabPress(index, route.name)}
                activeOpacity={0.7}
              >
                {/* Icono */}
                <View style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerActive
                ]}>
                  <Ionicons
                    name={getTabIcon(route.name, isFocused)}
                    size={isFocused ? 26 : 22}
                    color={isFocused ? DUOLINGO_COLORS.TEXT.INVERSE : DUOLINGO_COLORS.TEXT.SECONDARY}
                  />
                </View>
                
                {/* Label */}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {getTabLabel(route.name)}
                </Text>
                
                {/* Indicador activo */}
                {isFocused && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    position: 'relative',
  },
  shadowContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 20, // Safe area para iPhones
    paddingHorizontal: 5,
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    position: 'relative',
    minHeight: 60,
  },
  tabButtonActive: {
    // Styling handled by individual elements
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    elevation: 4,
    shadowColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: DUOLINGO_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: DUOLINGO_COLORS.GREEN.DEFAULT,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 30,
    height: 3,
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    borderRadius: 2,
  },
});

export default DuolingoTabBar;
