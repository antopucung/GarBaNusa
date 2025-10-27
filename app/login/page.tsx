'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, loginAsUser } from '@/lib/auth';
import { resetUserDatabase, userHasData } from '@/lib/reset-database';
import users from '@/lib/mock-data/users.json';
import { initializeLiveDatabase } from '@/lib/user-profile-manager';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDataStatus, setUserDataStatus] = useState<{[key: string]: boolean}>({});
  const [resettingUser, setResettingUser] = useState<string | null>(null);

  useEffect(() => {
    // Check data status for each demo user
    const status: {[key: string]: boolean} = {};
    users.users.forEach(user => {
      status[user.id] = userHasData(user.id);
    });
    setUserDataStatus(status);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (success) {
      // Redirect based on user role
      const user = users.users.find(u => u.email === email);
      if (user?.role === 'committee') {
        router.push('/merit-board');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError('Email atau password salah');
      setLoading(false);
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    setLoading(true);
    loginAsUser(userEmail);
    
    // Redirect based on role
    const user = users.users.find(u => u.email === userEmail);
    if (user?.role === 'committee') {
      router.push('/merit-board');
    } else {
      router.push('/dashboard');
    }
  };

  const handleResetUser = (userId: string, userName: string) => {
    if (confirm(`🗑️ Reset data pelatihan untuk ${userName}?\n\nSemua progress, enrollment, dan badge user ini akan dihapus. Aksi ini tidak dapat dibatalkan.`)) {
      setResettingUser(userId);
      resetUserDatabase(userId);
      setTimeout(() => {
        setResettingUser(null);
        // Update status
        setUserDataStatus(prev => ({ ...prev, [userId]: false }));
        alert(`✅ Data ${userName} berhasil direset!\n\nUser ini dapat memulai demo dari awal.`);
      }, 500);
    }
  };

  const demoAccounts = users.users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role === 'committee' ? 'Komite' : user.role === 'supervisor' ? 'Supervisor' : 'ASN (Staf)',
    name: user.name,
    password: 'demo123'
  }));

  const quickLogin = (demoEmail: string) => {
    handleQuickLogin(demoEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10">
          {/* Logo & Branding */}
          <div className="text-center mb-10">
            <div className="mb-4 inline-block p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              GarBaNusa 5.0
            </h1>
            <p className="text-gray-500 text-sm font-medium">Sistem Manajemen Talenta ASN Digital</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="email@instansi.go.id"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">⚡ Quick Login Demo</h3>
            <p className="text-xs text-gray-600 mb-4">Pilih user untuk login langsung (tanpa password)</p>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <div key={account.email} className="relative">
                  <button
                    onClick={() => quickLogin(account.email)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all border-2 border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{account.email}</div>
                        <div className="text-xs text-gray-500 font-medium">{account.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {userDataStatus[account.id] && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                            Ada Data
                          </span>
                        )}
                        <div className="text-xs text-gray-400 font-mono">{account.password}</div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Per-user Reset Button */}
                  {userDataStatus[account.id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetUser(account.id, account.name);
                      }}
                      disabled={resettingUser === account.id}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Reset data ${account.name}`}
                    >
                      {resettingUser === account.id ? '🔄' : '🗑️'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          © 2025 Badan Kepegawaian Negara
        </p>
      </div>
    </div>
  );
}
