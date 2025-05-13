import { useState, useCallback } from 'react';

/**
 * Hook qui gère l'exécution d'une fonction asynchrone et la gestion de son état
 */
export function useAsyncData(asyncFunction, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      
      setData(result.data);
      setRetry(result.retry || false);
      setFromCache(result.fromCache || false);
      
      return result.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { data, loading, error, retry, fromCache, execute };
}
