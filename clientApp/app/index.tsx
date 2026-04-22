// app/index.tsx - Con Tailwind
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Definir la estructura de los datos que vienen del backend
interface Tesis {
  id_tesis: number;
  titulo: string;
  resumen?: string;
  carrera?: {
    id_carrera: number;
    nombre: string;
  };
  estudiantes?: any[];
  promedio_nota?: number;
}

const API_URL = 'http://localhost:3000/api';

export default function HomeScreen() {
  const [tesis, setTesis] = useState<Tesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarTesis();
  }, []);

  const cargarTesis = async () => {
    try {
      const response = await fetch(`${API_URL}/tesis`);
      const data = await response.json();
      setTesis(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarTesis();
  };

  const irACrearTesis = () => {
    router.push('/tesis/create');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center bg-gray-800 px-5 py-4">
        <Text className="text-xl font-bold text-white">📚 Catálogo de Tesis</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={irACrearTesis}
        >
          <Text className="text-white font-bold text-sm">+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de tesis */}
      <FlatList
        data={tesis}
        keyExtractor={(item) => item.id_tesis?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View className="bg-white mx-3 my-2 p-4 rounded-xl shadow-md">
            <Text className="text-base font-bold text-gray-800 mb-1">
              {item.titulo}
            </Text>
            <Text className="text-sm text-gray-500 mb-3">
              {item.carrera?.nombre || 'Sin carrera'}
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-xs text-blue-500">
                👥 {item.estudiantes?.length || 0} estudiante(s)
              </Text>
              {item.promedio_nota ? (
                <Text className="text-xs text-yellow-600 font-bold">
                  ⭐ {item.promedio_nota}
                </Text>
              ) : null}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="text-center mt-12 text-gray-500">
            No hay tesis disponibles
          </Text>
        }
      />
    </View>
  );
}