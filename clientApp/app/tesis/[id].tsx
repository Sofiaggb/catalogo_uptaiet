import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function TesisDetailScreen() {
  // Obtener el ID de la URL
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalle de Tesis #{id}</Text>
      {/* Aquí cargas los datos con fetch */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
});