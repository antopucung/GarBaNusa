// Live User Profile Management - Synced Across All Roles
import usersData from './mock-data/users.json';
import candidatesData from './mock-data/candidates.json';
import trainingData from './mock-data/training.json';
import { getTrainingProgress } from './training-progress';

export interface UserProfile {
  id: string;
  nip: string;
  name: string;
  email: string;
  role: string;
  currentPosition: string;
  unit: string;
  klPemda: string;
  competencies: {
    technical: number;
    leadership: number;
    analytics: number;
    communication: number;
    digital: number;
  };
  meritScore: number;
  meritChange: number;
  trainingCompleted: string[];
  certificationsEarned: string[];
  lastUpdated: string;
}

// Initialize live database from JSON files
export const initializeLiveDatabase = (): void => {
  if (typeof window === 'undefined') return;

  const existing = localStorage.getItem('liveUserDatabase');
  if (existing) return; // Already initialized

  // Create live database from static data
  const liveDb: { [key: string]: UserProfile } = {};

  usersData.users.forEach((user: any) => {
    liveDb[user.id] = {
      id: user.id,
      nip: user.nip || '',
      name: user.name,
      email: user.email,
      role: user.role,
      currentPosition: user.currentPosition || '',
      unit: user.unit || '',
      klPemda: user.klPemda || '',
      competencies: user.competencies || {
        technical: 70,
        leadership: 50,
        analytics: 70,
        communication: 70,
        digital: 60
      },
      meritScore: user.meritScore || 70,
      meritChange: user.meritChange || 0,
      trainingCompleted: user.trainingCompleted || [],
      certificationsEarned: user.certificationsEarned || [],
      lastUpdated: new Date().toISOString()
    };
  });

  localStorage.setItem('liveUserDatabase', JSON.stringify(liveDb));
  console.log('✅ Live user database initialized');
};

// Get user profile (always fresh from live DB)
export const getUserProfile = (userId: string): UserProfile | null => {
  if (typeof window === 'undefined') return null;

  const dbStr = localStorage.getItem('liveUserDatabase');
  if (!dbStr) {
    initializeLiveDatabase();
    return getUserProfile(userId);
  }

  const db = JSON.parse(dbStr);
  return db[userId] || null;
};

// Update user competencies based on training completion
export const updateUserCompetencies = (
  userId: string,
  trainingId: string
): UserProfile | null => {
  const profile = getUserProfile(userId);
  if (!profile) return null;

  // Get training info
  const training = trainingData.programs.find((t: any) => t.id === trainingId);
  if (!training) return null;

  // Map training to competency updates
  const competencyMap: { [key: string]: { [key: string]: number } } = {
    'train-001': { // Leadership Essentials
      leadership: 25,
      communication: 15,
      technical: 10
    },
    'train-002': { // Data Analytics
      analytics: 30,
      technical: 20,
      digital: 15
    },
    'train-003': { // Digital Transformation
      digital: 35,
      technical: 20,
      leadership: 10
    }
  };

  const updates = competencyMap[trainingId] || {};

  // Apply competency increases (max 100)
  Object.keys(updates).forEach(comp => {
    const key = comp as keyof typeof profile.competencies;
    profile.competencies[key] = Math.min(100, profile.competencies[key] + updates[comp]);
  });

  // Add to completed training
  if (!profile.trainingCompleted.includes(trainingId)) {
    profile.trainingCompleted.push(trainingId);
    profile.certificationsEarned.push(training.name);
  }

  // Recalculate merit score
  profile.meritScore = calculateLiveMeritScore(profile);
  profile.lastUpdated = new Date().toISOString();

  // Save back to database
  saveUserProfile(profile);

  console.log(`✅ Updated ${profile.name}'s competencies:`, updates);
  console.log(`📊 New Merit Score: ${profile.meritScore}`);

  return profile;
};

// Calculate live merit score from actual competencies
const calculateLiveMeritScore = (profile: UserProfile): number => {
  const {
    technical,
    leadership,
    analytics,
    communication,
    digital
  } = profile.competencies;

  // Weighted average (Leadership and Analytics more important)
  const weights = {
    technical: 0.20,
    leadership: 0.25,
    analytics: 0.25,
    communication: 0.15,
    digital: 0.15
  };

  const weightedScore =
    technical * weights.technical +
    leadership * weights.leadership +
    analytics * weights.analytics +
    communication * weights.communication +
    digital * weights.digital;

  // Add bonus for completed trainings (up to +10)
  const trainingBonus = Math.min(10, profile.trainingCompleted.length * 3);

  return Math.round(weightedScore + trainingBonus);
};

// Save user profile to live database
const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;

  const dbStr = localStorage.getItem('liveUserDatabase');
  if (!dbStr) return;

  const db = JSON.parse(dbStr);
  db[profile.id] = profile;
  localStorage.setItem('liveUserDatabase', JSON.stringify(db));
};

// Get all user profiles (for committee view)
export const getAllUserProfiles = (): UserProfile[] => {
  if (typeof window === 'undefined') return [];

  const dbStr = localStorage.getItem('liveUserDatabase');
  if (!dbStr) {
    initializeLiveDatabase();
    return getAllUserProfiles();
  }

  const db = JSON.parse(dbStr);
  return Object.values(db);
};

// Get user profiles as candidates (for merit board)
export const getCandidatesWithLiveData = (): any[] => {
  const profiles = getAllUserProfiles();

  // Convert to candidate format with live data
  return profiles
    .filter(p => p.role === 'asn' || p.role === 'supervisor') // ASN and Supervisors can be candidates
    .map(profile => {
      const avgCompetency = Object.values(profile.competencies).reduce((a, b) => a + b, 0) / 5;

      return {
        id: profile.id,
        name: profile.name,
        nip: profile.nip,
        currentPosition: profile.currentPosition,
        unit: profile.unit,
        klPemda: profile.klPemda,
        meritScore: profile.meritScore,
        competencyMatch: Math.round(avgCompetency),
        performance: Math.round(avgCompetency * 0.95),
        feedback360: 85, // Could be dynamic later
        learningAgility: 75 + profile.trainingCompleted.length * 5,
        tenure: 5, // Could calculate from employment date
        avatar: '/avatars/default.svg',
        // Additional info
        trainingCompleted: profile.trainingCompleted.length,
        certificationsEarned: profile.certificationsEarned,
        competencies: profile.competencies,
        lastUpdated: profile.lastUpdated
      };
    })
    .sort((a, b) => b.meritScore - a.meritScore);
};

// Get competency breakdown for AI simulator
export const getCompetencyBreakdown = (userId: string) => {
  const profile = getUserProfile(userId);
  if (!profile) return null;

  const progress = getTrainingProgress('train-001'); // Check any training

  return {
    competencies: profile.competencies,
    meritScore: profile.meritScore,
    trainingProgress: progress?.overallProgress || 0,
    trainingsCompleted: profile.trainingCompleted.length,
    certifications: profile.certificationsEarned,
    lastUpdated: profile.lastUpdated
  };
};

// Reset live database (for testing)
export const resetLiveDatabase = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('liveUserDatabase');
  initializeLiveDatabase();
  console.log('✅ Live database reset to initial state');
};
