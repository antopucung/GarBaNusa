// Training Progress Management
interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  completedAt?: string;
  timeSpent?: number;
  attempts?: number; // Track how many times attempted
}

interface ModuleProgress {
  moduleId: string;
  lessons: LessonProgress[];
  completed: boolean;
  score: number;
}

interface QuizAttempt {
  lessonId: string;
  attemptNumber: number;
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  timeSpent: number;
  passed: boolean;
  attemptedAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  category: 'streak' | 'score' | 'speed' | 'completion';
}

interface TrainingProgress {
  trainingId: string;
  modules: ModuleProgress[];
  totalPoints: number;
  badges: string[];
  currentModule: number;
  currentLesson: number;
  overallProgress: number;
  lastAccessed: string;
  // Gamification fields
  gamification: {
    maxStreak: number;
    totalQuizAttempts: number;
    quizHistory: QuizAttempt[];
    achievements: Achievement[];
    pointsBreakdown: {
      lessons: number;
      quizzes: number;
      bonuses: number;
    };
  };
}

export const getTrainingProgress = (trainingId: string): TrainingProgress | null => {
  if (typeof window === 'undefined') return null;
  
  // Try user-specific key first
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    const userKey = `training_progress_${currentUser.id}_${trainingId}`;
    const userStored = localStorage.getItem(userKey);
    if (userStored) {
      return JSON.parse(userStored);
    }
  }
  
  // Fallback to old key
  const key = `training_progress_${trainingId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};

export const initializeTrainingProgress = (trainingId: string): TrainingProgress => {
  const progress: TrainingProgress = {
    trainingId,
    modules: [],
    totalPoints: 0,
    badges: [],
    currentModule: 0,
    currentLesson: 0,
    overallProgress: 0,
    lastAccessed: new Date().toISOString(),
    gamification: {
      maxStreak: 0,
      totalQuizAttempts: 0,
      quizHistory: [],
      achievements: [],
      pointsBreakdown: {
        lessons: 0,
        quizzes: 0,
        bonuses: 0
      }
    }
  };
  
  saveTrainingProgress(progress);
  return progress;
};

export const saveTrainingProgress = (progress: TrainingProgress): void => {
  if (typeof window === 'undefined') return;
  
  // Save with user-specific key
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    const userKey = `training_progress_${currentUser.id}_${progress.trainingId}`;
    localStorage.setItem(userKey, JSON.stringify(progress));
  }
  
  // Also save with old key for backward compatibility
  const key = `training_progress_${progress.trainingId}`;
  localStorage.setItem(key, JSON.stringify(progress));
};

export const completeLesson = (
  trainingId: string,
  moduleId: string,
  lessonId: string,
  score?: number,
  timeSpent?: number
): TrainingProgress => {
  let progress = getTrainingProgress(trainingId);
  if (!progress) {
    progress = initializeTrainingProgress(trainingId);
  }
  
  // Find or create module progress
  let moduleProgress = progress.modules.find(m => m.moduleId === moduleId);
  if (!moduleProgress) {
    moduleProgress = {
      moduleId,
      lessons: [],
      completed: false,
      score: 0
    };
    progress.modules.push(moduleProgress);
  }
  
  // Update lesson progress
  let lessonProgress = moduleProgress.lessons.find(l => l.lessonId === lessonId);
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      completed: false
    };
    moduleProgress.lessons.push(lessonProgress);
  }
  
  lessonProgress.completed = true;
  lessonProgress.score = score;
  lessonProgress.completedAt = new Date().toISOString();
  lessonProgress.timeSpent = timeSpent;
  
  // Update points
  if (score) {
    progress.totalPoints += score;
  }
  
  progress.lastAccessed = new Date().toISOString();
  
  saveTrainingProgress(progress);
  return progress;
};

export const awardBadge = (trainingId: string, badgeId: string): void => {
  const progress = getTrainingProgress(trainingId);
  if (!progress) return;
  
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
    saveTrainingProgress(progress);
  }
};

export const calculateModuleProgress = (moduleProgress: ModuleProgress, totalLessons: number): number => {
  const completedLessons = moduleProgress.lessons.filter(l => l.completed).length;
  return Math.round((completedLessons / totalLessons) * 100);
};
