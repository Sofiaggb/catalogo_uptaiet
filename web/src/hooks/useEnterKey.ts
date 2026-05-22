import { useCallback } from 'react';

export const useEnterKey = (callback?: () => void) => {
  return useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (callback) {
        callback();
      }
    }
  }, [callback]);
};