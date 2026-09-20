import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { httpRequest } from '../services/httpService';

export function useHttp() {
  const { accessToken, signOut } = useAuth();

  return useCallback(async (path, options = {}) => {
    try {
      return await httpRequest(path, {
        ...options,
        token: options.token ?? accessToken,
      });
    } catch (error) {
      if (error.status === 401 && accessToken) signOut();
      throw error;
    }
  }, [accessToken, signOut]);
}
