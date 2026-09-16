import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar si el usuario actual tiene un permiso específico.
 * 
 * @param {string} modulo - El módulo a verificar (ej: 'libro', 'proyecto')
 * @param {string} accion - La acción a verificar (ej: 'crear', 'editar', 'eliminar')
 * @returns {boolean} - true si tiene el permiso, false si no
 * 
 * @example
 * const puedeCrear = usePermiso('libro', 'crear');
 * if (puedeCrear) { ... }
 */
export function usePermiso(modulo, accion) {
  const { user } = useAuth();

  // Si no está autenticado, no tiene permisos
  if (!user) return false;

  // Si el usuario no tiene el array de permisos (por ejemplo, si es un usuario viejo en cache), retorna false
//   console.log(user.permisos)
  if (!user.permisos || !Array.isArray(user.permisos)) return false;

  // Verificar si el array de permisos incluye el formato 'modulo:accion'
  return user.permisos.includes(`${modulo}:${accion}`);
}