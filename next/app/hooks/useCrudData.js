'use client';

import { useState, useCallback, useEffect } from 'react';

import useAuthToken from '@/app/hooks/useAuthToken';

import { useNotification } from '@/app/context/NotificationContext';

export default function useCrudData({ fetchFn, deleteFn, mapToRow }) {
  const token = useAuthToken();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  const refresh = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetchFn(token)
      .then(items => items.map(mapToRow))
      .then(setData)
      .catch(err => notify(`Erreur lors du chargement des données : ${err.message}`, 'error'))
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
      notify(`Erreur lors de la suppression : ${err.message}`, 'error');
      await refresh();
    }
  }, [token, deleteFn, refresh]);

  return { data, loading, refresh, remove };
}
