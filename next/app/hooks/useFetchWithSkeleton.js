import { useState, useEffect, useCallback } from 'react';

export default function useFetchWithSkeleton(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    if (typeof fetcher !== 'function') return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (typeof fetcher === 'function') {
      run();
    }
  }, [fetcher, run]);

  return { data, loading, error, refetch: run };
}
