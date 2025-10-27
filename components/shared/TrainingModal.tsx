'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollInTraining } from '@/lib/training-manager';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: {
    id: string;
    name: string;
    provider: string;
    duration: string;
    credits: number;
    description: string;
  };
}

export default function TrainingModal({ isOpen, onClose, training }: TrainingModalProps) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  if (!isOpen) return null;

  const handleEnroll = async () => {
    setEnrolling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save enrollment
    enrollInTraining(training);
    
    setEnrolled(true);
    setEnrolling(false);
    
    // Navigate to training page after success
    setTimeout(() => {
      router.push('/my-training');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {enrolled ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h3>
            <p className="text-gray-600 mb-1">Anda telah terdaftar dalam pelatihan ini.</p>
            <p className="text-sm text-blue-600 font-semibold animate-pulse">Mengarahkan ke Pelatihan Saya...</p>
          </div>
        ) : (
          /* Enrollment Form */
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Daftar Pelatihan</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{training.name}</h3>
                <p className="text-sm text-gray-600">{training.provider}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Durasi:</span>
                  <p className="font-semibold">{training.duration}</p>
                </div>
                <div>
                  <span className="text-gray-600">Kredit:</span>
                  <p className="font-semibold">{training.credits} SKP</p>
                </div>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Deskripsi:</span>
                <p className="text-sm text-gray-700 mt-1">{training.description}</p>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium">
                💡 Pelatihan ini akan menambah kompetensi Leadership Anda
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg shadow-blue-500/30"
              >
                {enrolling ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
