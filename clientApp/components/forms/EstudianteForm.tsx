// components/forms/EstudianteForm.tsx
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Estudiante {
    id_estudiante?: number;
    nombre_completo: string;
    cedula: string;
    email: string;
    esExistente: boolean;
}

interface EstudianteFormProps {
    index: number;
    estudiante: Estudiante;
    onUpdate: (index: number, campo: keyof Estudiante, valor: string) => void;
    onDelete: (index: number) => void;
    onBuscar: (index: number, cedula: string) => void;
}

export const EstudianteForm = ({ 
    index, 
    estudiante, 
    onUpdate, 
    onDelete, 
    onBuscar 
}: EstudianteFormProps) => {
    return (
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            {/* Cabecera */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-gray-700">
                    Estudiante {index + 1}
                </Text>
                {estudiante.esExistente && (
                    <View className="bg-green-100 px-2 py-1 rounded">
                        <Text className="text-green-700 text-xs">✓ Existente</Text>
                    </View>
                )}
                <TouchableOpacity onPress={() => onDelete(index)}>
                    <Text className="text-red-500 font-bold">Eliminar</Text>
                </TouchableOpacity>
            </View>

            {/* Campo Cédula (con búsqueda automática) */}
            <Text className="text-sm font-semibold text-gray-600 mb-1">Cédula *</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                value={estudiante.cedula}
                onChangeText={(text) => onUpdate(index, 'cedula', text)}
                onBlur={() => onBuscar(index, estudiante.cedula)}
                placeholder="Cédula"
                placeholderTextColor="#999"
            />

            {/* Campo Nombre */}
            <Text className="text-sm font-semibold text-gray-600 mb-1">Nombre Completo *</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                value={estudiante.nombre_completo}
                onChangeText={(text) => onUpdate(index, 'nombre_completo', text)}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
            />

            {/* Campo Email */}
            <Text className="text-sm font-semibold text-gray-600 mb-1">Email</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2"
                value={estudiante.email}
                onChangeText={(text) => onUpdate(index, 'email', text)}
                placeholder="email@universidad.edu"
                placeholderTextColor="#999"
                keyboardType="email-address"
            />
        </View>
    );
};