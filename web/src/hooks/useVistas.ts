import { useEffect, useRef } from 'react';

export const useVistas = (id: number, incrementar: () => void) => {
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Solo incrementar una vez por sesión
    const key = `vista_tesis_${id}`;
    const alreadyViewed = sessionStorage.getItem(key);
    
    if (!alreadyViewed && !hasIncremented.current) {
      incrementar();
      sessionStorage.setItem(key, 'true');
      hasIncremented.current = true;
    }
  }, [id]);
};