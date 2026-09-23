import { createContext, useCallback, useMemo, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'wcs:auth:v1';

function readStoredAuth() {
  try {
    const stored = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    const auth = stored ? JSON.parse(stored) : { accessToken: null, user: null };
    if (auth?.user?.expiresAt && Number(auth.user.expiresAt) <= Date.now()) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return { accessToken: null, user: null };
    }
    return auth ?? { accessToken: null, user: null };
  } catch {
    return { accessToken: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const persistAuth = useCallback((nextAuth) => {
    setAuth(nextAuth);
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
  }, []);

  const signIn = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    const nextAuth = {
      ...result,
      accessToken: result.accessToken,
      user: result.user ?? null,
    };
    persistAuth(nextAuth);
    return nextAuth;
  }, [persistAuth]);

  const signOut = useCallback(() => {
    const emptyAuth = { accessToken: null, user: null };
    setAuth(emptyAuth);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.accessToken) return null;
    const user = await authService.getCurrentUser(auth.accessToken);
    persistAuth({ ...auth, user });
    return user;
  }, [auth, persistAuth]);

  const value = useMemo(() => ({
    user: auth.user,
    accessToken: auth.accessToken,
    isAuthenticated: typeof auth.accessToken === 'string' && auth.accessToken.trim().length > 0,
    signIn,
    signOut,
    refreshUser,
  }), [auth, signIn, signOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
