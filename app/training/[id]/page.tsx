'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/shared/Header';
import PageContainer from '@/components/shared/PageContainer';
import trainingData from '@/lib/mock-data/training.json';
import trainingContent from '@/lib/mock-data/training-content.json';
import { getTrainingProgress, initializeTrainingProgress } from '@/lib/training-progress';
import { getEnrollments } from '@/lib/training-manager';

export default function TrainingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const trainingId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [training, setTraining] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    
    // Load training data
    const trainingDetail = trainingData.programs.find(p => p.id === trainingId);
    setTraining(trainingDetail);
    
    // Load training content
    const trainingContentData = (trainingContent as any)[trainingId];
    setContent(trainingContentData);
    
    // Load or initialize progress
    let userProgress = getTrainingProgress(trainingId);
    if (!userProgress) {
      userProgress = initializeTrainingProgress(trainingId);
    }
    setProgress(userProgress);
    
    // Load enrollment
    const enrollments = getEnrollments();
    const userEnrollment = enrollments.find(e => e.trainingId === trainingId);
    setEnrollment(userEnrollment);
  }, [router, trainingId]);

  const handleStartModule = (moduleIndex: number) => {
    router.push(`/training/${trainingId}/module/${moduleIndex}`);
  };

  const getModuleProgress = (moduleId: string) => {
    if (!progress || !content) return 0;
    
    const moduleProgress = progress.modules.find((m: any) => m.moduleId === moduleId);
    const trainingModule = content.modules.find((m: any) => m.id === moduleId);
    
    if (!moduleProgress || !trainingModule) return 0;
    
    const completedLessons = moduleProgress.lessons.filter((l: any) => l.completed).length;
    return Math.round((completedLessons / trainingModule.lessons.length) * 100);
  };

  if (!currentUser || !training || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Memuat...</div>
      </div>
    );
  }

  const totalLessons = content.modules.reduce((sum: number, mod: any) => sum + mod.lessons.length, 0);
  const completedLessons = progress?.modules.reduce((sum: number, mod: any) => 
    sum + mod.lessons.filter((l: any) => l.completed).length, 0) || 0;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);
  const isCompleted = enrollment?.status === 'completed' || enrollment?.progress === 100 || overallProgress === 100;

  return (
    <>
      <Header 
        userName={currentUser.name} 
        userPosition={currentUser.currentPosition}
        showBackButton
        backUrl="/dashboard"
        title={training.name}
      />
      <PageContainer>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{training.name}</h1>
              <p className="text-blue-100 mb-4">{training.provider} • {training.duration} • {training.credits} SKP</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  📊 {content.modules.length} Modul
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  🎯 {content.totalPoints} Poin
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  🏆 {content.badges.length} Badge
                </span>
              </div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-4xl font-bold mb-1">{overallProgress}%</div>
              <div className="text-sm text-blue-100">Progress</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {/* Certificate Button */}
          {isCompleted && (
            <div className="mt-6">
              <button
                onClick={() => router.push(`/training/${trainingId}/certificate`)}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                📄 Lihat Sertifikat Penyelesaian
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-100">
            <div className="text-3xl font-bold text-blue-600 mb-1">{progress?.totalPoints || 0}</div>
            <div className="text-sm text-gray-600 font-semibold">Total Poin</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-green-100">
            <div className="text-3xl font-bold text-green-600 mb-1">{completedLessons}/{totalLessons}</div>
            <div className="text-sm text-gray-600 font-semibold">Pelajaran</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-100">
            <div className="text-3xl font-bold text-purple-600 mb-1">{progress?.badges.length || 0}/{content.badges.length}</div>
            <div className="text-sm text-gray-600 font-semibold">Badge</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-orange-100">
            <div className="text-3xl font-bold text-orange-600 mb-1">{content.passingScore}%</div>
            <div className="text-sm text-gray-600 font-semibold">Passing Score</div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Modul Pelatihan</h2>
          
          {content.modules.map((module: any, index: number) => {
            const moduleProgress = getModuleProgress(module.id);
            const isLocked = index > 0 && getModuleProgress(content.modules[index - 1].id) < 100;
            
            return (
              <div 
                key={module.id}
                className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all ${
                  isLocked 
                    ? 'border-gray-200 opacity-60' 
                    : 'border-blue-200 hover:border-blue-400 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-sm text-gray-600">
                        📅 {module.duration}
                      </span>
                      <span className="text-sm text-gray-600">
                        • {module.lessons.length} pelajaran
                      </span>
                    </div>
                  </div>
                  
                  {isLocked ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">Terkunci</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{moduleProgress}%</div>
                      <button
                        onClick={() => handleStartModule(index)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm"
                      >
                        {moduleProgress === 0 ? 'Mulai' : moduleProgress === 100 ? 'Review' : 'Lanjutkan'}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${moduleProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Badge & Pencapaian</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {content.badges.map((badge: any) => {
              const earned = progress?.badges.includes(badge.id);
              
              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    earned 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg' 
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="text-5xl mb-2">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  {earned && (
                    <div className="mt-2 text-xs text-green-600 font-bold">✓ Diperoleh!</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
