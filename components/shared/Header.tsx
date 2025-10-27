'use client';

import { useRouter } from 'next/navigation';
import { mockLogout } from '@/lib/auth';

interface HeaderProps {
  userName?: string;
  userPosition?: string;
  showBackButton?: boolean;
  title?: string;
}

export default function Header({ userName, userPosition, showBackButton, title }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    mockLogout();
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                aria-label="Kembali"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Kembali</span>
              </button>
            )}
            {title ? (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GarBaNusa
                </h1>
                <span className="hidden sm:inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  5.0
                </span>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {userName && (
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{userName}</div>
                {userPosition && <div className="text-xs text-gray-500">{userPosition}</div>}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs sm:text-sm text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all font-medium border border-gray-200"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
