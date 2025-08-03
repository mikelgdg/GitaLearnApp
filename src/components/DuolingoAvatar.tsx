import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DUOLINGO_COLORS } from '../constants/DuolingoColors';
import { TYPOGRAPHY } from '../constants/DuolingoTypography';

interface DuolingoAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  imageUri?: string;
  userName?: string;
  level?: number;
  xp?: number;
  streak?: number;
  onPress?: () => void;
  showBorder?: boolean;
  borderColor?: string;
  showLevel?: boolean;
  showStreak?: boolean;
  animated?: boolean;
}

const DuolingoAvatar: React.FC<DuolingoAvatarProps> = ({
  size = 'medium',
  imageUri,
  userName,
  level,
  xp,
  streak,
  onPress,
  showBorder = true,
  borderColor,
  showLevel = false,
  showStreak = false,
  animated = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const streakPulseAnim = useRef(new Animated.Value(1)).current;

  // 🎯 Size configurations
  const getSizeConfig = () => {
    const configs = {
      small: {
        avatarSize: 32,
        fontSize: 12,
        borderWidth: 2,
        levelBadgeSize: 16,
        streakSize: 14,
      },
      medium: {
        avatarSize: 48,
        fontSize: 16,
        borderWidth: 2,
        levelBadgeSize: 20,
        streakSize: 16,
      },
      large: {
        avatarSize: 64,
        fontSize: 20,
        borderWidth: 3,
        levelBadgeSize: 24,
        streakSize: 18,
      },
      xlarge: {
        avatarSize: 96,
        fontSize: 32,
        borderWidth: 4,
        levelBadgeSize: 32,
        streakSize: 24,
      },
    };
    
    return configs[size] || configs.medium;
  };

  const config = getSizeConfig();

  // 🎨 Animations
  useEffect(() => {
    if (animated) {
      // Gentle bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (showStreak && streak && streak > 0) {
      // Streak pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(streakPulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(streakPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, showStreak, streak, bounceAnim, streakPulseAnim]);

  // 🎯 Handle press animation
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // 🎨 Get user initials if no image
  const getUserInitials = () => {
    if (!userName) return '?';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userName.charAt(0).toUpperCase();
  };

  // 🎯 Get border color based on level or custom
  const getBorderColor = () => {
    if (borderColor) return borderColor;
    if (level) {
      if (level >= 50) return DUOLINGO_COLORS.YELLOW.DEFAULT;
      if (level >= 25) return DUOLINGO_COLORS.BLUE.DEFAULT;
      if (level >= 10) return DUOLINGO_COLORS.GREEN.DEFAULT;
    }
    return DUOLINGO_COLORS.GRAY[300];
  };

  const avatarContent = (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: animated ? bounceAnim : scaleAnim },
          ],
        },
      ]}
    >
      {/* Main Avatar */}
      <View
        style={[
          styles.avatar,
          {
            width: config.avatarSize,
            height: config.avatarSize,
            borderRadius: config.avatarSize / 2,
            borderWidth: showBorder ? config.borderWidth : 0,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.avatarImage,
              {
                width: config.avatarSize - (showBorder ? config.borderWidth * 2 : 0),
                height: config.avatarSize - (showBorder ? config.borderWidth * 2 : 0),
                borderRadius: (config.avatarSize - (showBorder ? config.borderWidth * 2 : 0)) / 2,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                width: config.avatarSize - (showBorder ? config.borderWidth * 2 : 0),
                height: config.avatarSize - (showBorder ? config.borderWidth * 2 : 0),
                borderRadius: (config.avatarSize - (showBorder ? config.borderWidth * 2 : 0)) / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  fontSize: config.fontSize,
                },
              ]}
            >
              {getUserInitials()}
            </Text>
          </View>
        )}
      </View>

      {/* Level Badge */}
      {showLevel && level && (
        <View
          style={[
            styles.levelBadge,
            {
              width: config.levelBadgeSize,
              height: config.levelBadgeSize,
              borderRadius: config.levelBadgeSize / 2,
              bottom: -4,
              right: -4,
            },
          ]}
        >
          <Text
            style={[
              styles.levelText,
              {
                fontSize: config.levelBadgeSize * 0.5,
              },
            ]}
          >
            {level}
          </Text>
        </View>
      )}

      {/* Streak Fire */}
      {showStreak && streak && streak > 0 && (
        <Animated.View
          style={[
            styles.streakBadge,
            {
              transform: [{ scale: streakPulseAnim }],
              top: -8,
              right: -8,
            },
          ]}
        >
          <Ionicons
            name="flame"
            size={config.streakSize}
            color={DUOLINGO_COLORS.YELLOW.DEFAULT}
          />
          <Text
            style={[
              styles.streakText,
              {
                fontSize: config.streakSize * 0.6,
              },
            ]}
          >
            {streak}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: DUOLINGO_COLORS.BLUE.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.BUTTON,
    color: DUOLINGO_COLORS.BLUE.DEFAULT,
    fontWeight: '700',
  },
  levelBadge: {
    position: 'absolute',
    backgroundColor: DUOLINGO_COLORS.GREEN.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  levelText: {
    ...TYPOGRAPHY.CAPTION,
    color: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
    fontWeight: '700',
  },
  streakBadge: {
    position: 'absolute',
    backgroundColor: DUOLINGO_COLORS.YELLOW.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  streakText: {
    ...TYPOGRAPHY.CAPTION,
    color: DUOLINGO_COLORS.YELLOW.DARK,
    fontWeight: '700',
    marginLeft: 2,
  },
});

export default DuolingoAvatar;
