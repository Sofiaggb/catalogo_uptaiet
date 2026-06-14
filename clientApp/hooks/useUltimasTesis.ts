// app/hooks/useUltimasTesis.ts
import { useEffect, useState } from 'react';
import { tesisApi } from '@/services/api/endpoints/tesis';
import type { Tesis } from '@/services/api/types';

export const useUltimasTesis = () => {
    const [tesis, setTesis] = useState<Tesis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarUltimasTesis();
    }, []);

    const cargarUltimasTesis = async () => {
        setLoading(true);
        try {
            const result = await tesisApi.listar({ 
                limit: 3,  // Solo 3 últimas tesis
                page: 1,
                sort: 'reciente'
            });
            
            if (result.success && result.data) {
                setTesis(result.data);
            } else {
                setError('No se pudieron cargar las tesis');
            }
        } catch (err) {
            console.error('Error cargando últimas tesis:', err);
            setError('Error al cargar las tesis');
        } finally {
            setLoading(false);
        }
    };

    return { tesis, loading, error };
};