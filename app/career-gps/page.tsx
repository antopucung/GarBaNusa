'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCareerRecommendations, type CareerRecommendation } from '@/lib/ai-simulator/career-recommender';
import Header from '@/components/shared/Header';
import PageContainer from '@/components/shared/PageContainer';
import TrainingModal from '@/components/shared/TrainingModal';
import trainingData from '@/lib/mock-data/training.json';
import { TEXT } from '@/lib/constants';

export default function CareerGPSPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadRecommendations(user.id);
  }, [router]);

  const loadRecommendations = async (userId: string) => {
    setLoading(true);
    setProgress(0);
    try {
      const rec = await getCareerRecommendations(userId, (p) => setProgress(p));
      setRecommendation(rec);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.link === '/training') {
      // Find matching training
      const training = trainingData.programs[0]; // Leadership Essentials
      setSelectedTraining(training);
      setShowModal(true);
    } else if (action.link === '/mentorship') {
      alert('Fitur mentorship akan segera hadir!');
    } else {
      alert(`${action.action} - Fitur dalam pengembangan`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">{TEXT.common.loading}</div>
      </div>
    );
  }

  return (
    <>
      <Header 
        userName={currentUser.name} 
        userPosition={currentUser.currentPosition}
        showBackButton
        title={TEXT.careerGps.title}
      />
      <PageContainer 
        title={TEXT.careerGps.title}
        subtitle={TEXT.careerGps.subtitle}
      >
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-700 font-semibold">{TEXT.common.processing}...</p>
              <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{Math.round(progress)}% {TEXT.dashboard.complete}</p>
            </div>
          </div>
        ) : recommendation ? (
          <div className="space-y-6">
            {/* Journey Overview */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📍 {TEXT.careerGps.currentRole}</h3>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="text-center flex-1 w-full">
                  <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.dashboard.currentPosition}</div>
                  <div className="font-bold text-gray-900">Analyst</div>
                </div>
                <div className="flex-1 flex items-center px-4 w-full">
                  <div className="w-full h-3 bg-gray-200 rounded-full relative">
                    <div
                      className="absolute left-0 top-0 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${recommendation.matchPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center flex-1 w-full">
                  <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.careerGps.targetRole}</div>
                  <div className="font-bold text-gray-900">{recommendation.nextRole}</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-blue-900">{TEXT.careerGps.estimatedTimeline}</p>
                    <p className="text-xs text-blue-700 mt-1 font-medium">{recommendation.timeline}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-blue-900">{TEXT.careerGps.aiConfidence}</p>
                    <p className="text-xs text-blue-700 mt-1 font-medium">{Math.round(recommendation.confidence * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 {TEXT.careerGps.competencyGaps}</h3>
              <div className="space-y-4">
                {recommendation.gaps.map((gap, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{gap.competency}</span>
                      {gap.critical && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-lg font-bold">
                          KRITIS
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Saat ini: {gap.current}</span>
                        <span className="text-gray-600">Diperlukan: {gap.required}</span>
                        <span className="text-red-600 font-bold">Gap: {gap.gap}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${gap.critical ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}
                          style={{ width: `${(gap.current / gap.required) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Rencana Aksi AI</h3>
              <div className="space-y-4">
                {recommendation.actionPlan.map((action, index) => (
                  <div key={index} className="flex gap-4 border-l-4 border-blue-500 pl-4 py-2 hover:bg-blue-50 transition-colors rounded-r-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {action.step}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">{action.action}</p>
                      {action.duration && (
                        <p className="text-sm text-gray-600 mb-1">Durasi: {action.duration}</p>
                      )}
                      <p className="text-sm text-green-600 font-bold mb-2">
                        Dampak: {action.expectedGain}
                      </p>
                      {action.link && (
                        <button
                          onClick={() => handleActionClick(action)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        >
                          Ambil Tindakan →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-800 font-semibold">
                  📊 <strong>Tingkat Keberhasilan:</strong> {recommendation.successRate}% ASN yang mengikuti rencana serupa berhasil mencapai tujuan mereka
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Tidak ada rekomendasi tersedia</p>
          </div>
        )}

        {/* Training Modal */}
        {selectedTraining && (
          <TrainingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            training={selectedTraining}
          />
        )}
      </PageContainer>
    </>
  );
}
