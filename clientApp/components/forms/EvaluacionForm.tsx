// components/forms/EvaluacionForm.tsx
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Jurado {
    id_jurado?: number;
    nombre_completo: string;
    cedula: string;
    titulo_profesional: string;
    esExistente: boolean;
}

interface Evaluacion {
    nota: string;
    fecha_evaluacion: string;
    comentarios: string;
    jurado: Jurado;
}

interface EvaluacionFormProps {
    index: number;
    evaluacion: Evaluacion;
    onUpdateEvaluacion: (index: number, campo: keyof Evaluacion, valor: string) => void;
    onUpdateJurado: (evalIndex: number, campo: keyof Jurado, valor: string) => void;
    onBuscarJurado: (evalIndex: number, cedula: string) => void;
    onDelete: (index: number) => void;
}

export const EvaluacionForm = ({
    index,
    evaluacion,
    onUpdateEvaluacion,
    onUpdateJurado,
    onBuscarJurado,
    onDelete
}: EvaluacionFormProps) => {
    return (
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            {/* Cabecera */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-gray-700">Evaluación {index + 1}</Text>
                {evaluacion.jurado.esExistente && (
                    <View className="bg-green-100 px-2 py-1 rounded">
                        <Text className="text-green-700 text-xs">✓ Jurado existente</Text>
                    </View>
                )}
                <TouchableOpacity onPress={() => onDelete(index)}>
                    <Text className="text-red-500 font-bold">Eliminar</Text>
                </TouchableOpacity>
            </View>

            {/* Campo Nota */}
            <Text className="text-sm font-semibold text-gray-600 mb-1">Nota *</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                value={evaluacion.nota}
                onChangeText={(text) => onUpdateEvaluacion(index, 'nota', text)}
                placeholder="0 - 20"
                placeholderTextColor="#999"
                keyboardType="numeric"
            />

            {/* Campo Fecha */}
            <Text className="text-sm font-semibold text-gray-600 mb-1">Fecha Evaluación</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                value={evaluacion.fecha_evaluacion}
                onChangeText={(text) => onUpdateEvaluacion(index, 'fecha_evaluacion', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
            />

            {/* Campo Comentarios */}
            <Text className="text-sm font-semibold text-gray-600 mb-1">Comentarios</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-4 min-h-[60px]"
                value={evaluacion.comentarios}
                onChangeText={(text) => onUpdateEvaluacion(index, 'comentarios', text)}
                placeholder="Observaciones del jurado"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />

            {/* Separador */}
            <View className="h-px bg-gray-200 my-3" />

            {/* Datos del Jurado */}
            <Text className="text-sm font-bold text-gray-700 mb-2">
                 Datos del Jurado
            </Text>

            {/* Campo Cédula del Jurado */}
            <Text className="text-xs font-semibold text-gray-500 mb-1">Cédula *</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                value={evaluacion.jurado.cedula}
                onChangeText={(text) => onUpdateJurado(index, 'cedula', text)}
                onBlur={() => onBuscarJurado(index, evaluacion.jurado.cedula)}
                placeholder="Cédula del jurado"
                placeholderTextColor="#999"
            />

            {/* Campo Nombre del Jurado */}
            <Text className="text-xs font-semibold text-gray-500 mb-1">Nombre Completo *</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3"
                value={evaluacion.jurado.nombre_completo}
                onChangeText={(text) => onUpdateJurado(index, 'nombre_completo', text)}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
            />

            {/* Campo Título Profesional */}
            <Text className="text-xs font-semibold text-gray-500 mb-1">Título Profesional</Text>
            <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-2"
                value={evaluacion.jurado.titulo_profesional}
                onChangeText={(text) => onUpdateJurado(index, 'titulo_profesional', text)}
                placeholder="Dr., Mg., Ing., etc."
                placeholderTextColor="#999"
            />
        </View>
    );
};