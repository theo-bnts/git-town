// app/hooks/useCrudData.js
import { useState, useCallback, useEffect } from 'react';

import useAuthToken from '@/app/hooks/useAuthToken';

export default function useCrudData({ fetchFn, deleteFn, mapToRow }) {
  const token = useAuthToken();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetchFn(token)
      .then(items => items.map(mapToRow))
      .then(setData)
      .catch(err => alert(`Erreur : ${err.message}`))
      .finally(() => setLoading(false));
  }, [token, fetchFn, mapToRow]);

  useEffect(refresh, [refresh]);

  const remove = useCallback(async (id) => {
    if (!token) return;
    setLoading(true);
    try {
      await deleteFn(id, token);
      await refresh();
    } catch (err) {
      alert(`Suppression impossible : ${err.message}`);
    }
  }, [token, deleteFn, refresh]);

  return { data, loading, refresh, remove };
}
