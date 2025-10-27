'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import usersData from '@/lib/mock-data/users.json';
import trainingData from '@/lib/mock-data/training.json';
import trainingContent from '@/lib/mock-data/training-content.json';
import Header from '@/components/shared/Header';
import PageContainer from '@/components/shared/PageContainer';
import StatCard from '@/components/shared/StatCard';
import TrainingModal from '@/components/shared/TrainingModal';
import { TEXT } from '@/lib/constants';
import { getEnrollments } from '@/lib/training-manager';
import { getTrainingProgress } from '@/lib/training-progress';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    if (user.role === 'supervisor') {
      router.push('/supervisor-dashboard');
      return;
    }
    if (user.role === 'committee') {
      router.push('/merit-board');
      return;
    }

    setCurrentUser(user);

    // Get full user data
    const fullUserData = usersData.users.find(u => u.id === user.id);
    setUserData(fullUserData);
  }, [router]);

  const handleEnrollTraining = (training: any) => {
    setSelectedTraining(training);
    setShowModal(true);
  };

  const handleViewMyTraining = () => {
    router.push('/my-training');
  };

  const myEnrollments = getEnrollments();

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">{TEXT.common.loading}</div>
      </div>
    );
  }

  const recommendedTraining = trainingData.programs.slice(0, 2);
  
  // Check if user is enrolled in a training
  const isEnrolled = (trainingId: string) => {
    return myEnrollments.some(e => e.trainingId === trainingId);
  };
  
  const getEnrollmentProgress = (trainingId: string) => {
    // Calculate actual progress from completed lessons
    const content = (trainingContent as any)[trainingId];
    const progress = getTrainingProgress(trainingId);
    
    if (content && progress) {
      const totalLessons = content.modules.reduce((sum: number, mod: any) => sum + mod.lessons.length, 0);
      const completedLessons = progress.modules.reduce((sum: number, mod: any) => 
        sum + mod.lessons.filter((l: any) => l.completed).length, 0);
      return Math.round((completedLessons / totalLessons) * 100);
    }
    
    return 0;
  };

  return (
    <>
      <Header userName={userData.name} userPosition={userData.currentPosition} />
      <PageContainer 
        title={`${TEXT.dashboard.welcome}, ${userData.name.split(' ')[0]}! 👋`}
        subtitle={TEXT.dashboard.summary}
      >
        <div className="min-h-[60vh]">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title={TEXT.dashboard.meritScore}
            value={userData.meritScore}
            maxValue={100}
            progress={userData.meritScore}
            badge={{ text: `+${userData.meritChange} ↑`, color: 'green' }}
            gradientColor="blue"
          />

          <StatCard
            title={TEXT.dashboard.profile}
            value={`${userData.profileCompleteness}%`}
            progress={userData.profileCompleteness}
            badge={{ text: TEXT.dashboard.complete, color: 'blue' }}
            gradientColor="green"
          />

          <StatCard
            title={TEXT.dashboard.careerProgress}
            value={`${userData.careerProgress}%`}
            subtitle={`menuju ${userData.careerTarget}`}
            progress={userData.careerProgress}
            gradientColor="orange"
          />
        </div>

        {/* Career Path Preview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 {TEXT.dashboard.careerPath}</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.dashboard.currentPosition}</div>
              <div className="font-semibold text-gray-900">{userData.currentPosition}</div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-full h-2 bg-gray-200 rounded-full relative">
                <div className="absolute left-0 top-0 h-2 bg-blue-600 rounded-full" style={{ width: `${userData.careerProgress}%` }}></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.dashboard.targetPosition}</div>
              <div className="font-semibold text-gray-900">{userData.careerTarget}</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900">{TEXT.dashboard.nextMilestone}</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">{TEXT.dashboard.completeTraining} Leadership</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {myEnrollments.length > 0 && (
                <button
                  onClick={handleViewMyTraining}
                  className="flex-1 sm:flex-none px-3 py-2 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-all border-2 border-blue-300"
                >
                  📚 {TEXT.dashboard.myTraining}
                </button>
              )}
              <button
                onClick={() => router.push('/career-gps')}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
              >
                {TEXT.dashboard.viewCareerGPS} →
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 {TEXT.dashboard.recommendations}</h3>
          
          {/* Training Recommendations */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700">🎓 {TEXT.dashboard.trainingPrograms}</h4>
            {recommendedTraining.map((training) => {
              const enrolled = isEnrolled(training.id);
              const progress = getEnrollmentProgress(training.id);
              
              return (
                <div key={training.id} className={`border-2 rounded-xl p-4 transition-all ${
                  enrolled 
                    ? 'border-green-300 bg-green-50 hover:shadow-lg' 
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">{training.name}</h5>
                        {enrolled && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            ✓ {TEXT.dashboard.enrolled}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{training.duration} • {training.format} • {training.credits} kredit</p>
                    </div>
                    {!enrolled && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-lg font-bold">
                        {training.matchScore}% cocok
                      </span>
                    )}
                  </div>
                  
                  {enrolled && progress > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{TEXT.dashboard.yourProgress}</span>
                        <span className="font-bold text-green-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 mb-3">{training.description}</p>
                  
                  {enrolled ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => router.push(`/training/${training.id}`)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                      >
                        {progress === 0 ? `🚀 ${TEXT.dashboard.startLearning}` : `📚 ${TEXT.dashboard.continueLearning}`} →
                      </button>
                      {progress === 100 && (
                        <button 
                          onClick={() => router.push(`/training/${training.id}/certificate`)}
                          className="px-4 py-2 border-2 border-green-600 text-green-600 text-sm font-bold rounded-lg hover:bg-green-50 transition-all whitespace-nowrap"
                        >
                          📄 {TEXT.dashboard.certificate}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEnrollTraining(training)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      {TEXT.dashboard.enrollNow} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Training Modal */}
        {selectedTraining && (
          <TrainingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            training={selectedTraining}
          />
        )}
      </div>
    </PageContainer>
    </>
  );
}
