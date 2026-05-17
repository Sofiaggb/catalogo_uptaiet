// app/(auth)/login.tsx
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

export default function LoginScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };

        if (!form.email.trim()) {
            newErrors.email = 'El usuario es obligatorio';
            isValid = false;
        }

        if (!form.password) {
            newErrors.password = 'La contraseña es obligatoria';
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const result = await login(form.email, form.password);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Error', result.message || 'Email o contraseña incorrectos');
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
                    <View className="items-center mb-8">
                        <View className="bg-cyan-500 rounded-full p-4">
                            <Image
                                source={require('../../assets/images/logo_uptaiet.png')}
                                className="w-10 h-10 "
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-2xl font-bold text-black mt-4">UPTAIET</Text>
                        <Text className="text-gray-500 text-sm">Catálogo Digital</Text>
                    </View>

                    {/* Título */}
                    <Text className="text-3xl font-bold text-black mb-2">Bienvenido</Text>
                    <Text className="text-gray-500 mb-8">Inicia sesión para continuar</Text>

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-700 mb-2">Usuario</Text>
                        <TextInput
                            className={`bg-gray-50 border rounded-lg p-3 text-base ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={form.email}
                            onChangeText={(text) => {
                                setForm({ ...form, email: text });
                                setErrors({ ...errors, email: '' });
                            }}
                            placeholder="correo@ejemplo.com o tu_usuario"
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

                    {/* Botón Login */}
                    <TouchableOpacity
                        className={`py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-cyan-400'}`}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => router.push('/forgotPassword')} className="mt-4">
                        <Text className="text-blue-500 text-center">¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>


                    {/* Link a registro */}
                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-600">¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('./register')}>
                            <Text className="text-blue-500 font-semibold">Regístrate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}