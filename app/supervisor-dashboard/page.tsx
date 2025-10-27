'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, mockLogout } from '@/lib/auth';
import usersData from '@/lib/mock-data/users.json';
import { getUserProfile, getAllUserProfiles } from '@/lib/user-profile-manager';
import { TEXT } from '@/lib/constants';

export default function SupervisorDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'supervisor') {
      router.push('/dashboard');
      return;
    }
    setCurrentUser(user);

    // Load team members
    loadTeamMembers(user.id);
  }, [router]);

  const loadTeamMembers = (supervisorId: string) => {
    // Get all users who report to this supervisor
    const allProfiles = getAllUserProfiles();
    const team = usersData.users
      .filter(u => u.supervisorId === supervisorId)
      .map(u => {
        const liveProfile = allProfiles.find(p => p.id === u.id);
        return liveProfile || u;
      })
      .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0));
    
    setTeamMembers(team);
  };

  const handleLogout = () => {
    mockLogout();
    router.push('/login');
  };

  const handleViewProfile = (member: any) => {
    setSelectedMember(member);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">{TEXT.common.loading}</div>
      </div>
    );
  }

  const teamAvgMerit = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, m) => sum + (m.meritScore || 0), 0) / teamMembers.length)
    : 0;

  const topPerformer = teamMembers[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-600">{TEXT.supervisor.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.currentPosition}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {TEXT.common.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.supervisor.teamSize}</div>
            <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
            <div className="text-xs text-gray-500 mt-1">{TEXT.supervisor.activeMembers}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.supervisor.avgMeritScore}</div>
            <div className="text-3xl font-bold text-gray-900">{teamAvgMerit}</div>
            <div className="text-xs text-gray-500 mt-1">{TEXT.supervisor.outOf} 100</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
            <div className="text-sm text-gray-600 mb-1 font-semibold">{TEXT.supervisor.topPerformer}</div>
            <div className="text-lg font-bold text-gray-900">{topPerformer?.name || '-'}</div>
            <div className="text-xs text-gray-500 mt-1">{TEXT.supervisor.merit}: {topPerformer?.meritScore || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{TEXT.supervisor.yourTeam}</h3>
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                onClick={() => handleViewProfile(member)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                  selectedMember?.id === member.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <p className="text-xs text-gray-600">{member.currentPosition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{member.meritScore}</div>
                    <div className="text-xs text-gray-500">Merit</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-gray-600">{TEXT.supervisor.rank}</div>
                    <div className="font-bold text-gray-900">{member.rank}</div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-gray-600">{TEXT.supervisor.trainings}</div>
                    <div className="font-bold text-gray-900">{member.trainingCompleted?.length || 0}</div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-gray-600">{TEXT.supervisor.progress}</div>
                    <div className="font-bold text-gray-900">{member.careerProgress}%</div>
                  </div>
                </div>
              </div>
            ))}

            {teamMembers.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                {TEXT.supervisor.noTeamMembers}
              </div>
            )}
          </div>

          {/* Member Detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedMember ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMember.name}</h3>
                  <p className="text-sm text-gray-600">{selectedMember.currentPosition} • {selectedMember.unit}</p>
                  <p className="text-xs text-gray-500 mt-1">NIP: {selectedMember.nip}</p>
                </div>

                {/* Competencies */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{TEXT.supervisor.competencies}</h4>
                  <div className="space-y-3">
                    {selectedMember.competencies && Object.entries(selectedMember.competencies).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 capitalize">{key}</span>
                          <span className="font-semibold">{value}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-green-900 mb-2">📚 {TEXT.supervisor.trainingProgress}</h5>
                  <p className="text-sm text-green-800">
                    {TEXT.supervisor.completed}: {selectedMember.trainingCompleted?.length || 0} pelatihan
                  </p>
                  {selectedMember.certificationsEarned && selectedMember.certificationsEarned.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-green-900 mb-1">{TEXT.supervisor.certifications}:</div>
                      {selectedMember.certificationsEarned.map((cert: string, idx: number) => (
                        <div key={idx} className="text-xs text-green-800">• {cert}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career Path */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">🎯 {TEXT.supervisor.careerTarget}</h5>
                  <p className="text-sm text-blue-800 mb-2">
                    {TEXT.supervisor.target}: <strong>{selectedMember.careerTarget}</strong>
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${selectedMember.careerProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">{selectedMember.careerProgress}% selesai</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    {TEXT.supervisor.recommendForPromotion}
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
                    {TEXT.supervisor.sendFeedback}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                {TEXT.supervisor.selectMember}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
