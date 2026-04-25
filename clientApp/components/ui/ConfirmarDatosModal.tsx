// components/ui/ConfirmarDatosModal.tsx
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmarDatosModalProps {
    visible: boolean;
    titulo: string;
    datos: any;
    onConfirmar: () => void;
    onCancelar: () => void;
}

export const ConfirmarDatosModal = ({
    visible,
    titulo,
    datos,
    onConfirmar,
    onCancelar
}: ConfirmarDatosModalProps) => {
    if (!datos) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onCancelar}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-lg p-6 w-11/12 max-w-sm">
                    <Text className="text-xl font-bold mb-4 text-center">
                        {titulo} Encontrado
                    </Text>

                    <View className="mb-4">
                        <Text className="text-gray-700">
                            <Text className="font-bold">Nombre:</Text> {datos.nombre_completo}
                        </Text>
                        <Text className="text-gray-700 mt-1">
                            <Text className="font-bold">Cédula:</Text> {datos.cedula}
                        </Text>
                        {datos.email && (
                            <Text className="text-gray-700 mt-1">
                                <Text className="font-bold">Email:</Text> {datos.email}
                            </Text>
                        )}
                    </View>

                    <Text className="text-gray-600 mb-4 text-center">
                        ¿Deseas usar estos datos?
                    </Text>

                    <View className="flex-row justify-between gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-gray-300 py-3 rounded-lg"
                            onPress={onCancelar}
                        >
                            <Text className="text-center font-bold">No, crear nuevo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-blue-500 py-3 rounded-lg"
                            onPress={onConfirmar}
                        >
                            <Text className="text-white text-center font-bold">Sí, usar existente</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};