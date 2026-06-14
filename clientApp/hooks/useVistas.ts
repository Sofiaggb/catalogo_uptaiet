// app/hooks/useVistas.ts (versión final recomendada)
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tesisApi } from '@/services/api/endpoints/tesis';

export const useVistas = (id: number) => {
    const hasIncremented = useRef(false);

    useEffect(() => {
        if (!id) return;
        
        const incrementarSiNoVisto = async () => {
            try {
                const key = `vista_tesis_${id}`;
                const yaVisto = await AsyncStorage.getItem(key);
                
                if (!yaVisto && !hasIncremented.current) {
                    await tesisApi.incrementarVistas(id);
                    await AsyncStorage.setItem(key, 'true');
                    hasIncremented.current = true;
                }
            } catch (error) {
                console.error('Error en useVistas:', error);
            }
        };
        
        incrementarSiNoVisto();
    }, [id]);
};