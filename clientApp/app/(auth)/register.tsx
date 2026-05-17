// app/(auth)/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api/endpoints/auth';

export default function RegisterScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = { nombre: '', email: '', password: '', confirmPassword: '' };

        if (!form.nombre.trim()) {
            newErrors.nombre = 'El nombre de usuario es obligatorio';
            isValid = false;
        } else if (form.nombre.length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
            isValid = false;
        }

        if (!form.email.trim()) {
            newErrors.email = 'El email es obligatorio';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Email inválido';
            isValid = false;
        }

        if (!form.password) {
            newErrors.password = 'La contraseña es obligatoria';
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        //   Solicitar código de verificación
        const result = await authApi.enviarCodigo({ email: form.email, nombre: form.nombre });

        if (result.success) {
            // Guardar datos en el estado de navegación
            router.push({
                pathname: '/verificar',
                params: {
                    email: form.email,
                    nombre: form.nombre,
                    password: form.password
                }
            });
        } else {
            Alert.alert('Error', result.message || 'No se pudo enviar el código');
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className=" pt-16 pb-4 px-5">
                <TouchableOpacity onPress={() => router.back()} className="w-10">
                    <Ionicons name="arrow-back-outline" size={28} color="#06b6d4" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center p-6">
                    {/* Logo */}
                    <View className="items-center mb-6">
                        <View className="bg-cyan-500 rounded-full p-4">
                            <Image
                                source={require('../../assets/images/logo_uptaiet.png')}
                                className="w-10 h-10 "
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-2xl font-bold text-black mt-4">Crear Cuenta</Text>
                        <Text className="text-gray-500 text-sm">Regístrate para acceder</Text>
                    </View>

                    {/* Nombre */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Nombre de usuario
                        </Text>
                        <TextInput
                            className={`bg-gray-50 border rounded-lg p-3 text-base ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={form.nombre}
                            onChangeText={(text) => {
                                setForm({ ...form, nombre: text });
                                setErrors({ ...errors, nombre: '' });
                            }}
                            placeholder="usuario123"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                        />
                        {errors.nombre && (
                            <Text className="text-red-500 text-sm mt-1">{errors.nombre}</Text>
                        )}
                    </View>

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-700 mb-2">Email</Text>
                        <TextInput
                            className={`bg-gray-50 border rounded-lg p-3 text-base ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={form.email}
                            onChangeText={(text) => {
                                setForm({ ...form, email: text });
                                setErrors({ ...errors, email: '' });
                            }}
                            placeholder="correo@ejemplo.com"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        {errors.email && (
                            <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
                        )}
                    </View>

                    {/* Password */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-700 mb-2">Contraseña</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg">
                            <TextInput
                                className="flex-1 p-3 text-base"
                                value={form.password}
                                onChangeText={(text) => {
                                    setForm({ ...form, password: text });
                                    setErrors({ ...errors, password: '' });
                                }}
                                placeholder="********"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="pr-3"
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View className="mb-6">
                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Confirmar contraseña
                        </Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg">
                            <TextInput
                                className="flex-1 p-3 text-base"
                                value={form.confirmPassword}
                                onChangeText={(text) => {
                                    setForm({ ...form, confirmPassword: text });
                                    setErrors({ ...errors, confirmPassword: '' });
                                }}
                                placeholder="********"
                                placeholderTextColor="#999"
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="pr-3"
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
                        )}
                    </View>

                    {/* Botón Registrar */}
                    <TouchableOpacity
                        className={`py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-cyan-400'}`}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Registrarse</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link a login */}
                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('./login')}>
                            <Text className="text-blue-500 font-semibold">Iniciar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}