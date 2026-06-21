import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { perfilApi } from '../api/endpoints/perfil';

// Helper para localStorage (similar a AsyncStorage pero para web)
const storage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error getting item:', error);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error setting item:', error);
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }
};

interface User {
  id_usuario: number;
  email: string;
  nombre: string;
  id_rol: number;
  rol: string;
  foto_perfil?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
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

  // REFRESH USER - Obtiene datos actualizados del servidor
    const refreshUser = async () => {
        try {
            // Usar el endpoint o /perfil/me
            const response = await perfilApi.getMe();
            
            if (response.success && response.data) {
                // Actualizar estado
                setUser(response.data);
                
                // Actualizar localStorage
                storage.setItem('@user', JSON.stringify(response.data));
                
                // Actualizar token si viene en la respuesta
                if (response.data.token) {
                    storage.setItem('@auth_token', response.data.token);
                }
            } 
        } catch (error) {
            console.error('Error refrescando usuario:', error);
            // Si hay error, intentar recuperar de localStorage
            const userData = storage.getItem('@user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
    };


  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      refreshUser,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};