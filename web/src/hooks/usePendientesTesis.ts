import { useState, useEffect } from 'react';
import { usePermiso } from './usePermiso';
import { tesisApi } from '../api/endpoints/tesis';

const REFRESH_INTERVAL = 60 * 1000; // 1 minuto

/**
 * Hook para obtener el contador de tesis pendientes.
 * Solo hace la consulta si el usuario tiene el permiso 'proyecto:aprobar'.
 * Se actualiza automáticamente cada minuto.
 */
export function usePendientesTesis() {
  const puedeAprobar = usePermiso('proyecto', 'aprobar');
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    // Si no tiene permiso, no hace nada
    if (!puedeAprobar) return;

    const cargarContador = async () => {
      try {
        const res = await tesisApi.contarPendientes();
        setPendientes(res.data.total || 0);
      } catch (error) {
        console.error('Error al contar pendientes:', error);
      }
    };

    // Cargar al inicio
    cargarContador();

    // Refrescar cada minuto
    const interval = setInterval(cargarContador, REFRESH_INTERVAL);

    //  Escuchar el evento global 'tesis-revisada'
    window.addEventListener('tesis-revisada', cargarContador);

    // Limpiar al desmontar
    return () => {
      clearInterval(interval);
      window.removeEventListener('tesis-revisada', cargarContador);
    };
  }, [puedeAprobar]);

  return pendientes;
}