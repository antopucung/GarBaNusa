'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/shared/Header';
import PageContainer from '@/components/shared/PageContainer';
import trainingData from '@/lib/mock-data/training.json';
import { getTrainingProgress } from '@/lib/training-progress';
import { getEnrollments } from '@/lib/training-manager';

export default function CertificatePage() {
  const router = useRouter();
  const params = useParams();
  const trainingId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [training, setTraining] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    
    const trainingDetail = trainingData.programs.find(p => p.id === trainingId);
    setTraining(trainingDetail);
    
    const userProgress = getTrainingProgress(trainingId);
    setProgress(userProgress);
    
    const enrollments = getEnrollments();
    const userEnrollment = enrollments.find(e => e.trainingId === trainingId);
    setEnrollment(userEnrollment);
  }, [router, trainingId]);

  const handleDownload = () => {
    alert('📄 Fitur download sertifikat akan segera hadir!\n\nSertifikat dapat diunduh dalam format PDF.');
  };

  const handleShare = () => {
    alert('🔗 Fitur share sertifikat akan segera hadir!\n\nAnda dapat membagikan sertifikat ke LinkedIn, Facebook, atau platform lainnya.');
  };

  if (!currentUser || !training || !progress || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Memuat...</div>
      </div>
    );
  }

  const isCompleted = enrollment.status === 'completed' && progress?.totalPoints >= (progress?.passingScore || 70);
  const completionDate = enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date();
  completionDate.setDate(completionDate.getDate() + 56); // 8 weeks later

  return (
    <>
      <Header 
        userName={currentUser.name} 
        userPosition={currentUser.currentPosition}
        showBackButton
        title="Sertifikat"
      />
      <PageContainer>
        {!isCompleted ? (
          /* Not Completed Yet */
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sertifikat Belum Tersedia</h2>
              <p className="text-gray-700 mb-6">
                Anda perlu menyelesaikan seluruh modul pelatihan untuk mendapatkan sertifikat.
              </p>
              <div className="bg-white rounded-xl p-4 mb-6">
                <div className="text-lg font-bold text-gray-900 mb-2">Progress Anda: {enrollment.progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => router.push(`/training/${trainingId}`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Lanjutkan Pelatihan →
              </button>
            </div>
          </div>
        ) : (
          /* Certificate Display */
          <div className="max-w-4xl mx-auto">
            {/* Certificate Preview */}
            <div className="bg-white rounded-2xl shadow-2xl border-8 border-double border-yellow-600 p-8 sm:p-12 mb-6 relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-600"></div>
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-600"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-yellow-600"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-yellow-600"></div>
              
              <div className="text-center">
                {/* Header */}
                <div className="mb-8">
                  <div className="text-yellow-600 text-6xl mb-4">🏆</div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>
                    SERTIFIKAT
                  </h1>
                  <p className="text-lg text-gray-600 font-semibold">PENYELESAIAN PELATIHAN</p>
                </div>
                
                {/* Body */}
                <div className="mb-8 space-y-4">
                  <p className="text-gray-700 text-lg">Diberikan kepada</p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'serif' }}>
                    {currentUser.name}
                  </h2>
                  <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                    Telah berhasil menyelesaikan program pelatihan
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 my-6">
                    &ldquo;{training.name}&rdquo;
                  </h3>
                  <p className="text-gray-700">
                    dengan durasi <strong>{training.duration}</strong> dan memperoleh <strong>{training.credits} SKP</strong>
                  </p>
                  <p className="text-gray-700 mt-4">
                    Diselesaikan pada <strong>{completionDate.toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</strong>
                  </p>
                </div>
                
                {/* Footer */}
                <div className="mt-12 pt-8 border-t-2 border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <div className="mb-2 pt-4 border-t-2 border-gray-900 inline-block px-8">
                        <p className="font-bold text-gray-900">Dr. Siti Nurhaliza</p>
                        <p className="text-sm text-gray-600">Direktur Pelatihan</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 pt-4 border-t-2 border-gray-900 inline-block px-8">
                        <p className="font-bold text-gray-900">Budi Santoso, M.M.</p>
                        <p className="text-sm text-gray-600">Fasilitator</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-xs text-gray-500">
                    <p>Sertifikat No: GBN-{trainingId.toUpperCase()}-{currentUser.id.toUpperCase()}-2025</p>
                    <p className="mt-1">Badan Kepegawaian Negara • GarDu Bakat Nusantara</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-blue-100">
                <div className="text-3xl font-bold text-blue-600">{progress.totalPoints}</div>
                <div className="text-sm text-gray-600 font-semibold">Total Poin</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-green-100">
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 font-semibold">Selesai</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-purple-100">
                <div className="text-3xl font-bold text-purple-600">{progress.badges.length}</div>
                <div className="text-sm text-gray-600 font-semibold">Badge</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-orange-100">
                <div className="text-3xl font-bold text-orange-600">{training.credits}</div>
                <div className="text-sm text-gray-600 font-semibold">SKP</div>
              </div>
            </div>
            
            {/* Badges Earned */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Badge yang Diperoleh</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {progress.badges.map((badgeId: string) => (
                  <div key={badgeId} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
                    <div className="text-4xl mb-2">
                      {badgeId === 'badge-starter' && '🎯'}
                      {badgeId === 'badge-communicator' && '💬'}
                      {badgeId === 'badge-graduate' && '🎓'}
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {badgeId === 'badge-starter' && 'Pemula Leadership'}
                      {badgeId === 'badge-communicator' && 'Komunikator Handal'}
                      {badgeId === 'badge-graduate' && 'Lulusan Leadership'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                📥 Download PDF
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                🔗 Bagikan
              </button>
              <button
                onClick={() => router.push('/my-training')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Pelatihan Saya
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}
