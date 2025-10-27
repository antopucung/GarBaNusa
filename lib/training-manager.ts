// Training Enrollment Management
interface Enrollment {
  trainingId: string;
  trainingName: string;
  enrolledAt: string;
  status: 'enrolled' | 'in-progress' | 'completed';
  progress: number;
}

export const enrollInTraining = (training: any): void => {
  const enrollments = getEnrollments();

  // Check if already enrolled
  const alreadyEnrolled = enrollments.find(e => e.trainingId === training.id);
  if (alreadyEnrolled) return;

  const newEnrollment: Enrollment = {
    trainingId: training.id,
    trainingName: training.name,
    enrolledAt: new Date().toISOString(),
    status: 'enrolled',
    progress: 0
  };

  enrollments.push(newEnrollment);
  
  // Get current user from auth
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    localStorage.setItem(`userEnrollments_${currentUser.id}`, JSON.stringify(enrollments));
  }
  // Fallback to old key for backward compatibility
  localStorage.setItem('userEnrollments', JSON.stringify(enrollments));
};

export const getEnrollments = (): Enrollment[] => {
  if (typeof window === 'undefined') return [];

  // Try to get user-specific enrollments first
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    const userEnrollments = localStorage.getItem(`userEnrollments_${currentUser.id}`);
    if (userEnrollments) {
      return JSON.parse(userEnrollments);
    }
  }

  // Fallback to old key
  const stored = localStorage.getItem('userEnrollments');
  return stored ? JSON.parse(stored) : [];
};

export const isEnrolled = (trainingId: string): boolean => {
  const enrollments = getEnrollments();
  return enrollments.some(e => e.trainingId === trainingId);
};

export const updateProgress = (trainingId: string, progress: number): void => {
  const enrollments = getEnrollments();
  const enrollment = enrollments.find(e => e.trainingId === trainingId);
  
  if (enrollment) {
    enrollment.progress = progress;
    if (progress >= 100) {
      enrollment.status = 'completed';
    } else if (progress > 0) {
      enrollment.status = 'in-progress';
    }
    localStorage.setItem('userEnrollments', JSON.stringify(enrollments));
  }
};
