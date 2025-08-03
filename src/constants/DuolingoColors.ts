/**
 * 🎨 DUOLINGO EXACT COLOR PALETTE
 * Extracted from official APK analysis
 * All colors match Duolingo's design system
 */

export const DUOLINGO_COLORS = {
  // 🟢 PRIMARY COLORS
  GREEN: {
    DEFAULT: '#58CC02',    // Main Duolingo Green (buttons, success)
    LIGHT: '#89E219',      // Light green (hover states)
    DARK: '#46A302',       // Dark green (pressed states)
    BACKGROUND: '#DDF4FF', // Light green background
  },

  // 🔵 SECONDARY COLORS  
  BLUE: {
    DEFAULT: '#1CB0F6',    // Duolingo Blue (links, info)
    LIGHT: '#84D8FF',      // Light blue
    DARK: '#0F82C7',       // Dark blue
    BACKGROUND: '#E3F2FD', // Light blue background
  },

  // 🔴 ERROR/HEARTS
  RED: {
    DEFAULT: '#FF4B4B',    // Error color, hearts
    LIGHT: '#FF8A80',      // Light red
    DARK: '#D32F2F',       // Dark red
    BACKGROUND: '#FFEBEE', // Light red background
  },

  // 🟡 XP/ACHIEVEMENTS
  YELLOW: {
    DEFAULT: '#FFC800',    // XP, achievements, gems
    LIGHT: '#FFD54F',      // Light yellow
    DARK: '#FF8F00',       // Dark yellow (golden)
    BACKGROUND: '#FFF8E1', // Light yellow background
  },

  // 🟣 PREMIUM/SPECIAL
  PURPLE: {
    DEFAULT: '#CE82FF',    // Premium features
    LIGHT: '#E1BEE7',      // Light purple
    DARK: '#9C27B0',       // Dark purple
    BACKGROUND: '#F3E5F5', // Light purple background
  },

  // ⚫ GRAYSCALE
  GRAY: {
    50: '#FAFAFA',         // Lightest background
    100: '#F5F5F5',        // Light background
    200: '#EEEEEE',        // Border light
    300: '#E0E0E0',        // Border default
    400: '#BDBDBD',        // Border dark
    500: '#9E9E9E',        // Text light
    600: '#757575',        // Text medium
    700: '#616161',        // Text dark
    800: '#424242',        // Text darker
    900: '#212121',        // Text darkest
  },

  // 📱 UI BACKGROUNDS
  BACKGROUND: {
    PRIMARY: '#FFFFFF',    // Main background
    SECONDARY: '#F7F7F7',  // Card backgrounds
    TERTIARY: '#FAFBFC',   // Section backgrounds
    OVERLAY: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },

  // 📝 TEXT COLORS
  TEXT: {
    PRIMARY: '#3C3C41',    // Main text
    SECONDARY: '#777777',  // Secondary text
    TERTIARY: '#ADADAD',   // Placeholder text
    INVERSE: '#FFFFFF',    // White text
    DISABLED: '#BDBDBD',   // Disabled text
  },

  // 🎯 ACTION COLORS
  ACTION: {
    SUCCESS: '#58CC02',    // Success states
    WARNING: '#FFC800',    // Warning states
    ERROR: '#FF4B4B',      // Error states
    INFO: '#1CB0F6',       // Info states
  },

  // 🌟 SPECIAL EFFECTS
  EFFECTS: {
    STREAK_FIRE: '#FF6B35',     // Streak flame color
    XP_GLOW: '#FFD700',         // XP glow effect
    HEART_PULSE: '#FF69B4',     // Heart pulse animation
    CONFETTI: ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF'],
  },

  // 🎮 LESSON STATES
  LESSON: {
    LOCKED: '#E0E0E0',     // Locked lessons
    UNLOCKED: '#58CC02',   // Available lessons
    COMPLETED: '#FFD700',  // Completed lessons (gold)
    CURRENT: '#1CB0F6',    // Current lesson
    MASTERY: '#9C27B0',    // Mastery level
  },

  // 📊 PROGRESS INDICATORS
  PROGRESS: {
    BACKGROUND: '#E0E0E0', // Progress bar background
    FILL: '#58CC02',       // Progress bar fill
    STREAK: '#FF6B35',     // Streak indicator
    XP: '#FFC800',         // XP progress
  },

  // 🎨 GRADIENTS
  GRADIENTS: {
    GREEN: ['#58CC02', '#46A302'],
    BLUE: ['#1CB0F6', '#0F82C7'],
    SUNSET: ['#FF6B35', '#F7931E'],
    PURPLE: ['#CE82FF', '#9C27B0'],
    GOLD: ['#FFD700', '#FFC800'],
  },
} as const;

// 🎯 SEMANTIC COLOR MAPPING
export const SEMANTIC_COLORS = {
  // Main brand color
  primary: DUOLINGO_COLORS.GREEN.DEFAULT,
  secondary: DUOLINGO_COLORS.BLUE.DEFAULT,
  
  // Status colors
  success: DUOLINGO_COLORS.GREEN.DEFAULT,
  warning: DUOLINGO_COLORS.YELLOW.DEFAULT,
  error: DUOLINGO_COLORS.RED.DEFAULT,
  info: DUOLINGO_COLORS.BLUE.DEFAULT,
  
  // UI colors
  background: DUOLINGO_COLORS.BACKGROUND.PRIMARY,
  surface: DUOLINGO_COLORS.BACKGROUND.SECONDARY,
  border: DUOLINGO_COLORS.GRAY[300],
  
  // Text colors
  textPrimary: DUOLINGO_COLORS.TEXT.PRIMARY,
  textSecondary: DUOLINGO_COLORS.TEXT.SECONDARY,
  textInverse: DUOLINGO_COLORS.TEXT.INVERSE,
} as const;

// 🌙 DARK MODE COLORS (Future implementation)
export const DUOLINGO_DARK_COLORS = {
  BACKGROUND: {
    PRIMARY: '#1F1F1F',
    SECONDARY: '#2A2A2A',
    TERTIARY: '#353535',
  },
  TEXT: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#CCCCCC',
    TERTIARY: '#999999',
  },
  // Keep brand colors the same in dark mode
  ...DUOLINGO_COLORS,
} as const;

// 🎨 ACCESSIBILITY COLORS
export const ACCESSIBILITY_COLORS = {
  FOCUS: '#005FCC',           // Focus indicator
  HIGH_CONTRAST: '#000000',   // High contrast mode
  REDUCED_MOTION: '#666666',  // Reduced motion alternative
} as const;

// 🔧 COLOR UTILITIES
export const ColorUtils = {
  /**
   * Add alpha (transparency) to any color
   */
  withAlpha: (color: string, alpha: number): string => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
      return `#${hex}${alphaHex}`;
    }
    return color;
  },

  /**
   * Get gradient string for React Native
   */
  getGradient: (gradientName: keyof typeof DUOLINGO_COLORS.GRADIENTS): string[] => {
    return DUOLINGO_COLORS.GRADIENTS[gradientName];
  },

  /**
   * Get lesson state color
   */
  getLessonColor: (state: 'locked' | 'unlocked' | 'completed' | 'current' | 'mastery'): string => {
    return DUOLINGO_COLORS.LESSON[state.toUpperCase() as keyof typeof DUOLINGO_COLORS.LESSON];
  },
} as const;

export default DUOLINGO_COLORS;
