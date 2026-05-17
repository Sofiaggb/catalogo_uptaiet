// app/(auth)/verificar.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api/endpoints/auth';

export default function VerificarScreen() {
    const { email, nombre, password } = useLocalSearchParams();
    const { login } = useAuth();
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [reenviando, setReenviando] = useState(false);

    const handleVerificar = async () => {
        if (!codigo || codigo.length !== 6) {
            Alert.alert('Error', 'Ingresa el código de 6 dígitos');
            return;
        }

        setLoading(true);
        
        // Paso 2: Verificar y crear usuario
        const result = await authApi.verificarYRegistrar({
            email: email as string,
            codigo,
            password: password as string,
            nombre: nombre as string
        });
        
        if (result.success && result.data) {
            // Iniciar sesión automáticamente
            await login(email as string, password as string);
            Alert.alert('Éxito', 'Cuenta creada correctamente', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } else {
            Alert.alert('Error', result.message || 'Código incorrecto');
        }
        setLoading(false);
    };

    const handleReenviar = async () => {
        setReenviando(true);
        const result = await authApi.reenviarCodigo({ email: email as string });
        
        if (result.success) {
            Alert.alert('Éxito', 'Se ha enviado un nuevo código a tu correo');
        } else {
            Alert.alert('Error', result.message || 'No se pudo reenviar el código');
        }
        setReenviando(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className="flex-1 justify-center p-6">
                {/* Icono */}
                <View className="items-center mb-8">
                    <View className="bg-cyan-500 rounded-full p-4">
                        <Ionicons name="mail-outline" size={50} color="#FFFFFF" />
                    </View>
                    <Text className="text-2xl font-bold text-black mt-4">Verifica tu correo</Text>
                    <Text className="text-gray-500 text-center mt-2">
                        Hemos enviado un código de verificación a:
                    </Text>
                    <Text className="text-blue-600 font-semibold mt-1">{email}</Text>
                </View>

                {/* Input código */}
                <Text className="text-base font-semibold text-gray-700 mb-2">
                    Código de verificación
                </Text>
                <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-base text-center text-2xl tracking-widest"
                    value={codigo}
                    onChangeText={setCodigo}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={6}
                />

                {/* Botón Verificar */}
                <TouchableOpacity
                    className={`mt-6 py-4 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
                    onPress={handleVerificar}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white text-lg font-bold">Verificar y Crear Cuenta</Text>
                    )}
                </TouchableOpacity>

                {/* Reenviar código */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-600">¿No recibiste el código? </Text>
                    <TouchableOpacity onPress={handleReenviar} disabled={reenviando}>
                        <Text className="text-blue-500 font-semibold">
                            {reenviando ? 'Enviando...' : 'Reenviar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Volver atrás */}
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="mt-4"
                >
                    <Text className="text-gray-500 text-center">← Volver al registro</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}