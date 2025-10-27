// Reset per-user localStorage data for demo purposes
export const resetUserDatabase = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  console.log(`🗑️ Resetting all data for user: ${userId}`);
  
  // Clear user-specific training-related data
  const keysToRemove: string[] = [];
  
  // Get all keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Remove this user's data:
      // - Training progress: training_progress_userId_*
      // - Enrollments: userEnrollments_userId
      // - Gamification: gamification_userId_*
      // - Quiz attempts: quiz_attempts_userId_*
      // - User badges: user_badges_userId_*
      // - Live database: liveUserProfiles (partial - we'll reset user's profile)
      if (
        key === `userEnrollments_${userId}` ||
        key.startsWith(`training_progress_${userId}_`) ||
        key.startsWith(`gamification_${userId}_`) ||
        key.startsWith(`quiz_attempts_${userId}_`) ||
        key.startsWith(`user_badges_${userId}_`)
      ) {
        keysToRemove.push(key);
      }
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   Removed: ${key}`);
  });
  
  // Reset user profile in live database
  const liveDb = localStorage.getItem('liveUserProfiles');
  if (liveDb) {
    try {
      const profiles = JSON.parse(liveDb);
      if (profiles[userId]) {
        delete profiles[userId];
        localStorage.setItem('liveUserProfiles', JSON.stringify(profiles));
        console.log(`   Reset live profile for: ${userId}`);
      }
    } catch (e) {
      console.error('Error resetting live profile:', e);
    }
  }
  
  // Also clear old format (for backward compatibility)
  localStorage.removeItem('userEnrollments');
  const oldKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('training_progress_train-')) {
      oldKeys.push(key);
    }
  }
  oldKeys.forEach(key => localStorage.removeItem(key));
  
  console.log(`✅ User ${userId} database reset complete! All data cleared.`);
};

// Check if specific user has any data
export const userHasData = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for user-specific enrollments
  const enrollments = localStorage.getItem(`userEnrollments_${userId}`);
  if (enrollments) {
    try {
      const parsed = JSON.parse(enrollments);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return true;
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
  
  // Check for any training progress, gamification, or quiz data for this user
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith(`training_progress_${userId}_`) ||
      key.startsWith(`gamification_${userId}_`) ||
      key.startsWith(`quiz_attempts_${userId}_`)
    )) {
      return true;
    }
  }
  
  // Check if user has profile in live database
  const liveDb = localStorage.getItem('liveUserProfiles');
  if (liveDb) {
    try {
      const profiles = JSON.parse(liveDb);
      if (profiles[userId]) {
        return true;
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
  
  // Check old format (backward compatibility)
  const oldEnrollments = localStorage.getItem('userEnrollments');
  if (oldEnrollments) {
    try {
      const parsed = JSON.parse(oldEnrollments);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return true;
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
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
