import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardScreen() {
    const { user } = useAuth();

    const navigateTo = (screen: 'auditoria' | 'estadisticas' | 'solicitudes') => {
        router.push(`./admin/${screen}`);
    };

    // Definir los items del menú con colores específicos
    const menuItems = [
        {
            title: 'Auditoría',
            icon: 'document-text-outline',
            route: 'auditoria' as const,
            bgLight: 'bg-blue-50',
            bgDark: 'bg-blue-500',
            borderColor: 'border-blue-200',
            description: 'Registro de actividades del sistema',
            roles: [3, 4, 5]
        },
        {
            title: 'Estadísticas',
            icon: 'stats-chart-outline',
            route: 'estadisticas' as const,
            bgLight: 'bg-green-50',
            bgDark: 'bg-green-500',
            borderColor: 'border-green-200',
            description: 'Métricas del sistema',
            roles: [3, 4, 5]
        },
        {
            title: 'Solicitudes de Rol',
            icon: 'people-outline',
            route: 'solicitudes' as const,
            bgLight: 'bg-yellow-50',
            bgDark: 'bg-yellow-500',
            borderColor: 'border-yellow-200',
            description: 'Gestionar cambios de rol',
            roles: [5]
        }
    ];

    // Filtrar items según el rol del usuario
    const itemsVisibles = menuItems.filter(item => 
        item.roles.includes(user?.id_rol ?? 0)
    );

    return (
        <ScrollView className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-cyan-600 pt-12 pb-6 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Panel Admin</Text>
                        <Text className="text-white/80 text-sm">Bienvenido, {user?.nombre}</Text>
                    </View>
                </View>
            </View>

            {/* Tarjetas de menú con colores personalizados */}
            <View className="p-5">
                {itemsVisibles.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        className={`${item.bgLight} rounded-xl p-5 mb-4 border ${item.borderColor}`}
                        onPress={() => navigateTo(item.route)}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-12 h-12 ${item.bgDark} rounded-full items-center justify-center mr-4`}>
                                <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
                                <Text className="text-sm text-gray-500">{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}