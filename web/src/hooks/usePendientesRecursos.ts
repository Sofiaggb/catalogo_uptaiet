import { useState, useEffect } from 'react';
import { usePermiso } from './usePermiso';
import { librosApi } from '../api/endpoints/libros';
const REFRESH_INTERVAL = 60 * 1000; // 1 minuto

export function usePendientesRecursos() {
  const puedeAprobar = usePermiso('recursos', 'aprobar');
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    if (!puedeAprobar) return;

    const cargarContador = async () => {
      try {
        const res = await librosApi.contarPendientes();
        setPendientes(res.data.total || 0);
      } catch (error) {
        console.error('Error al contar pendientes:', error);
      }
    };

    cargarContador();
    const interval = setInterval(cargarContador, REFRESH_INTERVAL);
    window.addEventListener('recurso-revisado', cargarContador);

    return () => {
      clearInterval(interval);
      window.removeEventListener('recurso-revisado', cargarContador);
    };
  }, [puedeAprobar]);

  return pendientes;
}