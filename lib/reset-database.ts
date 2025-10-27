// Reset per-user localStorage data for demo purposes
export const resetUserDatabase = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  // Clear user-specific training-related data
  const keysToRemove: string[] = [];
  
  // Get all keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Remove this user's training progress and enrollments
      if (key === `userEnrollments_${userId}` || key.startsWith(`training_progress_${userId}_`)) {
        keysToRemove.push(key);
      }
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Also clear old format (for backward compatibility)
  localStorage.removeItem('userEnrollments');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('training_progress_train-')) {
      localStorage.removeItem(key);
    }
  }
  
  console.log(`✅ User ${userId} database reset complete!`);
};

// Check if specific user has any data
export const userHasData = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const enrollments = localStorage.getItem(`userEnrollments_${userId}`);
  if (enrollments && JSON.parse(enrollments).length > 0) {
    return true;
  }
  
  // Check for any training progress for this user
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`training_progress_${userId}_`)) {
      return true;
    }
  }
  
  // Check old format
  const oldEnrollments = localStorage.getItem('userEnrollments');
  if (oldEnrollments && JSON.parse(oldEnrollments).length > 0) {
    return true;
  }
  
  return false;
};

// Check if database has any data (any user)
export const hasDatabaseData = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for any user enrollments or progress
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      if (key.startsWith('userEnrollments_') || key.startsWith('training_progress_') || key === 'userEnrollments') {
        return true;
      }
    }
  }
  
  return false;
};
