import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface User {
  id_usuario: number;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('@user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('@user', JSON.stringify(response.data));
        if (response.data.token) {
          localStorage.setItem('@auth_token', response.data.token);
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@user');
    localStorage.removeItem('@auth_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};