'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, mockLogout } from '@/lib/auth';
import candidatesData from '@/lib/mock-data/candidates.json';
import usersData from '@/lib/mock-data/users.json';
import trainingContent from '@/lib/mock-data/training-content.json';
import { getCandidatesWithLiveData, initializeLiveDatabase, getUserProfile } from '@/lib/user-profile-manager';
import { getTrainingProgress } from '@/lib/training-progress';
import { TEXT } from '@/lib/constants';
import { generateFraudChecklist, type FraudCheckReport } from '@/lib/fraud-detection';

export default function MeritBoardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'merit' | 'name'>('merit');
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'supervisor' | 'asn'>('all');
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showFraudCheck, setShowFraudCheck] = useState(false);
  const [fraudReport, setFraudReport] = useState<FraudCheckReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'committee') {
      router.push('/dashboard');
      return;
    }
    setCurrentUser(user);

    // Initialize live database and load candidates
    initializeLiveDatabase();
    const liveCandidates = getCandidatesWithLiveData();
    
    // Merge live candidates with static candidates
    const mergedCandidates = [...candidatesData.candidates];
    
    // Add live candidates that aren't already in static data
    liveCandidates.forEach(liveCandidate => {
      const existingIndex = mergedCandidates.findIndex(c => c.id === liveCandidate.id);
      if (existingIndex >= 0) {
        // Update existing with live data
        mergedCandidates[existingIndex] = { ...mergedCandidates[existingIndex], ...liveCandidate };
      } else {
        // Add new live candidate
        mergedCandidates.push(liveCandidate);
      }
    });
    
    // Calculate actual training completion for each candidate
    const candidatesWithTraining = mergedCandidates.map(candidate => {
      const userEnrollmentsStr = localStorage.getItem(`userEnrollments_${candidate.id}`);
      const userEnrollments = userEnrollmentsStr ? JSON.parse(userEnrollmentsStr) : [];
      let completedTrainings = 0;
      
      userEnrollments.forEach((enrollment: any) => {
        const content = (trainingContent as any)[enrollment.trainingId];
        const progress = getTrainingProgress(enrollment.trainingId);
        
        if (content && progress) {
          const totalLessons = content.modules.reduce((sum: number, mod: any) => sum + mod.lessons.length, 0);
          const completedLessons = progress.modules.reduce((sum: number, mod: any) => 
            sum + mod.lessons.filter((l: any) => l.completed).length, 0);
          const actualProgress = Math.round((completedLessons / totalLessons) * 100);
          
          if (actualProgress === 100) {
            completedTrainings++;
          }
        }
      });
      
      return {
        ...candidate,
        actualTrainingCompleted: completedTrainings
      };
    });
    
    setAllCandidates(candidatesWithTraining);
  }, [router]);

  const handleLogout = () => {
    mockLogout();
    router.push('/login');
  };

  const handleAddToCompare = (candidate: any) => {
    if (compareList.length >= 2) {
      alert('You can only compare 2 candidates at a time. Remove one to add another.');
      return;
    }
    if (compareList.find(c => c.id === candidate.id)) {
      alert('This candidate is already in the comparison list.');
      return;
    }
    setCompareList([...compareList, candidate]);
  };

  const handleRemoveFromCompare = (candidateId: string) => {
    setCompareList(compareList.filter(c => c.id !== candidateId));
  };

  const handleOpenCompare = () => {
    if (compareList.length < 2) {
      alert('Please add 2 candidates to compare.');
      return;
    }
    setShowCompareModal(true);
  };

  const isInCompareList = (candidateId: string) => {
    return compareList.some(c => c.id === candidateId);
  };

  const handleRunFraudCheck = async (candidate: any) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate AI analysis with progress
    const steps = [
      { progress: 15, delay: 400, message: 'Menganalisis riwayat pelatihan...' },
      { progress: 30, delay: 500, message: 'Memeriksa konsistensi skor...' },
      { progress: 50, delay: 600, message: 'Mengevaluasi progres karier...' },
      { progress: 70, delay: 500, message: 'Menganalisis umpan balik...' },
      { progress: 85, delay: 400, message: 'Memeriksa kelengkapan data...' },
      { progress: 100, delay: 300, message: 'Menyelesaikan analisis...' },
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setAnalysisProgress(step.progress);
    }
    
    // Generate report
    const report = generateFraudChecklist(candidate);
    setFraudReport(report);
    
    // Small delay before showing modal
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsAnalyzing(false);
    setShowFraudCheck(true);
  };

  if (!currentUser || allCandidates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">{TEXT.common.loading}</div>
      </div>
    );
  }

  // Filter candidates based on view mode
  const filteredCandidates = allCandidates.filter(candidate => {
    if (viewMode === 'all') return true;
    
    // Find original user data to check role
    const userData = usersData.users.find(u => u.id === candidate.id || u.nip === candidate.nip);
    
    if (viewMode === 'supervisor') {
      return userData?.role === 'supervisor';
    }
    if (viewMode === 'asn') {
      return userData?.role === 'asn';
    }
    return true;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'merit') {
      return b.meritScore - a.meritScore;
    }
    return a.name.localeCompare(b.name);
  });

  // Check if we're using live data
  const isLiveData = allCandidates.some(c => c.lastUpdated);

  // Get supervisor info for a candidate
  const getSupervisorInfo = (candidate: any) => {
    const userData = usersData.users.find(u => u.id === candidate.id || u.nip === candidate.nip);
    if (!userData?.supervisorId) return null;
    
    const supervisor = usersData.users.find(u => u.id === userData.supervisorId);
    return supervisor;
  };

  // Get team members for a supervisor
  const getTeamMembers = (supervisorId: string) => {
    return usersData.users.filter(u => u.supervisorId === supervisorId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-600">{TEXT.meritBoard.title}</h1>
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
        {/* Header Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{TEXT.meritBoard.directorPosition}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{TEXT.meritBoard.totalCandidates}: {allCandidates.length}</span>
            <span>•</span>
            <span>{TEXT.meritBoard.reviewDue}: 30 Nov 2025</span>
            {isLiveData && (
              <>
                <span>•</span>
                <span className="text-green-600 font-semibold">🔄 {TEXT.meritBoard.liveDataActive}</span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{TEXT.meritBoard.view}:</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'all' | 'supervisor' | 'asn')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title={TEXT.meritBoard.view}
                >
                  <option value="all">{TEXT.meritBoard.allCandidates} ({allCandidates.length})</option>
                  <option value="supervisor">{TEXT.meritBoard.supervisorsOnly}</option>
                  <option value="asn">{TEXT.meritBoard.asnOnly}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{TEXT.meritBoard.sortBy}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'merit' | 'name')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title={TEXT.meritBoard.sortBy}
                >
                  <option value="merit">{TEXT.meritBoard.meritScoreHighLow}</option>
                  <option value="name">{TEXT.meritBoard.nameAZ}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                {TEXT.meritBoard.exportReport}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidates List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{TEXT.meritBoard.candidates}</h3>
            {sortedCandidates.map((candidate, index) => {
              const userData = usersData.users.find(u => u.id === candidate.id || u.nip === candidate.nip);
              const supervisor = getSupervisorInfo(candidate);
              const teamMembers = userData?.role === 'supervisor' ? getTeamMembers(candidate.id) : [];
              
              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedCandidate?.id === candidate.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                          {userData?.role === 'supervisor' && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold">
                              {TEXT.meritBoard.supervisor}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{candidate.currentPosition} • {candidate.unit}</p>
                        {supervisor && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            {TEXT.meritBoard.reportsTo}: {supervisor.name}
                          </p>
                        )}
                        {teamMembers.length > 0 && (
                          <p className="text-xs text-purple-600 mt-0.5">
                            {TEXT.meritBoard.team}: {teamMembers.length} {TEXT.meritBoard.members}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{candidate.meritScore}</div>
                      <div className="text-xs text-gray-500">{TEXT.meritBoard.meritScore}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">{TEXT.meritBoard.match}: {candidate.competencyMatch}%</span>
                    <span className="text-gray-600">{TEXT.meritBoard.tenure}: {candidate.tenure || 5} {TEXT.meritBoard.years}</span>
                    {candidate.actualTrainingCompleted > 0 && (
                      <span className="text-green-600">Pelatihan: {candidate.actualTrainingCompleted}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Candidate Detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedCandidate ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                    {(() => {
                      const userData = usersData.users.find(u => u.id === selectedCandidate.id || u.nip === selectedCandidate.nip);
                      return userData?.role === 'supervisor' && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">
                          {TEXT.meritBoard.supervisor}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-gray-600">{selectedCandidate.currentPosition} • {selectedCandidate.klPemda}</p>
                  {(() => {
                    const supervisor = getSupervisorInfo(selectedCandidate);
                    return supervisor && (
                      <p className="text-sm text-blue-600 mt-1">
                        📊 {TEXT.meritBoard.reportsTo}: {supervisor.name} ({supervisor.currentPosition})
                      </p>
                    );
                  })()}
                </div>

                {/* Merit Score Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{TEXT.meritBoard.meritScore}: {selectedCandidate.meritScore}/100</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{TEXT.meritBoard.competencyMatch} (35%)</span>
                        <span className="font-semibold">{selectedCandidate.competencyMatch}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedCandidate.competencyMatch}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{TEXT.meritBoard.performance} (30%)</span>
                        <span className="font-semibold">{selectedCandidate.performance}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${selectedCandidate.performance}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{TEXT.meritBoard.feedback360} (20%)</span>
                        <span className="font-semibold">{selectedCandidate.feedback360}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${selectedCandidate.feedback360}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{TEXT.meritBoard.learningAgility} (15%)</span>
                        <span className="font-semibold">{selectedCandidate.learningAgility}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${selectedCandidate.learningAgility}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">🤖 {TEXT.meritBoard.aiJustification}</h5>
                  <p className="text-sm text-blue-800">
                    Kandidat menunjukkan keselarasan luar biasa dengan persyaratan Direktur, 
                    terutama dalam {selectedCandidate.competencyMatch >= 90 ? 'semua area kunci' : 'perencanaan strategis dan kepemimpinan'}. 
                    Kinerja konsisten tinggi selama {selectedCandidate.tenure} tahun.
                  </p>
                </div>

                {/* Bias Check */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-green-900 mb-2">✅ {TEXT.meritBoard.biasCheck}</h5>
                  <p className="text-sm text-green-800">
                    {TEXT.meritBoard.noBiasDetected}
                  </p>
                </div>

                {/* Team Members (if supervisor) */}
                {(() => {
                  const userData = usersData.users.find(u => u.id === selectedCandidate.id || u.nip === selectedCandidate.nip);
                  const teamMembers = userData?.role === 'supervisor' ? getTeamMembers(selectedCandidate.id) : [];
                  
                  return teamMembers.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-purple-900 mb-3">👥 {TEXT.meritBoard.teamMembers} ({teamMembers.length})</h5>
                      <div className="space-y-2">
                        {teamMembers.map(member => {
                          const liveProfile = getUserProfile(member.id);
                          const merit = liveProfile?.meritScore || member.meritScore || 0;
                          
                          return (
                            <div key={member.id} className="flex items-center justify-between bg-white rounded p-2">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                <div className="text-xs text-gray-600">{member.currentPosition}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-purple-600">{merit}</div>
                                <div className="text-xs text-gray-500">{TEXT.meritBoard.merit}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="text-xs text-purple-800">
                          {TEXT.meritBoard.avgMerit} Tim: <strong>{Math.round(teamMembers.reduce((sum, m) => {
                            const liveProfile = getUserProfile(m.id);
                            return sum + (liveProfile?.meritScore || m.meritScore || 0);
                          }, 0) / teamMembers.length)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Training History */}
                {selectedCandidate.certificationsEarned && selectedCandidate.certificationsEarned.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-amber-900 mb-2">🎓 {TEXT.meritBoard.completedTrainings}</h5>
                    <div className="space-y-1">
                      {selectedCandidate.certificationsEarned.map((cert: string, idx: number) => (
                        <div key={idx} className="text-sm text-amber-800">• {cert}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Fraud Check */}
                <div>
                  <button
                    onClick={() => handleRunFraudCheck(selectedCandidate)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg transition-all"
                  >
                    🤖 {TEXT.meritBoard.runVerification}
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {TEXT.meritBoard.verificationSubtitle}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    {TEXT.meritBoard.addToShortlist}
                  </button>
                  {isInCompareList(selectedCandidate.id) ? (
                    <button 
                      onClick={() => handleRemoveFromCompare(selectedCandidate.id)}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200"
                    >
                      {TEXT.meritBoard.removeFromCompare}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAddToCompare(selectedCandidate)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                      disabled={compareList.length >= 2}
                    >
                      {compareList.length >= 2 ? TEXT.meritBoard.compareFull : TEXT.meritBoard.addToCompare}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                {TEXT.meritBoard.selectCandidate}
              </div>
            )}
          </div>
        </div>

        {/* Floating Compare Button */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-600 p-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {TEXT.meritBoard.compareList} ({compareList.length}/2)
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {compareList.map(c => c.name).join(' vs ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {compareList.length === 2 && (
                    <button
                      onClick={handleOpenCompare}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      {TEXT.meritBoard.compareNow}
                    </button>
                  )}
                  <button
                    onClick={() => setCompareList([])}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                  >
                    {TEXT.common.clear}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Comparison Modal */}
      {showCompareModal && compareList.length === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{TEXT.meritBoard.candidateComparison}</h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {compareList.map((candidate, idx) => {
                  const userData = usersData.users.find(u => u.id === candidate.id || u.nip === candidate.nip);
                  const supervisor = getSupervisorInfo(candidate);
                  const teamMembers = userData?.role === 'supervisor' ? getTeamMembers(candidate.id) : [];

                  return (
                    <div key={candidate.id} className="space-y-4">
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${idx === 0 ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-purple-700'} text-white rounded-lg p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{candidate.name}</h3>
                          {userData?.role === 'supervisor' && (
                            <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded font-bold">
                              {TEXT.meritBoard.supervisor}
                            </span>
                          )}
                        </div>
                        <p className="text-sm opacity-90">{candidate.currentPosition}</p>
                        <p className="text-xs opacity-75 mt-1">{candidate.unit}</p>
                      </div>

                      {/* Merit Score */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">{candidate.meritScore}</div>
                          <div className="text-sm text-gray-600 mt-1">{TEXT.meritBoard.meritScore}</div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{TEXT.meritBoard.competencyMatch}</span>
                            <span className="font-semibold">{candidate.competencyMatch}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${candidate.competencyMatch}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{TEXT.meritBoard.performance}</span>
                            <span className="font-semibold">{candidate.performance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${candidate.performance}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{TEXT.meritBoard.feedback360}</span>
                            <span className="font-semibold">{candidate.feedback360}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${candidate.feedback360}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{TEXT.meritBoard.learningAgility}</span>
                            <span className="font-semibold">{candidate.learningAgility}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${candidate.learningAgility}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Competencies */}
                      {candidate.competencies && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-3">{TEXT.supervisor.competencies}</h4>
                          <div className="space-y-2">
                            {Object.entries(candidate.competencies).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-700 capitalize">{key}</span>
                                <span className="font-semibold text-blue-600">{value}/100</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reporting Structure */}
                      {supervisor && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-900 mb-2">{TEXT.meritBoard.reportsTo}</h4>
                          <div className="text-sm text-green-800">
                            {supervisor.name} ({supervisor.currentPosition})
                          </div>
                        </div>
                      )}

                      {/* Team (if supervisor) */}
                      {teamMembers.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-purple-900 mb-2">
                            {TEXT.meritBoard.team}: {teamMembers.length} {TEXT.meritBoard.members}
                          </h4>
                          <div className="text-xs text-purple-800">
                            {TEXT.meritBoard.avgMerit}: {Math.round(teamMembers.reduce((sum, m) => {
                              const liveProfile = getUserProfile(m.id);
                              return sum + (liveProfile?.meritScore || m.meritScore || 0);
                            }, 0) / teamMembers.length)}
                          </div>
                        </div>
                      )}

                      {/* Trainings */}
                      {candidate.actualTrainingCompleted > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-amber-900 mb-2">{TEXT.meritBoard.training}</h4>
                          <div className="text-sm text-amber-800">
                            {TEXT.supervisor.completed}: {candidate.actualTrainingCompleted} {TEXT.meritBoard.programs}
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{TEXT.meritBoard.tenure}</span>
                          <span className="font-semibold">{candidate.tenure || 5} {TEXT.meritBoard.years}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">NIP</span>
                          <span className="font-semibold text-xs">{candidate.nip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison Summary */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 {TEXT.meritBoard.aiComparisonSummary}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-800">
                    <strong>{compareList[0].name}</strong> {TEXT.meritBoard.hasAMeritScore} <strong>{compareList[0].meritScore}</strong> {TEXT.meritBoard.comparedTo} <strong>{compareList[1].name} {compareList[1].meritScore}</strong>.
                  </p>
                  <p className="text-gray-800">
                    {compareList[0].meritScore > compareList[1].meritScore 
                      ? `${compareList[0].name} ${TEXT.meritBoard.leadsBy} ${compareList[0].meritScore - compareList[1].meritScore} poin.`
                      : compareList[0].meritScore < compareList[1].meritScore
                      ? `${compareList[1].name} ${TEXT.meritBoard.leadsBy} ${compareList[1].meritScore - compareList[0].meritScore} poin.`
                      : TEXT.meritBoard.equalScores}
                  </p>
                  <p className="text-gray-800">
                    {TEXT.meritBoard.competencyMatch}: <strong>{compareList[0].name}</strong> ({compareList[0].competencyMatch}%) vs <strong>{compareList[1].name}</strong> ({compareList[1].competencyMatch}%)
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  {TEXT.common.close} {TEXT.meritBoard.candidateComparison}
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  {TEXT.meritBoard.exportComparisonReport}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Loading Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            {/* AI Animation */}
            <div className="text-center mb-6">
              <div className="inline-block relative">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  {/* Spinning circles */}
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  
                  {/* AI Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🤖</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI Sedang Menganalisis
              </h3>
              <p className="text-gray-600">
                Memeriksa data kandidat secara menyeluruh...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-bold text-purple-600">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${analysisProgress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Analysis Steps */}
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 transition-all ${analysisProgress >= 15 ? 'text-purple-600' : 'text-gray-400'}`}>
                <span>{analysisProgress >= 15 ? '✓' : '○'}</span>
                <span>Menganalisis riwayat pelatihan</span>
              </div>
              <div className={`flex items-center gap-2 transition-all ${analysisProgress >= 30 ? 'text-purple-600' : 'text-gray-400'}`}>
                <span>{analysisProgress >= 30 ? '✓' : '○'}</span>
                <span>Memeriksa konsistensi skor</span>
              </div>
              <div className={`flex items-center gap-2 transition-all ${analysisProgress >= 50 ? 'text-purple-600' : 'text-gray-400'}`}>
                <span>{analysisProgress >= 50 ? '✓' : '○'}</span>
                <span>Mengevaluasi progres karier</span>
              </div>
              <div className={`flex items-center gap-2 transition-all ${analysisProgress >= 70 ? 'text-purple-600' : 'text-gray-400'}`}>
                <span>{analysisProgress >= 70 ? '✓' : '○'}</span>
                <span>Menganalisis umpan balik</span>
              </div>
              <div className={`flex items-center gap-2 transition-all ${analysisProgress >= 85 ? 'text-purple-600' : 'text-gray-400'}`}>
                <span>{analysisProgress >= 85 ? '✓' : '○'}</span>
                <span>Memeriksa kelengkapan data</span>
              </div>
              <div className={`flex items-center gap-2 transition-all ${analysisProgress >= 100 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                <span>{analysisProgress >= 100 ? '✓' : '○'}</span>
                <span>Menyelesaikan analisis</span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-xs text-blue-800">
                AI menganalisis 8 kategori verifikasi untuk kandidat ini
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Fraud Detection Wizard */}
      {showFraudCheck && fraudReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  🤖 {TEXT.meritBoard.aiVerificationChecklist}
                </h2>
                <p className="text-sm mt-1 opacity-90">
                  {TEXT.meritBoard.candidate}: {fraudReport.userName} | {TEXT.meritBoard.riskLevel}: {fraudReport.overallRisk.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setShowFraudCheck(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                aria-label="Close fraud check wizard"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Important Notice */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-1">{TEXT.meritBoard.importantNotice}</h3>
                    <p className="text-sm text-blue-800">
                      {TEXT.meritBoard.noticeDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Overview */}
              <div className={`border-2 rounded-lg p-4 ${
                fraudReport.overallRisk === 'high' ? 'bg-red-50 border-red-300' :
                fraudReport.overallRisk === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{TEXT.meritBoard.overallRiskAssessment}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    fraudReport.overallRisk === 'high' ? 'bg-red-200 text-red-900' :
                    fraudReport.overallRisk === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                    'bg-green-200 text-green-900'
                  }`}>
                    {fraudReport.overallRisk.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm">{fraudReport.summary}</p>
              </div>

              {/* Checklist Items */}
              <div>
                <h3 className="font-bold text-lg mb-4">📋 {TEXT.meritBoard.reviewChecklist} ({fraudReport.itemsToReview.length} {TEXT.meritBoard.items})</h3>
                <div className="space-y-3">
                  {fraudReport.itemsToReview.map((item, index) => (
                    <div 
                      key={index}
                      className={`border-2 rounded-lg p-4 ${
                        item.status === 'suspicious' ? 'bg-red-50 border-red-300' :
                        item.status === 'review' ? 'bg-yellow-50 border-yellow-300' :
                        'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              item.severity === 'high' ? 'bg-red-200 text-red-900' :
                              item.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                              'bg-gray-200 text-gray-900'
                            }`}>
                              {item.severity.toUpperCase()}
                            </span>
                            <span className="font-bold text-gray-900">{item.category}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{item.concern}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="bg-white bg-opacity-50 rounded p-2">
                          <span className="font-semibold text-gray-700">{TEXT.meritBoard.dataPoint}: </span>
                          <span className="text-gray-900">{item.dataPoint}</span>
                        </div>
                        
                        {item.expectedRange && (
                          <div className="bg-white bg-opacity-50 rounded p-2">
                            <span className="font-semibold text-gray-700">{TEXT.meritBoard.expectedRange}: </span>
                            <span className="text-gray-900">{item.expectedRange}</span>
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <span className="font-semibold text-blue-900">✓ {TEXT.meritBoard.recommendation}: </span>
                          <span className="text-blue-800">{item.recommendation}</span>
                        </div>
                      </div>

                      {/* Checklist checkbox */}
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white hover:bg-opacity-50 p-2 rounded">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="font-semibold">{TEXT.meritBoard.verified}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-900 mb-2">📌 {TEXT.meritBoard.nextStepsTitle}</h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  {TEXT.meritBoard.nextStepsItems.map((step, idx) => (
                    <li key={idx}>• {step}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFraudCheck(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  {TEXT.meritBoard.closeChecklist}
                </button>
                <button
                  onClick={() => {
                    alert('📄 Laporan daftar verifikasi akan diekspor ke PDF dengan timestamp dan catatan verifikasi Anda.');
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                >
                  📥 {TEXT.meritBoard.exportChecklistReport}
                </button>
              </div>

              {/* Timestamp */}
              <div className="text-center text-xs text-gray-500">
                {TEXT.meritBoard.generated}: {new Date(fraudReport.checkedAt).toLocaleString('id-ID')} | 
                {TEXT.meritBoard.committee}: {currentUser.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
