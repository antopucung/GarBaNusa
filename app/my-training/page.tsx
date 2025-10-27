'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getEnrollments } from '@/lib/training-manager';
import Header from '@/components/shared/Header';
import PageContainer from '@/components/shared/PageContainer';
import trainingData from '@/lib/mock-data/training.json';

export default function MyTrainingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadEnrollments();
  }, [router]);

  const loadEnrollments = () => {
    const userEnrollments = getEnrollments();
    
    // Match with full training data
    const enrichedEnrollments = userEnrollments.map(enrollment => {
      const trainingDetail = trainingData.programs.find(p => p.id === enrollment.trainingId);
      return {
        ...enrollment,
        ...trainingDetail
      };
    });
    
    setEnrollments(enrichedEnrollments);
  };

  const handleStartTraining = (trainingId: string) => {
    router.push(`/training/${trainingId}`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Memuat...</div>
      </div>
    );
  }

  return (
    <>
      <Header 
        userName={currentUser.name} 
        userPosition={currentUser.currentPosition}
        showBackButton
        title="Pelatihan Saya"
      />
      <PageContainer 
        title="Pelatihan Saya"
        subtitle={`${enrollments.length} pelatihan terdaftar`}
      >
        {enrollments.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Pelatihan</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Anda belum mendaftar pelatihan apapun. Mulai tingkatkan kompetensi Anda!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
            >
              Lihat Rekomendasi Pelatihan
            </button>
          </div>
        ) : (
          /* Enrolled Trainings */
          <div className="space-y-4 sm:space-y-6">
            {enrollments.map((training) => (
              <div 
                key={training.trainingId}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 sm:p-6 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {training.trainingName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {training.provider} • {training.duration} • {training.credits} SKP
                        </p>
                      </div>
                    </div>
                    
                    {training.description && (
                      <p className="text-sm text-gray-700 mb-3 pl-15">
                        {training.description}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                      training.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : training.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {training.status === 'completed' 
                        ? '✅ Selesai' 
                        : training.status === 'in-progress'
                        ? '🔄 Berlangsung'
                        : '📝 Terdaftar'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progres</span>
                    <span className="text-sm font-bold text-blue-600">{training.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${training.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Enrollment Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Terdaftar: {new Date(training.enrolledAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStartTraining(training.trainingId)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                  >
                    {training.progress === 0 ? '🚀 Mulai Belajar' : training.progress === 100 ? '📖 Review Materi' : '📚 Lanjutkan Belajar'}
                  </button>
                  <button
                    onClick={() => router.push(`/training/${training.trainingId}/certificate`)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      training.status === 'completed'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg'
                        : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {training.status === 'completed' ? '📄 Lihat Sertifikat' : '🔒 Sertifikat Terkunci'}
                  </button>
                </div>
              </div>
            ))}

            {/* Find More Training */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 text-center">
              <p className="text-gray-700 font-semibold mb-4">
                💡 Ingin mengikuti pelatihan lainnya?
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-blue-300"
              >
                Lihat Rekomendasi Pelatihan
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}
