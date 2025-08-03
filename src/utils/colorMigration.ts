/**
 * 🎨 COLOR MIGRATION UTILITY
 * Quick replacement of ARJU_COLORS to DUOLINGO_COLORS
 * Used to complete Phase UI-1 migration
 */

export const COLOR_MAPPINGS = {
  // OLD ARJU_COLORS → NEW DUOLINGO_COLORS
  'ARJU_COLORS.PRIMARY_BLUE': 'DUOLINGO_COLORS.GREEN.DEFAULT',
  'ARJU_COLORS.DUOLINGO_GREEN': 'DUOLINGO_COLORS.GREEN.DEFAULT', 
  'ARJU_COLORS.ACCENT_ORANGE': 'DUOLINGO_COLORS.YELLOW.DEFAULT',
  'ARJU_COLORS.BACKGROUND_SAGE': 'DUOLINGO_COLORS.BACKGROUND.PRIMARY',
  'ARJU_COLORS.TEXT_PRIMARY': 'DUOLINGO_COLORS.TEXT.PRIMARY',
  'ARJU_COLORS.TEXT_LIGHT': 'DUOLINGO_COLORS.TEXT.SECONDARY',
  'ARJU_COLORS.TEXT_DARK': 'DUOLINGO_COLORS.TEXT.PRIMARY',
} as const;

// Import statement replacement
export const IMPORT_REPLACEMENT = {
  old: "import { ARJU_COLORS",
  new: "import { DUOLINGO_COLORS",
} as const;

export const FILES_TO_UPDATE = [
  'src/components/LessonCompletionScreen.tsx',
  'src/components/AnimatedButton.tsx', 
  'src/components/NeomorphicCard.tsx',
  'src/components/learning-path/LessonBubble.tsx',
  'src/components/learning-path/UnitSection.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/LessonScreen.tsx',
  'src/screens/LearningPathMapScreen.tsx',
  'src/constants/sections.ts',
] as const;

/**
 * Manual replacements needed in each file
 */
export const MANUAL_REPLACEMENTS = {
  'LessonCompletionScreen.tsx': [
    'StatusBar backgroundColor',
    'Gradient colors array',
    'All style properties using ARJU_COLORS',
  ],
  'AnimatedButton.tsx': [
    'Button background colors',
    'Text colors',
    'Border colors',
  ],
  // Add more as needed...
} as const;

export default COLOR_MAPPINGS;
