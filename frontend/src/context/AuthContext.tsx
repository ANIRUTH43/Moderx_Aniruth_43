import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'ADMIN' | 'USER';

interface AuthContextType {
  role: UserRole;
  toggleRole: () => void;
  userId: string;
  setUserId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('USER');
  const [userId, setUserId] = useState<string>('user-' + Math.random().toString(36).substr(2, 9));

  const toggleRole = () => {
    setRole((prev) => (prev === 'ADMIN' ? 'USER' : 'ADMIN'));
  };

  return (
    <AuthContext.Provider value={{ role, toggleRole, userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
