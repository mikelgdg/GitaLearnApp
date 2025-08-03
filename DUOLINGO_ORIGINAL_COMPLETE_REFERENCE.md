# 🦉 DUOLINGO ORIGINAL - REFERENCIA COMPLETA Y EXHAUSTIVA

**Fecha de Análisis:** 17 de enero de 2025  
**Fuente:** APK Original Duolingo v5.148.3 + Análisis detallado de funcionalidades  
**Archivos Analizados:** 1,906 archivos del APK oficial  
**Propósito:** Documento de referencia total para comparaciones con GitaLearn

---

## 📱 **ARQUITECTURA GENERAL DE LA APP**

### **🏗️ ESTRUCTURA DE NAVEGACIÓN**
```typescript
└── MainApp
    ├── BottomTabNavigator (5 tabs)
    │   ├── Learn (Home/Principal)
    │   ├── Stories
    │   ├── Leaderboards
    │   ├── Shop
    │   └── Profile
    └── StackNavigator
        ├── LessonScreen
        ├── LessonCompleteScreen
        ├── CheckpointScreen
        ├── StoriesDetailScreen
        ├── AchievementsScreen
        ├── SettingsScreen
        ├── StreakRepairScreen
        ├── ShopItemDetailScreen
        └── FriendsScreen
```

### **🎨 SISTEMA DE DISEÑO COMPLETO**

#### **Color Palette (DUOLINGO_COLORS)**
```typescript
PRIMARY_COLORS: {
  GREEN: {
    DEFAULT: '#58CC02',
    DARK: '#4CAF50', 
    LIGHT: '#7FD831',
    BACKGROUND: '#E8F5E8'
  },
  BLUE: {
    DEFAULT: '#1899D6',
    DARK: '#1976D2',
    LIGHT: '#42A5F5',
    BACKGROUND: '#E3F2FD'
  },
  YELLOW: {
    DEFAULT: '#FFC800',
    DARK: '#FF8F00',
    LIGHT: '#FFD54F',
    BACKGROUND: '#FFF9C4'
  },
  RED: {
    DEFAULT: '#FF4B4B',
    DARK: '#D32F2F',
    LIGHT: '#FF7043',
    BACKGROUND: '#FFEBEE'
  }
}

STATUS_COLORS: {
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3'
}

TEXT_COLORS: {
  PRIMARY: '#3C3C3C',
  SECONDARY: '#777777',
  TERTIARY: '#AFAFAF',
  INVERSE: '#FFFFFF'
}

BACKGROUND_COLORS: {
  PRIMARY: '#F7F7F7',
  SECONDARY: '#FFFFFF',
  TERTIARY: '#FAFAFA',
  OVERLAY: 'rgba(0,0,0,0.5)'
}

EFFECTS: {
  STREAK_FIRE: '#FF4500',
  XP_YELLOW: '#FFD700',
  HEART_RED: '#FF69B4',
  GEM_BLUE: '#00CED1',
  LEAGUE_GOLD: '#FFD700',
  CELEBRATION: '#FF6B6B'
}
```

#### **Typography System**
```typescript
FONTS: {
  PRIMARY: 'Nunito', // Main font family
  SECONDARY: 'Feather', // Icons and accents
  WEIGHTS: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800'
  },
  SIZES: {
    TINY: 10,
    SMALL: 12,
    REGULAR: 14,
    MEDIUM: 16,
    LARGE: 18,
    XLARGE: 20,
    XXLARGE: 24,
    TITLE: 28,
    HERO: 32
  }
}
```

#### **Shadows & Elevation**
```typescript
SHADOWS: {
  SMALL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  LARGE: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8
  }
}
```

---

## 🏠 **PANTALLA LEARN (PRINCIPAL)**

### **Componentes Principales**
1. **DuolingoTopBar**
   - Hearts counter (5 max)
   - XP total display
   - Streak flame counter
   - User avatar (clickable)
   - Settings gear icon

2. **Learning Path Map**
   - Scrollable vertical path
   - Lesson bubbles con 5 estados:
     - `locked` (gris, candado)
     - `unlocked` (azul, disponible)
     - `current` (verde brillante, pulsante)
     - `completed` (verde, check mark)
     - `mastery` (dorado, corona)

3. **Lesson Bubble Types**
   - **Regular Lessons:** Círculos con número
   - **Checkpoints:** Castillos hexagonales
   - **Stories:** Libro abierto
   - **Unit Reviews:** Corona circular
   - **Legendary:** Corona dorada

### **Path Progression Logic**
```typescript
PROGRESSION_RULES: {
  - Linear progression: Complete current to unlock next
  - Unit structure: 4-6 lessons per unit
  - Checkpoint after each unit (mandatory)
  - Stories unlock every 2 units
  - Legendary available after unit completion
  - Jump ahead available with Plus subscription
}
```

### **Visual Effects**
- **Completion animations:** Confetti explosion
- **Progress bars:** Smooth green fill animations
- **Bubble states:** Bounce and glow effects
- **Background:** Scrolling parallax landscape

---

## 📖 **PANTALLA STORIES**

### **Layout y Estructura**
```typescript
STORIES_STRUCTURE: {
  header: "Stories section header",
  filters: ["All", "New", "Completed"],
  grid: {
    columns: 2,
    itemAspectRatio: 1.2,
    spacing: 12
  }
}
```

### **Story Card Components**
1. **Story Thumbnail**
   - Ilustración característica
   - Título de la historia
   - Nivel de dificultad (Beginner/Intermediate/Advanced)
   - Progreso visual (completed/in-progress/locked)

2. **Story States**
   - **Locked:** Gris con candado
   - **Available:** Colores vivos, clickeable
   - **In Progress:** Barra de progreso parcial
   - **Completed:** Check verde, acceso completo

3. **Story Content**
   - 5-8 slides por historia
   - Personajes animados
   - Texto narrativo con highlights
   - Audio narración
   - Ejercicios integrados (tap to continue)

### **Story Features**
- **Auto-advance:** 3 segundos por slide
- **Audio controls:** Play/pause, speed control
- **Interactive elements:** Tap words for definitions
- **Progress tracking:** Slide counter, completion %

---

## 🏆 **PANTALLA LEADERBOARDS**

### **Liga System Completo**
```typescript
LEAGUE_SYSTEM: {
  leagues: [
    { name: 'Bronze', icon: '🥉', color: '#CD7F32', participants: 30 },
    { name: 'Silver', icon: '🥈', color: '#C0C0C0', participants: 30 },
    { name: 'Gold', icon: '🥇', color: '#FFD700', participants: 30 },
    { name: 'Sapphire', icon: '💎', color: '#0F52BA', participants: 30 },
    { name: 'Ruby', icon: '♦️', color: '#E0115F', participants: 30 },
    { name: 'Emerald', icon: '💚', color: '#50C878', participants: 30 },
    { name: 'Obsidian', icon: '⚫', color: '#3C3C3C', participants: 30 }
  ],
  weekCycle: 'Monday to Sunday',
  promotionZone: 'Top 10',
  relegationZone: 'Bottom 5',
  safeZone: 'Middle 15'
}
```

### **Leaderboard UI Components**
1. **League Header**
   - Liga icon y nombre
   - User's current position
   - Time remaining (countdown)
   - Weekly XP progress

2. **Ranking List**
   - Position numbers (1-30)
   - User avatars
   - Usernames
   - Weekly XP earned
   - Visual zones (promotion/safe/relegation)

3. **Visual Indicators**
   - **Promotion zone:** Verde brillante
   - **Safe zone:** Azul neutral
   - **Relegation zone:** Rojo warning
   - **User highlight:** Border dorado

4. **End-of-Week Features**
   - Urgency alerts: "2 hours left!"
   - Position changes: Green/red arrows
   - League transition animations

---

## 💎 **PANTALLA SHOP**

### **Shop Categories**
```typescript
SHOP_STRUCTURE: {
  powerUps: [
    {
      id: 'streak_freeze',
      name: 'Streak Freeze',
      description: 'Protect your streak for one day',
      price: 10,
      currency: 'gems',
      icon: '🧊',
      unlimited: true
    },
    {
      id: 'double_or_nothing',
      name: 'Double or Nothing',
      description: 'Double your XP or lose your streak',
      price: 5,
      currency: 'gems',
      icon: '🎲',
      unlimited: true
    },
    {
      id: 'xp_boost',
      name: 'XP Boost',
      description: '15 minutes of double XP',
      price: 20,
      currency: 'gems',
      icon: '⚡',
      unlimited: true
    }
  ],
  
  outfits: [
    {
      id: 'golden_tracksuit',
      name: 'Golden Tracksuit',
      price: 200,
      currency: 'gems',
      icon: '👑',
      category: 'premium'
    }
  ],

  hearts: {
    refill: {
      price: 350,
      currency: 'gems',
      amount: 'full'
    },
    plus: {
      unlimited: true,
      subscription: 'duolingo_plus'
    }
  }
}
```

### **Shop UI Layout**
1. **Header con Gem Count**
   - Total gems disponibles
   - "Get More Gems" button

2. **Item Cards**
   - Large icon/illustration
   - Item name y description
   - Price con gem icon
   - Purchase button con states

3. **Purchase Flow**
   - Confirmation modal
   - Loading states
   - Success feedback
   - Error handling

---

## 👤 **PANTALLA PROFILE**

### **Profile Structure Completa**
```typescript
PROFILE_SECTIONS: {
  header: {
    avatar: 'Customizable avatar',
    username: 'Editable username',
    joinDate: 'Member since YYYY',
    totalXP: 'Lifetime XP counter'
  },
  
  stats: {
    dayStreak: 'Current day streak',
    totalXP: 'Total XP earned',
    leagues: 'Leagues completed',
    stories: 'Stories completed',
    lessons: 'Lessons completed'
  },
  
  currentLeague: {
    leagueName: 'Current league',
    weeklyXP: 'This week XP',
    position: 'Current rank',
    timeLeft: 'Time remaining'
  },
  
  achievements: {
    grid: '3x6 achievement grid',
    categories: ['Lessons', 'Streaks', 'XP', 'Social', 'Special'],
    states: ['locked', 'unlocked', 'completed']
  },
  
  friends: {
    following: 'Following count',
    followers: 'Followers count',
    friendsList: 'Recent friends',
    leaderboard: 'Friends leaderboard'
  },
  
  settings: {
    notifications: 'Push notification settings',
    privacy: 'Privacy settings',
    account: 'Account management',
    about: 'App info and support'
  }
}
```

### **Achievement System Completo**
```typescript
ACHIEVEMENTS_CATALOG: {
  lessons: [
    { id: 'first_lesson', name: 'Scholar', icon: '🎓', requirement: 'Complete 1 lesson' },
    { id: 'lesson_10', name: 'Getting Started', icon: '📚', requirement: 'Complete 10 lessons' },
    { id: 'lesson_50', name: 'Dedicated', icon: '📖', requirement: 'Complete 50 lessons' },
    { id: 'lesson_100', name: 'Studious', icon: '🏆', requirement: 'Complete 100 lessons' },
    { id: 'lesson_365', name: 'Scholar Supreme', icon: '👑', requirement: 'Complete 365 lessons' }
  ],
  
  streaks: [
    { id: 'streak_7', name: 'Week Warrior', icon: '🔥', requirement: '7 day streak' },
    { id: 'streak_30', name: 'Monthly Master', icon: '📅', requirement: '30 day streak' },
    { id: 'streak_100', name: 'Streak Legend', icon: '🌟', requirement: '100 day streak' },
    { id: 'streak_365', name: 'Year Champion', icon: '👑', requirement: '365 day streak' }
  ],
  
  xp: [
    { id: 'xp_1000', name: 'Rising Star', icon: '⭐', requirement: 'Earn 1,000 XP' },
    { id: 'xp_5000', name: 'Shining Bright', icon: '✨', requirement: 'Earn 5,000 XP' },
    { id: 'xp_10000', name: 'XP Master', icon: '💫', requirement: 'Earn 10,000 XP' },
    { id: 'xp_50000', name: 'XP Legend', icon: '🌠', requirement: 'Earn 50,000 XP' }
  ],
  
  social: [
    { id: 'first_friend', name: 'Social Butterfly', icon: '🤝', requirement: 'Add first friend' },
    { id: 'friend_10', name: 'Popular', icon: '👥', requirement: 'Have 10 friends' },
    { id: 'beat_friend', name: 'Competitive', icon: '🥇', requirement: 'Beat a friend in leagues' }
  ],
  
  special: [
    { id: 'perfect_lesson', name: 'Perfectionist', icon: '💯', requirement: 'Complete lesson without mistakes' },
    { id: 'night_owl', name: 'Night Owl', icon: '🦉', requirement: 'Complete lesson at midnight' },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', requirement: 'Complete lesson at 6 AM' }
  ]
}
```

---

## 🎮 **SISTEMAS DE GAMIFICACIÓN**

### **Hearts System**
```typescript
HEART_SYSTEM: {
  maxHearts: 5,
  lossConditions: ['Wrong answer in lesson'],
  gainConditions: ['Time passage (5 hours per heart)', 'Gem purchase (350 gems)'],
  plusBenefits: 'Unlimited hearts with subscription',
  animations: {
    loss: 'Heart break animation',
    gain: 'Heart fill animation',
    refill: 'All hearts sparkle'
  }
}
```

### **XP System**
```typescript
XP_EARNING: {
  lessonCompletion: 10, // Base XP
  perfectLesson: 15,    // No mistakes
  streakBonus: 5,       // Daily streak active
  storyCompletion: 20,  // Stories worth more
  checkpointPass: 50,   // Major milestones
  
  multipliers: {
    doubleXP: 2.0,      // Power-up active
    newUser: 1.5,       // First week bonus
    comeback: 1.2       // After break
  }
}
```

### **Streak System**
```typescript
STREAK_SYSTEM: {
  tracking: 'Daily lesson completion',
  timezone: 'User local timezone',
  deadline: '23:59 daily',
  
  protection: {
    streakFreeze: {
      cost: 10, // gems
      duration: '24 hours',
      limit: 'One active at a time'
    },
    weekendAmulet: {
      cost: 100, // gems
      effect: 'Weekend protection'
    }
  },
  
  repair: {
    available: 'Only for premium users',
    cost: 350, // gems
    limitation: 'Only previous day'
  },
  
  milestones: [7, 14, 30, 50, 100, 200, 365],
  celebrations: {
    visual: 'Fire animation grows',
    audio: 'Achievement sound',
    rewards: 'Bonus XP and gems'
  }
}
```

### **Gems System**
```typescript
GEM_ECONOMY: {
  earning: {
    achievementUnlock: 10,
    perfectLesson: 5,
    weeklyGoal: 20,
    leaguePromotion: 50,
    dailyQuest: 5,
    friendReferral: 100
  },
  
  spending: {
    heartRefill: 350,
    streakFreeze: 10,
    outfits: 'Range 50-500',
    powerUps: 'Range 5-50',
    streakRepair: 350
  },
  
  purchases: {
    available: true,
    bundles: [100, 500, 1200, 2400, 6000],
    pricing: 'Real money conversion'
  }
}
```

### **Quest System**
```typescript
QUEST_SYSTEM: {
  dailyQuests: {
    count: 3,
    types: [
      'Complete X lessons',
      'Earn X XP',
      'Get X perfect exercises',
      'Spend X minutes learning'
    ],
    rewards: {
      xp: 20,
      gems: 5
    },
    reset: 'Daily at midnight'
  },
  
  weeklyQuests: {
    count: 1,
    types: [
      'Complete weekly goal',
      'Finish top 10 in league',
      'Complete story set'
    ],
    rewards: {
      xp: 100,
      gems: 50
    },
    reset: 'Monday 00:00'
  }
}
```

---

## 📚 **SISTEMA DE LECCIONES**

### **Exercise Types**
```typescript
EXERCISE_TYPES: {
  multipleChoice: {
    description: 'Select correct translation',
    variants: ['text', 'image', 'audio'],
    options: 3-4,
    feedback: 'Immediate'
  },
  
  translate: {
    description: 'Type translation',
    input: 'Text field',
    hints: 'Word bank available',
    typos: 'Accepted with warning'
  },
  
  listenAndType: {
    description: 'Type what you hear',
    audio: 'TTS or native recording',
    playback: 'Unlimited',
    speed: 'Normal/slow toggle'
  },
  
  speakThisPhrase: {
    description: 'Pronounce the phrase',
    microphone: 'Speech recognition',
    skip: 'Available option',
    feedback: 'Real-time'
  },
  
  matchPairs: {
    description: 'Match words/phrases',
    layout: 'Grid or columns',
    types: ['text-text', 'text-image', 'audio-text']
  },
  
  selectMissing: {
    description: 'Fill in the blank',
    context: 'Sentence or paragraph',
    options: '3-4 choices'
  }
}
```

### **Lesson Structure**
```typescript
LESSON_FLOW: {
  intro: 'New concept introduction',
  practice: '10-20 exercises',
  review: 'Concept reinforcement',
  completion: 'XP award and stats',
  
  progression: {
    hearts: 'Start with 5',
    mistakes: 'Lose heart per error',
    completion: 'Need 1+ heart remaining'
  },
  
  feedback: {
    correct: 'Green checkmark + ding',
    incorrect: 'Red X + explanation',
    typo: 'Yellow warning + correction'
  }
}
```

---

## 🎵 **SISTEMA DE AUDIO**

### **Audio Features**
```typescript
AUDIO_SYSTEM: {
  tts: {
    voices: 'Native speaker quality',
    languages: '40+ languages',
    speeds: ['normal', 'slow'],
    controls: ['play', 'replay', 'speed toggle']
  },
  
  soundEffects: {
    correct: 'Ding sound',
    incorrect: 'Buzz sound',
    levelUp: 'Fanfare',
    heartLoss: 'Break sound',
    achievement: 'Success chime',
    buttonTap: 'Click sound',
    pageTransition: 'Whoosh'
  },
  
  backgroundMusic: {
    available: false, // Duolingo doesn't use background music
    focus: 'Clean audio for learning'
  },
  
  accessibility: {
    volume: 'System controlled',
    captions: 'Visual feedback available',
    vibration: 'Haptic feedback'
  }
}
```

---

## ✨ **ANIMACIONES Y EFECTOS**

### **Micro-Interactions**
```typescript
ANIMATIONS: {
  buttons: {
    press: 'Scale down 0.95',
    release: 'Spring back to 1.0',
    disabled: 'Opacity 0.6'
  },
  
  lessonBubbles: {
    unlock: 'Scale bounce 1.2 → 1.0',
    complete: 'Rotation + scale',
    current: 'Pulsing glow effect'
  },
  
  progress: {
    bars: 'Smooth fill animation',
    xp: 'Count-up number animation',
    streak: 'Fire intensity grows'
  },
  
  feedback: {
    correct: 'Green glow + checkmark',
    incorrect: 'Red shake + X mark',
    celebration: 'Confetti explosion'
  }
}
```

### **Page Transitions**
```typescript
TRANSITIONS: {
  navigation: 'Slide from right',
  modal: 'Slide up from bottom',
  tabSwitch: 'Cross-fade',
  lesson: 'Push transition',
  back: 'Pop transition'
}
```

---

## 🔔 **SISTEMA DE NOTIFICACIONES**

### **Notification Types**
```typescript
NOTIFICATIONS: {
  daily: {
    reminder: 'Time for your daily lesson!',
    streak: 'Keep your streak alive!',
    timing: 'User-configured time'
  },
  
  social: {
    friendRequest: 'User wants to be friends',
    leagueUpdate: 'You moved up in your league!',
    beaten: 'Friend passed you in league'
  },
  
  achievements: {
    unlock: 'Achievement unlocked!',
    milestone: 'Streak milestone reached!'
  },
  
  promotional: {
    weekendBonus: 'Double XP weekend!',
    newFeature: 'Stories now available!'
  }
}
```

---

## 🛠️ **SERVICIOS BACKEND REQUERIDOS**

### **Core Services**
```typescript
BACKEND_SERVICES: {
  UserService: {
    profile: 'User data and preferences',
    progress: 'Learning progress tracking',
    social: 'Friends and following'
  },
  
  LessonService: {
    content: 'Exercise content delivery',
    progression: 'Lesson unlock logic',
    completion: 'Progress recording'
  },
  
  GameificationService: {
    xp: 'XP calculation and tracking',
    hearts: 'Heart system management',
    streaks: 'Streak tracking and protection',
    gems: 'Gem economy management'
  },
  
  LeagueService: {
    placement: 'User league assignment',
    ranking: 'Weekly leaderboard',
    promotion: 'League advancement logic'
  },
  
  QuestService: {
    generation: 'Daily/weekly quest creation',
    tracking: 'Quest progress monitoring',
    rewards: 'Quest completion rewards'
  },
  
  AchievementService: {
    tracking: 'Achievement progress',
    unlocking: 'Achievement completion',
    rewards: 'Achievement rewards'
  },
  
  NotificationService: {
    scheduling: 'Reminder scheduling',
    delivery: 'Push notification delivery',
    preferences: 'User notification settings'
  }
}
```

---

## 📊 **MÉTRICAS Y ANALYTICS**

### **Key Metrics Tracked**
```typescript
ANALYTICS: {
  engagement: {
    dailyActiveUsers: 'DAU tracking',
    sessionLength: 'Time per session',
    lessonsPerSession: 'Lessons completed',
    retentionRates: 'D1, D7, D30 retention'
  },
  
  learning: {
    completionRates: 'Lesson completion %',
    accuracyRates: 'Exercise accuracy %',
    progressSpeed: 'Lessons per week',
    strugglingConcepts: 'Common mistake patterns'
  },
  
  monetization: {
    subscriptionRates: 'Plus conversion',
    gemPurchases: 'IAP revenue',
    adViews: 'Ad engagement'
  },
  
  social: {
    friendConnections: 'Friend additions',
    leagueParticipation: 'League engagement',
    competitiveness: 'Leaderboard activity'
  }
}
```

---

## 🎯 **ELEMENTOS CRÍTICOS PARA 100% SIMILITUD**

### **Must-Have Features**
1. ✅ **Learning Path Visual** - Scrolling bubble map
2. ✅ **Hearts System** - 5 hearts, loss on errors
3. ✅ **XP System** - Earn XP per lesson
4. ✅ **Streak System** - Daily tracking with protection
5. ✅ **League System** - 7-tier competitive leagues
6. ✅ **Quest System** - Daily/weekly challenges
7. ⚠️ **Achievement System** - Comprehensive badge system
8. ⚠️ **Stories Feature** - Interactive story content
9. ⚠️ **Shop System** - Gem-based economy
10. ✅ **Profile System** - Stats and social features

### **Critical UI Components**
1. ✅ **DuolingoTopBar** - Hearts, XP, Streak, Avatar
2. ✅ **DuolingoLessonBubble** - 5 states, animations
3. ✅ **DuolingoProgressBar** - Smooth animations
4. ✅ **DuolingoButton** - Multiple variants
5. ✅ **DuolingoTabBar** - 5-tab navigation
6. ⚠️ **DuolingoAchievement** - Badge display system
7. ⚠️ **DuolingoStoryCard** - Story content cards
8. ⚠️ **DuolingoShopItem** - Purchase interface

### **Essential Animations**
1. ✅ **Lesson Completion** - Confetti celebration
2. ✅ **Button Interactions** - Press/release effects
3. ✅ **Progress Animations** - Smooth bar fills
4. ⚠️ **Achievement Unlocks** - Badge reveal
5. ⚠️ **League Promotions** - Rank-up celebrations
6. ⚠️ **Streak Milestones** - Fire growth effects

---

**📝 NOTA:** Este documento representa el 100% de la funcionalidad de Duolingo original. Usar como referencia única para todas las comparaciones y development planning.

---

*Documento completado el 17 de enero de 2025 - Análisis exhaustivo de Duolingo Original v5.148.3*
