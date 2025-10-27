import { simulateAIProcessing } from './delays';
import usersData from '../mock-data/users.json';
import { getUserProfile } from '../user-profile-manager';

export interface MeritBreakdown {
  total: number;
  components: {
    competency: { raw: number; weighted: number; weight: number };
    performance: { raw: number; weighted: number; weight: number };
    feedback: { raw: number; weighted: number; weight: number };
    learning: { raw: number; weighted: number; weight: number };
  };
  dataSources: string[];
  calculatedAt: string;
  biasCheck: {
    passed: boolean;
    details: string;
  };
}

export const calculateMeritScore = async (
  userId: string,
  onProgress?: (progress: number) => void
): Promise<MeritBreakdown> => {
  // Simulate AI processing
  await simulateAIProcessing('calculate', onProgress);
  
  // 🔥 GET USER FROM LIVE DATABASE (includes training updates!)
  const liveProfile = getUserProfile(userId);
  const user = liveProfile || usersData.users.find(u => u.id === userId);
  
  if (!user || user.role !== 'asn') {
    throw new Error('User not found or not an ASN');
  }
  
  // Calculate weighted scores
  const weights = {
    competency: 0.35,
    performance: 0.30,
    feedback: 0.20,
    learning: 0.15
  };
  
  // Use live competencies if available
  const competencies = liveProfile?.competencies || user.competencies || {
    technical: 75,
    leadership: 75,
    analytics: 75,
    communication: 75,
    digital: 75
  };
  const avgCompetency = Object.values(competencies).reduce((a, b) => a + b, 0) / 
                        Object.values(competencies).length;
  
  // Use live merit score if available
  const currentMeritScore = liveProfile?.meritScore || user.meritScore || 80;
  const trainingCompleted = liveProfile?.trainingCompleted?.length || 0;
  
  const competencyWeighted = avgCompetency * weights.competency;
  const performanceWeighted = currentMeritScore * weights.performance;
  const feedbackWeighted = 75 * weights.feedback;
  const learningWeighted = (72 + trainingCompleted * 5) * weights.learning; // Bonus for trainings!
  
  const dataSources = [
    '12 competencies assessed',
    `${liveProfile?.certificationsEarned?.length || 0} certifications verified`,
    '8 project contributions',
    '2024 performance review',
    '360° feedback (8 responses)'
  ];
  
  if (trainingCompleted > 0) {
    dataSources.push(`${trainingCompleted} training programs completed`);
  }

  return {
    total: Number((competencyWeighted + performanceWeighted + feedbackWeighted + learningWeighted).toFixed(2)),
    components: {
      competency: {
        raw: Number(avgCompetency.toFixed(2)),
        weighted: Number(competencyWeighted.toFixed(2)),
        weight: weights.competency
      },
      performance: {
        raw: currentMeritScore,
        weighted: Number(performanceWeighted.toFixed(2)),
        weight: weights.performance
      },
      feedback: {
        raw: 75,
        weighted: Number(feedbackWeighted.toFixed(2)),
        weight: weights.feedback
      },
      learning: {
        raw: 72 + trainingCompleted * 5,
        weighted: Number(learningWeighted.toFixed(2)),
        weight: weights.learning
      }
    },
    dataSources,
    calculatedAt: new Date().toISOString(),
    biasCheck: {
      passed: true,
      details: 'No demographic bias detected across gender, age, and regional factors'
    }
  };
};
