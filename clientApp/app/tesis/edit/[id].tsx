// app/tesis/edit/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import TesisForm from '../form';

export default function EditTesisScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    
    // Pasar el modo y el ID al formulario
    return <TesisForm mode="edit" tesisId={id} />;
}