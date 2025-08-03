/**
 * 🔤 DUOLINGO TYPOGRAPHY SYSTEM
 * Based on Duolingo's design system
 * Fonts: Nunito (primary), Feather (icons), system fallbacks
 */

import { TextStyle } from 'react-native';

// 📱 FONT FAMILIES
export const FONT_FAMILIES = {
  // Primary font (will be Nunito when installed, system font for now)
  PRIMARY: 'System',
  SECONDARY: 'System',
  MONOSPACE: 'Courier New',
  
  // System fallbacks
  IOS: {
    PRIMARY: 'Helvetica Neue',
    FALLBACK: 'San Francisco',
    SYSTEM: 'San Francisco',
  },
  ANDROID: {
    PRIMARY: 'Roboto',
    FALLBACK: 'sans-serif',
    SYSTEM: 'sans-serif',
  },
} as const;

// 📏 FONT SIZES (Duolingo scale)
export const FONT_SIZES = {
  XXS: 10,   // Tiny labels
  XS: 12,    // Small labels, captions
  SM: 14,    // Secondary text
  MD: 16,    // Body text (default)
  LG: 18,    // Large body text
  XL: 20,    // Subheadings
  XXL: 24,   // Headings
  XXXL: 28,  // Large headings
  DISPLAY: 32, // Display text
  HERO: 36,  // Hero text
} as const;

// 📐 LINE HEIGHTS
export const LINE_HEIGHTS = {
  TIGHT: 1.2,    // Dense text
  NORMAL: 1.4,   // Regular text
  RELAXED: 1.6,  // Comfortable reading
  LOOSE: 1.8,    // Very spaced
} as const;

// 🎯 FONT WEIGHTS
export const FONT_WEIGHTS = {
  LIGHT: '300' as const,
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMIBOLD: '600' as const,
  BOLD: '700' as const,
  EXTRABOLD: '800' as const,
};

// 🎨 TYPOGRAPHY STYLES (Duolingo Design System)
export const TYPOGRAPHY = {
  // 🏷️ DISPLAY STYLES
  HERO: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.HERO,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.HERO * LINE_HEIGHTS.TIGHT,
    letterSpacing: -0.5,
  } as TextStyle,

  DISPLAY: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.DISPLAY,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.DISPLAY * LINE_HEIGHTS.TIGHT,
    letterSpacing: -0.25,
  } as TextStyle,

  // 📰 HEADING STYLES
  H1: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XXXL,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.XXXL * LINE_HEIGHTS.TIGHT,
  } as TextStyle,

  H2: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XXL,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    lineHeight: FONT_SIZES.XXL * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  H3: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XL,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    lineHeight: FONT_SIZES.XL * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  H4: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.LG * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  // 📝 BODY TEXT STYLES
  BODY_LARGE: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.LG * LINE_HEIGHTS.RELAXED,
  } as TextStyle,

  BODY: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.MD,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.MD * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  BODY_SMALL: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.SM * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  // 🏷️ LABEL STYLES
  LABEL_LARGE: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.MD,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.MD * LINE_HEIGHTS.TIGHT,
  } as TextStyle,

  LABEL: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.SM * LINE_HEIGHTS.TIGHT,
    letterSpacing: 0.25,
  } as TextStyle,

  LABEL_SMALL: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.XS * LINE_HEIGHTS.TIGHT,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  // 💬 CAPTION STYLES
  CAPTION: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.XS * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  CAPTION_SMALL: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XXS,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: FONT_SIZES.XXS * LINE_HEIGHTS.NORMAL,
  } as TextStyle,

  // 🔘 BUTTON STYLES
  BUTTON_LARGE: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.LG * LINE_HEIGHTS.TIGHT,
    letterSpacing: 0.25,
  } as TextStyle,

  BUTTON: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.MD,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.MD * LINE_HEIGHTS.TIGHT,
    letterSpacing: 0.25,
  } as TextStyle,

  BUTTON_SMALL: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    lineHeight: FONT_SIZES.SM * LINE_HEIGHTS.TIGHT,
    letterSpacing: 0.5,
  } as TextStyle,

  // 🔢 SPECIALIZED STYLES
  OVERLINE: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    lineHeight: FONT_SIZES.XS * LINE_HEIGHTS.TIGHT,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,

  SUBTITLE: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.MD,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.MD * LINE_HEIGHTS.RELAXED,
    letterSpacing: 0.15,
  } as TextStyle,

  // 🔤 SANSKRIT/SPECIAL TEXT
  SANSKRIT: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: FONT_SIZES.LG * LINE_HEIGHTS.RELAXED,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  } as TextStyle,

  // 💎 XP/NUMBERS
  XP_COUNTER: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: FONT_SIZES.SM * LINE_HEIGHTS.TIGHT,
    letterSpacing: 0.25,
  } as TextStyle,

  STREAK_COUNTER: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.EXTRABOLD,
    lineHeight: FONT_SIZES.SM * LINE_HEIGHTS.TIGHT,
  } as TextStyle,
} as const;

// 🎯 DUOLINGO-SPECIFIC TEXT VARIANTS
export const DUOLINGO_TEXT_VARIANTS = {
  // Top bar elements
  TOP_BAR_STREAK: {
    ...TYPOGRAPHY.STREAK_COUNTER,
    color: '#FF6B35', // Fire color
  },
  
  TOP_BAR_XP: {
    ...TYPOGRAPHY.XP_COUNTER,
    color: '#FFC800', // Gold color
  },

  TOP_BAR_HEARTS: {
    ...TYPOGRAPHY.XP_COUNTER,
    color: '#FF4B4B', // Red color
  },

  // Lesson elements
  LESSON_TITLE: {
    ...TYPOGRAPHY.H2,
    color: '#3C3C41',
  },

  LESSON_PROGRESS: {
    ...TYPOGRAPHY.LABEL_SMALL,
    color: '#777777',
  },

  EXERCISE_QUESTION: {
    ...TYPOGRAPHY.H3,
    color: '#3C3C41',
    textAlign: 'center',
  },

  EXERCISE_OPTION: {
    ...TYPOGRAPHY.BODY,
    color: '#3C3C41',
  },

  // Feedback text
  CORRECT_FEEDBACK: {
    ...TYPOGRAPHY.BUTTON,
    color: '#58CC02',
  },

  INCORRECT_FEEDBACK: {
    ...TYPOGRAPHY.BUTTON,
    color: '#FF4B4B',
  },

  // Stats and numbers
  XP_EARNED: {
    ...TYPOGRAPHY.DISPLAY,
    color: '#FFC800',
    fontWeight: FONT_WEIGHTS.EXTRABOLD,
  },

  LESSON_STATS: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: '#3C3C41',
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
} as const;

// 🔧 TYPOGRAPHY UTILITIES
export const TypographyUtils = {
  /**
   * Get platform-specific font family
   */
  getPlatformFont: (platform: 'ios' | 'android' = 'ios'): string => {
    return platform === 'ios' 
      ? FONT_FAMILIES.IOS.PRIMARY 
      : FONT_FAMILIES.ANDROID.PRIMARY;
  },

  /**
   * Create responsive font size
   */
  responsiveFont: (size: number, scaleFactor: number = 1): number => {
    return Math.round(size * scaleFactor);
  },

  /**
   * Get text style by variant name
   */
  getTextStyle: (variant: keyof typeof TYPOGRAPHY): TextStyle => {
    return TYPOGRAPHY[variant];
  },

  /**
   * Combine multiple text styles
   */
  combineStyles: (...styles: TextStyle[]): TextStyle => {
    return Object.assign({}, ...styles);
  },
} as const;

// 📚 FONT LOADING CONFIGURATION
export const FONT_CONFIG = {
  // TODO: Add actual Nunito font files to assets/fonts/
  FONTS_TO_LOAD: {
    // 'Nunito-Light': require('../../assets/fonts/Nunito-Light.ttf'),
    // 'Nunito-Regular': require('../../assets/fonts/Nunito-Regular.ttf'),
    // 'Nunito-Medium': require('../../assets/fonts/Nunito-Medium.ttf'),
    // 'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf'),
    // 'Nunito-Bold': require('../../assets/fonts/Nunito-Bold.ttf'),
    // 'Nunito-ExtraBold': require('../../assets/fonts/Nunito-ExtraBold.ttf'),
  },
  
  FALLBACK_FONTS: {
    ios: 'Helvetica Neue',
    android: 'Roboto',
    web: 'system-ui, -apple-system, sans-serif',
  },
} as const;

export default TYPOGRAPHY;
