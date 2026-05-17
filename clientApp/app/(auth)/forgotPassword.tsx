// app/(auth)/forgot-password.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authApi } from '@/services/api/endpoints/auth';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState(1); // 1: email, 2: codigo, 3: nueva contraseña
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Ingresa tu email');
            return;
        }

        setLoading(true);
        const result = await authApi.enviarCodigoRecuperacion({ email });
        
        if (result.success) {
            setStep(2);
            Alert.alert('Éxito', 'Se ha enviado un código de verificación a tu correo');
        } else {
            Alert.alert('Error', result.message || 'No se pudo enviar el código');
        }
        setLoading(false);
    };

    const handleVerifyCode = async () => {
        if (!codigo || codigo.length !== 6) {
            Alert.alert('Error', 'Ingresa el código de 6 dígitos');
            return;
        }

        setLoading(true);
        const result = await authApi.verificarCodigoRecuperacion({ email, codigo });
        
        if (result.success) {
            setStep(3);
        } else {
            Alert.alert('Error', result.message || 'Código incorrecto');
        }
        setLoading(false);
    };

    const handleResetPassword = async () => {
        if (!nuevaPassword || nuevaPassword.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (nuevaPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        const result = await authApi.cambiarContrasena({ 
            email, 
            codigo, 
            nueva_contrasena: nuevaPassword 
        });
        
        if (result.success) {
            Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
                { text: 'OK', onPress: () => router.push('/login') }
            ]);
        } else {
            Alert.alert('Error', result.message || 'No se pudo cambiar la contraseña');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className="mt-12 flex-1 p-6">
                {/* Header */}
                <TouchableOpacity onPress={() => router.back()} className="mb-6">
                    <Ionicons name="arrow-back-outline" size={28} color="#06b6d4" />
                </TouchableOpacity>

                {/* Icono */}
                <View className="items-center mb-8">
                    <View className="bg-cyan-500 rounded-full p-4">
                        <Ionicons name="key-outline" size={50} color="#FFFFFF" />
                    </View>
                    <Text className="text-2xl font-bold text-black mt-4">
                        {step === 1 && 'Recuperar contraseña'}
                        {step === 2 && 'Verificar código'}
                        {step === 3 && 'Nueva contraseña'}
                    </Text>
                    <Text className="text-gray-500 text-center mt-2">
                        {step === 1 && 'Ingresa tu email para recibir un código de verificación'}
                        {step === 2 && 'Ingresa el código que enviamos a tu correo'}
                        {step === 3 && 'Ingresa tu nueva contraseña'}
                    </Text>
                </View>

                {/* Paso 1: Email */}
                {step === 1 && (
                    <>
                        <Text className="text-base font-semibold text-gray-700 mb-2">Email</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-base mb-6"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="tu@email.com"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TouchableOpacity
                            className={`py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : 
                                <Text className="text-white text-lg font-bold">Enviar código</Text>
                            }
                        </TouchableOpacity>
                    </>
                )}

                {/* Paso 2: Código */}
                {step === 2 && (
                    <>
                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Código de verificación
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-lg p-3  text-center text-2xl tracking-widest mb-6"
                            value={codigo}
                            onChangeText={setCodigo}
                            placeholder="000000"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TouchableOpacity
                            className={`py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                            onPress={handleVerifyCode}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : 
                                <Text className="text-white text-lg font-bold">Verificar código</Text>
                            }
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={handleSendCode}
                            className="mt-4"
                        >
                            <Text className="text-blue-500 text-center">Reenviar código</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Paso 3: Nueva contraseña */}
                {step === 3 && (
                    <>
                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Nueva contraseña
                        </Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg mb-4">
                            <TextInput
                                className="flex-1 p-3 text-base"
                                value={nuevaPassword}
                                onChangeText={setNuevaPassword}
                                placeholder="********"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-3">
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-base font-semibold text-gray-700 mb-2">
                            Confirmar contraseña
                        </Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg mb-6">
                            <TextInput
                                className="flex-1 p-3 text-base"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="********"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        <TouchableOpacity
                            className={`py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : 
                                <Text className="text-white text-lg font-bold">Cambiar contraseña</Text>
                            }
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}