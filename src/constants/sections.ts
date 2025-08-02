import { Section, NewUnit, GemEarning, ShopItem } from '../types';

// ==================== SECCIONES DEL BHAGAVAD GITA ====================

export const SECTIONS: Section[] = [
  {
    id: 'foundations',
    title: 'Fundamentos Espirituales',
    description: 'El dilema de Arjuna y los primeros principios',
    chapters: [1, 2, 3],
    unlockRequirement: 'available_from_start',
    color: '#1CB0F6', // Duolingo Blue
    icon: '📚',
    status: 'unlocked',
    progress: 0
  },
  {
    id: 'action',
    title: 'El Sendero de la Acción',
    description: 'Karma Yoga y el desapego',
    chapters: [4, 5, 6],
    unlockRequirement: '70_percent_of_foundations',
    color: '#58CC02', // Green
    icon: '⚔️',
    status: 'locked',
    progress: 0
  },
  {
    id: 'meditation',
    title: 'Meditación y Devoción',
    description: 'Dhyana y Bhakti Yoga',
    chapters: [7, 8, 9, 10, 11, 12],
    unlockRequirement: '70_percent_of_action',
    color: '#BD5CFF', // Purple
    icon: '🧘',
    status: 'locked',
    progress: 0
  },
  {
    id: 'knowledge',
    title: 'Conocimiento Trascendental',
    description: 'Jnana Yoga y sabiduría suprema',
    chapters: [13, 14, 15],
    unlockRequirement: '70_percent_of_meditation',
    color: '#FF9933', // Orange
    icon: '🕉️',
    status: 'locked',
    progress: 0
  },
  {
    id: 'liberation',
    title: 'Liberación y Entrega',
    description: 'El camino hacia la liberación final',
    chapters: [16, 17, 18],
    unlockRequirement: '70_percent_of_knowledge',
    color: '#FFD700', // Gold
    icon: '🏆',
    status: 'locked',
    progress: 0
  }
];

// ==================== UNITS REDISEÑADAS ====================

export const FOUNDATION_UNITS: NewUnit[] = [
  {
    id: 'unit_1_1',
    sectionId: 'foundations',
    title: 'El Dilema de Arjuna',
    description: 'La crisis inicial del guerrero',
    verses: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7'], // 7 versos
    checkpointRequired: true,
    unlockRequirement: 'available_from_start',
    status: 'unlocked',
    completionPercentage: 0
  },
  {
    id: 'unit_1_2', 
    sectionId: 'foundations',
    title: 'La Depresión Espiritual',
    description: 'Arjuna se rinde ante Krishna',
    verses: ['1.28', '1.29', '1.30', '1.31', '1.46', '1.47'], // 6 versos
    checkpointRequired: true,
    unlockRequirement: 'complete_unit_1_1',
    status: 'locked',
    completionPercentage: 0
  },
  {
    id: 'unit_2_1',
    sectionId: 'foundations',
    title: 'La Naturaleza del Alma',
    description: 'Krishna enseña sobre la inmortalidad del alma',
    verses: ['2.11', '2.12', '2.13', '2.20', '2.22', '2.23'], // 6 versos
    checkpointRequired: true,
    unlockRequirement: 'complete_unit_1_2',
    status: 'locked',
    completionPercentage: 0
  },
  {
    id: 'unit_2_2',
    sectionId: 'foundations',
    title: 'El Karma Yoga Introducción',
    description: 'Los fundamentos de la acción desinteresada',
    verses: ['2.47', '2.48', '2.50', '2.51'], // 4 versos
    checkpointRequired: true,
    unlockRequirement: 'complete_unit_2_1',
    status: 'locked',
    completionPercentage: 0
  }
];

export const ACTION_UNITS: NewUnit[] = [
  {
    id: 'unit_3_1',
    sectionId: 'action',
    title: 'El Sendero de la Acción',
    description: 'Principios fundamentales del Karma Yoga',
    verses: ['3.3', '3.4', '3.5', '3.8', '3.9'], // 5 versos
    checkpointRequired: true,
    unlockRequirement: 'complete_foundations_70_percent',
    status: 'locked',
    completionPercentage: 0
  },
  {
    id: 'unit_3_2',
    sectionId: 'action',
    title: 'El Liderazgo Espiritual',
    description: 'El ejemplo de los grandes hombres',
    verses: ['3.20', '3.21', '3.22', '3.23'], // 4 versos
    checkpointRequired: true,
    unlockRequirement: 'complete_unit_3_1',
    status: 'locked',
    completionPercentage: 0
  },
  {
    id: 'unit_4_1',
    sectionId: 'action',
    title: 'Avatar y Dharma',
    description: 'La manifestación divina y el deber',
    verses: ['4.7', '4.8', '4.9'], // 3 versos
    checkpointRequired: true,
    unlockRequirement: 'complete_unit_3_2',
    status: 'locked',
    completionPercentage: 0
  }
];

// ==================== SISTEMA DE GEMAS ====================

export const GEM_EARNING_RATES: GemEarning = {
  lessonComplete: 10,
  perfectLesson: 15, // sin errores
  firstTryPerfect: 20,
  unitComplete: 50,
  checkpointPass: 100,
  dailyStreak: 5, // cada día
  weeklyStreak: 25, // 7 días consecutivos
  achievementUnlock: 15, // base, puede variar 15-100
  leaderboardRank: 25, // top 3 en liga
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'heart_refill',
    name: 'Recarga de Corazones',
    description: 'Restaura 5 corazones inmediatamente',
    cost: 350,
    icon: '❤️',
    effect: 'refill_hearts',
    category: 'hearts'
  },
  {
    id: 'streak_freeze',
    name: 'Protección de Racha',
    description: 'Protege tu racha por 1 día',
    cost: 200,
    icon: '🔥',
    effect: 'freeze_streak',
    category: 'utils'
  },
  {
    id: 'double_xp',
    name: 'Doble XP',
    description: '15 minutos de XP doble',
    cost: 100,
    icon: '⚡',
    effect: 'double_xp_boost',
    category: 'boosts'
  },
  {
    id: 'hint_reveal',
    name: 'Pista Revelada',
    description: 'Revela una pista en el ejercicio actual',
    cost: 50,
    icon: '💡',
    effect: 'hint_reveal',
    category: 'utils'
  },
  {
    id: 'retry_test',
    name: 'Reintentar Examen',
    description: 'Permite reintentar un checkpoint fallido',
    cost: 500,
    icon: '🔄',
    effect: 'retry_checkpoint',
    category: 'utils'
  },
  {
    id: 'outfit_mascot',
    name: 'Atuendo del Gurú',
    description: 'Viste a tu mascota con ropas especiales',
    cost: 800,
    icon: '👘',
    effect: 'mascot_outfit',
    category: 'cosmetics'
  },
  {
    id: 'lesson_skip',
    name: 'Saltar Lección',
    description: 'Salta una lección completa (¡Caro!)',
    cost: 1000,
    icon: '⏭️',
    effect: 'skip_lesson',
    category: 'utils'
  }
];

// ==================== FRASES MOTIVADORAS ====================

export const MOTIVATIONAL_MESSAGES = {
  perfect: [
    "¡Increíble! Dominas cada verso como un verdadero sabio 🏆",
    "¡Perfección absoluta! Krishna estaría orgulloso 🌟",
    "¡Flawless! Tu dedicación es verdaderamente divina ✨",
    "¡Maestría total! El conocimiento fluye a través de ti 💫",
    "¡Impecable! Tu comprensión del Gita es extraordinaria 🔥"
  ],
  excellent: [
    "¡Excelente trabajo! Cada día te acercas más a la sabiduría 💪",
    "¡Fantástico! Tu comprensión del Gita crece constantemente 📈",
    "¡Brillante! Sigues el sendero del conocimiento con determinación 🔥",
    "¡Sobresaliente! Krishna sonríe con tu dedicación 😊",
    "¡Magnífico! El dharma se fortalece en tu corazón 🌅"
  ],
  good: [
    "¡Buen progreso! Cada verso aprendido es un paso hacia la iluminación 🌅",
    "¡Sigue así! El camino del aprendizaje requiere perseverancia 🚀",
    "¡Bien hecho! Tu esfuerzo constante dará grandes frutos 🌱",
    "¡Progreso sólido! La sabiduría se construye paso a paso 📚",
    "¡Continúa! Cada lección te acerca más a la verdad 🎯"
  ],
  needs_improvement: [
    "¡No te rindas! Incluso Arjuna necesitó orientación 💪",
    "¡Sigue intentando! La sabiduría viene con la práctica constante 🎯",
    "¡Cada error es aprendizaje! Krishna enseña a través de la experiencia 📚",
    "¡Persevera! Los grandes sabios también comenzaron como estudiantes 🌱",
    "¡Ánimo! El sendero del conocimiento tiene sus desafíos 🏔️"
  ]
};

// ==================== COLORES DUOLINGO ====================

export const DUOLINGO_COLORS = {
  PRIMARY: '#1CB0F6', // Duolingo Blue
  SUCCESS: '#58CC02', // Green
  ERROR: '#FF4B4B', // Red
  WARNING: '#FFC800', // Yellow
  GEMS: '#BD5CFF', // Purple
  XP: '#FF9933', // Orange
  HEARTS: '#FF6B9D', // Pink
  STREAK: '#FF9500', // Fire Orange
  BACKGROUND: '#F7F7F7', // Light Gray
  TEXT_PRIMARY: '#3C3C3C', // Dark Gray
  TEXT_SECONDARY: '#777777', // Medium Gray
};

export default {
  SECTIONS,
  FOUNDATION_UNITS,
  ACTION_UNITS,
  GEM_EARNING_RATES,
  SHOP_ITEMS,
  MOTIVATIONAL_MESSAGES,
  DUOLINGO_COLORS
};
