// Comprehensive Gamification System
import { getTrainingProgress, saveTrainingProgress } from './training-progress';

interface QuizResult {
  lessonId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  timeSpent: number;
  percentage: number;
}

// Save quiz attempt with full gamification data
export const saveQuizAttempt = (trainingId: string, result: QuizResult): void => {
  const progress = getTrainingProgress(trainingId);
  if (!progress) return;

  // Ensure gamification object exists (for backward compatibility)
  if (!progress.gamification) {
    progress.gamification = {
      maxStreak: 0,
      totalQuizAttempts: 0,
      quizHistory: [],
      achievements: [],
      pointsBreakdown: {
        lessons: 0,
        quizzes: 0,
        bonuses: 0
      }
    };
  }

  const passed = result.percentage >= 70;

  // Create quiz attempt record
  const attempt = {
    lessonId: result.lessonId,
    attemptNumber: progress.gamification.totalQuizAttempts + 1,
    score: result.score,
    percentage: result.percentage,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    maxStreak: result.maxStreak,
    timeSpent: result.timeSpent,
    passed,
    attemptedAt: new Date().toISOString()
  };

  // Add to history
  progress.gamification.quizHistory.push(attempt);
  progress.gamification.totalQuizAttempts++;

  // Update max streak if this is higher
  if (result.maxStreak > progress.gamification.maxStreak) {
    progress.gamification.maxStreak = result.maxStreak;
    
    // Award streak achievement
    if (result.maxStreak >= 5) {
      awardAchievement(progress, {
        id: `streak-${result.maxStreak}`,
        name: `Streak Master ${result.maxStreak}`,
        description: `Jawab ${result.maxStreak} soal berturut-turut dengan benar!`,
        earnedAt: new Date().toISOString(),
        category: 'streak'
      });
    }
  }

  // Update points breakdown
  progress.gamification.pointsBreakdown.quizzes += result.score;

  // Award achievements based on performance
  checkAndAwardAchievements(progress, result);

  saveTrainingProgress(progress);
};

// Check and award achievements
const checkAndAwardAchievements = (progress: any, result: QuizResult): void => {
  // Perfect score achievement
  if (result.percentage === 100) {
    awardAchievement(progress, {
      id: `perfect-${result.lessonId}`,
      name: '🌟 Skor Sempurna',
      description: 'Menjawab semua soal dengan benar!',
      earnedAt: new Date().toISOString(),
      category: 'score'
    });
  }

  // High score achievement
  if (result.percentage >= 90 && result.percentage < 100) {
    awardAchievement(progress, {
      id: `high-score-${result.lessonId}`,
      name: '⭐ Performa Tinggi',
      description: 'Skor 90% atau lebih!',
      earnedAt: new Date().toISOString(),
      category: 'score'
    });
  }

  // Speed achievement (completed in less than 5 minutes)
  if (result.timeSpent < 300) {
    awardAchievement(progress, {
      id: `speed-${result.lessonId}`,
      name: '⚡ Lightning Fast',
      description: 'Selesaikan kuis dalam waktu singkat!',
      earnedAt: new Date().toISOString(),
      category: 'speed'
    });
  }

  // First try achievement
  const previousAttempts = progress.gamification.quizHistory.filter(
    (a: any) => a.lessonId === result.lessonId
  );
  if (previousAttempts.length === 1 && result.percentage >= 70) {
    awardAchievement(progress, {
      id: `first-try-${result.lessonId}`,
      name: '🎯 Sekali Jalan',
      description: 'Lulus kuis pada percobaan pertama!',
      earnedAt: new Date().toISOString(),
      category: 'completion'
    });
  }
};

// Award achievement helper
const awardAchievement = (progress: any, achievement: any): void => {
  // Check if already awarded
  const exists = progress.gamification.achievements.some(
    (a: any) => a.id === achievement.id
  );
  
  if (!exists) {
    progress.gamification.achievements.push(achievement);
  }
};

// Update points breakdown when completing non-quiz lessons
export const updateLessonPoints = (trainingId: string, points: number): void => {
  const progress = getTrainingProgress(trainingId);
  if (!progress) return;

  if (!progress.gamification) {
    progress.gamification = {
      maxStreak: 0,
      totalQuizAttempts: 0,
      quizHistory: [],
      achievements: [],
      pointsBreakdown: {
        lessons: 0,
        quizzes: 0,
        bonuses: 0
      }
    };
  }

  progress.gamification.pointsBreakdown.lessons += points;
  saveTrainingProgress(progress);
};

// Award bonus points
export const awardBonusPoints = (
  trainingId: string,
  points: number,
  reason: string
): void => {
  const progress = getTrainingProgress(trainingId);
  if (!progress) return;

  if (!progress.gamification) {
    progress.gamification = {
      maxStreak: 0,
      totalQuizAttempts: 0,
      quizHistory: [],
      achievements: [],
      pointsBreakdown: {
        lessons: 0,
        quizzes: 0,
        bonuses: 0
      }
    };
  }

  progress.gamification.pointsBreakdown.bonuses += points;
  progress.totalPoints += points;

  // Award bonus achievement
  awardAchievement(progress, {
    id: `bonus-${Date.now()}`,
    name: '🎁 Bonus Points',
    description: reason,
    earnedAt: new Date().toISOString(),
    category: 'completion'
  });

  saveTrainingProgress(progress);
};

// Get gamification stats
export const getGamificationStats = (trainingId: string) => {
  const progress = getTrainingProgress(trainingId);
  if (!progress || !progress.gamification) {
    return {
      maxStreak: 0,
      totalQuizAttempts: 0,
      achievements: [],
      pointsBreakdown: { lessons: 0, quizzes: 0, bonuses: 0 },
      averageScore: 0,
      bestStreak: 0
    };
  }

  const quizHistory = progress.gamification.quizHistory;
  const averageScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length)
    : 0;

  return {
    maxStreak: progress.gamification.maxStreak,
    totalQuizAttempts: progress.gamification.totalQuizAttempts,
    achievements: progress.gamification.achievements,
    pointsBreakdown: progress.gamification.pointsBreakdown,
    averageScore,
    bestStreak: progress.gamification.maxStreak
  };
};
