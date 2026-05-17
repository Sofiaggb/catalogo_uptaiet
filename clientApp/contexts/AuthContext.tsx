// // contexts/AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { authApi } from '@/services/api/endpoints/auth';

// interface User {
//     id_usuario: number;
//     email: string;
//     nombre: string;
//     rol: string;
//     fecha_creacion: string;

// }

// interface AuthContextType {
//     user: User | null;
//     isLoading: boolean;
//     isAuthenticated: boolean;
//     login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
//     register: (email: string, password: string, nombre: string) => Promise<{ success: boolean; message?: string }>;
//     logout: () => Promise<void>;
//     hasRole: (roles: string[]) => boolean;
// }

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within AuthProvider');
//     }
//     return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         cargarUsuario();
//     }, []);

//     const cargarUsuario = async () => {
//         try {
//             const userData = await AsyncStorage.getItem('@user');
//             if (userData) {
//                 setUser(JSON.parse(userData));
//             }
//         } catch (error) {
//             console.error('Error cargando usuario:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const login = async (email: string, password: string) => {
//         try {
//             const response = await authApi.login({ email, password });
//             if (response.success && response.data) {
//                 setUser(response.data);
//                 await AsyncStorage.setItem('@user', JSON.stringify(response.data));
//                 return { success: true };
//             }
//             return { success: false, message: response.message };
//         } catch (error) {
//             console.error('Error en login:', error);
//             return { success: false, message: 'Error de conexión' };
//         }
//     };

//     const register = async (email: string, password: string, nombre: string) => {
//         try {
//             const response = await authApi.register({ email, password, nombre });
//             if (response.success && response.data) {
//                 setUser(response.data);
//                 await AsyncStorage.setItem('@user', JSON.stringify(response.data));
//                 return { success: true };
//             }
//             return { success: false, message: response.message };
//         } catch (error) {
//             console.error('Error en registro:', error);
//             return { success: false, message: 'Error de conexión' };
//         }
//     };

//     const logout = async () => {
//         setUser(null);
//         await AsyncStorage.removeItem('@user');
//     };

//     const hasRole = (roles: string[]) => {
//         if (!user) return false;
//         return roles.includes(user.rol);
//     };

//     return (
//         <AuthContext.Provider value={{
//             user,
//             isLoading,
//             isAuthenticated: !!user,
//             login,
//             register,
//             logout,
//             hasRole,
//         }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/api/endpoints/auth';

interface User {
    id_usuario: number;
    email: string;
    nombre: string;
    rol: string;
    id_rol?: number;
    fecha_creacion: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (identificador: string, password: string) => Promise<{ success: boolean; message?: string }>;
    enviarCodigoVerificacion: (email: string, nombre: string) => Promise<{ success: boolean; message?: string; data?: any }>;
    verificarYRegistrar: (email: string, codigo: string, password: string, nombre: string) => Promise<{ success: boolean; message?: string }>;
    reenviarCodigo: (email: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    hasRole: (roles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        try {
            const userData = await AsyncStorage.getItem('@user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // LOGIN (con email o nombre de usuario)
    // ============================================
    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login({ email, password });
            
            if (response.success && response.data) {
                setUser(response.data);
                await AsyncStorage.setItem('@user', JSON.stringify(response.data));
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    // ============================================
    // ENVIAR CÓDIGO DE VERIFICACIÓN (primer paso del registro)
    // ============================================
    const enviarCodigoVerificacion = async (email: string, nombre: string) => {
        try {
            const response = await authApi.enviarCodigo({ email, nombre });
            return response;
        } catch (error) {
            console.error('Error enviando código:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    // ============================================
    // VERIFICAR CÓDIGO Y REGISTRAR USUARIO (segundo paso)
    // ============================================
    const verificarYRegistrar = async (email: string, codigo: string, password: string, nombre: string) => {
        try {
            const response = await authApi.verificarYRegistrar({ email, codigo, password, nombre });
            
            if (response.success && response.data) {
                setUser(response.data);
                await AsyncStorage.setItem('@user', JSON.stringify(response.data));
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error en verificación:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    // ============================================
    // REENVIAR CÓDIGO DE VERIFICACIÓN
    // ============================================
    const reenviarCodigo = async (email: string) => {
        try {
            const response = await authApi.reenviarCodigo({ email });
            return response;
        } catch (error) {
            console.error('Error reenviando código:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    // ============================================
    // CERRAR SESIÓN
    // ============================================
    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('@user');
    };

    // ============================================
    // VERIFICAR ROL
    // ============================================
    const hasRole = (roles: string[]) => {
        if (!user) return false;
        return roles.includes(user.rol);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            enviarCodigoVerificacion,
            verificarYRegistrar,
            reenviarCodigo,
            logout,
            hasRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
};