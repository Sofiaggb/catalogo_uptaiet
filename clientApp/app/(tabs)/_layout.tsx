// app/(tabs)/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

export default function TabLayout() {
  const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const handlePerfilPress = () => {
        if (isAuthenticated) {
            router.push('/perfil');
        } else {
            router.push('/(auth)/login');
        }
    };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#06b6d4',
          borderTopColor: '#FFD700',
          borderTopWidth: 2,
          height: 70,
        },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#0891b2' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tesis/index"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="libros/index"
        options={{
          title: 'Libros',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="perfil/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      /> */}

       <Tabs.Screen
                name="perfil/index"
                options={{
                    title: isAuthenticated ? 'Perfil' : 'Ingresar',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons 
                            name={isAuthenticated ? "person-circle-outline" : "log-in-outline"} 
                            size={size} 
                            color={color} 
                        />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        handlePerfilPress();
                    },
                }}
            />
    </Tabs>
  );
}
