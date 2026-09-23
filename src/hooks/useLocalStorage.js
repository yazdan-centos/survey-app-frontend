import { useState, useEffect, useCallback } from 'react';

/**
 * Persists a piece of state to localStorage under `key`, so a respondent
 * can close the tab mid-survey and resume later without losing progress.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch (err) {
      console.warn(`Could not read localStorage key "${key}":`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Could not write localStorage key "${key}":`, err);
    }
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Could not clear localStorage key "${key}":`, err);
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clear];
}
