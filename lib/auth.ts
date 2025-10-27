import usersData from './mock-data/users.json';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nip?: string;
  currentPosition?: string;
  unit?: string;
  avatar?: string;
}

export const mockLogin = async (email: string, password: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = usersData.users.find(
    u => u.email === email && u.password === password
  );
  
  if (!user) return null;
  
  const authUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    nip: user.nip,
    currentPosition: user.currentPosition,
    unit: user.unit,
    avatar: user.avatar
  };
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(authUser));
  }
  
  return authUser;
};

export const mockLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Alias for mockLogin (for backward compatibility)
export const login = mockLogin;

// Quick login without password (for demo purposes)
export const loginAsUser = (email: string): void => {
  const user = usersData.users.find(u => u.email === email);
  
  if (!user) return;
  
  const authUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    nip: user.nip,
    currentPosition: user.currentPosition,
    unit: user.unit,
    avatar: user.avatar
  };
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(authUser));
  }
};
