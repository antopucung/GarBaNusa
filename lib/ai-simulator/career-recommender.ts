import { simulateAIProcessing } from './delays';
import { getUserProfile } from '../user-profile-manager';

export interface CareerGap {
  competency: string;
  current: number;
  required: number;
  gap: number;
  critical: boolean;
}

export interface CareerRecommendation {
  nextRole: string;
  timeline: string;
  matchPercentage: number;
  gaps: CareerGap[];
  actionPlan: Array<{
    step: number;
    action: string;
    duration?: string;
    expectedGain: string;
    link?: string;
  }>;
  successRate: number;
  confidence: number;
}

export const getCareerRecommendations = async (
  userId: string,
  onProgress?: (progress: number) => void
): Promise<CareerRecommendation> => {
  await simulateAIProcessing('recommend', onProgress);
  
  // 🔥 GET USER FROM LIVE DATABASE (includes training updates!)
  const liveProfile = getUserProfile(userId);
  
  if (!liveProfile) {
    // Fallback to default
    return getDefaultRecommendation();
  }

  // Use actual user competencies from profile
  const { leadership, analytics, technical, communication, digital } = liveProfile.competencies;

  // Define requirements for next role (Senior Analyst)
  const requirements = {
    leadership: 85,
    analytics: 90,
    technical: 80,
    communication: 75,
    digital: 75
  };

  // Calculate gaps
  const gaps: CareerGap[] = [];
  
  const leadershipGap = requirements.leadership - leadership;
  if (leadershipGap > 0) {
    gaps.push({
      competency: 'Leadership',
      current: leadership,
      required: requirements.leadership,
      gap: leadershipGap,
      critical: leadershipGap > 20
    });
  }

  const analyticsGap = requirements.analytics - analytics;
  if (analyticsGap > 0) {
    gaps.push({
      competency: 'Data Analytics',
      current: analytics,
      required: requirements.analytics,
      gap: analyticsGap,
      critical: analyticsGap > 20
    });
  }

  const technicalGap = requirements.technical - technical;
  if (technicalGap > 0) {
    gaps.push({
      competency: 'Technical Skills',
      current: technical,
      required: requirements.technical,
      gap: technicalGap,
      critical: technicalGap > 20
    });
  }

  const communicationGap = requirements.communication - communication;
  if (communicationGap > 0) {
    gaps.push({
      competency: 'Communication',
      current: communication,
      required: requirements.communication,
      gap: communicationGap,
      critical: communicationGap > 20
    });
  }

  const digitalGap = requirements.digital - digital;
  if (digitalGap > 0) {
    gaps.push({
      competency: 'Digital Literacy',
      current: digital,
      required: requirements.digital,
      gap: digitalGap,
      critical: digitalGap > 20
    });
  }

  // Sort gaps by size (biggest first)
  gaps.sort((a, b) => b.gap - a.gap);

  // Calculate match percentage
  const avgCurrent = (leadership + analytics + technical + communication + digital) / 5;
  const avgRequired = (requirements.leadership + requirements.analytics + requirements.technical + requirements.communication + requirements.digital) / 5;
  const matchPercentage = Math.round((avgCurrent / avgRequired) * 100);

  // Build action plan based on gaps
  const actionPlan: Array<{
    step: number;
    action: string;
    duration?: string;
    expectedGain: string;
    link?: string;
  }> = [];

  let stepCounter = 1;

  // Check if user already completed Leadership training
  const hasLeadershipTraining = liveProfile.trainingCompleted.includes('train-001');
  
  if (leadershipGap > 0 && !hasLeadershipTraining) {
    actionPlan.push({
      step: stepCounter++,
      action: 'Enroll in Leadership Essentials training',
      duration: '8 weeks',
      expectedGain: `+25 Leadership points (current: ${leadership} → target: ${Math.min(100, leadership + 25)})`,
      link: '/training'
    });
  }

  if (analyticsGap > 0 && !liveProfile.trainingCompleted.includes('train-002')) {
    actionPlan.push({
      step: stepCounter++,
      action: 'Complete Data Analytics training',
      duration: '6 weeks',
      expectedGain: `+30 Analytics points (current: ${analytics} → target: ${Math.min(100, analytics + 30)})`,
      link: '/training'
    });
  }

  if (digitalGap > 0 && !liveProfile.trainingCompleted.includes('train-003')) {
    actionPlan.push({
      step: stepCounter++,
      action: 'Complete Digital Transformation training',
      duration: '4 weeks',
      expectedGain: `+35 Digital points (current: ${digital} → target: ${Math.min(100, digital + 35)})`,
      link: '/training'
    });
  }

  // Add project-based actions
  if (leadershipGap > 0) {
    actionPlan.push({
      step: stepCounter++,
      action: 'Lead 2 cross-functional projects',
      expectedGain: '+15 Leadership points + merit boost'
    });
  }

  // Add mentorship
  actionPlan.push({
    step: stepCounter++,
    action: 'Connect with senior leadership mentor',
    expectedGain: 'Guidance and professional networking',
    link: '/mentorship'
  });

  // Calculate timeline based on gaps
  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
  const timeline = totalGap > 100 ? '24-30 months' : totalGap > 50 ? '18-24 months' : '12-18 months';

  // Calculate confidence based on data quality and user progress
  const confidence = Math.min(0.95, 0.75 + (liveProfile.trainingCompleted.length * 0.05));

  // Calculate success rate
  const successRate = Math.min(95, Math.round(70 + matchPercentage * 0.2));

  return {
    nextRole: 'Senior Analyst',
    timeline,
    matchPercentage,
    gaps,
    actionPlan,
    successRate,
    confidence
  };
};

// Fallback for when profile is not available
const getDefaultRecommendation = (): CareerRecommendation => {
  return {
    nextRole: 'Senior Analyst',
    timeline: '18-24 months',
    matchPercentage: 40,
    gaps: [
      {
        competency: 'Leadership',
        current: 50,
        required: 85,
        gap: 35,
        critical: true
      },
      {
        competency: 'Data Analytics',
        current: 82,
        required: 90,
        gap: 8,
        critical: false
      }
    ],
    actionPlan: [
      {
        step: 1,
        action: 'Enroll in Leadership Essentials training',
        duration: '8 weeks',
        expectedGain: '+25 Leadership points',
        link: '/training'
      },
      {
        step: 2,
        action: 'Lead 2 cross-functional projects',
        expectedGain: '+15 Leadership points + merit boost'
      },
      {
        step: 3,
        action: 'Connect with senior leadership mentor',
        expectedGain: 'Guidance and professional networking',
        link: '/mentorship'
      }
    ],
    successRate: 78,
    confidence: 0.87
  };
};
