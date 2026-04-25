// app/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-black pt-1 pb-6 px-5">
                <View className="flex-row  items-center">
                    <Image
                        source={require('../../assets/images/logo_uptaiet.png')}
                        className="w-10 h-10 mr-3"
                        resizeMode="contain"
                    />
                    <View>
                        <Text className="text-yellow-500 text-2xl font-bold">UPTAIET</Text>
                        <Text className="text-white text-sm">Catálogo Digital</Text>
                    </View>
                </View>
            </View>

            {/* Banner principal */}
            <View className="bg-yellow-500 mx-5 mt-5 rounded-2xl p-6">
                <Text className="text-black text-2xl font-bold">Bienvenido</Text>
                <Text className="text-black text-base mt-2">
                    Explora nuestro catálogo de tesis, proyectos y recursos académicos
                </Text>
                <TouchableOpacity className="bg-black rounded-full px-6 py-3 mt-4 self-start">
                    <Text className="text-yellow-500 font-bold">Explorar →</Text>
                </TouchableOpacity>
            </View>

            {/* Secciones rápidas */}
            <View className="px-5 mt-6">
                <Text className="text-black text-xl font-bold mb-4">Accesos Rápidos</Text>
                <View className="flex-row flex-wrap justify-between gap-4">

                    <QuickCard title="Tesis" iconName="document-text-outline"
                        href="/tesis"
                        colorVariant="black" />

                    <QuickCard title="Carreras" iconName="school-outline"
                        href="/carreras"
                        colorVariant="yellow" />

                    <QuickCard title="Documentos" iconName="library-outline"
                        href="/docs"
                        colorVariant="black" />

                    <QuickCard title="Mi Perfil" iconName="person-circle-outline"
                        href="/auth/perfil"
                        colorVariant="yellow" />

                </View>
            </View>

            {/* Últimas tesis */}
            <View className="px-5 mt-6 pb-10">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-black text-xl font-bold">Últimas Tesis</Text>
                    <Link href="/tesis/crear/" asChild>
                        <TouchableOpacity>
                            <Text className="text-yellow-600">Ver todas →</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                {/* Lista de tesis */}
                <TesisCard
                    titulo="Machine Learning en Educación"
                    autores="María Rojas, Carlos Méndez"
                    carrera="Ingeniería Informática"
                />
                <TesisCard
                    titulo="Blockchain para Certificación"
                    autores="Ana Torres, Javier Paz"
                    carrera="Ingeniería de Sistemas"
                />
            </View>
        </ScrollView>
    );
}

// Componentes reutilizables
// Definir los tipos de las props
type QuickCardProps = {
    title: string;
    iconName: keyof typeof Ionicons.glyphMap;
    href: Href;
    colorVariant: 'black' | 'yellow';
};

function QuickCard({ title, iconName, href, colorVariant }: QuickCardProps) {
    const bgColor = colorVariant === 'yellow' ? 'bg-yellow-500' : 'bg-black';
    const textColor = colorVariant === 'yellow' ? 'text-black' : 'text-white';
    const iconColor = colorVariant === 'yellow' ? '#000000' : '#FFFFFF';

    return (
        <Link href={href} asChild>
            <TouchableOpacity className={`${bgColor} rounded-xl p-4 w-[45%] mb-3 items-center`}>
                <Ionicons name={iconName} size={32} color={iconColor} />
                <Text className={`${textColor} font-bold text-center mt-2`}>{title}</Text>
            </TouchableOpacity>
        </Link>
    );
}

function TesisCard({ titulo, autores, carrera }: any) {
    return (
        <View className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
            <Text className="text-black font-bold text-lg">{titulo}</Text>
            <Text className="text-gray-600 text-sm mt-1">{autores}</Text>
            <Text className="text-gray-500 text-xs mt-1">{carrera}</Text>
            <TouchableOpacity className="mt-3">
                <Text className="text-yellow-600 font-semibold">Ver detalles →</Text>
            </TouchableOpacity>
        </View>
    );
}