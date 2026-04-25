// app/components/ConstructionScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;
type ConstructionVariant = 'building' | 'soon' | 'maintenance' | 'empty';

interface ConstructionScreenV2Props {
  variant?: ConstructionVariant;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  customIcon?: IconName;
}

const variants = {
  building: {
    icon: 'construct-outline',
    title: 'En Construcción',
    message: 'Estamos trabajando para traerte esta sección muy pronto.',
    color: '#FFD700'
  },
  soon: {
    icon: 'time-outline',
    title: 'Próximamente',
    message: 'Esta funcionalidad estará disponible en los próximos días.',
    color: '#3B82F6'
  },
  maintenance: {
    icon: 'settings-outline',
    title: 'En Mantenimiento',
    message: 'Estamos realizando mejoras. Vuelve en unos momentos.',
    color: '#F59E0B'
  },
  empty: {
    icon: 'folder-open-outline',
    title: 'Sin Contenido',
    message: 'No hay elementos para mostrar en esta sección.',
    color: '#6B7280'
  }
};

export default function ConstructionScreen({ 
  variant = 'building',
  title,
  message,
  showBackButton = true,
  showHomeButton = true,
  customIcon
}: ConstructionScreenV2Props) {
  const config = variants[variant];
  const iconName = (customIcon || config.icon) as IconName;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const iconColor = variant === 'building' ? '#000000' : '#FFFFFF';

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header minimalista */}
      <View className="bg-black pt-12 pb-4 px-5">
        <Text className="text-yellow-500 text-2xl font-bold"> UPTAIET</Text>
        <Text className="text-white text-sm">Catálogo Digital</Text>
      </View>

      {/* Contenido principal */}
      <View className="flex-1 justify-center items-center py-20 px-5">
        {/* Icono con fondo */}
        <View className="rounded-full p-6 mb-6" style={{ backgroundColor: `${config.color}20` }}>
          <Ionicons name={iconName} size={80} color={config.color} />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-center mb-3" style={{ color: config.color }}>
          {displayTitle}
        </Text>

        {/* Mensaje */}
        <Text className="text-gray-600 text-center text-base mb-8 px-5">
          {displayMessage}
        </Text>

        {/* Animación de puntos (CSS) */}
        <View className="flex-row justify-center space-x-2 mb-10">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-500"
              style={{
                opacity: 0.3 + (i * 0.3),
              }}
            />
          ))}
        </View>

        {/* Botones */}
        <View className="flex-row gap-4">
          {showBackButton && (
            <TouchableOpacity
              className="bg-black rounded-xl px-6 py-3 flex-row items-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-outline" size={20} color="#FFD700" />
              <Text className="text-yellow-500 font-semibold ml-2">Volver</Text>
            </TouchableOpacity>
          )}
          
          {showHomeButton && (
            <Link href="/" asChild>
              <TouchableOpacity
                className="bg-yellow-500 rounded-xl px-6 py-3 flex-row items-center"
              >
                <Ionicons name="home-outline" size={20} color="#000000" />
                <Text className="text-black font-semibold ml-2">Inicio</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </View>
    </ScrollView>
  );
}