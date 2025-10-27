'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/shared/Header';
import PageContainer from '@/components/shared/PageContainer';
import trainingContent from '@/lib/mock-data/training-content.json';
import { getTrainingProgress, completeLesson, awardBadge, saveTrainingProgress } from '@/lib/training-progress';
import { generateQuiz } from '@/lib/ai-simulator/training-ai';
import { saveQuizAttempt, updateLessonPoints } from '@/lib/gamification';
import { updateUserCompetencies } from '@/lib/user-profile-manager';
import { getEnrollments } from '@/lib/training-manager';

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const trainingId = params.id as string;
  const moduleIndex = parseInt(params.moduleIndex as string);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    
    const trainingContentData = (trainingContent as any)[trainingId];
    setContent(trainingContentData);
    setModule(trainingContentData?.modules[moduleIndex]);
    
    const userProgress = getTrainingProgress(trainingId);
    setProgress(userProgress);
  }, [router, trainingId, moduleIndex]);

  const isLessonCompleted = (lessonId: string) => {
    if (!progress || !module) return false;
    const moduleProgress = progress.modules.find((m: any) => m.moduleId === module.id);
    if (!moduleProgress) return false;
    return moduleProgress.lessons.some((l: any) => l.lessonId === lessonId && l.completed);
  };

  const handleStartLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    
    if (lesson.type === 'quiz' || lesson.type === 'exam') {
      handleStartQuiz(lesson);
    }
  };

  const handleStartQuiz = async (lesson: any) => {
    setLoading(true);
    setShowQuiz(true);
    
    // Generate quiz using AI
    const questions = await generateQuiz(
      lesson.title,
      lesson.questions || 5,
      (p) => console.log(`Generating: ${p}%`)
    );
    
    setQuizData({ lesson, questions, currentQuestion: 0, answers: [], score: 0 });
    setLoading(false);
  };

  const handleCompleteLesson = async (lesson: any, score?: number, quizData?: any) => {
    const timeSpent = Math.floor(Math.random() * 600) + 300; // 5-15 minutes
    
    const updatedProgress = completeLesson(
      trainingId,
      module.id,
      lesson.id,
      score || lesson.points,
      timeSpent
    );
    
    // Update gamification for non-quiz lessons
    if (lesson.type !== 'quiz' && lesson.type !== 'exam') {
      updateLessonPoints(trainingId, lesson.points);
    }
    
    setProgress(updatedProgress);
    setSelectedLesson(null);
    setShowQuiz(false);
    
    // Check for badge awards based on training ID
    const moduleProgress = updatedProgress.modules.find((m: any) => m.moduleId === module.id);
    const allLessonsCompleted = moduleProgress?.lessons.length === module.lessons.length &&
                                moduleProgress?.lessons.every((l: any) => l.completed);
    
    // Award first module completion badge
    if (allLessonsCompleted && moduleIndex === 0) {
      if (trainingId === 'train-001') {
        awardBadge(trainingId, 'badge-starter');
      } else if (trainingId === 'train-002') {
        awardBadge(trainingId, 'badge-analyst');
      } else if (trainingId === 'train-003') {
        awardBadge(trainingId, 'badge-digital-ready');
      }
    }
    
    // Award high score badge on quiz
    if (lesson.type === 'quiz' && score) {
      const percentage = Math.round((score / lesson.points) * 100);
      if (trainingId === 'train-001' && percentage >= 80 && moduleIndex === 1) {
        awardBadge(trainingId, 'badge-communicator');
      } else if (trainingId === 'train-002' && percentage >= 85 && moduleIndex === 1) {
        awardBadge(trainingId, 'badge-visualizer');
      } else if (trainingId === 'train-003' && percentage >= 80 && moduleIndex === 1) {
        awardBadge(trainingId, 'badge-digital-savvy');
      }
    }
    
    // Update enrollment progress
    const totalLessons = content.modules.reduce((sum: number, mod: any) => sum + mod.lessons.length, 0);
    const completedLessons = updatedProgress.modules.reduce((sum: number, mod: any) => 
      sum + mod.lessons.filter((l: any) => l.completed).length, 0);
    const overallProgress = Math.round((completedLessons / totalLessons) * 100);
    
    // Update enrollment
    const enrollments = getEnrollments();
    const enrollment = enrollments.find((e: any) => e.trainingId === trainingId);
    if (enrollment) {
      enrollment.progress = overallProgress;
      if (overallProgress > 0 && overallProgress < 100) {
        enrollment.status = 'in-progress';
      } else if (overallProgress === 100) {
        enrollment.status = 'completed';
        // Award final completion badge
        if (trainingId === 'train-001') {
          awardBadge(trainingId, 'badge-graduate');
        } else if (trainingId === 'train-002') {
          awardBadge(trainingId, 'badge-expert');
        } else if (trainingId === 'train-003') {
          awardBadge(trainingId, 'badge-transformer');
        }
        
        // 🔥 UPDATE USER COMPETENCIES IN LIVE DATABASE
        const updatedProfile = updateUserCompetencies(currentUser.id, trainingId);
        if (updatedProfile) {
          console.log(`🎓 Training completed! Competencies updated for ${updatedProfile.name}`);
          console.log(`📊 New Merit Score: ${updatedProfile.meritScore}`);
        }
      }
      localStorage.setItem('userEnrollments', JSON.stringify(enrollments));
    }
    
    // Show success message with badge notification
    let message = `✅ Pelajaran selesai!\n+${score || lesson.points} poin`;
    
    // Check if badge was just earned
    if (allLessonsCompleted && moduleIndex === 0) {
      message += '\n\n🏆 Badge baru diperoleh!';
    }
    if (lesson.type === 'quiz' && score) {
      const percentage = Math.round((score / lesson.points) * 100);
      if ((trainingId === 'train-001' && percentage >= 80 && moduleIndex === 1) ||
          (trainingId === 'train-002' && percentage >= 85 && moduleIndex === 1) ||
          (trainingId === 'train-003' && percentage >= 80 && moduleIndex === 1)) {
        message += '\n\n🏆 Badge baru diperoleh!';
      }
    }
    if (overallProgress === 100) {
      message += '\n\n🎉 Selamat! Pelatihan selesai!\n🏆 Badge final diperoleh!';
    }
    
    alert(message);
  };

  if (!currentUser || !module || !content) {
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
        title={module.title}
      />
      <PageContainer>
        {!selectedLesson ? (
          /* Lesson List */
          <div>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{module.title}</h1>
              <p className="text-indigo-100 mb-4">{module.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  📅 {module.duration}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  📚 {module.lessons.length} pelajaran
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {module.lessons.map((lesson: any, index: number) => {
                const completed = isLessonCompleted(lesson.id);
                
                return (
                  <div 
                    key={lesson.id}
                    className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all ${
                      completed ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-indigo-400 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            completed ? 'bg-green-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                          }`}>
                            {completed ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                              <span className="px-2 py-1 bg-gray-100 rounded font-medium">
                                {lesson.type === 'video' && '🎥 Video'}
                                {lesson.type === 'reading' && '📖 Bacaan'}
                                {lesson.type === 'interactive' && '🎮 Interaktif'}
                                {lesson.type === 'quiz' && '❓ Kuis'}
                                {lesson.type === 'exam' && '📝 Ujian'}
                                {lesson.type === 'case-study' && '💼 Studi Kasus'}
                              </span>
                              <span>{lesson.duration}</span>
                              <span>• {lesson.points} poin</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleStartLesson(lesson)}
                        disabled={completed}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          completed
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                        }`}
                      >
                        {completed ? '✓ Selesai' : 'Mulai'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => router.push(`/training/${trainingId}`)}
              className="w-full mt-6 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              ← Kembali ke Overview
            </button>
          </div>
        ) : showQuiz && quizData ? (
          /* Quiz Interface */
          <QuizInterface 
            quizData={quizData}
            loading={loading}
            trainingId={trainingId}
            onComplete={(score: number, quizResult: any) => handleCompleteLesson(selectedLesson, score, quizResult)}
            onCancel={() => {
              setSelectedLesson(null);
              setShowQuiz(false);
            }}
          />
        ) : (
          /* Lesson Content */
          <LessonContent 
            lesson={selectedLesson}
            onComplete={() => handleCompleteLesson(selectedLesson)}
            onBack={() => setSelectedLesson(null)}
          />
        )}
      </PageContainer>
    </>
  );
}

// Lesson Content Component
function LessonContent({ lesson, onComplete, onBack }: any) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
          <span className="text-sm text-gray-600">⏱️ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
        </div>
        
        {lesson.type === 'video' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold">Video Player (Simulasi)</p>
                <p className="text-sm text-gray-300 mt-2">Durasi: {lesson.duration}</p>
              </div>
            </div>
            <div className="prose max-w-none">
              <h3>Ringkasan Materi</h3>
              <p>Dalam video ini, Anda akan mempelajari tentang {lesson.title.toLowerCase()}. Materi mencakup konsep dasar, praktik terbaik, dan contoh penerapan dalam konteks organisasi pemerintahan.</p>
            </div>
          </div>
        )}
        
        {lesson.type === 'reading' && (
          <div className="prose max-w-none">
            <h3>Materi Bacaan</h3>
            <p className="lead">Selamat datang di materi bacaan tentang {lesson.title.toLowerCase()}.</p>
            <p>Kepemimpinan modern membutuhkan pemahaman yang mendalam tentang berbagai gaya dan pendekatan. Dalam konteks ASN, pemimpin harus mampu beradaptasi dengan dinamika organisasi dan kebutuhan masyarakat.</p>
            <h4>Poin Kunci:</h4>
            <ul>
              <li>Pemahaman konsep dasar kepemimpinan</li>
              <li>Identifikasi gaya kepemimpinan yang efektif</li>
              <li>Penerapan dalam konteks birokrasi</li>
              <li>Pengembangan kompetensi leadership</li>
            </ul>
            <p>Dengan memahami materi ini, Anda akan dapat mengidentifikasi kekuatan dan area pengembangan dalam kepemimpinan Anda sendiri.</p>
          </div>
        )}
        
        {(lesson.type === 'interactive' || lesson.type === 'case-study') && (
          <div className="space-y-6">
            <div className="prose max-w-none">
              <h3>Studi Kasus</h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <p className="font-semibold text-blue-900 mb-4">Situasi:</p>
                <p className="text-gray-700">Anda adalah kepala divisi yang baru dilantik. Tim Anda terdiri dari 12 orang dengan berbagai latar belakang dan pengalaman. Baru-baru ini, produktivitas tim menurun dan ada beberapa konflik interpersonal yang mulai muncul. Bagaimana Anda akan menangani situasi ini?</p>
              </div>
              <h4 className="mt-6">Pendekatan yang Direkomendasikan:</h4>
              <ol>
                <li><strong>Dengarkan</strong>: Lakukan pertemuan one-on-one dengan setiap anggota tim</li>
                <li><strong>Analisis</strong>: Identifikasi akar permasalahan</li>
                <li><strong>Komunikasikan</strong>: Sampaikan visi dan ekspektasi yang jelas</li>
                <li><strong>Fasilitasi</strong>: Ciptakan lingkungan kolaboratif</li>
                <li><strong>Evaluasi</strong>: Monitor progress secara berkala</li>
              </ol>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
        >
          ← Kembali
        </button>
        <button
          onClick={onComplete}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
        >
          Tandai Selesai ✓
        </button>
      </div>
    </div>
  );
}

// Quiz Interface Component
function QuizInterface({ quizData, loading, trainingId, onComplete, onCancel }: any) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [startTime] = useState(Date.now());

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-lg font-semibold text-gray-700">AI sedang menyiapkan soal kuis...</p>
      </div>
    );
  }

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = async () => {
    // Check if answer is correct for streak
    const isCorrect = selectedAnswers[currentQuestion] === quizData.questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
    } else {
      setStreak(0);
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate score and time spent
      const correct = selectedAnswers.filter((ans, idx) => 
        ans === quizData.questions[idx].correctAnswer
      ).length;
      const percentage = Math.round((correct / quizData.questions.length) * 100);
      const points = Math.round((percentage / 100) * quizData.lesson.points);
      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      
      setScore(points);
      setShowResult(true);
      
      // Save quiz attempt with full gamification data
      saveQuizAttempt(trainingId, {
        lessonId: quizData.lesson.id,
        score: points,
        correctAnswers: correct,
        totalQuestions: quizData.questions.length,
        maxStreak: maxStreak,
        timeSpent: timeSpentSeconds,
        percentage: percentage
      });
      
      // Get AI recommendations if failed
      if (percentage < 70) {
        setShowRecommendations(true);
        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAiRecommendations({
          weakAreas: ['Konsep dasar masih perlu diperkuat', 'Pemahaman praktis perlu ditingkatkan'],
          recommendations: [
            'Review kembali materi video di modul ini',
            'Baca ulang materi bacaan dengan lebih teliti',
            'Catat poin-poin penting',
            'Diskusikan dengan mentor atau rekan'
          ],
          nextSteps: 'Ulangi kuis setelah review materi. Anda bisa mencobanya lagi kapan saja!'
        });
      }
    }
  };

  if (showResult) {
    const percentage = Math.round((score / quizData.lesson.points) * 100);
    const passed = percentage >= 70;
    const correct = selectedAnswers.filter((ans, idx) => 
      ans === quizData.questions[idx].correctAnswer
    ).length;
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-xl shadow-2xl p-8 text-center ${
          passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300' : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-4 border-orange-300'
        }`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            passed ? 'bg-green-600' : 'bg-orange-600'
          }`}>
            <span className="text-4xl text-white">{passed ? '✓' : '!'}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {passed ? '🎉 Selamat!' : '📚 Perlu Review'}
          </h2>
          <div className="text-6xl font-bold text-gray-900 mb-4">{percentage}%</div>
          <p className="text-lg text-gray-700 mb-6">
            {passed 
              ? 'Anda berhasil menyelesaikan kuis dengan baik!'
              : 'Jangan berkecil hati! Review materi dan coba lagi.'}
          </p>
          
          {/* Gamification Stats */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{score}</div>
                <div className="text-sm text-gray-600">Poin</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{correct}/{quizData.questions.length}</div>
                <div className="text-sm text-gray-600">Benar</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{maxStreak}</div>
                <div className="text-sm text-gray-600">Streak Max</div>
              </div>
            </div>
          </div>

          {/* AI Recommendations for Failed Quiz */}
          {!passed && showRecommendations && aiRecommendations && (
            <div className="bg-white rounded-xl p-6 mb-6 text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 Rekomendasi AI untuk Anda</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">📍 Area yang Perlu Diperkuat:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {aiRecommendations.weakAreas.map((area: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">{area}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Rekomendasi Belajar:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {aiRecommendations.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-semibold">{aiRecommendations.nextSteps}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!passed && (
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-orange-600 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all"
              >
                Review Materi
              </button>
            )}
            <button
              onClick={() => passed ? onComplete(score, { maxStreak, correct, total: quizData.questions.length }) : onCancel()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {passed ? 'Lanjutkan' : 'Ulangi Nanti'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Gamification Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-indigo-600">
              Soal {currentQuestion + 1} dari {quizData.questions.length}
            </span>
            {streak > 0 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold animate-pulse">
                🔥 {streak} Streak!
              </span>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Tutup kuis"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
          />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h3>
        
        <div className="space-y-3 mb-8">
          {question.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {currentQuestion < quizData.questions.length - 1 ? 'Soal Berikutnya →' : 'Selesai'}
        </button>
      </div>
    </div>
  );
}
