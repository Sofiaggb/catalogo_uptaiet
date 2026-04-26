// components/ui/MultipleResultsModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface MultipleResultsModalProps {
    visible: boolean;
    title: string;
    results: any[];
    onSelect: (item: any) => void;
    onCancel: () => void;
}

export const MultipleResultsModal = ({ 
    visible, 
    title, 
    results, 
    onSelect, 
    onCancel 
}: MultipleResultsModalProps) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl max-h-96">
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                        <Text className="text-lg font-bold">{title}</Text>
                        <TouchableOpacity onPress={onCancel}>
                            <Ionicons name="close" size={24} color="#000000" />
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id_estudiante?.toString() || item.id_jurado?.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                className="p-4 border-b border-gray-100"
                                onPress={() => onSelect(item)}
                            >
                                <Text className="text-base font-semibold">{item.nombre_completo}</Text>
                                <Text className="text-sm text-gray-500 mt-1">Cédula: {item.cedula}</Text>
                                {item.email && (
                                    <Text className="text-sm text-gray-500">Email: {item.email}</Text>
                                )}
                                {item.titulo_profesional && (
                                    <Text className="text-sm text-gray-500">Título: {item.titulo_profesional}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                        ListHeaderComponent={() => (
                            <View className="p-4 bg-gray-50">
                                <Text className="text-center text-gray-600">
                                    Se encontraron {results.length} resultados. Selecciona uno:
                                </Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
};