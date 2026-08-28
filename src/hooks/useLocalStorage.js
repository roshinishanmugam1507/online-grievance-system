import { useState } from 'react';

/**
 * In-Memory State hook shim (No browser localStorage is accessed)
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  return [storedValue, setStoredValue];
};

export default useLocalStorage;
